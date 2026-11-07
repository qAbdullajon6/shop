import { adminApiClient } from "@/lib/adminApi";
import type { User } from "@/types";

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AdminUsersFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export const adminUsersService = {
  getAll: async (filters?: AdminUsersFilter): Promise<UsersListResponse> => {
    const res = await adminApiClient.get<UsersListResponse>("/users", { params: filters });
    return res.data;
  },

  getOne: async (id: string): Promise<User> => {
    const res = await adminApiClient.get<User>(`/users/${id}`);
    return res.data;
  },

  update: async (id: string, data: { is_active?: boolean; role?: string; name?: string; last_name?: string }): Promise<User> => {
    const res = await adminApiClient.patch<User>(`/users/${id}`, data);
    return res.data;
  },
};
