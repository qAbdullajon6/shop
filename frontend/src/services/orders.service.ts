import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Order, OrdersResponse, CreateOrderPayload, OrdersFilter } from "@/types";

export const ordersService = {
  getAll: (filters?: OrdersFilter) =>
    apiGet<OrdersResponse>(API_ENDPOINTS.ORDERS.LIST, { params: filters }),

  getById: (id: string) =>
    apiGet<Order>(API_ENDPOINTS.ORDERS.DETAIL(id)),

  create: (payload: CreateOrderPayload) =>
    apiPost<Order>(API_ENDPOINTS.ORDERS.CREATE, payload),

  cancel: (id: string) =>
    apiPatch<Order>(API_ENDPOINTS.ORDERS.CANCEL(id), null),
};
