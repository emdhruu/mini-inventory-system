import { Request, Response } from "express";

import Product from "../models/Product";
import Order from "../models/Order";

export const getDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalProducts,
      totalOrders,
      stockResult,
      salesResult,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),

      Order.countDocuments(),

      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: {
              $sum: "$stock",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            status: "confirmed",
          },
        },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.find()
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("customer items totalAmount status createdAt"),
    ]);

    const totalStock = stockResult[0]?.totalStock ?? 0;
    const totalSales = salesResult[0]?.totalSales ?? 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalStock,
        totalSales,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};