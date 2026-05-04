"use client";

// apps/web/src/app/ledger/page.tsx
import { useEffect, useState, useMemo } from "react";
import { Link2, ArrowRight, Search } from "lucide-react";
import Header from "@/app/components/header";
import {
  requisitions as requisitionsApi,
  projects as projectsApi,
  users as usersApi,
  equipment as equipmentApi,
  type Requisition,
} from "@/lib/api";
import { useTranslation } from "react-i18next";

interface LedgerEvent {
  key: string;
  type: "checkout" | "return";
  date: string;
  projectName: string;
  userName: string;
  assetName: string;
  snipeit_asset_id?: number;
  req_id: number;
}

export default function LedgerPage() {
  const { t } = useTranslation();
  const [events, setEvents]   = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const allReqs = await requisitionsApi.list() as Requisition[];
        const relevant = allReqs.filter((r) => r.checked_out_at || r.returned_at);

        const projectIds = [...new Set(relevant.map((r) => r.project_id))];
        const userIds    = [...new Set(relevant.map((r) => r.requested_by))];
        const assetIds   = [...new Set(
          relevant.map((r) => r.snipeit_asset_id).filter((id): id is number => id != null)
        )];

        const [projResults, userResults, assetResults] = await Promise.all([
          Promise.allSettled(projectIds.map((id) => projectsApi.get(id))),
          Promise.allSettled(userIds.map((id) => usersApi.get(id))),
          Promise.allSettled(assetIds.map((id) => equipmentApi.get(id))),
        ]);

        const pNames: Record<number, string> = {};
        projResults.forEach((r, i) => {
          if (r.status === "fulfilled") pNames[projectIds[i]] = r.value.name;
        });

        const uNames: Record<number, string> = {};
        userResults.forEach((r, i) => {
          if (r.status === "fulfilled") uNames[userIds[i]] = r.value.name;
        });

        const aNames: Record<number, string> = {};
        assetResults.forEach((r, i) => {
          if (r.status === "fulfilled") aNames[assetIds[i]] = r.value.name ?? `Asset #${assetIds[i]}`;
        });

        const evts: LedgerEvent[] = [];
        for (const req of relevant) {
          const projectName = pNames[req.project_id]   ?? `Project #${req.project_id}`;
          const userName    = uNames[req.requested_by] ?? `User #${req.requested_by}`;
          const assetName   = req.snipeit_asset_id
            ? (aNames[req.snipeit_asset_id] ?? `${t("ledgerPage.asset")} #${req.snipeit_asset_id}`)
            : t("ledgerPage.unknownAsset");

          if (req.checked_out_at) {
            evts.push({ key: `checkout-${req.id}`, type: "checkout", date: req.checked_out_at, projectName, userName, assetName, snipeit_asset_id: req.snipeit_asset_id, req_id: req.id });
          }
          if (req.returned_at) {
            evts.push({ key: `return-${req.id}`, type: "return", date: req.returned_at, projectName, userName, assetName, snipeit_asset_id: req.snipeit_asset_id, req_id: req.id });
          }
        }

        evts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(evts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter((e) =>
      e.assetName.toLowerCase().includes(q) ||
      e.userName.toLowerCase().includes(q) ||
      e.projectName.toLowerCase().includes(q)
    );
  }, [events, search]);

  return (
    <main className="flex-1 p-8 bg-[#f4f5f7] min-h-screen font-sans text-gray-900">
      <Header />

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">{t("ledgerPage.title")}</h1>
        <p className="text-gray-500 text-sm">{t("ledgerPage.subtitle")}</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t("ledgerPage.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all duration-300"
        />
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">{t("ledgerPage.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {search ? t("ledgerPage.noResults") : t("ledgerPage.noEvents")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((evt) => {
            const isCheckout = evt.type === "checkout";
            return (
              <div key={evt.key} className="group bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex flex-col items-center shrink-0 self-stretch">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                    <Link2 size={18} strokeWidth={2.5} />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 mt-2 min-h-[16px] group-hover:bg-indigo-100 transition-colors duration-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                      isCheckout ? "bg-amber-100/60 text-amber-700" : "bg-emerald-100/60 text-emerald-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isCheckout ? "bg-amber-500" : "bg-emerald-500"}`} />
                      {isCheckout ? t("ledgerPage.checkout") : t("ledgerPage.return")}
                    </span>
                    <span className="text-[16px] font-bold text-gray-900 truncate group-hover:text-indigo-900 transition-colors duration-300">{evt.assetName}</span>
                  </div>
                  <div className="flex items-center text-[14px] text-gray-500">
                    <span className="group-hover:text-gray-700 transition-colors duration-300">{evt.userName}</span>
                    <ArrowRight size={14} className="mx-2 text-gray-400 shrink-0 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-300" />
                    <span className="group-hover:text-gray-700 transition-colors duration-300">{evt.projectName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[14px] text-gray-500 font-medium group-hover:text-gray-700 transition-colors duration-300">
                    {new Date(evt.date).toLocaleString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit", hour12: false,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}