"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Listens for browser online/offline events and shows persistent toasts.
 * Renders nothing — side-effect only.
 */
export default function NetworkStatus() {
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // Show immediately if already offline on mount
    if (!navigator.onLine) {
      toastIdRef.current = toast.error("You are offline", {
        description: "Check your internet connection. Some features may not work.",
        duration: Infinity,
        id: "network-offline",
      });
    }

    const handleOffline = () => {
      toastIdRef.current = toast.error("You are offline", {
        description: "Check your internet connection. Some features may not work.",
        duration: Infinity,
        id: "network-offline",
      });
    };

    const handleOnline = () => {
      toast.dismiss("network-offline");
      toast.success("Back online", {
        description: "Your connection has been restored.",
        duration: 3000,
        id: "network-online",
      });
      toastIdRef.current = null;
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
