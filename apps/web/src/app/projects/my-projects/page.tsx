"use client";

// apps/web/src/app/projects/my-projects/page.tsx
import { useEffect, useState } from "react";
import { Search, Plus, Cpu, Folder } from "lucide-react";
import Link from "next/link";
import { projects as projectsApi, requisitions as reqApi, auth } from "@/lib/api";
import type { Project, RequisitionDetail, User } from "@/lib/api";
import Header from "@/app/components/header";

export default function MyProjectsPage() {
  const [me, setMe] = useState<User | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [requisitionsByProject, setRequisitionsByProject] = useState<Record<number, RequisitionDetail[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await auth.me();
        setMe(user);

        const all = await projectsApi.list();
        const mine = all.filter(
          (p) => p.created_by === user.id
        );
        setMyProjects(mine);

        // Busca requisições de cada projecto
        const reqs: Record<number, RequisitionDetail[]> = {};
        await Promise.all(
          mine.map(async (p) => {
            try {
              reqs[p.id] = await reqApi.listByProject(p.id);
            } catch {
              reqs[p.id] = [];
            }
          })
        );
        setRequisitionsByProject(reqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = myProjects.filter((proj) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" && ["active", "pending", "approved"].includes(proj.status)) ||
      (activeFilter === "Completed" && proj.status === "completed");
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors shadow-sm"
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

        <div className="flex items-center border border-gray-200 rounded-full p-1 shadow-sm">
          {["All", "Active", "Completed"].map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeFilter === option
                  ? "bg-white border border-gray-200 text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 border border-transparent"
              }`}
            >
              {option}
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
              requisitions={requisitionsByProject[proj.id] ?? []}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ProjectCard({ project, requisitions }: { project: Project; requisitions: RequisitionDetail[] }) {
  const isAwaiting = project.status === "pending";
  const isCompleted = project.status === "completed";

  return (
    <div className="border border-gray-200 rounded-[24px] overflow-hidden bg-white shadow-sm flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-900 text-xl">{project.name}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              isAwaiting  ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
              isCompleted ? "bg-gray-100 text-gray-400" :
              project.status === "approved" ? "bg-blue-50 text-blue-600 border border-blue-200" :
              project.status === "active" ? "bg-green-50 text-green-600 border border-green-200" :
              "bg-gray-100 text-gray-500"
            }`}>
              {isAwaiting ? "Awaiting Approval" : project.status}
            </span>
          </div>
          {project.status === "approved" && (
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Cpu size={14} /> Request Equipment
            </Link>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4 pr-12">
          {project.description ?? "No description."}
        </p>

        <div className="flex gap-2">
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
        </div>
      </div>

      {requisitions.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 pt-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Equipment Requests
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {requisitions.map((req) =>
              req.items.map((item) => (
                <RequisitionRow
                  key={item.id}
                  equipmentId={item.equipment_id}
                  status={req.status}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RequisitionRow({ equipmentId, status }: { equipmentId: number; status: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Cpu size={14} className="text-gray-300" />
        <span className="text-gray-600">Equipment #{equipmentId}</span>
      </div>
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
        status === "approved" ? "bg-green-50 text-green-600" :
        status === "rejected" ? "bg-red-50 text-red-500" :
        "bg-gray-100 text-gray-500"
      }`}>{status}</span>
    </div>
  );
}