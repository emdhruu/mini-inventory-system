import { type Order } from "./order";

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalStock: number;
  totalSales: number;
  recentOrders: Order[];
}