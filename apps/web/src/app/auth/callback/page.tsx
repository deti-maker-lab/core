"use client";

// apps/web/src/app/auth/callback/page.tsx
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }

    const returnUrl = localStorage.getItem("returnUrl") ?? "/new";
    localStorage.removeItem("returnUrl");

    const safeUrl = returnUrl.startsWith("/new") ? returnUrl : "/new" + returnUrl;
    window.location.replace(safeUrl);
  }, []);

  return <p>Authenticating...</p>;
}