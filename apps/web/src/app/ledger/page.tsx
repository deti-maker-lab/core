"use client";

import { useEffect, useState } from "react";
import { ledger as ledgerApi, type LedgerEntry } from "@/lib/api";
import { ArrowRight, FolderOpen, Cpu, Activity } from "lucide-react";

const entityIcon: Record<string, React.ReactNode> = {
  project:           <FolderOpen size={14} className="text-blue-400" />,
  equipment_request: <Cpu size={14} className="text-purple-400" />,
  equipment_usage:   <Activity size={14} className="text-teal-400" />,
  equipment:         <Cpu size={14} className="text-gray-400" />,
};

const statusColor: Record<string, string> = {
  active:             "bg-green-50 text-green-600",
  pending:            "bg-yellow-50 text-yellow-600",
  reserved:           "bg-purple-50 text-purple-600",
  checked_out:        "bg-orange-50 text-orange-500",
  available:          "bg-teal-50 text-teal-600",
  returned:           "bg-blue-50 text-blue-500",
  rejected:           "bg-red-50 text-red-500",
  fulfilled:          "bg-teal-50 text-teal-600",
  partially_fulfilled:"bg-orange-50 text-orange-400",
};

function StatusPill({ status }: { status?: string }) {
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${statusColor[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset]   = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    ledgerApi.list(LIMIT, offset)
      .then((data) => setEntries((prev) => offset === 0 ? data : [...prev, ...data]))
      .finally(() => setLoading(false));
  }, [offset]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Ledger</h1>
        <p className="text-gray-400 text-sm">Full history of status changes across projects and equipment</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <div className="col-span-2">Type</div>
          <div className="col-span-2">From</div>
          <div className="col-span-1"></div>
          <div className="col-span-2">To</div>
          <div className="col-span-2">Changed by</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Note</div>
        </div>

        {loading && offset === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm animate-pulse">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No history yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                {entityIcon[entry.entity_type] ?? <Activity size={14} className="text-gray-400" />}
                <div>
                    <div className="text-xs font-semibold text-gray-700 capitalize">
                    {entry.entity_type.replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]" title={entry.entity_name ?? ""}>
                    {entry.entity_name ?? `#${entry.entity_id}`}
                    </div>
                </div>
            </div>
              <div className="col-span-2">
                <StatusPill status={entry.old_status ?? undefined} />
              </div>
              <div className="col-span-1 flex justify-center">
                <ArrowRight size={14} className="text-gray-300" />
              </div>
              <div className="col-span-2">
                <StatusPill status={entry.new_status} />
              </div>
              <div className="col-span-2 text-xs text-gray-600 font-medium truncate">
                {entry.changed_by}
              </div>
              <div className="col-span-2 text-xs text-gray-400">
                {new Date(entry.changed_at).toLocaleDateString("pt-PT", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </div>
              <div className="col-span-1 text-xs text-gray-400 truncate" title={entry.note ?? ""}>
                {entry.note ?? "—"}
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {entries.length >= LIMIT && (
          <div className="px-6 py-4 flex justify-center border-t border-gray-50">
            <button
              onClick={() => setOffset((o) => o + LIMIT)}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}