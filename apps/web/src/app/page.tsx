import { Search, Bell, UserCircle, Folder, Cpu, Users, Activity, Image as ImageIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 bg-gray-50 p-8 min-h-screen font-sans">
      {/* Top Navigation (Notificações e Perfil) */}
      <div className="flex justify-end items-center gap-4 mb-12 text-gray-600">
        <button className="hover:text-gray-900"><Bell size={24} /></button>
        <button className="hover:text-gray-900"><UserCircle size={28} /></button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">DETI Maker Lab</h1>
        <p className="text-xl text-gray-500 mb-8">Your space for inovation</p>
        
        {/* Search Bar */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Folder size={24} className="text-gray-600"/>} value="39" label="Active Projects" />
        <StatCard icon={<Cpu size={24} className="text-gray-600"/>} value="1904" label="Available Equipment" />
        <StatCard icon={<Users size={24} className="text-gray-600"/>} value="87" label="Lab Members" />
        <StatCard icon={<Activity size={24} className="text-gray-600"/>} value="26" label="Checked Out" />
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Projects</h2>
          <a href="/projects" className="text-gray-600 hover:text-gray-900 font-medium cursor-pointer">View all</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProjectCard 
            title="Autonomous Rover v2" 
            desc="Building a self-navigating rover for the campus competition" 
            members="3" equip="5" 
          />
          <ProjectCard 
            title="Smart Greenhouse Monitor" 
            desc="IoT-based environmental monitoring system for the..." 
            members="2" equip="3" 
          />
          <ProjectCard 
            title="Prosthetic Hand Project" 
            desc="3D-printed prosthetic hand with EMG sensor control" 
            members="5" equip="7" 
          />
          <ProjectCard 
            title="Solar-Powered Station" 
            desc="Building an autonomous outdoor weather station" 
            members="2" equip="11" 
          />
        </div>
      </div>
    </main>
  );
}

// Componente auxiliar para os cartões de Estatísticas
function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

// Componente auxiliar para os cartões de Projetos
function ProjectCard({ title, desc, members, equip }: { title: string, desc: string, members: string, equip: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
        <ImageIcon size={48} className="text-gray-300" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{desc}</p>
        <div className="text-xs text-gray-400 font-medium flex gap-4">
          <span>{members} members</span>
          <span>{equip} equipment</span>
        </div>
      </div>
    </div>
  );
}