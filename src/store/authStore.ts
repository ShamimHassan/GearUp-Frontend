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
    // Clear the server-side cookie too
    if (typeof window !== "undefined") {
      fetch("/api/auth/set-token", { method: "DELETE" }).catch(() => {});
    }
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

// Individual action selectors — avoids returning a new object on every render
// which would cause infinite re-render loops in useEffect dependencies
export function useLoginAction() {
  return useAuthStore((s) => s.login);
}
export function useLogoutAction() {
  return useAuthStore((s) => s.logout);
}
export function useSetUserAction() {
  return useAuthStore((s) => s.setUser);
}
export function useSetTokenAction() {
  return useAuthStore((s) => s.setToken);
}
export function useCheckAuthAction() {
  return useAuthStore((s) => s.checkAuth);
}
export function useHydrateAction() {
  return useAuthStore((s) => s.hydrate);
}
export function useResetLoadingAction() {
  return useAuthStore((s) => s.resetLoading);
}

/** @deprecated Use individual action hooks instead to avoid re-render loops */
export function useAuthActions(): Pick<
  AuthState,
  "login" | "logout" | "setUser" | "setToken" | "checkAuth" | "hydrate" | "resetLoading"
> {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hydrate = useAuthStore((s) => s.hydrate);
  const resetLoading = useAuthStore((s) => s.resetLoading);
  return { login, logout, setUser, setToken, checkAuth, hydrate, resetLoading };
}

export { useAuthStore };
export type { AuthState };
export default useAuthStore;
