import dotenv from "dotenv";
import mongoose from "mongoose";

import Product from "../models/Product";
import Customer from "../models/Customer";
import Order from "../models/Order";
import { connectDb } from "../config/db";

dotenv.config();

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDb();

    console.log("Clearing existing data...");

    await Order.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});

    const products = await Product.insertMany([
      {
        name: "Wireless Mouse",
        sku: "WM-001",
        price: 799,
        stock: 50,
        category: "Electronics",
        status: "active",
      },
      {
        name: "Mechanical Keyboard",
        sku: "MK-002",
        price: 2499,
        stock: 30,
        category: "Electronics",
        status: "active",
      },
      {
        name: "USB-C Hub",
        sku: "UCH-003",
        price: 1499,
        stock: 25,
        category: "Accessories",
        status: "active",
      },
      {
        name: "Laptop Stand",
        sku: "LS-004",
        price: 1899,
        stock: 20,
        category: "Accessories",
        status: "active",
      },
      {
        name: "Webcam Full HD",
        sku: "WC-005",
        price: 3299,
        stock: 15,
        category: "Electronics",
        status: "active",
      },
      {
        name: "Bluetooth Speaker",
        sku: "BS-006",
        price: 2199,
        stock: 40,
        category: "Audio",
        status: "active",
      },
      {
        name: "Noise Cancelling Headphones",
        sku: "NCH-007",
        price: 5999,
        stock: 10,
        category: "Audio",
        status: "active",
      },
      {
        name: "Gaming Mouse Pad",
        sku: "GMP-008",
        price: 699,
        stock: 60,
        category: "Accessories",
        status: "active",
      },
    ]);

    console.log(`${products.length} products created`);

    const customers = await Customer.insertMany([
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "9876543210",
        address: "Ahmedabad, Gujarat",
      },
      {
        name: "Priya Patel",
        email: "priya@example.com",
        phone: "9876543211",
        address: "Surat, Gujarat",
      },
      {
        name: "Amit Shah",
        email: "amit@example.com",
        phone: "9876543212",
        address: "Vadodara, Gujarat",
      },
      {
        name: "Neha Mehta",
        email: "neha@example.com",
        phone: "9876543213",
        address: "Mumbai, Maharashtra",
      },
      {
        name: "Karan Joshi",
        email: "karan@example.com",
        phone: "9876543214",
        address: "Pune, Maharashtra",
      },
    ]);

    console.log(`${customers.length} customers created`);

    const createOrderItem = (
      product: (typeof products)[number],
      quantity: number
    ) => ({
      product: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
    });

    const order1Items = [
      createOrderItem(products[0], 2),
      createOrderItem(products[1], 1),
    ];

    const order2Items = [
      createOrderItem(products[2], 1),
      createOrderItem(products[3], 2),
    ];

    const order3Items = [
      createOrderItem(products[4], 1),
      createOrderItem(products[5], 1),
    ];

    const order4Items = [
      createOrderItem(products[6], 1),
      createOrderItem(products[7], 3),
    ];

    const orders = await Order.insertMany([
      {
        customer: customers[0]._id,
        items: order1Items,
        totalAmount: order1Items.reduce(
          (total, item) => total + item.subtotal,
          0
        ),
        status: "confirmed",
      },
      {
        customer: customers[1]._id,
        items: order2Items,
        totalAmount: order2Items.reduce(
          (total, item) => total + item.subtotal,
          0
        ),
        status: "confirmed",
      },
      {
        customer: customers[2]._id,
        items: order3Items,
        totalAmount: order3Items.reduce(
          (total, item) => total + item.subtotal,
          0
        ),
        status: "pending",
      },
      {
        customer: customers[3]._id,
        items: order4Items,
        totalAmount: order4Items.reduce(
          (total, item) => total + item.subtotal,
          0
        ),
        status: "cancelled",
      },
    ]);

    console.log(`${orders.length} orders created`);


    for (const order of orders) {
      if (order.status !== "confirmed") {
        continue;
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
          },
        });
      }
    }

    console.log("Stock updated for confirmed orders");

    console.log("Database seeded successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();