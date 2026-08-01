"use client";

import { useEffect, type ReactNode } from "react";
import { useHasHydrated, useHydrateAction, useCheckAuthAction } from "@/store/authStore";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Use individual stable selectors — NOT useAuthActions() which returns a
  // new object reference every render and causes an infinite useEffect loop
  const hydrate = useHydrateAction();
  const checkAuth = useCheckAuthAction();
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    // Only run once on mount
    if (!hasHydrated) {
      hydrate();
    }
    void checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — intentional: run only on mount

  return <>{children}</>;
}
