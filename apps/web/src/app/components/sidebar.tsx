"use client";

// apps/web/src/app/components/sidebar.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Folder, Cpu, Users, BarChart3,
  BookText, Wrench, Menu, X, LogOut, Package,
  ExternalLink, Globe, ChevronLeft, ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    auth.me().then(() => setIsLoggedIn(true)).catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/auth")) return null;

  const menuItems = [
    { name: t("sidebar.dashboard"),  href: "/",           icon: <LayoutDashboard size={20} /> },
    { name: t("sidebar.projects"),   href: "/projects",   icon: <Folder size={20} /> },
    { name: t("sidebar.equipment"),  href: "/equipment",  icon: <Cpu size={20} /> },
    { name: t("sidebar.users"),      href: "/users",      icon: <Users size={20} /> },
    { name: t("sidebar.statistics"), href: "/statistics", icon: <BarChart3 size={20} /> },
    { name: t("sidebar.ledger"),     href: "/ledger",     icon: <BookText size={20} /> },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.reload();
  }

  const NavContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      <Link
        href="/"
        className={`flex items-center h-16 shrink-0 mb-2 ${collapsed ? "justify-center px-4" : "px-5 gap-3"}`}
      >
        <img src="/deti-maker-lab.png" alt="DETI MakerLab" className="w-9 h-9 object-contain shrink-0" />
        {!collapsed && (
          <span className="font-bold text-base text-indigo-600 truncate">DETI Maker Lab</span>
        )}
      </Link>

      <div className="h-px bg-gray-100 mb-3 mx-3" />

      <nav className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                collapsed ? "justify-center py-3 px-2" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.name : ""}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {!collapsed ? (
          <div className="mt-6 mb-1 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t("sidebar.management")}
          </div>
        ) : (
          <div className="h-px bg-gray-100 my-3 mx-1" />
        )}

        <Link
          href="/admin"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all ${
            collapsed ? "justify-center py-3 px-2" : "gap-3 px-3 py-2.5"
          } ${pathname === "/admin" ? "bg-indigo-600 text-white" : ""}`}
          title={collapsed ? t("sidebar.technicianPortal") : ""}
        >
          <Wrench size={20} className="shrink-0" />
          {!collapsed && <span>{t("sidebar.technicianPortal")}</span>}
        </Link>
        <a
          href="https://inventory.deti-makerlab.ua.pt"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all ${
            collapsed ? "justify-center py-3 px-2" : "gap-3 px-3 py-2.5"
          }`}
          title={collapsed ? t("sidebar.inventory") : ""}
        >
          <Package size={20} className="shrink-0" />
          {!collapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span>{t("sidebar.inventory")}</span>
              <ExternalLink size={13} className="text-gray-400 shrink-0 ml-1" />
            </div>
          )}
        </a>
      </nav>

      <div className="p-3 border-t border-gray-100 flex flex-col gap-1.5 shrink-0">
        <div className={`flex items-center rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors ${
          collapsed ? "justify-center py-2.5" : "px-3 py-2"
        }`}>
          {collapsed ? (
            <button
              onClick={() => i18n.changeLanguage(i18n.language?.startsWith("en") ? "pt" : "en")}
              className="text-gray-500 font-bold text-xs uppercase"
              title={t("common.language")}
            >
              {(i18n.language || "en").substring(0, 2)}
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Globe size={15} className="text-gray-400 shrink-0" />
              <select
                className="bg-transparent text-sm font-medium text-gray-600 outline-none w-full cursor-pointer"
                value={(i18n.language || "en").substring(0, 2)}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">{t("common.en")}</option>
                <option value="pt">{t("common.pt")}</option>
              </select>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all ${
              collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
            }`}
            title={collapsed ? t("sidebar.logout") : ""}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>{t("sidebar.logout")}</span>}
          </button>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex border border-gray-100 rounded-xl p-2 w-full justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          title={isCollapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <img src="/deti-maker-lab.png" alt="DETI MakerLab" className="w-8 h-8 object-contain" />
          <span className="font-bold text-sm text-indigo-600">DETI Maker Lab</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={(e) => { if (e.target === e.currentTarget) setIsMobileOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <div className="relative w-64 h-full bg-white flex flex-col shadow-xl">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <NavContent collapsed={false} />
          </div>
        </div>
      )}

      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-100 bg-white transition-all duration-300 shrink-0 z-30 ${
          isCollapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <NavContent collapsed={isCollapsed} />
      </aside>

      <div className="lg:hidden h-14 shrink-0" />
    </>
  );
}