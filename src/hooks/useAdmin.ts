"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/api";
import type {
  GearItemWithRelations,
  RentalOrderWithRelations,
  UpdateUserStatusFormData,
  User,
  UserFilters,
} from "@/types";

const ADMIN_USERS_KEY = ["admin", "users"] as const;
const ADMIN_GEAR_KEY = ["admin", "gear"] as const;
const ADMIN_RENTALS_KEY = ["admin", "rentals"] as const;
const PUBLIC_GEAR_KEY = ["gear"] as const;
const PROVIDER_ORDERS_KEY = ["provider", "orders"] as const;
const RENTALS_KEY = ["rentals"] as const;

export function useAllUsers(
  filters?: UserFilters,
  options?: Omit<
    UseQueryOptions<User[], Error, User[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, filters] as const,
    queryFn: async () => adminApi.getAllUsers(filters),
    ...options,
  });
}

export function useUpdateUserStatus(
  options?: UseMutationOptions<User, Error, { id: string; data: UpdateUserStatusFormData }, { prevUsers: User[] | undefined }>,
) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: UpdateUserStatusFormData }, { prevUsers: User[] | undefined }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserStatusFormData }) =>
      adminApi.updateUserStatus(id, data),
    onMutate: async ({ id, data }): Promise<{ prevUsers: User[] | undefined }> => {
      const prevUsers = queryClient.getQueryData<User[]>(ADMIN_USERS_KEY);
      if (prevUsers) {
        queryClient.setQueryData(
          ADMIN_USERS_KEY,
          prevUsers.map((u) => (u.id === id ? { ...u, isActive: data.isActive } : u)),
        );
      }
      return { prevUsers };
    },
    onSuccess: (_result, _vars) => {
      toast.success("User status updated.");
    },
    onError: (error, _vars, context) => {
      if (context?.prevUsers !== undefined) {
        queryClient.setQueryData(ADMIN_USERS_KEY, context.prevUsers);
      }
      toast.error(error.message || "Failed to update user status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
    ...options,
  });
}

export function useAllGearAdmin(
  options?: Omit<
    UseQueryOptions<GearItemWithRelations[], Error, GearItemWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ADMIN_GEAR_KEY,
    queryFn: async () => adminApi.getAllGear(),
    ...options,
  });
}

export function useAllRentalsAdmin(
  options?: Omit<
    UseQueryOptions<RentalOrderWithRelations[], Error, RentalOrderWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: ADMIN_RENTALS_KEY,
    queryFn: async () => adminApi.getAllRentals(),
    ...options,
  });
}

export function useAdminGlobalInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_GEAR_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_RENTALS_KEY });
    queryClient.invalidateQueries({ queryKey: PUBLIC_GEAR_KEY });
    queryClient.invalidateQueries({ queryKey: PROVIDER_ORDERS_KEY });
    queryClient.invalidateQueries({ queryKey: RENTALS_KEY });
  };
}
