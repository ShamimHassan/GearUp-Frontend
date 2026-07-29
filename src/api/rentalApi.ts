import { apiGet, apiPost } from "@/api/axios";
import type {
  RentalFormData,
  RentalOrderWithRelations,
} from "@/types";

export const rentalApi = {
  createRental: (data: RentalFormData) =>
    apiPost<RentalOrderWithRelations>("/api/rentals", data),

  getMyRentals: () => apiGet<RentalOrderWithRelations[]>("/api/rentals"),

  getRentalById: (id: string) =>
    apiGet<RentalOrderWithRelations>(`/api/rentals/${id}`),
};

export default rentalApi;
