"use client";

import { useState } from "react";
import { Search, Bell, UserCircle, Users, Cpu, ChevronRight, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

const projectsData = [
  { id: 1, title: "Solar-Powered Weather Station", desc: "Building an autonomous outdoor weather station powered by solar panels, using ESP32 and LoRa for...", course: "PECI", group: "Group 7", members: 6, equip: 3, status: "active" },
  { id: 2, title: "Autonomous Rover v2", desc: "Building a self-navigating rover for the campus competition using SLAM and LiDAR", course: "PECI", group: "Group 3", members: 5, equip: 4, status: "active" },
  { id: 3, title: "Smart Greenhouse Monitor", desc: "IoT-based environmental monitoring system for the campus greenhouse using LoRa and custom PCBs", course: "PECI", group: "Group 4", members: 5, equip: 3, status: "active" },
  { id: 4, title: "Prosthetic Hand Project", desc: "3D-printed prosthetic hand with EMG sensor control for low-cost accessibility", course: "PECI", group: "Group 13", members: 6, equip: 11, status: "active" },
  { id: 5, title: "CubeSat Structural Testing", desc: "Vibration and thermal testing for the university's CubeSat mission payload", course: "PECI", group: "Group 7", members: 5, equip: 9, status: "completed" },
];

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projectsData.filter(proj => {
    const matchesFilter = activeFilter === "All" || proj.status === activeFilter.toLowerCase();
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      
      {/* Top Header */}
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
        <Bell size={24} className="cursor-pointer hover:text-gray-600 transition-colors" />
        <UserCircle size={28} className="cursor-pointer hover:text-gray-600 transition-colors" />
      </div>

      {/* Page Title & Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p className="text-gray-400 font-medium">All ongoing and past projects</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/projects/my-projects" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <BookOpen size={18} /> My Projects
          </Link>
          <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors shadow-sm">
            <Plus size={18} /> New Project
          </Link>
        </div>
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
      <div className="flex flex-col gap-4">
        {filteredProjects.map((proj) => (
          <div key={proj.id} className="border border-gray-200 rounded-[20px] p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group bg-white">
            
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{proj.title}</h3>
                <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">{proj.course}</span>
                <span className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded-full">{proj.group}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{proj.desc}</p>
            </div>

            <div className="flex items-center gap-8 pl-4">
              <div className="flex items-center gap-6 text-gray-500 font-bold text-sm">
                <div className="flex items-center gap-2"><Users size={18} /> {proj.members}</div>
                <div className="flex items-center gap-2"><Cpu size={18} /> {proj.equip}</div>
              </div>
              
              <span className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full w-24 text-center ${
                proj.status === 'active' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-400'
              }`}>
                {proj.status}
              </span>

              <ChevronRight size={24} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </div>

          </div>
        ))}
      </div>

    </main>
  );
}