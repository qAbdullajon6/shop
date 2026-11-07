export interface Notification {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  unread_count: number;
}

export interface NotificationsFilter {
  page?: number;
  limit?: number;
  is_read?: boolean;
}
