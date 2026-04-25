"use client";

// apps/web/src/app/components/sidebar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Folder, 
  Cpu, 
  Users, 
  BarChart3, 
  BookText, 
  Wrench, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Package,
  ExternalLink,
  Globe
} from "lucide-react";
import { auth } from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    auth.me()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const menuItems = [
    { name: t("sidebar.dashboard"), href: "/", icon: <LayoutDashboard size={22} /> },
    { name: t("sidebar.projects"), href: "/projects", icon: <Folder size={22} /> },
    { name: t("sidebar.equipment"), href: "/equipment", icon: <Cpu size={22} /> },
    { name: t("sidebar.users"), href: "/users", icon: <Users size={22} /> },
    { name: t("sidebar.statistics"), href: "/statistics", icon: <BarChart3 size={22} /> },
    //{ name: t("sidebar.ledger"), href: "/ledger", icon: <BookText size={22} /> },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.reload();
  }

  return (
    <aside 
      className={`border-r border-gray-100 bg-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0 z-50 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <Link
        href="/"
        aria-label="Go to homepage"
        className={`flex items-center h-20 shrink-0 mb-2 transition-opacity ${
          isCollapsed ? "justify-center" : "px-6 gap-3"
        }`}
      >
      <div className="flex items-center justify-center shrink-0">
        <img
          src="/deti-maker-lab.png"
          alt="DETI MakerLab"
          className="w-10 h-10 object-contain"
        />
      </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-indigo-600 overflow-hidden">
            <span className="font-bold text-lg leading-tight tracking-tight truncate">
              DETI
            </span>
            <span className="font-bold text-lg leading-tight tracking-tight whitespace-nowrap">
              Maker Lab
            </span>
          </div>
        )}
      </Link>

      <div className="w-full h-px bg-gray-100 mb-4 shrink-0" />

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
              } ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={isCollapsed ? item.name : ""}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}

        {!isCollapsed && (
          <div className="mt-8 mb-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            {t("sidebar.management")}
          </div>
        )}
        {isCollapsed && <div className="h-px bg-gray-100 my-4 mx-2 shrink-0" />}
        
        <Link
          href="/admin"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all shrink-0 ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          }`}
          title={isCollapsed ? t("sidebar.technicianPortal") : ""}
        >
          <Wrench size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.technicianPortal")}</span>}
        </Link>
        
        <a
          href="https://inventory.deti-makerlab.ua.pt"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all shrink-0 ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          }`}
          title={isCollapsed ? t("sidebar.inventory") : ""}
        >
          <Package size={20} className="shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="whitespace-nowrap">{t("sidebar.inventory")}</span>
              <ExternalLink size={14} className="text-gray-400 shrink-0 ml-2" />
            </div>
          )}
        </a>
      </nav>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-2 shrink-0 bg-white">
        
        <div className={`flex items-center rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors shadow-sm ${isCollapsed ? "justify-center py-2" : "px-3 py-2"}`}>
          {isCollapsed ? (
            <div className="text-gray-500 font-bold text-xs uppercase cursor-pointer" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'pt' : 'en')} title={t("common.language")}>
              {i18n.language.substring(0,2)}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <Globe size={16} className="text-gray-400 shrink-0" />
              <select 
                className="bg-transparent text-sm font-medium text-gray-600 outline-none w-full cursor-pointer appearance-none"
                value={i18n.language.substring(0,2)}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">{t("common.en")}</option>
                <option value="pt">{t("common.pt")}</option>
                <option value="pl">{t("common.pl")}</option>
              </select>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all group ${
              isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
            }`}
            title={isCollapsed ? t("sidebar.logout") : ""}
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="whitespace-nowrap">{t("sidebar.logout")}</span>}
          </button>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border border-gray-100 rounded-xl p-2.5 w-full flex justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 shadow-sm"
          title={isCollapsed ? t("sidebar.expandSidebar") : t("sidebar.collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}