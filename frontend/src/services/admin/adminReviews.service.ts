import { adminApiClient } from "@/lib/adminApi";
import type { Review, ReviewsResponse, ReviewStatus } from "@/types";

export interface AdminReviewsFilter {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  product_id?: string;
}

export const adminReviewsService = {
  getAll: async (filters?: AdminReviewsFilter): Promise<ReviewsResponse> => {
    const res = await adminApiClient.get<ReviewsResponse>("/reviews/admin/all", { params: filters });
    return res.data;
  },

  moderate: async (id: string, status: ReviewStatus, admin_note?: string): Promise<Review> => {
    const res = await adminApiClient.patch<Review>(`/reviews/${id}/moderate`, { status, admin_note });
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/reviews/${id}`);
  },
};
