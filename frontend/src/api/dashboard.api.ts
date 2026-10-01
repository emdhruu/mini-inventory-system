import api from "./axios";
import type { DashboardData } from "../types/dashboard";

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const getDashboard = async () => {
  const response = await api.get<DashboardResponse>("/dashboard");

  return response.data;
};