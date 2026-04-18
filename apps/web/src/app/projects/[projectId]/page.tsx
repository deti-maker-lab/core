"use client";

// apps/web/src/app/projects/[projectId]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Cpu, Tag, Link as LinkIcon,
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  X, Plus,
} from "lucide-react";
import Header from "@/app/components/header";
import {
  projects as projectsApi,
  users as usersApi,
  requisitions as requisitionsApi,
  equipment as equipmentApi,
  auth,
} from "@/lib/api";
import type { ProjectDetail, User, RequisitionDetail, EquipmentCatalogItem } from "@/lib/api";

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

// ── Edit Project Modal ────────────────────────────────────────────────────────

function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectDetail;
  onClose: () => void;
  onSaved: (updated: ProjectDetail) => void;
}) {
  const [name, setName]               = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [course, setCourse]           = useState(project.course ?? "");
  const [academicYear, setAcademicYear] = useState(project.academic_year ?? "");
  const [groupNumber, setGroupNumber] = useState(project.group_number?.toString() ?? "");
  const [tags, setTags]               = useState<string[]>(
    project.tags ? project.tags.split(",").map((t) => t.trim()).filter(Boolean) : []
  );
  const [tagInput, setTagInput]       = useState("");
  const [links, setLinks]             = useState<string[]>(
    project.links ? project.links.split(",").map((l) => l.trim()).filter(Boolean) : []
  );
  const [linkInput, setLinkInput]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const addLink = () => {
    const l = linkInput.trim();
    if (l && !links.includes(l)) setLinks([...links, l]);
    setLinkInput("");
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Project name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const updated = await projectsApi.update(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        course: course.trim() || undefined,
        academic_year: academicYear.trim() || undefined,
        group_number: groupNumber ? parseInt(groupNumber) : undefined,
        tags: tags.length ? tags.join(",") : undefined,
        links: links.length ? links.join(",") : undefined,
      });
      onSaved(updated as ProjectDetail);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-[24px] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold">Edit Project</h2>
          <button onClick={onClose}><X size={22} className="text-gray-400 hover:text-gray-700" /></button>
        </div>

        <div className="px-8 py-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Course</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Academic Year</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Group Number</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button onClick={addTag} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-700">
                <Plus size={16} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X size={11} className="hover:text-red-400" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Links</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
                placeholder="https://..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              />
              <button onClick={addLink} className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-700">
                <Plus size={16} />
              </button>
            </div>
            {links.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {links.map((l) => (
                  <div key={l} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs text-blue-500 truncate max-w-[90%]">{l}</span>
                    <button onClick={() => setLinks(links.filter((x) => x !== l))}>
                      <X size={13} className="text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 pb-8">
          <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Request Equipment Modal ───────────────────────────────────────────────────

function RequestEquipmentModal({
  projectId,
  onClose,
  onSubmitted,
}: {
  projectId: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [catalog, setCatalog]       = useState<EquipmentCatalogItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [items, setItems]           = useState<EquipmentCatalogItem[]>([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    equipmentApi.catalog()
      .then((cat) => setCatalog(cat.filter((m) => m.available)))
      .catch(() => setError("Failed to load equipment catalog."))
      .finally(() => setLoadingCat(false));
  }, []);

  const addItem = () => {
    if (!selectedId) return;
    const model = catalog.find((m) => m.id === selectedId);
    if (!model || items.find((i) => i.id === selectedId)) return;
    setItems([...items, model]);
    setSelectedId("");
  };

  const handleSubmit = async () => {
    if (items.length === 0) { setError("Add at least one equipment item."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await requisitionsApi.create(
        projectId,
        items.map((i) => ({ equipment_id: i.id }))
      );
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold">Request Equipment</h2>
          <button onClick={onClose}><X size={22} className="text-gray-400 hover:text-gray-700" /></button>
        </div>

        <div className="px-8 py-6 flex flex-col gap-4">
          {loadingCat ? (
            <div className="text-gray-400 text-sm animate-pulse">Loading catalog...</div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-gray-100 rounded-lg">
                      <Cpu size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                      {item.asset_tag && <div className="text-xs text-gray-400">[{item.asset_tag}] — {item.location ?? "no location"}</div>}
                    </div>
                  </div>
                  <button onClick={() => setItems(items.filter((i) => i.id !== item.id))}>
                    <X size={15} className="text-gray-300 hover:text-red-400 ml-1" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <select
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-gray-400 transition-colors"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value ? parseInt(e.target.value) : "")}
                >
                  <option value="">Select equipment...</option>
                  {catalog
                    .filter((m) => !items.find((i) => i.id === m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.asset_tag ? `[${m.asset_tag}]` : ""} — {m.location ?? "no location"}
                      </option>
                    ))}
                </select>
                <button onClick={addItem} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700">
                  <Plus size={18} />
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 pb-8">
          <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params?.projectId);

  const [project, setProject]             = useState<ProjectDetail | null>(null);
  const [memberUsers, setMemberUsers]     = useState<Record<number, User>>({});
  const [requisitions, setRequisitions]   = useState<RequisitionDetail[]>([]);
  const [catalog, setCatalog]             = useState<Record<number, string>>({});
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReqModal, setShowReqModal]   = useState(false);

  const loadRequisitions = async () => {
    const reqs = await requisitionsApi.listByProject(projectId).catch(() => [] as RequisitionDetail[]);
    setRequisitions(reqs);
  };

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const proj = await projectsApi.get(projectId);
        setProject(proj);

        const me = await auth.me().catch(() => null);
        setCurrentUserId(me?.id ?? null);

        const memberIds = [...new Set((proj.members ?? []).map((m) => m.user_id))];
        const userResults = await Promise.allSettled(memberIds.map((id) => usersApi.get(id)));
        const map: Record<number, User> = {};
        userResults.forEach((r, i) => {
          if (r.status === "fulfilled") map[memberIds[i]] = r.value;
        });
        setMemberUsers(map);

        const reqs = await requisitionsApi.listByProject(projectId).catch(() => [] as RequisitionDetail[]);
        setRequisitions(reqs);

        const cat = await equipmentApi.catalog().catch(() => []);
        const catMap: Record<number, string> = {};
        cat.forEach((m) => { catMap[m.id] = m.name; });
        setCatalog(catMap);

      } catch (e: any) {
        setError(e.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  if (loading) return <main className="p-8 bg-white min-h-screen font-sans"><Header /><div className="text-gray-400 mt-8 animate-pulse">Loading project...</div></main>;
  if (error)   return <main className="p-8 bg-white min-h-screen font-sans"><Header /><div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm">Error: {error}</div></main>;
  if (!project) return <main className="p-8 bg-white min-h-screen font-sans"><Header /><div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-700 text-sm">Project not found.</div></main>;

  const supervisorMembers = (project.members ?? []).filter((m) => m.role === "supervisor");
  const teamMembers       = (project.members ?? []).filter((m) => m.role !== "supervisor");
  const tags   = project.tags  ? project.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const links  = project.links ? project.links.split(",").map((l) => l.trim()).filter(Boolean) : [];
  const createdAt = new Date(project.created_at).toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" });
  const isMember = currentUserId !== null && (project.members ?? []).some((m) => m.user_id === currentUserId);

  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      <Header />

      <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-8 text-sm font-medium">
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

        {isMember && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowReqModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Cpu size={16} /> Request Equipment
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Edit Project
            </button>
          </div>
        )}
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
              <InfoRow label="Approved" value={new Date(project.approved_at).toLocaleDateString("pt-PT")} />
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Team ({(project.members ?? []).length})</h2>
            </div>

            {supervisorMembers.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">Supervisors</p>
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
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Supervisor</span>
                    </div>
                  );
                })}
              </div>
            )}

            {teamMembers.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-2">Members</p>
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
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${m.role === "leader" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {m.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {(project.members ?? []).length === 0 && <p className="text-sm text-gray-400">No members yet.</p>}
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Cpu size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Equipment Requests ({requisitions.length})</h2>
            </div>

            {requisitions.length === 0 ? (
              <p className="text-sm text-gray-400">No equipment requests.</p>
            ) : (
              requisitions.map((req) => (
                <div key={req.id} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">Req #{req.id} · {new Date(req.created_at).toLocaleDateString("pt-PT")}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {(req.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
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
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {tags.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><Tag size={16} className="text-gray-400" /><h2 className="font-bold">Tags</h2></div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => <span key={t} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">{t}</span>)}
              </div>
            </div>
          )}

          {links.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4"><LinkIcon size={16} className="text-gray-400" /><h2 className="font-bold">Links</h2></div>
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <a key={l} href={l} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate flex items-center gap-1">
                    <ChevronRight size={12} />{l.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-gray-400" /><h2 className="font-bold">Timeline</h2></div>
            <div className="flex flex-col gap-3">
              <TimelineItem icon={<CheckCircle2 size={14} />} label="Created" date={createdAt} color="text-gray-400" />
              {project.approved_at && <TimelineItem icon={<CheckCircle2 size={14} />} label="Approved" date={new Date(project.approved_at).toLocaleDateString("pt-PT")} color="text-green-500" />}
              {project.status === "rejected"  && <TimelineItem icon={<XCircle size={14} />}     label="Rejected"  color="text-red-400" />}
              {project.status === "active"    && <TimelineItem icon={<AlertCircle size={14} />}  label="Active"    color="text-green-500" />}
              {project.status === "completed" && <TimelineItem icon={<CheckCircle2 size={14} />} label="Completed" color="text-blue-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setProject(updated)}
        />
      )}

      {showReqModal && (
        <RequestEquipmentModal
          projectId={projectId}
          onClose={() => setShowReqModal(false)}
          onSubmitted={loadRequisitions}
        />
      )}
    </main>
  );
}