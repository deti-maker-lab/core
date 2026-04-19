// apps/web/src/app/equipment/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import { equipment as equipmentApi } from "@/lib/api";

type EquipmentItem = {
  id: number;
  name: string;
  category?: string;
  price?: string | number;
  supplier?: string;
  status?: string;
  location?: string;
  image?: string;
};

const statusFilters = ["All", "Available", "Checked Out", "Maintenance"];
const categories = [
  "All Categories", "Electronics", "3d Printing", "Laser Cutting", 
  "Hand Tools", "Testing", "Computing", "Robotics", "Optics", "Safety", "Other"
];

function normalizeStatus(status?: string): "available" | "checked out" | "maintenance" | "unknown" {
  const s = (status || "").toLowerCase();
  if (["ready to deploy", "available", "in stock"].includes(s)) return "available";
  if (["checked out", "deployed", "assigned"].includes(s)) return "checked out";
  if (["maintenance", "repair"].includes(s)) return "maintenance";
  return "unknown";
}

export default function EquipmentPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await equipmentApi.catalog();
        const list = Array.isArray(data) ? data : (data as any)?.rows || [];
        setEquipment(list.map((item: any) => ({
          id: Number(item.id),
          name: item.name ?? "Unnamed equipment",
          category: item.category ?? "Uncategorized",
          price: item.price ?? item.purchase_cost ?? "-",
          status: item.status ?? "unknown",
          location: item.location ?? "Unknown Room",
          image: item.image ?? undefined,
        })));
      } catch (e) {
        console.error("Error loading equipment", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const uiStatus = normalizeStatus(item.status);
      const matchesStatus = activeStatus === "All" || uiStatus === activeStatus.toLowerCase();
      const matchesCat = activeCategory === "All Categories" || item.category === activeCategory;
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesCat && matchesSearch;
    });
  }, [equipment, activeStatus, activeCategory, search]);

  return (
    <main className="flex-1 p-8 bg-[#f4f5f7] min-h-screen font-sans text-gray-900">
      <Header />

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-gray-900 mb-1">Equipment</h1>
        <p className="text-gray-500 font-medium">{equipment.length} items in inventory</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {activeCategory}
              <ChevronDown size={16} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setIsCatOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${activeCategory === cat ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center bg-white p-1 border border-gray-200 rounded-xl">
          {statusFilters.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveStatus(opt)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeStatus === opt ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        <div className="px-4 mb-2">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filteredEquipment.length} results</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Loading inventory...</div>
        ) : (
          filteredEquipment.map((item) => {
            const uiStatus = normalizeStatus(item.status);
            return (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="group flex items-center justify-between bg-white border border-gray-100 rounded-[20px] p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-3">
                      {item.name}
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full uppercase tracking-tight">
                        {item.category}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-200" /> {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">€{item.price}</div>
                  </div>

                  <div className="flex items-center gap-4 min-w-[140px] justify-end">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      uiStatus === "available" ? "bg-green-50 text-green-600" :
                      uiStatus === "checked out" ? "bg-orange-50 text-orange-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        uiStatus === "available" ? "bg-green-500" :
                        uiStatus === "checked out" ? "bg-orange-500" : "bg-red-500"
                      }`} />
                      {item.status}
                    </span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}