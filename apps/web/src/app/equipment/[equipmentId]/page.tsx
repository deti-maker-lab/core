"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Image as ImageIcon, History,
  DollarSign, Hash, MapPin, CheckCircle2, FolderOpen,
} from "lucide-react";
import { equipment as equipmentApi } from "@/lib/api";
import Header from "@/app/components/header";

type EquipmentDetail = {
  id: number;
  model_id: number;
  snipeit_asset_id?: number;
  name?: string;
  asset_tag?: string;
  serial?: string;
  location?: string;
  status: string;
  condition?: string;
  supplier?: string;
  category?: string;
  price?: string | number;
  image?: string;
  last_synced_at?: string;
};

type EquipmentProject = {
  id: number;
  name: string;
  status: string;
  course?: string;
};

export default function EquipmentDetailsPage() {
  const params = useParams<{ equipmentId: string }>();
  const equipmentId = params?.equipmentId;

  const [item, setItem]         = useState<EquipmentDetail | null>(null);
  const [projects, setProjects] = useState<EquipmentProject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId) return;
    (async () => {
      try {
        const [data, projs] = await Promise.allSettled([
          equipmentApi.get(Number(equipmentId)),
          equipmentApi.getProjects(Number(equipmentId)),
        ]);
        if (data.status === "fulfilled") setItem(data.value as EquipmentDetail);
        if (projs.status === "fulfilled") setProjects(projs.value);
      } catch (e: any) {
        setError(e?.message || "Error loading equipment");
      } finally {
        setLoading(false);
      }
    })();
  }, [equipmentId]);

  if (loading) return <main className="p-8 text-gray-400 animate-pulse">Loading equipment...</main>;
  if (error)   return <main className="p-8"><div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">Error: {error}</div></main>;
  if (!item)   return <main className="p-8"><div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700 text-sm">Equipment not found.</div></main>;

  const name      = item.name || `Equipment #${item.id}`;
  const category  = item.category || "Uncategorized";
  const price     = item.price !== undefined && item.price !== null && item.price !== "" ? `${item.price}€` : "—";
  const location  = item.location || "N/A";
  const condition = item.condition || "N/A";
  const reference = item.asset_tag || `REF-${String(item.id).padStart(3, "0")}`;

  const statusColor: Record<string, string> = {
    active:    "bg-green-50 text-green-600",
    pending:   "bg-yellow-50 text-yellow-600",
    rejected:  "bg-red-50 text-red-500",
    completed: "bg-blue-50 text-blue-600",
    reserved:  "bg-purple-50 text-purple-600 border-purple-200",
    approved:  "bg-teal-50 text-teal-600",
  };

  return (
    <main className="flex-1 bg-[#f4f5f7] p-8 min-h-screen font-sans text-gray-900">
      <Header />
      
      <Link
        href="/equipment"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image.startsWith("http") ? item.image : `https://inventory.deti-makerlab.ua.pt/uploads/assets/${item.image}`}
                  alt={name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon size={80} className="text-gray-200" />
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                    {category}
                  </span>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full whitespace-nowrap">
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Details</h2>
            <div className="space-y-4">
              <DetailRow icon={<DollarSign size={20} />} label="Price"     value={price} />
              <DetailRow icon={<Hash size={20} />}       label="Reference" value={reference} />
              <DetailRow icon={<MapPin size={20} />}     label="Location"  value={location} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <FolderOpen size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold">Projects With This Equipment ({projects.length})</h2>
            </div>

            {projects.length === 0 ? (
              <p className="text-sm text-gray-400">No projects yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((proj) => (
                  <Link key={proj.id} href={`/projects/${proj.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{proj.name}</div>
                        {proj.course && <div className="text-xs text-gray-400 mt-0.5">{proj.course}</div>}
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor[proj.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {proj.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold">Full History ({projects.length})</h2>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400">No history yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map((proj) => (
                  <div key={proj.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-700 font-medium">{proj.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${statusColor[proj.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-gray-500">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
}