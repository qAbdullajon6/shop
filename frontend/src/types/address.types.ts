/* Backend shakli: prisma Address + AddressResponseDto
   (lat/lon javobda string sifatida keladi — Decimal → String transform) */
export interface Address {
  id: string;
  user_id: string;
  title: string | null;
  city: string;
  district: string | null;
  street: string;
  zip_code: string | null;
  lat: string | null;
  lon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  title?: string;
  city: string;
  district?: string;
  street: string;
  zip_code?: string;
  lat?: number;
  lon?: number;
  is_default?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;
