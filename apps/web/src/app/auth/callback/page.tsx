"use client";

// // apps/web/src/app/auth/callback/sidebar.tsx
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

    const returnUrl = localStorage.getItem("returnUrl") ?? "/";
    localStorage.removeItem("returnUrl");
    window.location.replace(returnUrl);
  }, []);

  return <p>Authenticating...</p>;
}