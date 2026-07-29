"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { providerApi } from "@/api";
import type {
  GearFormData,
  GearItem,
  RentalOrderWithRelations,
  UpdateOrderStatusFormData,
} from "@/types";

const PROVIDER_GEAR_KEY = ["provider", "gear"] as const;
const PROVIDER_ORDERS_KEY = ["provider", "orders"] as const;
const PUBLIC_GEAR_LIST_KEY = ["gear", "list"] as const;
const RENTALS_LIST_KEY = ["rentals"] as const;

export function useProviderGear(
  options?: Omit<
    UseQueryOptions<GearItem[], Error, GearItem[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: PROVIDER_GEAR_KEY,
    queryFn: async () => providerApi.getProviderGear(),
    ...options,
  });
}

export function useCreateGear(
  options?: UseMutationOptions<GearItem, Error, GearFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GearFormData) => providerApi.createGear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_GEAR_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_GEAR_LIST_KEY });
      toast.success("Gear item added to inventory.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add gear item.");
    },
    ...options,
  });
}

export function useUpdateGear(
  options?: UseMutationOptions<GearItem, Error, { id: string; data: GearFormData }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GearFormData }) =>
      providerApi.updateGear(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_GEAR_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_GEAR_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["gear", "details", id] });
      toast.success("Gear item updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update gear item.");
    },
    ...options,
  });
}

export function useDeleteGear(
  options?: UseMutationOptions<GearItem, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providerApi.deleteGear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_GEAR_KEY });
      queryClient.invalidateQueries({ queryKey: PUBLIC_GEAR_LIST_KEY });
      toast.success("Gear item removed.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete gear item.");
    },
    ...options,
  });
}

export function useProviderOrders(
  options?: Omit<
    UseQueryOptions<RentalOrderWithRelations[], Error, RentalOrderWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: PROVIDER_ORDERS_KEY,
    queryFn: async () => providerApi.getProviderOrders(),
    ...options,
  });
}

export function useUpdateOrderStatus(
  options?: UseMutationOptions<
    RentalOrderWithRelations,
    Error,
    { id: string; data: UpdateOrderStatusFormData }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusFormData }) =>
      providerApi.updateOrderStatus(id, data),
    onMutate: async ({ id, data }) => {
      const ordersQueryKey = PROVIDER_ORDERS_KEY;
      const rentalListKey = RENTALS_LIST_KEY;
      const rentalDetailsKey = ["rentals", "details", id] as const;
      const adminRentalsKey = ["admin", "rentals"] as const;

      const prevOrders = queryClient.getQueryData<RentalOrderWithRelations[]>(ordersQueryKey);
      const prevRentals = queryClient.getQueryData<RentalOrderWithRelations[]>(rentalListKey);
      const prevRental = queryClient.getQueryData<RentalOrderWithRelations>(rentalDetailsKey);
      const prevAdminRentals = queryClient.getQueryData<RentalOrderWithRelations[]>(adminRentalsKey);

      if (prevOrders) {
        queryClient.setQueryData(
          ordersQueryKey,
          prevOrders.map((o) => (o.id === id ? { ...o, status: data.status } : o)),
        );
      }
      if (prevRentals) {
        queryClient.setQueryData(
          rentalListKey,
          prevRentals.map((o) => (o.id === id ? { ...o, status: data.status } : o)),
        );
      }
      if (prevRental) {
        queryClient.setQueryData(rentalDetailsKey, { ...prevRental, status: data.status });
      }
      if (prevAdminRentals) {
        queryClient.setQueryData(
          adminRentalsKey,
          prevAdminRentals.map((o) => (o.id === id ? { ...o, status: data.status } : o)),
        );
      }

      return { prevOrders, prevRentals, prevRental, prevAdminRentals };
    },
    onError: (error, _vars, context) => {
      if (context) {
        if (context.prevOrders !== undefined) {
          queryClient.setQueryData(PROVIDER_ORDERS_KEY, context.prevOrders);
        }
        if (context.prevRentals !== undefined) {
          queryClient.setQueryData(RENTALS_LIST_KEY, context.prevRentals);
        }
      }
      toast.error(error.message || "Failed to update order status.");
    },
    onSettled: (_result, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROVIDER_ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: RENTALS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["rentals", "details", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "rentals"] });
    },
    onSuccess: () => {
      toast.success("Order status updated.");
    },
    ...options,
  });
}
