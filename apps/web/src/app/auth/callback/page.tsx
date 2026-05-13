"use client";

// apps/web/src/app/auth/callback/page.tsx
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthCallbackInner() {
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
  }, [searchParams]);

  return <p>Authenticating...</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}