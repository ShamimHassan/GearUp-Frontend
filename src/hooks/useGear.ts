"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { gearApi } from "@/api";
import type {
  Category,
  GearFilters,
  GearItemWithRelations,
  ReviewWithRelations,
} from "@/types";

const GEAR_LIST_KEY = ["gear", "list"] as const;
const GEAR_DETAILS_KEY = ["gear", "details"] as const;
const GEAR_REVIEWS_KEY = ["gear", "reviews"] as const;
const CATEGORIES_KEY = ["gear", "categories"] as const;

export function useGearList(
  filters?: GearFilters,
  options?: Omit<
    UseQueryOptions<GearItemWithRelations[], Error, GearItemWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...GEAR_LIST_KEY, filters] as const,
    queryFn: async () => gearApi.getAllGear(filters),
    ...options,
  });
}

export function useGearDetails(
  id: string | undefined | null,
  options?: Omit<
    UseQueryOptions<GearItemWithRelations, Error, GearItemWithRelations, readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...GEAR_DETAILS_KEY, id] as const,
    queryFn: async () => gearApi.getGearById(id as string),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGearReviews(
  gearId: string | undefined | null,
  options?: Omit<
    UseQueryOptions<ReviewWithRelations[], Error, ReviewWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...GEAR_REVIEWS_KEY, gearId] as const,
    queryFn: async () => gearApi.getGearReviews(gearId as string),
    enabled: Boolean(gearId),
    ...options,
  });
}

export function useCategories(
  options?: Omit<
    UseQueryOptions<Category[], Error, Category[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => gearApi.getAllCategories(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useInvalidateGearCache() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: GEAR_LIST_KEY });
    queryClient.invalidateQueries({ queryKey: GEAR_DETAILS_KEY });
    queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
  };
}

export function _useGearMutationPlaceholder() {
  void useMutation;
  void toast;
}
