import { apiGet } from "@/api/axios";
import { buildQueryParams } from "@/lib/utils";
import type {
  Category,
  GearFilters,
  GearItemWithRelations,
  ReviewWithRelations,
} from "@/types";

export const gearApi = {
  getAllGear: (filters?: GearFilters) => {
    const params = buildQueryParams(filters);
    return apiGet<GearItemWithRelations[]>("/api/gear", { params });
  },

  getGearById: (id: string) => apiGet<GearItemWithRelations>(`/api/gear/${id}`),

  getGearReviews: (gearId: string) =>
    apiGet<ReviewWithRelations[]>(`/api/gear/${gearId}/reviews`),

  getAllCategories: () => apiGet<Category[]>("/api/categories"),
};

export default gearApi;
