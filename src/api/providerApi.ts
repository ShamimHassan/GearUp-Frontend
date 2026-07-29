import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/api/axios";
import type {
  GearFormData,
  GearItem,
  RentalOrderWithRelations,
  UpdateOrderStatusFormData,
} from "@/types";

export const providerApi = {
  createGear: (data: GearFormData) =>
    apiPost<GearItem>("/api/provider/gear", {
      name: data.name,
      description: data.description,
      brand: data.brand,
      price: data.price,
      stock: data.stock,
      images: data.images ?? [],
      categoryId: data.categoryId,
      isAvailable: data.isAvailable ?? true,
    }),

  getProviderGear: () => apiGet<GearItem[]>("/api/provider/gear"),

  updateGear: (id: string, data: GearFormData) =>
    apiPut<GearItem>(`/api/provider/gear/${id}`, {
      name: data.name,
      description: data.description,
      brand: data.brand,
      price: data.price,
      stock: data.stock,
      images: data.images ?? [],
      categoryId: data.categoryId,
      isAvailable: data.isAvailable ?? true,
    }),

  deleteGear: (id: string) =>
    apiDelete<GearItem>(`/api/provider/gear/${id}`),

  getProviderOrders: () =>
    apiGet<RentalOrderWithRelations[]>("/api/provider/orders"),

  updateOrderStatus: (id: string, data: UpdateOrderStatusFormData) =>
    apiPatch<RentalOrderWithRelations>(`/api/provider/orders/${id}`, data),
};

export default providerApi;
