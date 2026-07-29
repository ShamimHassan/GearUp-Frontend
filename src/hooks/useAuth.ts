"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/api";
import {
  clearAuth,
  setToken,
  setUser as storeSetUser,
} from "@/lib/auth-storage";
import type {
  AuthPayload,
  ChangePasswordFormData,
  LoginFormData,
  ProfileFormData,
  RegisterFormData,
  User,
} from "@/types";

const QUERY_KEY = ["auth", "me"] as const;

export function useMe(
  options?: Omit<UseQueryOptions<User, Error, User, typeof QUERY_KEY>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => authApi.getMe(),
    ...options,
  });
}

export function useLogin(
  options?: UseMutationOptions<AuthPayload, Error, LoginFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (payload) => {
      setToken(payload.token);
      storeSetUser(payload.user);
      queryClient.setQueryData(QUERY_KEY, payload.user);
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
    ...options,
  });
}

export function useRegister(
  options?: UseMutationOptions<AuthPayload, Error, RegisterFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: (payload) => {
      setToken(payload.token);
      storeSetUser(payload.user);
      queryClient.setQueryData(QUERY_KEY, payload.user);
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
    ...options,
  });
}

export function useUpdateProfile(
  options?: UseMutationOptions<User, Error, ProfileFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileFormData) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      storeSetUser(updatedUser);
      queryClient.setQueryData(QUERY_KEY, updatedUser);
      toast.success("Profile updated successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile.");
    },
    ...options,
  });
}

export function useChangePassword(
  options?: UseMutationOptions<User, Error, ChangePasswordFormData>,
) {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password.");
    },
    ...options,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = () => {
    clearAuth();
    queryClient.removeQueries({ queryKey: QUERY_KEY });
    queryClient.clear();
    queryClient.resetQueries();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };
  return { logout };
}
