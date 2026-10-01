import { Request, Response } from "express";
import mongoose from "mongoose";

import Order from "../models/Order";
import Product from "../models/Product";
import Customer from "../models/Customer";

interface IncomingOrderItem {
  product: string;
  quantity: number;
}

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { customer, items } = req.body as {
      customer?: string;
      items?: IncomingOrderItem[];
    };

    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      res.status(400).json({
        success: false,
        message: "Valid customer ID is required",
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
      return;
    }

    const customerExists = await Customer.exists({
      _id: customer,
    });

    if (!customerExists) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    // Merge duplicate products
    const mergedItems = new Map<string, number>();

    for (const item of items) {
      if (
        !item.product ||
        !mongoose.Types.ObjectId.isValid(item.product)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
        return;
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
        return;
      }

      const currentQuantity =
        mergedItems.get(item.product) ?? 0;

      mergedItems.set(
        item.product,
        currentQuantity + item.quantity
      );
    }

    const productIds = Array.from(mergedItems.keys());

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
      status: "active",
    });

    if (products.length !== productIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more products are invalid or inactive",
      });
      return;
    }

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of mergedItems) {
      const product = productMap.get(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
        });
        return;
      }

      const subtotal = product.price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity,
        subtotal,
      });

      totalAmount += subtotal;
    }

    const order = await Order.create({
      customer,
      items: orderItems,
      totalAmount,
      status: "pending",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku price stock");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

export const getOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: Record<string, unknown> = {};

    if (
      typeof status === "string" &&
      ["pending", "confirmed", "cancelled"].includes(status)
    ) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await Order.findById(id)
      .populate("customer", "name email phone address")
      .populate("items.product", "name sku price stock");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const confirmOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    session.startTransaction();

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();

      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.status !== "pending") {
      await session.abortTransaction();

      res.status(400).json({
        success: false,
        message: `Order cannot be confirmed because it is already ${order.status}`,
      });
      return;
    }

    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          status: "active",
          stock: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedProduct) {
        await session.abortTransaction();

        res.status(409).json({
          success: false,
          message: `Insufficient stock for product ${item.name}`,
        });
        return;
      }
    }

    order.status = "confirmed";

    await order.save({
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku price stock");

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Confirm order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to confirm order",
    });
  } finally {
    await session.endSession();
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    session.startTransaction();

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();

      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.status === "cancelled") {
      await session.abortTransaction();

      res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
      return;
    }

    if (order.status === "confirmed") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          },
          {
            session,
          }
        );
      }
    }

    order.status = "cancelled";

    await order.save({
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku price stock");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Cancel order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  } finally {
    await session.endSession();
  }
};