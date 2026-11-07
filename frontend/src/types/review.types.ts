export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewUser {
  id: string;
  name: string | null;
  last_name: string | null;
  avatar: string | null;
}

export interface ReviewProduct {
  id: string;
  name_uz: string;
  slug: string;
}

export interface ReviewOrderItem {
  variant_volume: string | null;
  variant_sku: string;
}

export interface Review {
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  rating_longevity: number | null;
  rating_quality: number | null;
  rating_packaging: number | null;
  rating_value: number | null;
  is_verified: boolean;
  status: ReviewStatus;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user: ReviewUser;
  order_item: ReviewOrderItem | null;
  product?: ReviewProduct;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateReviewPayload {
  order_item_id: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
}
