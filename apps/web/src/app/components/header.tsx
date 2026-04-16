"use client";

// // apps/web/src/app/components/header.tsx
import { useEffect, useState } from "react";
import { Bell, UserCircle, LogIn, LogOut } from "lucide-react";
import { auth } from "@/lib/api";
import type { User } from "@/lib/api";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.reload();
  }

  if (!loaded) return <div className="flex justify-end mb-6 h-8" />;

  return (
    <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
      {user ? (
        <>
          <Bell size={24} className="cursor-pointer hover:text-gray-600 transition-colors" />
          <div className="flex items-center gap-2">
            <UserCircle size={28} className="cursor-pointer hover:text-gray-600 transition-colors" />
            <span className="text-sm font-medium text-gray-600">{user.name.split(" ")[0]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <button onClick={() => {
            localStorage.setItem("returnUrl", window.location.pathname + window.location.search);
            window.location.href = auth.loginUrl();
        }}>
            Login
        </button>
      )}
    </div>
  );
}