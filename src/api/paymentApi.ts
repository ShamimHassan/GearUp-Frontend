import api, { apiGet, apiPost } from "@/api/axios";
import { buildQueryParams } from "@/lib/utils";
import type {
  ConfirmPaymentQuery,
  CreatePaymentFormData,
  PaymentFilters,
  PaymentInitiationResult,
  PaymentWithRelations,
} from "@/types";

export const paymentApi = {
  createPayment: (data: CreatePaymentFormData) =>
    apiPost<PaymentInitiationResult>("/api/payments/create", data),

  confirmPayment: (query: ConfirmPaymentQuery) => {
    const params = { ...query };
    return api.post<unknown>("/api/payments/confirm", null, { params });
  },

  getPaymentHistory: (filters?: PaymentFilters) => {
    const params = buildQueryParams(filters);
    return apiGet<PaymentWithRelations[]>("/api/payments", { params });
  },

  getPaymentById: (paymentId: string) =>
    apiGet<PaymentWithRelations>(`/api/payments/${paymentId}`),
};

export default paymentApi;
