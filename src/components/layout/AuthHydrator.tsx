"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

/**
 * AuthHydrator — di-mount di root layout.
 * Saat app load, cek cookie (lewat /api/auth/me) dan hydrate user ke Zustand.
 * Ini membuat user tetap "login" setelah refresh page.
 */
export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { default: api } = await import("@/lib/api");
        const res = await api.get("/auth/me");
        const payload = res.data.data ?? res.data;
        if (!cancelled && payload?.user) {
          setUser(payload.user);
        }
      } catch {
        // 401 = belum login, itu normal
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return <>{children}</>;
}

export default AuthHydrator;
