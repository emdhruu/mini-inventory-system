export type ProductStatus = "active" | "inactive";

export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
}