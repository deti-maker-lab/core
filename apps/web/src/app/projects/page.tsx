"use client";

import { useEffect, useState } from "react";
import { Search, Users, Cpu, ChevronRight, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { projects as projectsApi } from "@/lib/api";
import type { Project } from "@/lib/api";
import Header from "@/app/components/header";

const STATUS_FILTERS = ["All", "Active", "Pending", "Completed", "Rejected"];

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
      proj.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.course ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">

      {/* Top Header */}
      <Header />

      {/* Page Title & Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p className="text-gray-400 font-medium">All ongoing and past projects</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/projects/my-projects"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <BookOpen size={18} /> My Projects
          </Link>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors shadow-sm"
          >
            <Plus size={18} /> New Project
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center border border-gray-200 rounded-full px-5 py-2.5 w-full max-w-xl shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            className="ml-3 outline-none w-full text-sm bg-transparent placeholder:text-gray-400"
            placeholder="search by name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center border border-gray-200 rounded-full p-1 shadow-sm">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
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

      {/* Projects List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-[20px] p-5 h-24 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No projects found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="border border-gray-200 rounded-[20px] p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group bg-white"
            >
              <div className="flex flex-col gap-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {proj.name}
                  </h3>
                  {proj.course && (
                    <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                      {proj.course}
                    </span>
                  )}
                  {proj.group_number && (
                    <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                      Group {proj.group_number}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {proj.description ?? "No description."}
                </p>
              </div>

              <div className="flex items-center gap-8 pl-4">
                <span className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full w-28 text-center ${
                  proj.status === "active"   ? "bg-green-50 text-green-600 border border-green-200" :
                  proj.status === "pending"  ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                  proj.status === "rejected" ? "bg-red-50 text-red-500 border border-red-200" :
                  "bg-gray-50 border border-gray-200 text-gray-400"
                }`}>
                  {proj.status}
                </span>
                <ChevronRight size={24} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}