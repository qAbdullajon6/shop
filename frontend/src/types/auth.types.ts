export interface User {
  id: string;
  phone_number: string;
  name: string | null;
  last_name: string | null;
  email: string | null;
  avatar: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  is_active: boolean;
  created_at: string;
}

export interface SendOtpPayload {
  phone_number: string;
}

export interface VerifyOtpPayload {
  phone_number: string;
  code: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string; // cookie-based; may be absent in JSON response
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UpdateProfilePayload {
  /* Backend UpdateUserDto: name / last_name / email */
  name?: string;
  last_name?: string;
  email?: string;
}
