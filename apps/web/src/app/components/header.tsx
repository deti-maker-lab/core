"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, UserCircle, Check } from "lucide-react";
import { auth, notifications as notificationsApi } from "@/lib/api";
import type { User, Notification } from "@/lib/api";

export default function Header() {
  const [user, setUser]           = useState<User | null>(null);
  const [loaded, setLoaded]       = useState(false);
  const [notifs, setNotifs]       = useState<Notification[]>([]);
  const [open, setOpen]           = useState(false);
  const panelRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    auth.me()
      .then((u: User) => {
        setUser(u);
        return notificationsApi.list();
      })
      .then(setNotifs)
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markRead(id: number) {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const unread = notifs.filter((n) => !n.is_read);
    await Promise.allSettled(unread.map((n) => notificationsApi.markRead(n.id)));
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.reload();
  }

  const getNotifStyles = (isRead: boolean, type?: string) => {
    if (isRead) return "bg-white hover:bg-gray-50 border-transparent";
    switch (type) {
      case "success": return "bg-green-50 hover:bg-green-100 border-l-4 border-green-400";
      case "error":   return "bg-red-50 hover:bg-red-100 border-l-4 border-red-400";
      case "warning": return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400";
      default:        return "bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400";
    }
  };

  const getTextColor = (isRead: boolean, type?: string) => {
    if (isRead) return "text-gray-700";
    switch (type) {
      case "success": return "text-green-800";
      case "error":   return "text-red-800";
      case "warning": return "text-yellow-800";
      default:        return "text-purple-800";
    }
  };

  const getDotColor = (type?: string) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "error":   return "bg-red-500";
      case "warning": return "bg-yellow-500";
      default:        return "bg-purple-500";
    }
  };

  if (!loaded) return <div className="flex justify-end mb-6 h-8" />;

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
      {user ? (
        <>
          <div className="relative flex items-center" ref={panelRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative flex items-center justify-center hover:text-gray-600 transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifs.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => !n.is_read && markRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 transition-all relative ${getNotifStyles(n.is_read, n.type)}`}
                      >
                        {!n.is_read && (
                          <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${getDotColor(n.type)}`} />
                        )}
                        <div className={`text-xs font-bold mb-0.5 pr-4 ${getTextColor(n.is_read, n.type)}`}>
                          {n.title}
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed pr-4">
                          {n.message}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString("pt-PT", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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