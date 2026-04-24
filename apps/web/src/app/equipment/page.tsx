"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import { equipment as equipmentApi, type EquipmentCatalogItem } from "@/lib/api";
import { useTranslation } from "react-i18next";

const statusFilters = ["All", "Available", "Reserved", "Checked Out", "Maintenance"];
const categories = [
  "All Categories", "Electronics", "3d Printing", "Laser Cutting",
  "Hand Tools", "Testing", "Computing", "Robotics", "Optics", "Safety", "Other"
];

function normalizeStatus(status?: string | null): string {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s === "available") return "available";
  if (s === "reserved") return "reserved";
  if (s === "checked_out" || s === "checked out") return "checked out";
  if (s === "maintenance" || s === "repair" || s === "retired") return "maintenance";
  return "unknown";
}

const statusBadge: Record<string, { bg: string; dot: string; label: string }> = {
  available:     { bg: "bg-green-50 text-green-600",   dot: "bg-green-500",  label: "Available" },
  reserved:      { bg: "bg-purple-50 text-purple-600", dot: "bg-purple-500", label: "Reserved" },
  "checked out": { bg: "bg-orange-50 text-orange-600", dot: "bg-orange-500", label: "Checked Out" },
  maintenance:   { bg: "bg-yellow-50 text-yellow-600", dot: "bg-yellow-500", label: "Maintenance" },
  unknown:       { bg: "bg-gray-100 text-gray-500",    dot: "bg-gray-400",   label: "Unknown" },
};

export default function EquipmentPage() {
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState<EquipmentCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await equipmentApi.catalog();
        const list = Array.isArray(data) ? data : (data as any)?.rows || [];
        setEquipment(
          list
            .filter((item: any) => item != null && item.id != null)
            .map((item: any): EquipmentCatalogItem => ({
              id: Number(item.id),
              model_id: item.model_id,
              model_name: item.model_name,
              name: item.name ?? "Unnamed equipment",
              asset_tag: item.asset_tag,
              serial: item.serial,
              category: item.category ?? "Uncategorized",
              supplier: item.supplier,
              price: item.price ?? undefined,
              status: item.status ?? "unknown",
              snipeit_status: item.snipeit_status,
              status_type: item.status_type,
              location: item.location ?? "Unknown Room",
              image: item.image ?? undefined,
              assigned_to: item.assigned_to,
              available: item.available ?? false,
              expected_checkin: item.expected_checkin,
            }))
        );
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
      const matchesStatus =
        activeStatus === "All" || uiStatus === activeStatus.toLowerCase();
      const matchesCat =
        activeCategory === "All Categories" || item.category === activeCategory;
      const matchesSearch =
        !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesCat && matchesSearch;
    });
  }, [equipment, activeStatus, activeCategory, search]);

  return (
    <main className="flex-1 p-8 bg-[#f4f5f7] min-h-screen font-sans text-gray-900">
      <Header />

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-gray-900 mb-1">
          {t("equipmentPage.title")}
        </h1>
        <p className="text-gray-500 font-medium">
          {t("equipmentPage.itemsInInventory", { count: equipment.length })}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
              placeholder={t("equipmentPage.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {activeCategory === "All Categories"
                ? t("equipmentPage.allCategories")
                : activeCategory}
              <ChevronDown
                size={16}
                className={`transition-transform ${isCatOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setIsCatOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      activeCategory === cat ? "text-blue-600 font-bold" : "text-gray-600"
                    }`}
                  >
                    {cat === "All Categories" ? t("equipmentPage.allCategories") : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center bg-white p-1 border border-gray-200 rounded-xl">
          {statusFilters.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveStatus(opt)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeStatus === opt
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt === "All"          ? t("equipmentPage.all") :
               opt === "Available"   ? t("equipmentPage.available") :
               opt === "Reserved"    ? t("equipmentPage.reserved") :
               opt === "Checked Out" ? t("equipmentPage.checkedOut") :
                                       t("equipmentPage.maintenance")}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        <div className="px-4 mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t("equipmentPage.results", { count: filteredEquipment.length })}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            {t("equipmentPage.loading")}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            No equipment found.
          </div>
        ) : (
          filteredEquipment.map((item) => {
            const uiStatus = normalizeStatus(item.status);
            {console.log(filteredEquipment)}
            const badge = statusBadge[uiStatus] ?? statusBadge["unknown"];

            return (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="group flex items-center justify-between bg-white border border-gray-100 rounded-[20px] p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-3">
                      {item.name}
                      {item.category && (
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full uppercase tracking-tight">
                          {item.category}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      {item.location ?? "Unknown location"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {item.price != null && (
                    <div className="text-sm font-bold text-gray-900">€{item.price}</div>
                  )}

                  <div className="flex items-center gap-4 min-w-[140px] justify-end">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-400 transition-colors"
                    />
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