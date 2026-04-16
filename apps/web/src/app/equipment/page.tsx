"use client";

// apps/web/src/app/equipment/page.tsx
import { useEffect, useMemo, useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
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
};

const filterOptions = ["All", "Available", "Checked Out", "Maintenance"];

function normalizeStatus(status?: string): "available" | "checked out" | "maintenance" | "unknown" {
  const s = (status || "").toLowerCase();

  if (["ready to deploy", "available", "in stock"].includes(s)) return "available";
  if (["checked out", "deployed", "assigned"].includes(s)) return "checked out";
  if (["maintenance", "repair"].includes(s)) return "maintenance";

  return "unknown";
}

export default function EquipmentPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    (async () => {
      try {
        const data = await equipmentApi.catalog();
        const list = Array.isArray(data)
          ? data
          : (data as any)?.rows || (data as any)?.items || [];

        setEquipment(
          list.map((item: any) => ({
            id: Number(item.id),
            name: item.name ?? item.model_name ?? "Unnamed equipment",
            category: item.category ?? item.category_name ?? "Uncategorized",
            price: item.price ?? item.purchase_cost ?? "-",
            status: item.status ?? item.status_label ?? "unknown",
            supplier: item.supplier ?? item.supplier_name ?? "",
          }))
        );
      } catch (e: any) {
        setError(e.message || "Erro a carregar equipamentos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const uiStatus = normalizeStatus(item.status);
      const matchesFilter =
        activeFilter === "All" ||
        uiStatus === activeFilter.toLowerCase();

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.supplier || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [equipment, activeFilter, search]);

  return (
    <main className="flex-1 p-8 bg-white min-h-screen font-sans text-gray-800">
      <Header />

      <h1 className="text-3xl font-bold mb-1">Equipment</h1>
      <p className="text-gray-400 mb-6">{filteredEquipment.length} items in inventory</p>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 w-full max-w-md">
          <Search size={18} className="text-gray-400" />
          <input
            className="ml-2 outline-none w-full"
            placeholder="search by name, category or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setActiveFilter(option)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              activeFilter === option
                ? "bg-gray-100 font-medium text-gray-900 border border-gray-200"
                : "text-gray-500 hover:bg-gray-50 border border-transparent"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500">Loading equipment...</div>}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Erro: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {filteredEquipment.map((item) => {
            const uiStatus = normalizeStatus(item.status);

            return (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                    <ImageIcon className="text-gray-300" />
                  </div>

                  <div>
                    <div className="font-semibold">{item.name}</div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                        {item.category || "Uncategorized"}
                      </span>

                      {item.supplier && (
                        <span className="text-xs bg-blue-50 px-2 py-1 rounded-full text-blue-600">
                          {item.supplier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-6">
                  <span className="font-medium">
                    {typeof item.price === "number" ? `${item.price}€` : item.price || "-"}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full capitalize ${
                      uiStatus === "available"
                        ? "bg-green-100 text-green-700"
                        : uiStatus === "checked out"
                        ? "bg-yellow-100 text-yellow-700"
                        : uiStatus === "maintenance"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.status || "unknown"}
                  </span>
                </div>
              </Link>
            );
          })}

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No equipment found for this filter/search.
            </div>
          )}
        </div>
      )}
    </main>
  );
}