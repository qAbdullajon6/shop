import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { API_ENDPOINTS } from "@/constants";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/types";

export const addressesService = {
  getAll: () =>
    apiGet<Address[]>(API_ENDPOINTS.ADDRESSES.LIST),

  getById: (id: string) =>
    apiGet<Address>(API_ENDPOINTS.ADDRESSES.DETAIL(id)),

  create: (payload: CreateAddressPayload) =>
    apiPost<Address>(API_ENDPOINTS.ADDRESSES.CREATE, payload),

  update: (id: string, payload: UpdateAddressPayload) =>
    apiPatch<Address>(API_ENDPOINTS.ADDRESSES.UPDATE(id), payload),

  setDefault: (id: string) =>
    apiPatch<Address>(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id), null),

  delete: (id: string) =>
    apiDelete<void>(API_ENDPOINTS.ADDRESSES.DELETE(id)),
};
