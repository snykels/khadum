"use client";

import { useEffect, useState, useCallback } from "react";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  phone?: string | null;
  avatar?: string | null;
  isVerified?: boolean | null;
};

export function useUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
<<<<<<< HEAD
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
=======
    await fetch("/api/auth/logout", { method: "POST" });
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, refresh, logout };
}
