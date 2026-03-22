"use client";

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
  // State to track if the sidebar is collapsed or not
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", href: "/projects", icon: <Folder size={20} /> },
    { name: "Equipment", href: "/equipment", icon: <Cpu size={20} /> },
    { name: "Users", href: "/users", icon: <Users size={20} /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart3 size={20} /> },
    { name: "Ledger", href: "/ledger", icon: <BookText size={20} /> },
  ];

  return (
    <aside 
      // The width changes smoothly based on the isCollapsed state
      className={`border-r border-gray-200 bg-white flex flex-col h-screen p-4 transition-all duration-300 ${
        isCollapsed ? "w-20 items-center" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center text-gray-800 mb-8 ${isCollapsed ? "justify-center" : "gap-2 px-2"}`}>
        <Network size={24} className="shrink-0" />
        {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap">DETI Maker Lab</span>}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1 w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2"
              } ${
                isActive 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={isCollapsed ? item.name : ""} // Adds a little tooltip when collapsed
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}

        {/* Separator / Management Section */}
        {isCollapsed ? (
          <div className="w-full h-px bg-gray-200 my-4"></div>
        ) : (
          <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Management
          </div>
        )}
        
        <Link
          href="/admin"
          className={`flex items-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${
            isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2"
          }`}
          title={isCollapsed ? "Technician Portal" : ""}
        >
          <Wrench size={20} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Technician Portal</span>}
        </Link>
      </nav>

      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mt-auto border border-gray-200 rounded-lg p-2 w-full flex justify-center hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-900"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  );
}