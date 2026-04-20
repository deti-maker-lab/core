// apps/web/src/app/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Folder, Cpu, Users, Activity, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { projects as projectsApi, equipment as equipmentApi, auth, users as usersApi } from "@/lib/api";
import type { Project, User, EquipmentCatalogItem } from "@/lib/api";
import Header from "@/app/components/header";

function HomeContent() {
  const [projectList, setProjectList]   = useState<Project[]>([]);
  const [catalogList, setCatalogList]   = useState<EquipmentCatalogItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState<User | null>(null);
  const [userCount, setUserCount]       = useState(0);
  const [search, setSearch]             = useState("");
  const [allUsers, setAllUsers]         = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<{
    projects: Project[];
    equipment: EquipmentCatalogItem[];
    users: User[];
  } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await auth.me();
        setUser(me);
      } catch {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const [p, e, u] = await Promise.all([
          projectsApi.list(),
          equipmentApi.catalog(),
          usersApi.list(),
        ]);
        setProjectList(p);
        setCatalogList(e); 
        setUserCount(u.length);
        setAllUsers(u);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults(null); return; }
    const ql = q.toLowerCase();
    
    // Agora filtra APENAS pelo nome em todas as categorias
    setSearchResults({
      projects:  projectList.filter((p) => p.name.toLowerCase().includes(ql)),
      equipment: catalogList.filter((e) => e.name.toLowerCase().includes(ql)),
      users:     allUsers.filter((u) => u.name.toLowerCase().includes(ql)),
    });
  };

  const activeProjects = projectList.filter((p) => p.status === "active").length;
  const recentProjects = [...projectList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <main className="flex-1 bg-[#f4f5f7] p-8 min-h-screen font-sans text-gray-900">
      <Header/>

      <div className="flex flex-col items-center mb-16 mt-8">
        <h1 className="text-5xl md:text-[56px] font-extrabold tracking-tight mb-4 text-gray-900">
          DETI <span className="text-blue-600">Maker Lab</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 font-medium">Your lab management platform. Search anything.</p>
        <div className="relative w-full max-w-3xl mx-auto" ref={searchRef}>
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, equipment, users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-14 pr-12 py-4 rounded-full border border-gray-200 bg-white text-gray-900 font-medium text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-gray-400 placeholder:font-normal"
          />
          {search && (
            <button 
              onClick={() => handleSearch("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}

          {searchResults && (search.trim()) && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-3xl shadow-xl z-50 overflow-hidden max-h-[500px] overflow-y-auto py-2">
              {searchResults.projects.length === 0 && searchResults.equipment.length === 0 && searchResults.users.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No results for "{search}"</div>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center">Projects</div>
                      {searchResults.projects.slice(0, 4).map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} onClick={() => setSearchResults(null)}>
                          <div className="flex items-start gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                            <Folder size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                              <div className="text-sm text-gray-500 capitalize">{p.status}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.equipment.length > 0 && (
                    <div>
                      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center mt-2">Equipment</div>
                      {searchResults.equipment.slice(0, 4).map((e) => (
                        <Link key={e.id} href={`/equipment/${e.id}`} onClick={() => setSearchResults(null)}>
                          <div className="flex items-start gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                            <Cpu size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{e.name}</div>
                              <div className="text-sm text-gray-500 capitalize">{e.available ? "Available" : "In use"}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-center mt-2">Users</div>
                      {searchResults.users.slice(0, 4).map((u) => (
                        <Link key={u.id} href={`/users/${u.id}`} onClick={() => setSearchResults(null)}>
                          <div className="flex items-start gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                            <Users size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                              <div className="text-sm text-gray-500 capitalize">{u.role}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/projects" className="block">
          <StatCard
            icon={<Folder size={20} className="text-blue-500" />}
            iconBg="bg-blue-50"
            value={loading ? "..." : String(activeProjects)}
            label="Active Projects"
          />
        </Link>
        <Link href="/equipment" className="block">
          <StatCard
            icon={<Cpu size={20} className="text-teal-500" />}
            iconBg="bg-teal-50"
            value={loading ? "..." : String(catalogList.length)}
            label="Available Equipment"
          />
        </Link>
        <Link href="/users" className="block">
          <StatCard
            icon={<Users size={20} className="text-purple-500" />}
            iconBg="bg-purple-50"
            value={loading ? "..." : String(userCount)}
            label="Lab Members"
          />
        </Link>
        <Link href="/projects" className="block">
          <StatCard
            icon={<Activity size={20} className="text-yellow-500" />}
            iconBg="bg-yellow-50"
            value={loading ? "..." : String(projectList.filter((p) => p.status === "pending").length)}
            label="Checked Out"
          />
        </Link>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-end mb-6 px-1">
          <h2 className="text-[22px] font-bold text-gray-900">Recent Projects</h2>
          <Link href="/projects" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[280px] animate-pulse" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProjects.map((proj) => (
              <Link key={proj.id} href={`/projects/${proj.id}`}>
                <ProjectCard
                  title={proj.name}
                  desc={proj.description ?? ""}
                  status={proj.status}
                  course={proj.course ?? ""}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function StatCard({ icon, iconBg, value, label }: { icon: React.ReactNode; iconBg: string; value: string; label: string; }) {
  return (
    <div className="group bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between h-40 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <ArrowUpRight size={20} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div>
        <div className="text-[32px] font-bold text-gray-900 leading-none mb-2">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

function ProjectCard({ title, desc, status, course }: { title: string; desc: string; status: string; course: string }) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="h-[140px] bg-gradient-to-br from-blue-50/80 to-slate-50 flex items-center justify-center">
        <Folder size={40} strokeWidth={1.5} className="text-blue-300" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-1">{desc || "No description provided"}</p>
        </div>
        <div className="flex items-center text-xs text-gray-400 font-medium gap-2">
          {course && <span>{course}</span>}
          {course && <span className="w-1 h-1 rounded-full bg-gray-300" />}
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}