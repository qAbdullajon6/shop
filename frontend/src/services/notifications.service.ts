import { apiGet, apiPatch } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { NotificationsResponse, NotificationsFilter, Notification } from "@/types";

export const notificationsService = {
  getAll: (filters?: NotificationsFilter) =>
    apiGet<NotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST, { params: filters }),

  markRead: (id: string) =>
    apiPatch<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), null),

  markAllRead: () =>
    apiPatch<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, null),
};
