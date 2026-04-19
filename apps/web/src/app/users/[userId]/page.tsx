// apps/web/src/app/users/[userId]/page.tsx

"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Folder, Cpu } from "lucide-react";
import Header from "@/app/components/header";
import { users as usersApi, equipment as equipmentApi, type User, type Project, type RequisitionDetail } from "@/lib/api";

export default function UserDetails({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [catalog, setCatalog] = useState<Record<number, string>>({});

  useEffect(() => {
    const id = parseInt(userId);
    if (isNaN(id)) { setNotFoundError(true); return; }

    equipmentApi.catalog().then((cat) => {
      const map: Record<number, string> = {};
      cat.forEach((m) => (map[m.id] = m.name));
      setCatalog(map);
    });

    Promise.all([
      usersApi.get(id),
      usersApi.projects(id),
      usersApi.requisitions(id),
    ])
      .then(([u, p, r]) => {
        console.log("Requisitions:", r);
        setUser(u);
        setProjects(p);
        setRequisitions(r);
      })
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <main className="flex-1 bg-white p-8 min-h-screen text-gray-800">
        <Header />
        <p className="text-gray-300 mt-8">A carregar...</p>
      </main>
    );
  }

  if (notFoundError || !user) return notFound();

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      active:    "bg-green-50 text-green-600 border-green-200",
      pending:   "bg-yellow-50 text-yellow-600 border-yellow-200",
      rejected:  "bg-red-50 text-red-500 border-red-200",
      completed: "bg-blue-50 text-blue-600 border-blue-200",
      reserved:  "bg-purple-50 text-purple-600 border-purple-200",
      archived:  "bg-gray-100 text-gray-500 border-gray-200",
      approved:  "bg-teal-50 text-teal-600 border-teal-200",
    };

    return (
      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${map[status] ?? "bg-gray-100 text-gray-400 border-gray-200"}`}>
        {status}
      </span>
    );
  }

  return (
    <main className="flex-1 bg-white p-8 min-h-screen text-gray-800">
      <Header />

      <Link
        href="/users"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

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

        <div className="lg:col-span-8 flex flex-col gap-6">

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
                      <span className="px-4 py-1.5 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full shadow-sm">
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

          <section className="border border-gray-200 rounded-[32px] p-8 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Cpu size={20} className="text-gray-400" /> Equipment Requests ({requisitions.length})
            </div>
            {requisitions.length === 0 ? (
              <p className="text-gray-400 text-sm">No equipment requests.</p>
            ) : (
              requisitions.map((req) => (
                <div key={req.id} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">
                      Req #{req.id} · {new Date(req.created_at).toLocaleDateString("pt-PT")}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="flex flex-col gap-2">
                    {(req.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-gray-300" />
                          <span className="text-gray-700 font-medium">
                            {catalog[item.equipment_id] ?? `Equipment #${item.equipment_id}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {req.rejection_reason && (
                    <div className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                      Rejection reason: {req.rejection_reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

        </div>
      </div>
    </main>
  );
}