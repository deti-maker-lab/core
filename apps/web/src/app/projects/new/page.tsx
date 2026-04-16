"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Tag, Link as LinkIcon, Users, Cpu } from "lucide-react";
import Header from "@/app/components/header";
import {
  auth,
  projects as projectsApi,
  requisitions as requisitionsApi,
  users as usersApi,
  equipment as equipmentApi,
  type User,
  type EquipmentModel,
} from "@/lib/api";

const MEMBER_ROLES = ["leader", "contributor", "observer", "advisor"];

interface MemberEntry {
  user: User;
  role: string;
}

interface EquipmentEntry {
  model: EquipmentModel;
  quantity: number;
}

export default function NewProjectPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<EquipmentModel[]>([]);
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
  const [supervisorId, setSupervisorId] = useState<number | "">("");
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [equipmentItems, setEquipmentItems] = useState<EquipmentEntry[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | "">("");

  useEffect(() => {
    async function load() {
      try {
        const [me, allUsers, cat] = await Promise.all([
          auth.me(),
          usersApi.list(),
          equipmentApi.catalog(),
        ]);
        setCurrentUser(me);
        setSupervisors(allUsers.filter((u) => u.role === "professor"));
        setAvailableUsers(allUsers.filter((u) => u.role === "student" && u.id !== me.id));
        setCatalog(cat);
      } catch {
        router.push("/");
      }
    }
    load();
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
    setMembers([...members, { user, role: "contributor" }]);
    setSelectedMemberId("");
  };

  const updateMemberRole = (userId: number, role: string) => {
    setMembers(members.map((m) => (m.user.id === userId ? { ...m, role } : m)));
  };

  const addEquipment = () => {
    if (!selectedModelId) return;
    const model = catalog.find((m) => m.id === selectedModelId);
    if (!model || equipmentItems.find((e) => e.model.id === selectedModelId)) return;
    setEquipmentItems([...equipmentItems, { model, quantity: 1 }]);
    setSelectedModelId("");
  };

  const updateQuantity = (modelId: number, qty: number) => {
    if (qty < 1) return;
    setEquipmentItems(equipmentItems.map((e) => (e.model.id === modelId ? { ...e, quantity: qty } : e)));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Project name is required."); return; }
    if (!supervisorId) { setError("Please select a supervisor."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const project = await projectsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        course: course.trim() || undefined,
        academic_year: academicYear.trim() || undefined,
        group_number: groupNumber ? parseInt(groupNumber) : undefined,
        supervisor_id: supervisorId as number,
        tags: tags.length ? tags.join(",") : undefined,
        links: links.length ? links.join(",") : undefined,
        members: members.map((m) => ({ user_id: m.user.id, role: m.role })),
      });

      if (equipmentItems.length > 0) {
        await requisitionsApi.create(
          project.id,
          equipmentItems.map((e) => ({ model_id: e.model.id, quantity: e.quantity }))
        );
      }

      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create project.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-8 bg-white min-h-screen font-sans text-gray-800">
      <Header />

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 mb-8 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">New Project</h1>
        <p className="text-gray-400 font-medium mb-10">Fill in the details to submit your project for approval.</p>

        <div className="flex flex-col gap-6">

          {/* Project Information */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <h2 className="text-lg font-bold mb-6">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                  placeholder="e.g. Solar Charger v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Course</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                  placeholder="e.g. LEI"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Academic Year</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                  placeholder="e.g. 2024/2025"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Group Number</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                  placeholder="e.g. 3"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">Description</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors resize-none"
                  placeholder="Describe the project goals and scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Tag size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Tags</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button onClick={addTag} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                      <X size={12} className="hover:text-red-400 transition-colors" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Documentation & Links */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Documentation & Links</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                placeholder="https://..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              />
              <button onClick={addLink} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            {links.length > 0 && (
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <div key={l} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    <a href={l} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate max-w-[90%]">{l}</a>
                    <button onClick={() => setLinks(links.filter((x) => x !== l))}>
                      <X size={14} className="text-gray-300 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Supervisor */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <h2 className="text-lg font-bold mb-6">Supervisor <span className="text-red-400">*</span></h2>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value ? parseInt(e.target.value) : "")}
            >
              <option value="">Select a supervisor...</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
              ))}
            </select>
          </section>

          {/* Team Members */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Team Members</h2>
            </div>

            {currentUser && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{currentUser.name}</div>
                    <div className="text-xs text-gray-400">{currentUser.email}</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase rounded-full">Leader</span>
              </div>
            )}

            {members.map((m) => (
              <div key={m.user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{m.user.name}</div>
                    <div className="text-xs text-gray-400">{m.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white outline-none"
                    value={m.role}
                    onChange={(e) => updateMemberRole(m.user.id, e.target.value)}
                  >
                    {MEMBER_ROLES.filter((r) => r !== "leader").map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <button onClick={() => setMembers(members.filter((x) => x.user.id !== m.user.id))}>
                    <X size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-4">
              <select
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-gray-400 transition-colors"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">Add a team member...</option>
                {availableUsers
                  .filter((u) => !members.find((m) => m.user.id === u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
              </select>
              <button onClick={addMember} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
                <Plus size={18} />
              </button>
            </div>
          </section>

          {/* Equipment Request */}
          <section className="border border-gray-200 rounded-[28px] p-8 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Cpu size={18} className="text-gray-400" />
              <h2 className="text-lg font-bold">Equipment Request</h2>
            </div>

            {equipmentItems.map((e) => (
              <div key={e.model.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400">
                    <Cpu size={16} />
                  </div>
                  <span className="text-sm font-semibold">{e.model.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(e.model.id, e.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors text-sm font-bold"
                    >−</button>
                    <span className="w-6 text-center text-sm font-semibold">{e.quantity}</span>
                    <button
                      onClick={() => updateQuantity(e.model.id, e.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors text-sm font-bold"
                    >+</button>
                  </div>
                  <button onClick={() => setEquipmentItems(equipmentItems.filter((x) => x.model.id !== e.model.id))}>
                    <X size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-4">
              <select
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-gray-400 transition-colors"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value ? parseInt(e.target.value) : "")}
              >
                <option value="">Select equipment...</option>
                {catalog
                  .filter((m) => !equipmentItems.find((e) => e.model.id === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
              <button onClick={addEquipment} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
                <Plus size={18} />
              </button>
            </div>
          </section>

          {error && (
            <div className="px-5 py-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pb-8">
            <Link
              href="/projects"
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}