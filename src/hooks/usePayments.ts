"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentApi } from "@/api";
import type {
  CreatePaymentFormData,
  PaymentFilters,
  PaymentInitiationResult,
  PaymentWithRelations,
} from "@/types";

const PAYMENT_LIST_KEY = ["payments", "history"] as const;
const PAYMENT_DETAILS_KEY = ["payments", "details"] as const;

export function usePaymentHistory(
  filters?: PaymentFilters,
  options?: Omit<
    UseQueryOptions<PaymentWithRelations[], Error, PaymentWithRelations[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...PAYMENT_LIST_KEY, filters] as const,
    queryFn: async () => paymentApi.getPaymentHistory(filters),
    ...options,
  });
}

export function usePaymentDetails(
  paymentId: string | undefined | null,
  options?: Omit<
    UseQueryOptions<PaymentWithRelations, Error, PaymentWithRelations, readonly unknown[]>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...PAYMENT_DETAILS_KEY, paymentId] as const,
    queryFn: async () => paymentApi.getPaymentById(paymentId as string),
    enabled: Boolean(paymentId),
    ...options,
  });
}

export function useCreatePayment(
  options?: UseMutationOptions<PaymentInitiationResult, Error, CreatePaymentFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentFormData) => paymentApi.createPayment(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_LIST_KEY });
      if (result?.gatewayUrl && typeof window !== "undefined") {
        toast.success("Redirecting to payment gateway...");
        window.setTimeout(() => {
          window.location.href = result.gatewayUrl;
        }, 500);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment.");
    },
    ...options,
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: async (query: Parameters<typeof paymentApi.confirmPayment>[0]) =>
      paymentApi.confirmPayment(query),
    onError: (error) => {
      toast.error(error.message || "Payment confirmation failed.");
    },
  });
}
