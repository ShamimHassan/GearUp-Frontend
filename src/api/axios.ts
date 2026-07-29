import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getToken, clearAuth } from "@/lib/auth-storage";
import type { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gear-up-iota.vercel.app";
const DEFAULT_TIMEOUT = 30000;

export class ApiError extends Error {
  status: number;
  data?: unknown;
  errorDetails?: unknown;

  constructor(message: string, status: number, data?: unknown, errorDetails?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errorDetails = errorDetails;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<never> => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<ApiResponse<unknown> | Record<string, unknown>>): Promise<never> => {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data;

    let message = "Something went wrong. Please try again.";
    let errorDetails: unknown = undefined;

    if (typeof responseData === "object" && responseData !== null) {
      if ("message" in responseData && typeof responseData.message === "string") {
        message = responseData.message;
      }
      if ("errorDetails" in responseData) {
        errorDetails = (responseData as ApiResponse<unknown>).errorDetails;
      }
    }

    if (!navigatorOnLine()) {
      message = "Connection error. Please check your internet connection.";
    } else if (status === 401) {
      message = message || "Session expired. Please login again.";
      if (typeof window !== "undefined") {
        clearAuth();
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
        )}`;
        if (!window.location.pathname.startsWith("/auth/login")) {
          window.location.href = loginUrl;
        }
      }
    } else if (status === 403) {
      message = message || "You are not authorized to perform this action.";
    } else if (status === 404) {
      message = message || "Resource not found.";
    } else if (status === 409) {
      message = message || "Conflict. This resource may already exist.";
    } else if (status >= 500) {
      message = message || "Server error. Please try again later.";
    } else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      message = "Request timed out. Please try again.";
    } else if (axios.isCancel(error)) {
      message = "Request cancelled.";
    }

    const apiError = new ApiError(message, status, responseData, errorDetails);
    return Promise.reject(apiError);
  },
);

function navigatorOnLine(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export function extractApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return extractApiData(response);
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return extractApiData(response);
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data, config);
  return extractApiData(response);
}

export async function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return extractApiData(response);
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return extractApiData(response);
}

export { BASE_URL as API_BASE_URL };
export default api;
