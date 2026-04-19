// app/statistics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { projects as projectsApi, equipment as equipmentApi, users as usersApi, requisitions as requisitionsApi } from "@/lib/api";
import type { Project, EquipmentCatalogItem, User, RequisitionDetail } from "@/lib/api";
import { FolderOpen, Cpu, Users, TrendingUp, Clock, CheckCircle2, XCircle, BarChart2 } from "lucide-react";

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs text-gray-500 font-medium truncate shrink-0">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 text-xs text-gray-400 text-right shrink-0">{value}</div>
    </div>
  );
}

export default function StatisticsPage() {
  const [projects, setProjects]       = useState<Project[]>([]);
  const [equipment, setEquipment]     = useState<EquipmentCatalogItem[]>([]);
  const [users, setUsers]             = useState<User[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionDetail[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.allSettled([
      projectsApi.list(),
      equipmentApi.catalog(),
      usersApi.list(),
      requisitionsApi.list(),
    ]).then(([p, e, u, r]) => {
      if (p.status === "fulfilled") setProjects(p.value);
      if (e.status === "fulfilled") setEquipment(e.value);
      if (u.status === "fulfilled") setUsers(u.value);
      if (r.status === "fulfilled") setRequisitions(r.value);
    }).finally(() => setLoading(false));
  }, []);

  const activeProjects    = projects.filter((p) => p.status === "active").length;
  const pendingProjects   = projects.filter((p) => p.status === "pending").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const rejectedProjects  = projects.filter((p) => p.status === "rejected").length;

  const availableEquipment = equipment.filter((e) => e.available).length;
  const checkedOut         = equipment.filter((e) => !e.available).length;

  const students     = users.filter((u) => u.role === "student").length;
  const professors   = users.filter((u) => u.role === "professor").length;
  const technicians  = users.filter((u) => u.role === "lab_technician").length;

  const pendingReqs   = requisitions.filter((r) => r.status === "pending").length;
  const reservedReqs  = requisitions.filter((r) => r.status === "reserved").length;
  const fulfilledReqs = requisitions.filter((r) => r.status === "fulfilled").length;

  const courseCounts: Record<string, number> = {};
  projects.forEach((p) => { if (p.course) courseCounts[p.course] = (courseCounts[p.course] ?? 0) + 1; });
  const topCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCourse  = topCourses[0]?.[1] ?? 1;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString("pt-PT", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });
  const projectsPerMonth = months.map(({ label, year, month }) => ({
    label,
    count: projects.filter((p) => {
      const d = new Date(p.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
  }));
  const maxMonth = Math.max(...projectsPerMonth.map((m) => m.count), 1);

  if (loading) return <div className="text-gray-400 animate-pulse p-8">Loading statistics...</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Statistics</h1>
        <p className="text-gray-400 text-sm">Overview of lab activity and resources</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects"      value={projects.length}   sub={`${activeProjects} active`}     icon={<FolderOpen size={20} />} color="bg-blue-100 text-blue-500" />
        <StatCard label="Equipment Items"     value={equipment.length}  sub={`${availableEquipment} available`} icon={<Cpu size={20} />}       color="bg-teal-100 text-teal-500" />
        <StatCard label="Lab Members"         value={users.length}      sub={`${students} students`}          icon={<Users size={20} />}      color="bg-purple-100 text-purple-500" />
        <StatCard label="Total Requisitions"  value={requisitions.length} sub={`${pendingReqs} pending`}      icon={<TrendingUp size={20} />}  color="bg-amber-100 text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FolderOpen size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">Project Status</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Bar label="Active"    value={activeProjects}    max={projects.length} color="bg-green-400" />
            <Bar label="Pending"   value={pendingProjects}   max={projects.length} color="bg-yellow-400" />
            <Bar label="Completed" value={completedProjects} max={projects.length} color="bg-blue-400" />
            <Bar label="Rejected"  value={rejectedProjects}  max={projects.length} color="bg-red-400" />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
            {[
              { label: "Active",    value: activeProjects,    color: "text-green-500" },
              { label: "Pending",   value: pendingProjects,   color: "text-yellow-500" },
              { label: "Completed", value: completedProjects, color: "text-blue-500" },
              { label: "Rejected",  value: rejectedProjects,  color: "text-red-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Cpu size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">Equipment Status</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Bar label="Available"   value={availableEquipment} max={equipment.length} color="bg-teal-400" />
            <Bar label="Checked out" value={checkedOut}          max={equipment.length} color="bg-orange-400" />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">Utilisation rate</span>
              <span className="font-bold text-gray-800">
                {equipment.length > 0 ? Math.round((checkedOut / equipment.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                style={{ width: `${equipment.length > 0 ? (availableEquipment / equipment.length) * 100 : 0}%` }}
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <div className="text-xl font-bold text-teal-600">{availableEquipment}</div>
                <div className="text-xs text-teal-500">Available</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-xl font-bold text-orange-500">{checkedOut}</div>
                <div className="text-xs text-orange-400">In use</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">User Roles</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Bar label="Students"    value={students}    max={users.length} color="bg-purple-400" />
            <Bar label="Professors"  value={professors}  max={users.length} color="bg-blue-400" />
            <Bar label="Technicians" value={technicians} max={users.length} color="bg-gray-400" />
          </div>
          <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col gap-2">
            {[
              { label: "Students",    value: students,    bg: "bg-purple-50", text: "text-purple-600" },
              { label: "Professors",  value: professors,  bg: "bg-blue-50",   text: "text-blue-600" },
              { label: "Technicians", value: technicians, bg: "bg-gray-50",   text: "text-gray-600" },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`flex items-center justify-between px-4 py-2 ${bg} rounded-xl`}>
                <span className={`text-sm font-medium ${text}`}>{label}</span>
                <span className={`text-sm font-bold ${text}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">Projects Created (last 6 months)</h2>
          </div>
          <div className="flex items-end gap-3 h-32">
            {projectsPerMonth.map(({ label, count }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-gray-500">{count > 0 ? count : ""}</div>
                <div
                  className="w-full bg-blue-100 rounded-t-lg transition-all"
                  style={{ height: `${(count / maxMonth) * 100}px`, minHeight: count > 0 ? "4px" : "0" }}
                >
                  <div className="w-full h-full bg-blue-400 rounded-t-lg opacity-80" />
                </div>
                <div className="text-[10px] text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-gray-400" />
            <h2 className="font-bold text-gray-800">Top Courses by Projects</h2>
          </div>
          {topCourses.length === 0 ? (
            <p className="text-sm text-gray-400">No course data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topCourses.map(([course, count]) => (
                <Bar key={course} label={course} value={count} max={maxCourse} color="bg-indigo-400" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 size={16} className="text-gray-400" />
          <h2 className="font-bold text-gray-800">Equipment Requisitions Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending",   value: pendingReqs,                                              color: "bg-yellow-50 text-yellow-600" },
            { label: "Reserved",  value: reservedReqs,                                             color: "bg-purple-50 text-purple-600" },
            { label: "Fulfilled", value: fulfilledReqs,                                            color: "bg-teal-50 text-teal-600" },
            { label: "Rejected",  value: requisitions.filter((r) => r.status === "rejected").length, color: "bg-red-50 text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl p-5 text-center ${color}`}>
              <div className="text-3xl font-bold mb-1">{value}</div>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}