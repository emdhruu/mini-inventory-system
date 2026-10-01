import api from "./axios";
import type { CreateOrderPayload, Order, OrderStatus } from "../types/order";

interface OrdersResponse {
  success: boolean;
  data: Order[];
}

interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export const getOrders = async (status?: OrderStatus) => {
  const response = await api.get<OrdersResponse>("/order/list", {
    params: status ? { status } : undefined,
  });

  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get<OrderResponse>(`/order/get/${id}`);

  return response.data;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const response = await api.post<OrderResponse>("/order/create", payload);

  return response.data;
};

export const confirmOrder = async (id: string) => {
  const response = await api.patch<OrderResponse>(
    `/order/confirm/${id}`
  );

  return response.data;
};

export const cancelOrder = async (id: string) => {
  const response = await api.patch<OrderResponse>(
    `/order/cancel/${id}`
  );

  return response.data;
};