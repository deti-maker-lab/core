"use client";

import { useState } from "react";
import { Search, Bell, UserCircle, Plus, Cpu, Folder } from "lucide-react";
import Link from "next/link";

// Dados mockados baseados no teu desenho
const myProjectsData = [
  {
    id: 1,
    title: "Solar-Powered Weather Station",
    status: "Awaiting Approval",
    desc: "Building an autonomous outdoor weather station powered by solar panels, using ESP32 and LoRa for wireless data transmission to a central dashboard.",
    course: "PECI",
    group: "Group 2",
    equipment: [
      { name: "Fluke 87V Multimeter", status: "Pending", returnDate: "" },
      { name: "Siglent SDG2042X Signal Generator", status: "Pending", returnDate: "" },
      { name: "Dremel 4300 Rotary Tool", status: "Pending", returnDate: "" }
    ]
  },
  {
    id: 2,
    title: "Autonomous Rover v2",
    status: "active",
    desc: "Building a self-navigating rover for the campus competition using SLAM and LiDAR",
    course: "PECI",
    group: "Group 2",
    equipment: [
      { name: "NVIDIA Jetson AGX Orin", status: "Return by 17 May 26", returnDate: "17 May 26" },
      { name: "Raspberry Pi 5 Cluster", status: "Return by 17 May 26", returnDate: "17 May 26" },
      { name: "Universal Robots UR5e", status: "Pending", returnDate: "" }
    ]
  },
  {
    id: 3,
    title: "CubeSat Structural Testing",
    status: "completed",
    desc: "Vibration and thermal testing for the university's CubeSat mission payload",
    course: "PECI",
    group: "Group 2",
    equipment: [
      { name: "Siglent SDG2042X Signal Generator", status: "Returned", returnDate: "" }
    ]
  }
];

export default function MyProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false); // Estado para as notificações

  const filteredProjects = myProjectsData.filter(proj => {
    const matchesFilter = activeFilter === "All" || 
      (activeFilter === "Active" && (proj.status === "active" || proj.status === "Awaiting Approval")) ||
      (activeFilter === "Completed" && proj.status === "completed");
    
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      
      {/* Top Header com Notificações */}
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400 relative">
        <div className="relative cursor-pointer" onClick={() => setIsNotifOpen(!isNotifOpen)}>
          <Bell size={24} className="hover:text-gray-600 transition-colors" />
          {/* Bolinha de notificação não lida */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-[10px] text-white font-bold border-2 border-white">2</span>
        </div>
        <UserCircle size={28} className="cursor-pointer hover:text-gray-600 transition-colors" />

        {/* Pop-up de Notificações (Dropdown) */}
        {isNotifOpen && (
          <div className="absolute top-10 right-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden text-left">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-800">
              Notifications
            </div>
            <div className="flex flex-col max-h-96 overflow-y-auto">
              <NotificationItem 
                icon={<Folder size={20} />}
                text='Your project proposal "Smart Greenhouse Monitor" was approved! You can now pick up the equipment at the lab: Rigol DS1054Z Oscilloscope, Raspberry Pi 5 Cluster.'
                date="13 Mar, 08:53"
                unread
              />
              <NotificationItem 
                icon={<Cpu size={20} />}
                text='Your equipment request for "Fluke 87V Multimeter" on project "Prosthetic Hand Project" was approved. You can pick it up at the lab!'
                date="13 Mar, 08:54"
                unread
              />
            </div>
          </div>
        )}
      </div>

      {/* Page Title & Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Projects</h1>
          <p className="text-gray-400 font-medium">Projects you have submitted</p>
        </div>
        
        <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors shadow-sm">
          <Plus size={18} /> New Project
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center border border-gray-200 rounded-full px-5 py-2.5 w-full max-w-xl shadow-sm focus-within:border-gray-300 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            className="ml-3 outline-none w-full text-sm bg-transparent placeholder:text-gray-400"
            placeholder="search by name, course or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center border border-gray-200 rounded-full p-1 shadow-sm">
          {["All", "Active", "Completed"].map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
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
      <div className="flex flex-col gap-6">
        {filteredProjects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>

    </main>
  );
}

// --- Sub-Componentes ---

function ProjectCard({ project }: { project: any }) {
  const isAwaiting = project.status === "Awaiting Approval";
  const isCompleted = project.status === "completed";

  return (
    <div className="border border-gray-200 rounded-[24px] overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Detalhes do Projeto */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-900 text-xl">{project.title}</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
              isAwaiting ? 'bg-gray-50 text-gray-400 border border-gray-200' :
              isCompleted ? 'bg-gray-100 text-gray-400' :
              'bg-gray-100 text-gray-600'
            }`}>
              {project.status}
            </span>
          </div>
          {project.status === "active" && (
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Cpu size={14} /> Request Equipment
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-4 pr-12">{project.desc}</p>
        
        <div className="flex gap-2">
          <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">{project.course}</span>
          <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">{project.group}</span>
        </div>
      </div>

      {/* Secção de Equipamentos (Só mostra se houver equipamentos) */}
      {project.equipment.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 pt-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Equipment Requests</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {project.equipment.map((eq: any, idx: number) => (
              <EquipmentRow key={idx} name={eq.name} status={eq.status} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EquipmentRow({ name, status }: { name: string, status: string }) {
  const isPending = status === "Pending";
  const isReturned = status === "Returned";

  return (
    <div className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="text-gray-400"><Cpu size={18} /></div>
        <div className="text-sm font-bold text-gray-800">{name}</div>
      </div>
      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
        isPending ? 'bg-white border border-gray-200 text-gray-400 shadow-sm' :
        isReturned ? 'bg-gray-100 text-gray-400' :
        'bg-gray-100 text-gray-600'
      }`}>
        {status}
      </span>
    </div>
  );
}

function NotificationItem({ icon, text, date, unread }: any) {
  return (
    <div className={`p-4 flex gap-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${unread ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="text-gray-400 mt-1 shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-700 leading-snug mb-2">{text}</p>
        <span className="text-xs text-gray-400 font-medium">{date}</span>
      </div>
      {unread && <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 shrink-0"></div>}
    </div>
  );
}