"use client";

// // apps/web/src/app/components/sidebar.tsx
import { useState } from "react";
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
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={22} /> },
    { name: "Projects", href: "/projects", icon: <Folder size={22} /> },
    { name: "Equipment", href: "/equipment", icon: <Cpu size={22} /> },
    { name: "Users", href: "/users", icon: <Users size={22} /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart3 size={22} /> },
    { name: "Ledger", href: "/ledger", icon: <BookText size={22} /> },
  ];

  return (
    <aside 
      className={`border-r border-gray-100 bg-white flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-75"
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center h-20 mb-2 ${isCollapsed ? "justify-center" : "px-6 gap-3"}`}>
        <div className="bg-indigo-600 p-2 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
          <Network size={22} className="text-white" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-black">
            <span className="font-bold text-lg leading-tight tracking-tight">DETI</span>
            <span className="font-bold text-lg leading-tight tracking-tight whitespace-nowrap">Maker Lab</span>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 mb-4" />

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
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
          <div className="mt-8 mb-2 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Management
          </div>
        )}
        {isCollapsed && <div className="h-px bg-gray-100 my-4 mx-2" />}
        
        <Link
          href="/admin"
          className={`flex items-center rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all ${
            isCollapsed ? "justify-center py-3" : "gap-3 px-4 py-3"
          }`}
          title={isCollapsed ? "Technician Portal" : ""}
        >
          <Wrench size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Technician Portal</span>}
        </Link>
      </nav>

      {/* Collapse Button Footer */}
      <div className="p-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border border-gray-100 rounded-xl p-2.5 w-full flex justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}