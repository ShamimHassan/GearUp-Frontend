import { apiGet, apiPatch } from "@/api/axios";
import { buildQueryParams } from "@/lib/utils";
import type {
  GearItemWithRelations,
  RentalOrderWithRelations,
  UpdateUserStatusFormData,
  User,
  UserFilters,
} from "@/types";

export const adminApi = {
  getAllUsers: (filters?: UserFilters) => {
    const params = buildQueryParams(filters);
    return apiGet<User[]>("/api/admin/users", { params });
  },

  updateUserStatus: (id: string, data: UpdateUserStatusFormData) =>
    apiPatch<User>(`/api/admin/users/${id}`, data),

  getAllGear: () => apiGet<GearItemWithRelations[]>("/api/admin/gear"),

  getAllRentals: () => apiGet<RentalOrderWithRelations[]>("/api/admin/rentals"),
};

export default adminApi;
