import { type Customer } from "./customer";

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface OrderItem {
  product: string | {
    _id: string;
    name: string;
    sku: string;
  };
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  customer: Customer | string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItem {
  product: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer: string;
  items: CreateOrderItem[];
}