import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Review, ReviewsResponse, CreateReviewPayload, UpdateReviewPayload } from "@/types";

export const reviewsService = {
  getByProduct: (product_id: string, page = 1, limit = 10) =>
    apiGet<ReviewsResponse>(API_ENDPOINTS.REVIEWS.LIST, { params: { product_id, page, limit } }),

  create: (payload: CreateReviewPayload) =>
    apiPost<Review>(API_ENDPOINTS.REVIEWS.CREATE, payload),

  update: (id: string, payload: UpdateReviewPayload) =>
    apiPatch<Review>(API_ENDPOINTS.REVIEWS.UPDATE(id), payload),

  delete: (id: string) =>
    apiDelete<void>(API_ENDPOINTS.REVIEWS.DELETE(id)),
};
