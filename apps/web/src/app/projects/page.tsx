"use client";

// apps/web/src/app/projects/page.tsx
import { useEffect, useState } from "react";
import { Search, Users, Cpu, ChevronRight, BookOpen, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { projects as projectsApi } from "@/lib/api";
import type { Project } from "@/lib/api";
import Header from "@/app/components/header";

const STATUS_FILTERS = ["All", "Active", "Completed", "On Hold"];

function getStatusStyles(status: string) {
  const s = status.toLowerCase();
  if (s === "active") return { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" };
  if (s === "pending") return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  if (s === "on hold" || s === "pending approval") return { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" };
  if (s === "rejected") return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
  return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };
}

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    projectsApi.list()
      .then(setProjectList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projectList.filter((proj) => {
    const matchesFilter =
      activeFilter === "All" ||
      (proj.status || "active").toLowerCase() === activeFilter.toLowerCase();
      
    const matchesSearch =
      !searchQuery ||
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.course ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 bg-[#f4f5f7] p-8 min-h-screen font-sans text-gray-900">
      <Header />

      {/* Page Title & Actions */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-gray-500 font-medium">{projectList.length} projects</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/projects/my-projects"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <BookOpen size={16} /> My Projects
          </Link>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-bold hover:bg-[#4338ca] transition-colors shadow-sm"
          >
            <Plus size={18} /> New Project
          </Link>
        </div>
      </div>

      {/* Control Bar - Igual ao dos Equipamentos */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-3xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-[#eceef1] border-none rounded-xl outline-none text-sm text-gray-600 placeholder:text-gray-400"
            placeholder="Search by name, course, supervisor, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-[#eceef1] p-1 rounded-xl">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                activeFilter === option
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="px-1 mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filtered.length} results</span>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-transparent rounded-xl p-5 h-24 animate-pulse bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-medium">
          No projects found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((proj) => {
            const statusDisplay = proj.status || "active";
            const styles = getStatusStyles(statusDisplay);

            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="group border border-transparent hover:border-gray-200 bg-white rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all"
              >
                {/* Left Side: Info */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-[15px] truncate max-w-sm">
                      {proj.name}
                    </h3>
                    
                    {proj.course && (
                      <span className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-tight rounded-md">
                        {proj.course}
                      </span>
                    )}
                    
                    {proj.group_number && (
                      <span className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-tight rounded-md">
                        Group {proj.group_number}
                      </span>
                    )}

                    {statusDisplay.toLowerCase() === "pending approval" && (
                      <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-md">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-medium truncate">
                    {proj.description ?? "No description available."}
                  </p>
                </div>

                {/* Right Side: Meta & Actions */}
                <div className="flex items-center gap-6 xl:gap-8 shrink-0">
                  <span className="hidden lg:block text-sm text-gray-400 font-medium">
                    {/* Placeholder para supervisor caso não venha na API */}
                    by { (proj as any).supervisor || "Dr. Sarah Chen" }
                  </span>

                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Users size={16} /> {(proj as any).member_count || 2}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Cpu size={16} /> {(proj as any).equipment_count || 0}
                    </span>
                    <span className="hidden md:flex items-center gap-1.5 text-sm font-medium min-w-[90px]">
                      <Calendar size={16} /> {(proj as any).date || "Apr 2026"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 min-w-[120px] justify-end">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold lowercase tracking-wider ${styles.bg} ${styles.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {statusDisplay}
                    </span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}