import { adminApiClient } from "@/lib/adminApi";
import type { Order, OrdersResponse, OrderStatus, PaymentStatus, OrdersFilter } from "@/types";

export const adminOrdersService = {
  getAll: async (filters?: OrdersFilter): Promise<OrdersResponse> => {
    const res = await adminApiClient.get<OrdersResponse>("/orders", { params: filters });
    return res.data;
  },

  getOne: async (id: string): Promise<Order> => {
    const res = await adminApiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> => {
    const res = await adminApiClient.patch<Order>(`/orders/${id}/status`, { status, note });
    return res.data;
  },

  updatePaymentStatus: async (id: string, payment_status: PaymentStatus): Promise<Order> => {
    const res = await adminApiClient.patch<Order>(`/orders/${id}/payment-status`, { payment_status });
    return res.data;
  },
};
