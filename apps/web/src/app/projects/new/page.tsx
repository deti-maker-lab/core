"use client";

// apps/web/src/app/projects/new/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Tag, Link as LinkIcon, Users, Cpu, FileText, ShieldCheck } from "lucide-react";
import Header from "@/app/components/header";
import {
  auth,
  projects as projectsApi,
  requisitions as requisitionsApi,
  users as usersApi,
  equipment as equipmentApi,
  type User,
  type EquipmentCatalogItem,
} from "@/lib/api";

const MEMBER_ROLES = ["supervisor", "member", "observer", "advisor"];

interface MemberEntry {
  user: User;
  role: string;
}

interface EquipmentEntry {
  model: EquipmentCatalogItem;
}

export default function NewProjectPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<EquipmentCatalogItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | "">("");
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [equipmentItems, setEquipmentItems] = useState<EquipmentEntry[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [me, allUsers, cat] = await Promise.all([
          auth.me(),
          usersApi.list(),
          equipmentApi.catalog(),
        ]);
        if (cancelled) return;
        setCurrentUser(me);
        setSupervisors(allUsers.filter((u) => u.role === "professor"));
        setAvailableUsers(allUsers.filter((u) => u.role === "student" && u.id !== me.id));
        setCatalog(cat);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          router.push("/");
        } else {
          setError(err?.message ?? "Failed to load page data.");
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

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

  const addMember = () => {
    if (!selectedMemberId) return;
    const user = availableUsers.find((u) => u.id === selectedMemberId);
    if (!user || members.find((m) => m.user.id === selectedMemberId)) return;
    setMembers([...members, { user, role: "member" }]);
    setSelectedMemberId("");
  };

  const addSupervisor = () => {
    if (!selectedSupervisorId) return;
    const user = supervisors.find((u) => u.id === selectedSupervisorId);
    if (!user || members.find((m) => m.user.id === selectedSupervisorId)) return;
    setMembers([...members, { user, role: "supervisor" }]);
    setSelectedSupervisorId("");
  };

  const updateMemberRole = (userId: number, role: string) => {
    setMembers(members.map((m) => (m.user.id === userId ? { ...m, role } : m)));
  };

  const addEquipment = () => {
    if (!selectedModelId) return;
    const model = catalog.find((m) => m.id === selectedModelId);
    if (!model || equipmentItems.find((e) => e.model.id === selectedModelId)) return;
    setEquipmentItems([...equipmentItems, { model }]);
    setSelectedModelId("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Project name is required."); return; }

    const supervisorMembers = members.filter((m) => m.role === "supervisor");
    if (supervisorMembers.length === 0) {
      setError("Please add at least one supervisor.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const project = await projectsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        course: course.trim() || undefined,
        academic_year: academicYear.trim() || undefined,
        group_number: groupNumber ? parseInt(groupNumber) : undefined,
        tags: tags.length ? tags.join(",") : undefined,
        links: links.length ? links.join(",") : undefined,
        members: members.map((m) => ({ user_id: m.user.id, role: m.role })),
      });

      if (equipmentItems.length > 0) {
        await requisitionsApi.create(
          project.id,
          equipmentItems.map((e) => ({
            equipment_id: e.model.id,
          }))
        );
      }

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create project.");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400 placeholder:font-normal";

  return (
    <main className="flex-1 bg-[#f4f5f7] p-8 min-h-screen font-sans text-gray-900">
      <Header />

      <div className="max-w-4xl mx-auto pb-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 mb-8 text-sm font-semibold text-gray-600 shadow-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Create New Project</h1>
          <p className="text-gray-500 font-medium text-lg">Fill in the details to submit your project for approval.</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Project Information */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Project Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Autonomous Solar Drone v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Course</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Engenharia Informática"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Academic Year</label>
                <input
                  className={inputClass}
                  placeholder="e.g. 2023/2024"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Group Number</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="e.g. 3"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 mt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description</label>
                <textarea
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe the project goals, scope, and expected outcomes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Tag size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Tags</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <input
                className={inputClass}
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button 
                onClick={addTag} 
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((t) => (
                  <span key={t} className="group flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-red-200 hover:bg-red-50 transition-colors">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-gray-400 group-hover:text-red-500 transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Documentation & Links */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <LinkIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Documentation & Links</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <input
                className={inputClass}
                placeholder="https://github.com/..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              />
              <button 
                onClick={addLink} 
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
            </div>
            {links.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                {links.map((l) => (
                  <div key={l} className="flex items-center justify-between px-5 py-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-300 transition-colors">
                    <a href={l} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[90%]">{l}</a>
                    <button onClick={() => setLinks(links.filter((x) => x !== l))} className="p-1.5 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Supervisors */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Supervisors <span className="text-red-500">*</span>
              </h2>
            </div>
            
            {members.filter((m) => m.role === "supervisor").length > 0 && (
              <div className="mb-6 flex flex-col gap-3">
                {members.filter((m) => m.role === "supervisor").map((m) => (
                  <div key={m.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{m.user.name}</div>
                        <div className="text-xs font-medium text-gray-500">{m.user.email}</div>
                      </div>
                    </div>
                    <button onClick={() => setMembers(members.filter((x) => x.user.id !== m.user.id))} className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                className={`${inputClass} cursor-pointer`}
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">Select a supervisor from the list...</option>
                {supervisors
                  .filter((s) => !members.find((m) => m.user.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
                  ))}
              </select>
              <button onClick={addSupervisor} className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Add
              </button>
            </div>
          </section>

          {/* Team Members */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {currentUser && (
                <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{currentUser.name} <span className="text-gray-400 font-normal ml-1">(You)</span></div>
                      <div className="text-xs font-medium text-gray-500">{currentUser.email}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-indigo-200">Leader</span>
                </div>
              )}

              {members.filter((m) => m.role !== "supervisor").map((m) => (
                <div key={m.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{m.user.name}</div>
                      <div className="text-xs font-medium text-gray-500">{m.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-600 uppercase outline-none cursor-pointer hover:border-gray-300 transition-colors"
                      value={m.role}
                      onChange={(e) => updateMemberRole(m.user.id, e.target.value)}
                    >
                      {MEMBER_ROLES
                        .filter((r) => r !== "leader" && r !== "supervisor")
                        .map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <button onClick={() => setMembers(members.filter((x) => x.user.id !== m.user.id))} className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                className={`${inputClass} cursor-pointer`}
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">Add a student to your team...</option>
                {availableUsers
                  .filter((u) => !members.find((m) => m.user.id === u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
              </select>
              <button onClick={addMember} className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Add
              </button>
            </div>
          </section>

          {/* Equipment Request */}
          <section className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Cpu size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Equipment Request</h2>
            </div>

            {equipmentItems.length > 0 && (
              <div className="flex flex-col gap-3 mb-6">
                {equipmentItems.map((e) => (
                  <div key={e.model.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 shadow-sm">
                        <Cpu size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {e.model.name}
                          {e.model.asset_tag && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] uppercase rounded-md tracking-widest">{e.model.asset_tag}</span>
                          )}
                        </div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                          Location: <span className="text-gray-700">{e.model.location || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setEquipmentItems(equipmentItems.filter((x) => x.model.id !== e.model.id))} className="p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                className={`${inputClass} cursor-pointer`}
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">Select equipment from the lab catalog...</option>
                {catalog
                  .filter((m) => m.available && !equipmentItems.find((e) => e.model.id === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.asset_tag ? `[${m.asset_tag}]` : ""} — {m.location ?? "No location"}
                    </option>
                  ))}
              </select>
              <button onClick={addEquipment} className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> Add
              </button>
            </div>
          </section>

          {error && (
            <div className="px-6 py-4 bg-red-50 border border-red-200 text-red-600 font-medium text-sm rounded-2xl flex items-center justify-center shadow-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
            <Link
              href="/projects"
              className="px-8 py-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-center shadow-sm"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {submitting ? "Submitting Request..." : "Submit Project Request"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}