"use client";

import { create, type StateCreator } from "zustand";
import type { User } from "@/types";
import {
  clearAuth as storageClearAuth,
  getToken as storageGetToken,
  getUser as storageGetUser,
  setToken as storageSetToken,
  setUser as storageSetUser,
} from "@/lib/auth-storage";
import { authApi } from "@/api";
import { ApiError } from "@/api/axios";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: Partial<User> | User) => void;
  setToken: (token: string) => void;
  hydrate: () => void;
  checkAuth: () => Promise<void>;
  resetLoading: () => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
};

const stateCreator: StateCreator<AuthState, [], [], AuthState> = (set, get) => ({
  ...initialState,

  login: (token: string, user: User) => {
    storageSetToken(token);
    storageSetUser(user);
    set({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading: false,
    });
  },

  setToken: (token: string) => {
    storageSetToken(token);
    set({
      token,
      isAuthenticated: Boolean(token && get().user),
    });
  },

  setUser: (user: Partial<User> | User) => {
    const currentUser = get().user;
    const merged: User = {
      ...(currentUser ?? ({} as User)),
      ...(user as Partial<User>),
    } as User;
    storageSetUser(merged);
    set({
      user: merged,
      isAuthenticated: Boolean(get().token && merged),
    });
  },

  logout: () => {
    storageClearAuth();
    set({
      ...initialState,
      hasHydrated: true,
    });
    if (typeof window !== "undefined") {
      try {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/auth/login?redirect=${redirect}`;
      } catch {
        window.location.href = "/auth/login";
      }
    }
  },

  resetLoading: () => {
    set({ isLoading: false });
  },

  hydrate: () => {
    if (get().hasHydrated) return;
    let token: string | null = null;
    let user: User | null = null;
    try {
      token = storageGetToken();
      user = storageGetUser();
    } catch {
      token = null;
      user = null;
    }
    set({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      hasHydrated: true,
    });
  },

  checkAuth: async () => {
    if (!get().hasHydrated) {
      get().hydrate();
    }
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const freshUser = await authApi.getMe();
      storageSetUser(freshUser);
      set({
        user: freshUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const isUnauthorized =
        err instanceof ApiError && (err.status === 401 || err.status === 403);
      if (isUnauthorized) {
        storageClearAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    }
  },
});

const useAuthStore = create<AuthState>(stateCreator);

export function useUser(): User | null {
  return useAuthStore((s) => s.user);
}

export function useToken(): string | null {
  return useAuthStore((s) => s.token);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.isAuthenticated);
}

export function useAuthLoading(): boolean {
  return useAuthStore((s) => s.isLoading);
}

export function useHasHydrated(): boolean {
  return useAuthStore((s) => s.hasHydrated);
}

export function useAuthActions(): Pick<
  AuthState,
  "login" | "logout" | "setUser" | "setToken" | "checkAuth" | "hydrate" | "resetLoading"
> {
  return useAuthStore((s) => ({
    login: s.login,
    logout: s.logout,
    setUser: s.setUser,
    setToken: s.setToken,
    checkAuth: s.checkAuth,
    hydrate: s.hydrate,
    resetLoading: s.resetLoading,
  }));
}

export { useAuthStore };
export type { AuthState };
export default useAuthStore;
