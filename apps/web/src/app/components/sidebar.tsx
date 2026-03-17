"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Folder, Cpu, Users, 
  BarChart3, BookText, Wrench, ChevronLeft, Network 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", href: "/projects", icon: <Folder size={20} /> },
    { name: "Equipment", href: "/equipment", icon: <Cpu size={20} /> },
    { name: "Users", href: "/users", icon: <Users size={20} /> },
    { name: "Statistics", href: "/statistics", icon: <BarChart3 size={20} /> },
    { name: "Ledger", href: "/ledger", icon: <BookText size={20} /> },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen p-4">
      <div className="flex items-center gap-2 px-2 mb-8 text-gray-800">
        <Network size={24} />
        <span className="font-bold text-lg">DETI Maker Lab</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-gray-200 text-gray-900" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Management
        </div>
        
        <Link
          href="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Wrench size={20} />
          Technician Portal
        </Link>
      </nav>

      <button className="mt-auto border border-gray-200 rounded-lg p-2 flex justify-center hover:bg-gray-50 transition-colors">
        <ChevronLeft size={20} className="text-gray-400" />
      </button>
    </aside>
  );
}