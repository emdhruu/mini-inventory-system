import api from "./axios";
import type { Product, ProductPayload } from "../types/product";

interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
}

export const getProducts = async (params?: {search?: string; category?: string; status?: string; }) => {
  const response = await api.get<ProductsResponse>("/product/list", { params, });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get<ProductResponse>(`/product/get/${id}`);
  return response.data;
};

export const createProduct = async (payload: ProductPayload) => {
  const response = await api.post<ProductResponse>("/product/create", payload);
  return response.data;
};

export const updateProduct = async (id: string, payload: ProductPayload) => {
  const response = await api.put<ProductResponse>(`/product/update/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/product/delete/${id}`);
  return response.data;
};