"use client";

// apps/web/src/app/projects/[projectId]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Cpu, Tag, Link as LinkIcon,
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
} from "lucide-react";
import Header from "@/app/components/header";
import {
  projects as projectsApi,
  users as usersApi,
  requisitions as requisitionsApi,
  equipment as equipmentApi,
} from "@/lib/api";
import type { ProjectDetail, User, RequisitionDetail } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    "bg-green-50 text-green-600 border-green-200",
    pending:   "bg-yellow-50 text-yellow-600 border-yellow-200",
    rejected:  "bg-red-50 text-red-500 border-red-200",
    completed: "bg-blue-50 text-blue-600 border-blue-200",
    archived:  "bg-gray-100 text-gray-500 border-gray-200",
    approved:  "bg-teal-50 text-teal-600 border-teal-200",
  };
  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${map[status] ?? "bg-gray-100 text-gray-400 border-gray-200"}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800 font-semibold">{value}</span>
    </div>
  );
}

function TimelineItem({ icon, label, date, color }: {
  icon: React.ReactNode; label: string; date?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={color}>{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {date && <span className="text-xs text-gray-400 ml-auto">{date}</span>}
    </div>
  );
}

function MemberAvatar({ name, color = "bg-gray-200 text-gray-500" }: { name?: string; color?: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${color}`}>
      {initial}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);

  const [project, setProject]           = useState<ProjectDetail | null>(null);
  const [memberUsers, setMemberUsers]   = useState<Record<number, User>>({});
  const [requisitions, setRequisitions] = useState<RequisitionDetail[]>([]);
  const [catalog, setCatalog]           = useState<Record<number, string>>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        const proj = await projectsApi.get(projectId);
        setProject(proj);

        const memberIds = [...new Set((proj.members ?? []).map((m) => m.user_id))];
        const userResults = await Promise.allSettled(memberIds.map((id) => usersApi.get(id)));

        const map: Record<number, User> = {};
        userResults.forEach((r, i) => {
          const id = memberIds[i];
          if (r.status === "fulfilled") {
            map[id] = r.value;
          } 
        });
        setMemberUsers(map);

        const reqs = await requisitionsApi.listByProject(projectId).catch((e) => {
          return [] as RequisitionDetail[];
        });
        setRequisitions(reqs);

        const cat = await equipmentApi.catalog().catch(() => []);
        const catMap: Record<number, string> = {};
        (cat as any[]).forEach((m) => { catMap[m.id] = m.name; });
        setCatalog(catMap);

      } catch (e: any) {
        setError(e.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);


  if (loading) return (
    <main className="p-8 bg-white min-h-screen font-sans">
      <Header />
      <div className="text-gray-400 mt-8 animate-pulse">Loading project...</div>
    </main>
  );

  if (error) return (
    <main className="p-8 bg-white min-h-screen font-sans">
      <Header />
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">
        Error: {error}
      </div>
    </main>
  );

  if (!project) return (
    <main className="p-8 bg-white min-h-screen font-sans">
      <Header />
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-700 text-sm">
        Project not found.
      </div>
    </main>
  );


  const supervisorMembers = (project.members ?? []).filter((m) => m.role === "supervisor");
  const teamMembers       = (project.members ?? []).filter((m) => m.role !== "supervisor");
  const tags  = project.tags  ? project.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const links = project.links ? project.links.split(",").map((l) => l.trim()).filter(Boolean) : [];
  const createdAt = new Date(project.created_at).toLocaleDateString("pt-PT", {
    year: "numeric", month: "long", day: "numeric",
  });


  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      <Header />

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-gray-400 max-w-2xl">{project.description || "No description."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 flex flex-col gap-6">

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Project Info</h2>
            <InfoRow label="Course"        value={project.course} />
            <InfoRow label="Academic Year" value={project.academic_year} />
            <InfoRow label="Group Number"  value={project.group_number} />
            <InfoRow label="Created"       value={createdAt} />
            {project.approved_at && (
              <InfoRow
                label="Approved"
                value={new Date(project.approved_at).toLocaleDateString("pt-PT")}
              />
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">
                Team ({(project.members ?? []).length})
              </h2>
            </div>

            {supervisorMembers.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">
                  Supervisors
                </p>
                {supervisorMembers.map((m) => {
                  const u = memberUsers[m.user_id];
                  return (
                    <div key={m.user_id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={u?.name} color="bg-blue-200 text-blue-700" />
                        <div>
                          <div className="font-semibold text-sm">{u?.name ?? `User #${m.user_id}`}</div>
                          <div className="text-xs text-gray-400">{u?.email ?? "..."}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
                        Supervisor
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {teamMembers.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">
                  Members
                </p>
                {teamMembers.map((m) => {
                  const u = memberUsers[m.user_id];
                  return (
                    <div key={m.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={u?.name} />
                        <div>
                          <div className="font-semibold text-sm">{u?.name ?? `User #${m.user_id}`}</div>
                          <div className="text-xs text-gray-400">{u?.email ?? "..."}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                        m.role === "leader"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {m.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {(project.members ?? []).length === 0 && (
              <p className="text-sm text-gray-400">No members yet.</p>
            )}
          </div>

          {/* Equipment Requests */}
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Cpu size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">
                Equipment Requests ({requisitions.length})
              </h2>
            </div>

            {requisitions.length === 0 ? (
              <p className="text-sm text-gray-400">No equipment requests.</p>
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
                      <div key={item.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-gray-300" />
                          <span className="text-gray-700 font-medium">
                            {catalog[item.model_id] ?? `Model #${item.model_id}`}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-500 text-xs">
                          ×{item.quantity}
                        </span>
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
          </div>
        </div>

        <div className="flex flex-col gap-6">

          {tags.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-gray-400" />
                <h2 className="font-bold">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {links.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon size={16} className="text-gray-400" />
                <h2 className="font-bold">Links</h2>
              </div>
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <a key={l} href={l} target="_blank" rel="noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate flex items-center gap-1">
                    <ChevronRight size={12} />
                    {l.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-gray-400" />
              <h2 className="font-bold">Timeline</h2>
            </div>
            <div className="flex flex-col gap-3">
              <TimelineItem
                icon={<CheckCircle2 size={14} />}
                label="Created"
                date={createdAt}
                color="text-gray-400"
              />
              {project.approved_at && (
                <TimelineItem
                  icon={<CheckCircle2 size={14} />}
                  label="Approved"
                  date={new Date(project.approved_at).toLocaleDateString("pt-PT")}
                  color="text-green-500"
                />
              )}
              {project.status === "rejected" && (
                <TimelineItem icon={<XCircle size={14} />} label="Rejected" color="text-red-400" />
              )}
              {project.status === "active" && (
                <TimelineItem icon={<AlertCircle size={14} />} label="Active" color="text-green-500" />
              )}
              {project.status === "completed" && (
                <TimelineItem icon={<CheckCircle2 size={14} />} label="Completed" color="text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}