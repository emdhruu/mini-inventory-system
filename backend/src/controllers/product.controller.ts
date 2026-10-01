import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";
import Order from "../models/Order";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, sku, price , stock, category, status } = req.body;

        if (!name || !sku || !price || !stock || !category) {
            res.status(400).json({
            success: false,
            message: "Missing required fields"
            });
            return;
        }

        if (price < 0 || stock < 0) {
            res.status(400).json({
            success: false,
            message: "Price and stock cannot be negative"
            });
            return;
        }

        const existingProduct = await Product.findOne({ sku: sku.trim().toUpperCase() });
        if (existingProduct) {
            res.status(400).json({
            success: false,
            message: "Product with this SKU already exists"
            });
            return;
        }

        const newProduct = await Product.create({
            name, sku, price, stock, category, status
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });


    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating product" });
    }
}

export const getProducts = async (req: Request, res:Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, search , status, category, sortBy = "createdAt", order = "desc" } = req.query;

        const filter: Record<string, any> = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" }},
                { sku: { $regex: search, $options: "i" }},
                { category: { $regex: search, $options: "i" }},
            ]
        }
        if (category) {
            filter.category = category;
        }

        if (status) {
            filter.status = status;
        }

        const products = await Product.find(filter).sort({
        createdAt: -1,
        });

        res.status(200).json({
        success: true,
        count: products.length,
        data: products,
        });
        } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        });
        }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const { name, sku, price, stock, category, status } = req.body;

    if (price !== undefined && price < 0) {
      res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
      return;
    }

    if (stock !== undefined && stock < 0) {
      res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
      return;
    }

    if (sku) {
      const normalizedSku = sku.trim().toUpperCase();

      const existingProduct = await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: id },
      });

      if (existingProduct) {
        res.status(409).json({
          success: false,
          message: "Product with this SKU already exists",
        });
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku,
        price,
        stock,
        category,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const usedInOrder = await Order.exists({
      "items.product": id,
    });

    if (usedInOrder) {
      product.status = "inactive";
      await product.save();

      res.status(200).json({
        success: true,
        message:
          "Product is used in existing orders, so it has been deactivated instead of deleted",
        data: product,
      });

      return;
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};