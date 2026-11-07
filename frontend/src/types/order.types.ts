export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "ONLINE";
export type OrderSource = "WEB" | "TELEGRAM" | "ADMIN";

export interface OrderAddress {
  id: string;
  title: string | null;
  city: string;
  district: string | null;
  street: string;
  lat: string | null;
  lon: string | null;
}

export interface OrderUser {
  id: string;
  name: string | null;
  last_name: string | null;
  phone_number: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  variant_id: string | null;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  variant_sku: string | null;
  variant_volume: string | null;
  image_url: string | null;
  unit_price: string;
  line_total: string;
  review: { id: string; rating: number } | null;
}

export interface OrderStatusEvent {
  id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  source: OrderSource;
  customer_name: string | null;
  customer_phone: string;
  ship_city: string | null;
  ship_district: string | null;
  ship_street: string | null;
  delivery_name: string | null;
  subtotal_amount: string;
  discount_amount: string;
  shipping_fee: string;
  total_amount: string;
  notes: string | null;
  cancel_reason: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  user: OrderUser;
  address: OrderAddress | null;
  items: OrderItem[];
  coupon_use: { id: string; discount: string; coupon: { id: string; code: string } } | null;
  status_events: OrderStatusEvent[];
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateOrderPayload {
  address_id?: string;
  delivery_option_id?: string;
  items: { variant_id: string; quantity: number }[];
  coupon_code?: string;
  notes?: string;
  idempotency_key?: string;
}

export interface OrdersFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  search?: string;
}
