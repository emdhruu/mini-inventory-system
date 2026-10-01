import api from "./axios";
import type { Customer, CustomerPayload } from "../types/customer";

interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

interface CustomerResponse {
  success: boolean;
  data: Customer;
  message?: string;
}

export const getCustomers = async (search?: string) => {
  const response = await api.get<CustomersResponse>("/customer/list", {
    params: search ? { search } : undefined,
  });

  return response.data;
};

export const getCustomerById = async (id: string) => {
  const response = await api.get<CustomerResponse>(`/customer/get/${id}`);

  return response.data;
};

export const createCustomer = async (payload: CustomerPayload) => {
  const response = await api.post<CustomerResponse>("/customer/create", payload);

  return response.data;
};

export const updateCustomer = async ( id: string, payload: CustomerPayload
) => {
  const response = await api.put<CustomerResponse>(`/customer/update/${id}`, payload);

  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await api.delete(`/customer/delete/${id}`);

  return response.data;
};