"use client";

// apps/web/src/app/projects/my-projects/page.tsx
import { useEffect, useState } from "react";
import { Search, Plus, Cpu } from "lucide-react";
import Link from "next/link";
import { projects as projectsApi, requisitions as reqApi, equipment as equipmentApi, auth } from "@/lib/api";
import type { Project, Requisition, User } from "@/lib/api";
import Header from "@/app/components/header";

export default function MyProjectsPage() {
  const [me, setMe]           = useState<User | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [reqsByProject, setReqsByProject] = useState<Record<number, Requisition[]>>({});
  const [assetNames, setAssetNames]       = useState<Record<number, string>>({});
  const [loading, setLoading]   = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = await auth.me();
        setMe(user);

        const all  = await projectsApi.list();
        const mine = all.filter((p) => p.created_by === user.id);
        setMyProjects(mine);

        // Requisições por projeto
        const reqs: Record<number, Requisition[]> = {};
        await Promise.all(
          mine.map(async (p) => {
            try { reqs[p.id] = await reqApi.listByProject(p.id); }
            catch { reqs[p.id] = []; }
          })
        );
        setReqsByProject(reqs);

        // Nomes dos assets
        const assetIds = [...new Set(
          Object.values(reqs)
            .flat()
            .map((r) => r.snipeit_asset_id)
            .filter((id): id is number => id != null)
        )];
        const names: Record<number, string> = {};
        await Promise.allSettled(
          assetIds.map(async (id) => {
            try {
              const a = await equipmentApi.get(id);
              names[id] = a.name ?? `Asset #${id}`;
            } catch {
              names[id] = `Asset #${id}`;
            }
          })
        );
        setAssetNames(names);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = myProjects.filter((proj) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active"    && ["active", "pending"].includes(proj.status)) ||
      (activeFilter === "Completed" && proj.status === "completed");
    return matchesFilter && proj.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <main className="flex-1 bg-[#f4f5f7] p-8 min-h-screen font-sans text-gray-900">
      <Header />

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Projects</h1>
          <p className="text-gray-400 font-medium">Projects you have submitted</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> New Project
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-gray-200 rounded-full p-1 shadow-sm bg-white">
          {["All", "Active", "Completed"].map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeFilter === opt
                  ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-[24px] h-48 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No projects found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              requisitions={reqsByProject[proj.id] ?? []}
              assetNames={assetNames}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ProjectCard({
  project,
  requisitions,
  assetNames,
}: {
  project: Project;
  requisitions: Requisition[];
  assetNames: Record<number, string>;
}) {
  const now = new Date();

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:     { label: "Awaiting Approval", color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
    active:      { label: "Active",            color: "bg-green-50 text-green-600 border-green-200" },
    completed:   { label: "Completed",         color: "bg-blue-50 text-blue-600 border-blue-200" },
    rejected:    { label: "Rejected",          color: "bg-red-50 text-red-500 border-red-200" },
    archived:    { label: "Archived",          color: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const sc = statusConfig[project.status] ?? { label: project.status, color: "bg-gray-100 text-gray-500 border-gray-200" };

  return (
    // ← clica em qualquer parte do card para abrir o projecto
    <Link href={`/projects/${project.id}`} className="block">
      <div className="border border-gray-200 rounded-[24px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">

        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-gray-900 text-xl">{project.name}</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${sc.color}`}>
                {sc.label}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {project.description ?? "No description."}
          </p>

          <div className="flex gap-2 flex-wrap">
            {project.course && (
              <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                {project.course}
              </span>
            )}
            {project.group_number && (
              <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                Group {project.group_number}
              </span>
            )}
            {project.academic_year && (
              <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                {project.academic_year}
              </span>
            )}
          </div>
        </div>

        {requisitions.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-6 pt-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Equipment Requests ({requisitions.length})
            </div>
            <div className="flex flex-col gap-2">
              {requisitions.map((req) => {
                const assetName = req.snipeit_asset_id
                  ? (assetNames[req.snipeit_asset_id] ?? `Asset #${req.snipeit_asset_id}`)
                  : "Unknown asset";

                // Status label
                let statusLabel = req.status;
                let badgeColor  = "bg-gray-100 text-gray-500";

                if (req.status === "pending") {
                  statusLabel = "Pending";
                  badgeColor  = "bg-yellow-50 text-yellow-600";
                } else if (req.status === "reserved") {
                  statusLabel = "Reserved";
                  badgeColor  = "bg-purple-50 text-purple-600";
                } else if (req.status === "returned") {
                  statusLabel = "Returned";
                  badgeColor  = "bg-green-50 text-green-600";
                } else if (req.status === "rejected") {
                  statusLabel = "Rejected";
                  badgeColor  = "bg-red-50 text-red-500";
                } else if (req.status === "checked_out") {
                  if (req.expected_checkin) {
                    const due       = new Date(req.expected_checkin);
                    const isOverdue = due < now;
                    statusLabel = isOverdue
                      ? "Overdue"
                      : `Return by ${due.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
                    badgeColor = isOverdue ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600";
                  } else {
                    statusLabel = "Checked Out";
                    badgeColor  = "bg-orange-50 text-orange-600";
                  }
                }

                return (
                  <div key={req.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Cpu size={13} className="text-gray-300 shrink-0" />
                      <span className="text-gray-600 truncate">{assetName}</span>
                    </div>
                    <span className={`ml-3 shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${badgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}