"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      hydrate();
    }
    void checkAuth();
  }, [hydrate, checkAuth, hasHydrated]);

  return <>{children}</>;
}
