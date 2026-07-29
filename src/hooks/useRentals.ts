"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { rentalApi } from "@/api";
import type {
  RentalFormData,
  RentalOrderWithRelations,
} from "@/types";

const RENTAL_LIST_KEY = ["rentals", "mine"] as const;
const RENTAL_DETAILS_KEY = ["rentals", "details"] as const;

export function useMyRentals(
  options?: Omit<
    UseQueryOptions<RentalOrderWithRelations[], Error, RentalOrderWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: RENTAL_LIST_KEY,
    queryFn: async () => rentalApi.getMyRentals(),
    ...options,
  });
}

export function useRentalDetails(
  id: string | undefined | null,
  options?: Omit<
    UseQueryOptions<RentalOrderWithRelations, Error, RentalOrderWithRelations, readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...RENTAL_DETAILS_KEY, id] as const,
    queryFn: async () => rentalApi.getRentalById(id as string),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateRental(
  options?: UseMutationOptions<RentalOrderWithRelations, Error, RentalFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RentalFormData) => rentalApi.createRental(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RENTAL_LIST_KEY });
      toast.success("Rental request placed successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place rental request.");
    },
    ...options,
  });
}

export function useInvalidateRentals() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: RENTAL_LIST_KEY });
    queryClient.invalidateQueries({ queryKey: RENTAL_DETAILS_KEY });
  };
}
