import { adminApiClient } from "@/lib/adminApi";
import { adminTokens } from "@/lib/adminTokens";

interface AdminLoginResponse {
  access_token: string;
  refresh_token?: string; // cookie-based; may be absent in JSON response
  user: {
    id: string;
    phone_number: string;
    role: string;
  };
}

export const adminAuthService = {
  adminLogin: async (
    phone_number: string,
    password: string
  ): Promise<AdminLoginResponse> => {
    const response = await adminApiClient.post<AdminLoginResponse>(
      "/auth/admin/login",
      { phone_number, password }
    );
    return response.data;
  },

  adminLogout: (): void => {
    adminTokens.clearAccess();
    window.location.href = "/admin/login";
  },

  isAdminLoggedIn: (): boolean => {
    return !!adminTokens.getAccess();
  },
};
