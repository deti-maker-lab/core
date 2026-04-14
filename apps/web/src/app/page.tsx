// apps/web/src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Search, Folder, Cpu, Users, Activity, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { projects as projectsApi, equipment as equipmentApi, auth, users as usersApi } from "@/lib/api";
import type { Project, EquipmentModel, User } from "@/lib/api";
import Header from "@/app/components/header";


function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [catalogList, setCatalogList] = useState<EquipmentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userCount, setUserCount] = useState(0);

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams, router]);

  const activeProjects = projectList.filter((p) => p.status === "active").length;
  const recentProjects = [...projectList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <main className="flex-1 bg-gray-50 p-8 min-h-screen font-sans">
      {/* Top Navigation */}
      <Header/>

      {/* Hero Section */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">DETI Maker Lab</h1>
        <p className="text-xl text-gray-500 mb-8">Your space for innovation</p>
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="search projects, equipments, users..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
          />
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Folder size={24} className="text-gray-600" />}
            value={String(activeProjects)}
            label="Active Projects"
          />
          <StatCard
            icon={<Cpu size={24} className="text-gray-600" />}
            value={String(catalogList.length)}
            label="Equipment Models"
          />
          <Link href="/users" className="cursor-pointer">
            <StatCard
              icon={<Users size={24} className="text-gray-600" />}
              value={String(userCount)}
              label="Lab Members"
            />
          </Link>
          <StatCard
            icon={<Activity size={24} className="text-gray-600" />}
            value={String(projectList.filter((p) => p.status === "pending").length)}
            label="Pending Approval"
          />
        </div>
      )}

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Projects</h2>
          <Link href="/projects" className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm h-64 animate-pulse" />
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

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
      <div className="bg-gray-100 p-4 rounded-lg">{icon}</div>
      <div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

function ProjectCard({ title, desc, status, course }: { title: string; desc: string; status: string; course: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
        <ImageIcon size={48} className="text-gray-300" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{desc || "No description."}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          {course && <span>{course}</span>}
          <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}