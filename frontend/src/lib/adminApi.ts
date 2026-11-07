import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL } from "@/constants";
import { adminTokens } from "@/lib/adminTokens";
import { refreshAccessToken } from "@/lib/refreshSession";

const createAdminApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    const token = adminTokens.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          const accessToken = await refreshAccessToken();
          adminTokens.setAccess(accessToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return instance(error.config);
        } catch {
          adminTokens.clearAccess();
          window.location.href = "/admin/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const adminApiClient = createAdminApiInstance();
