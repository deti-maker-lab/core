"use client";

// apps/web/src/app/components/sidebar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Network, 
  LayoutDashboard, 
  Folder, 
  Cpu, 
  Users, 
  BarChart3, 
  BookText, 
  Wrench, 
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { auth } from "@/lib/api"; // A magia que fomos buscar ao Header!

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para sabermos se há login

  // Vai perguntar à API se existe uma sessão válida
  useEffect(() => {
    auth.me()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={22} /> },
    { name: "Projects", href: "/projects", icon: <Folder size={22} /> },
    { name: "Equipment", href: "/equipment", icon: <Cpu size={22} /> },
    { name: "Users", href: "/users", icon: <Users size={22} /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart3 size={22} /> },
    { name: "Ledger", href: "/ledger", icon: <BookText size={22} /> },
  ];

  // A verdadeira função de Logout (roubada do Header)
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
      {/* Logo Section */}
      <div className={`flex items-center h-20 shrink-0 mb-2 ${isCollapsed ? "justify-center" : "px-6 gap-3"}`}>
        <div className="bg-indigo-600 p-2 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
          <Network size={22} className="text-white" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-black overflow-hidden">
            <span className="font-bold text-lg leading-tight tracking-tight truncate">DETI</span>
            <span className="font-bold text-lg leading-tight tracking-tight whitespace-nowrap">Maker Lab</span>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 mb-4 shrink-0" />

      {/* Main Navigation */}
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

        {/* Separator / Management Section */}
        {!isCollapsed && (
          <div className="mt-8 mb-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            Management
          </div>
        )}
        {isCollapsed && <div className="h-px bg-gray-100 my-4 mx-2 shrink-0" />}
        
        <Link
          href="/admin"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all shrink-0 ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          }`}
          title={isCollapsed ? "Technician Portal" : ""}
        >
          <Wrench size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Technician Portal</span>}
        </Link>
      </nav>

      {/* Footer com Botões de Logout e Collapse */}
      <div className="p-4 border-t border-gray-100 flex flex-col gap-2 shrink-0 bg-white">
        
        {/* O botão agora SÓ aparece se a pessoa estiver logada! */}
        {isLoggedIn && (
          <button 
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all group ${
              isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        )}

        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border border-gray-100 rounded-xl p-2.5 w-full flex justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 shadow-sm"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}