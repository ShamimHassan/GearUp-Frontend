import { apiGet, apiPost, apiPut, apiPatch } from "@/api/axios";
import type {
  AuthPayload,
  ChangePasswordFormData,
  LoginFormData,
  ProfileFormData,
  RegisterFormData,
  User,
} from "@/types";

export const authApi = {
  register: (data: RegisterFormData) => {
    const payload: Omit<RegisterFormData, "confirmPassword"> = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.address ? { address: data.address } : {}),
    };
    return apiPost<AuthPayload>("/api/auth/register", payload);
  },

  login: (data: LoginFormData) => apiPost<AuthPayload>("/api/auth/login", data),

  getMe: () => apiGet<User>("/api/auth/me"),

  updateProfile: (data: ProfileFormData) => apiPut<User>("/api/auth/me", data),

  changePassword: (data: ChangePasswordFormData) => {
    const payload: { oldPassword: string; newPassword: string } = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };
    return apiPatch<User>("/api/auth/change-password", payload);
  },
};

export default authApi;
