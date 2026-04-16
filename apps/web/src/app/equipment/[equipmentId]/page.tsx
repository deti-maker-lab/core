"use client";

// apps/web/src/app/equipment/[equipmentId]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  History,
  DollarSign,
  Hash,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import Header from "@/app/components/header";
import { equipment as equipmentApi } from "@/lib/api";

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

export default function EquipmentDetailsPage() {
  const params = useParams<{ equipmentId: string }>();
  const equipmentId = params?.equipmentId;

  const [item, setItem] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!equipmentId) return;

    (async () => {
      try {
        const data = await equipmentApi.get(Number(equipmentId));
        setItem(data as EquipmentDetail);
      } catch (e: any) {
        if (String(e?.message || "").includes("404")) {
          setItem(null);
          return;
        }
        setError(e?.message || "Error loading equipment");
      } finally {
        setLoading(false);
      }
    })();
  }, [equipmentId]);

  if (loading) {
    return <main className="p-8">Loading equipment...</main>;
  }

  if (error) {
    return (
      <main className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Error: {error}
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="p-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-700">
          Equipment not found.
        </div>
      </main>
    );
  }

  const debug = true;
  const name = item.name || `Equipment #${item.id}`;
  const category = item.category || "Uncategorized";
  const price =
    item.price !== undefined && item.price !== null && item.price !== ""
      ? `${item.price}€`
      : "-";
  const location = item.location || "N/A";
  const condition = item.condition || "N/A";
  const reference = item.asset_tag || `REF-${String(item.id).padStart(3, "0")}`;

  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      <Header />

      <Link
        href="/equipment"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {debug && (
              <div className="border border-gray-200 rounded-2xl p-4 shadow-sm mt-4">
                <h3 className="text-sm font-bold mb-2">DEBUG: raw equipment payload</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left */}
        <div className="flex flex-col gap-6">
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
              {item.image ? (
                <img
                  src={
                    item.image.startsWith("http")
                      ? item.image
                      : `https://inventory.deti-makerlab.ua.pt/uploads/assets/${item.image}`
                  }
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
              <DetailRow icon={<DollarSign size={20} />} label="Price" value={price} />
              <DetailRow icon={<Hash size={20} />} label="Reference" value={reference} />
              <DetailRow icon={<MapPin size={20} />} label="Location" value={location} />
              <DetailRow icon={<CheckCircle2 size={20} />} label="Condition" value={condition} />
            </div>
          </div>
        </div>

        {/* Right (placeholder até ligares endpoints reais) */}
        <div className="flex flex-col gap-6">
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Projects With This Equipment (0)</h2>
            <div className="text-sm text-gray-400">No Projects yet.</div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} />
              <h2 className="text-lg font-bold">Full History (0)</h2>
            </div>
            <div className="text-sm text-gray-400">No history yet.</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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