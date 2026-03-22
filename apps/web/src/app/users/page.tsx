"use client";

import { useState } from "react";
import { Search, Bell, UserCircle } from "lucide-react";
import Link from "next/link";

// Dados mockados para popular a lista
const users = [
  { id: "1", name: "André Silva", email: "andrecastrosilva@ua.pt", nmec: "123456", role: "student" },
  { id: "2", name: "Diogo Gomes", email: "dgomes@ua.pt", nmec: "P1234", role: "professor" },
  { id: "3", name: "Francisco Wang", email: "franciscowang@ua.pt", nmec: "124567", role: "student" },
  { id: "4", name: "Frederico Coletta", email: "fredericocoletta@ua.pt", nmec: "128910", role: "student" },
  { id: "5", name: "Jakub Suliga", email: "jakub.suliga@ua.pt", nmec: "120394", role: "student" },
  { id: "6", name: "João Martins", email: "joaodiogomartins@ua.pt", nmec: "120284", role: "student" },
  { id: "7", name: "Laura Gabryjańczyk", email: "laura.gabryjanczyk@ua.pt", nmec: "121122", role: "student" },
  { id: "8", name: "Manuel Arez", email: "manuel.arez@ua.pt", nmec: "T9988", role: "tecnician" },
  { id: "9", name: "Manuel Mendonça", email: "manuel.mendonca@ua.pt", nmec: "123344", role: "student" },
];

const filterOptions = ["All", "Students", "Professors", "Tecnician"];

export default function UsersPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Lógica combinada de Filtro + Pesquisa
  const filteredUsers = users.filter((user) => {
    const matchesFilter = 
      activeFilter === "All" || 
      (activeFilter === "Students" && user.role === "student") ||
      (activeFilter === "Professors" && user.role === "professor") ||
      (activeFilter === "Tecnician" && user.role === "tecnician");

    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nmec.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="flex-1 p-8 bg-white min-h-screen font-sans text-gray-800">
      
      {/* Top Header */}
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
        <Bell size={24} className="cursor-pointer hover:text-gray-600 transition-colors" />
        <UserCircle size={28} className="cursor-pointer hover:text-gray-600 transition-colors" />
      </div>

      {/* Header Titles */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Users</h1>
        <p className="text-gray-400 font-medium">{users.length} lab participants</p>
      </div>

      {/* Search Bar and Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        
        {/* Search Input */}
        <div className="flex items-center border border-gray-200 rounded-full px-5 py-2.5 w-full max-w-md shadow-sm focus-within:border-gray-300 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            className="ml-3 outline-none w-full text-sm bg-transparent placeholder:text-gray-300"
            placeholder="search by name, email or nmec..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-5 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeFilter === option
                  ? "bg-white border border-gray-300 text-gray-900 shadow-sm font-semibold"
                  : "text-gray-400 hover:text-gray-600 font-medium"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Link 
            key={user.id} 
            href={`/users/${user.id}`}
            className="group border border-gray-200 rounded-3xl p-6 flex items-start gap-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer bg-white"
          >
            {/* Avatar Circle */}
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-gray-400 font-bold text-xl group-hover:bg-gray-200 transition-colors">
              {user.name.charAt(0)}
            </div>

            {/* User Metadata */}
            <div className="flex flex-col gap-1 overflow-hidden">
              <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                {user.name}
              </h3>
              <p className="text-sm text-gray-400 truncate font-medium">
                {user.email}
              </p>
              <p className="text-sm text-gray-300 font-bold mb-3 tracking-wide">
                {user.nmec}
              </p>
              
              <div>
                <span className="inline-block px-3 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full">
                  {user.role}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State UI */}
      {filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Search size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-medium">No lab participants found matching your criteria.</p>
          <button 
            onClick={() => {setSearchQuery(""); setActiveFilter("All");}}
            className="mt-4 text-sm font-bold text-gray-900 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </main>
  );
}