"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Folder, Cpu } from "lucide-react";
import {
  users as usersApi,
  projects as projectsApi,
  equipment as equipmentApi,
  type User,
  type Project,
  type RequisitionDetail,
  type EquipmentCatalogItem,
} from "@/lib/api";

export default function UserDetails({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);

  const [user, setUser]               = useState<User | null>(null);
  const [projects, setProjects]       = useState<Project[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionDetail[]>([]);
  const [equipmentNames, setEquipmentNames] = useState<Record<number, string>>({});
  const [projectNames, setProjectNames]     = useState<Record<number, string>>({});
  const [catalogItems, setCatalogItems]     = useState<Record<number, EquipmentCatalogItem>>({});
  const [loading, setLoading]         = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const id = parseInt(userId);
    if (isNaN(id)) { setNotFoundError(true); return; }

    async function load() {
      try {
        const [u, p, r] = await Promise.all([
          usersApi.get(id),
          usersApi.projects(id),
          usersApi.requisitions(id),
        ]);
        setUser(u);
        setProjects(p);
        setRequisitions(r);

        // Nomes dos projectos
        const pNames: Record<number, string> = {};
        p.forEach((proj) => { pNames[proj.id] = proj.name; });
        const extraPIds = [...new Set(r.map((req) => req.project_id).filter((pid) => !pNames[pid]))];
        await Promise.allSettled(extraPIds.map(async (pid) => {
          const proj = await projectsApi.get(pid).catch(() => null);
          if (proj) pNames[pid] = proj.name;
        }));
        setProjectNames(pNames);

        // Catálogo completo para ir buscar expected_checkin e status
        const cat = await equipmentApi.catalog().catch(() => []);
        const catMap: Record<number, EquipmentCatalogItem> = {};
        cat.forEach((m) => { catMap[m.id] = m; });
        setCatalogItems(catMap);

        // Nomes dos assets
        const eNames: Record<number, string> = {};
        const allItems = r.flatMap((req) => req.items.filter((i) => i.equipment_id));
        await Promise.allSettled(allItems.map(async (item) => {
          // Tenta primeiro pelo catálogo (já carregado)
          if (catMap[item.equipment_id!]) {
            eNames[item.equipment_id!] = catMap[item.equipment_id!].name;
          } else {
            const asset = await equipmentApi.get(item.equipment_id!).catch(() => null);
            if (asset) eNames[item.equipment_id!] = asset.name ?? `Asset #${item.equipment_id}`;
          }
        }));
        setEquipmentNames(eNames);

      } catch {
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading) {
    return (
      <main className="flex-1 bg-white p-8 min-h-screen text-gray-800">
        <p className="text-gray-300 mt-8 animate-pulse">Loading...</p>
      </main>
    );
  }

  if (notFoundError || !user) return notFound();

  return (
    <main className="flex-1 p-8 bg-[#f4f5f7] min-h-screen font-sans text-gray-900">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Profile Card */}
        <div className="lg:col-span-4 flex flex-col items-center p-10 border border-gray-200 rounded-[32px] shadow-sm h-fit text-center bg-white">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-3xl mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <span className="px-4 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full mb-6">
            {user.role}
          </span>
          <p className="text-gray-400 text-sm mb-1">{user.email}</p>
          <p className="text-gray-300 text-sm font-medium">{user.nmec ?? "—"}</p>
          {user.course && (
            <p className="text-gray-300 text-sm font-medium mt-1">{user.course}</p>
          )}
          {user.academic_year && (
            <p className="text-gray-300 text-sm font-medium">{user.academic_year}º ano</p>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Projects */}
          <section className="border border-gray-200 rounded-[32px] p-8 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Folder size={20} className="text-gray-400" /> Projects ({projects.length})
            </div>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <Link key={proj.id} href={`/projects/${proj.id}`}>
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[20px] hover:bg-gray-100 transition-colors cursor-pointer">
                      <div>
                        <div className="font-bold text-gray-800">{proj.name}</div>
                        <div className="text-xs text-gray-400">{proj.course ?? "—"}</div>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full border ${
                        proj.status === "active"    ? "bg-green-50 border-green-100 text-green-600" :
                        proj.status === "completed" ? "bg-blue-50 border-blue-100 text-blue-600" :
                        proj.status === "rejected"  ? "bg-red-50 border-red-100 text-red-500" :
                        "bg-white border-gray-200 text-gray-500 shadow-sm"
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No active projects.</p>
            )}
          </section>

          {/* Requisitions */}
          <section className="border border-gray-200 rounded-[32px] p-8 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Cpu size={20} className="text-gray-400" /> Equipment Requests ({requisitions.length})
            </div>
            {requisitions.length > 0 ? (
              <div className="space-y-4">
                {requisitions.map((req) => (
                  <div key={req.id} className="py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100">
                          <Cpu size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">
                            {projectNames[req.project_id] ?? `Project #${req.project_id}`}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">
                            {new Date(req.created_at).toLocaleDateString("pt-PT")}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-xl border ${
                        req.status === "reserved"   ? "bg-purple-50 border-purple-100 text-purple-500" :
                        req.status === "rejected"   ? "bg-red-50 border-red-100 text-red-400" :
                        req.status === "fulfilled"  ? "bg-green-50 border-green-100 text-green-500" :
                        req.status === "checked_out"? "bg-orange-50 border-orange-100 text-orange-500" :
                        "bg-white border-gray-200 text-gray-500 shadow-sm"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Items com return by date */}
                    <div className="ml-12 flex flex-col gap-1.5">
                      {req.items.map((item) => {
                        const assetInfo = item.equipment_id ? catalogItems[item.equipment_id] : null;
                        const isCheckedOut = assetInfo && !assetInfo.available &&
                          assetInfo.status?.toLowerCase() !== "reserved";
                        const expectedCheckin = assetInfo?.expected_checkin;

                        return (
                          <div key={item.id} className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Cpu size={12} className="text-gray-300" />
                              <span className="text-xs text-gray-600 font-medium">
                                {item.equipment_id
                                  ? (equipmentNames[item.equipment_id] ?? `Asset #${item.equipment_id}`)
                                  : `Equipment #${item.equipment_id}`}
                              </span>
                            </div>
                            {isCheckedOut && expectedCheckin && (
                              <span className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-[10px] font-semibold border border-orange-100">
                                Return by {new Date(expectedCheckin).toLocaleDateString("pt-PT", {
                                  day: "numeric", month: "short", year: "numeric"
                                })}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No equipment requested.</p>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}