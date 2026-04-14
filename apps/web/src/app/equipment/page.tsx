// apps/web/src/app/equipment/page.tsx

"use client"; // Adicionamos isto para podermos usar estados (interatividade)

import { useState } from "react";
import { Search, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";

const equipment = [
  {
    id: "0",
    name: "Prusa i3 MK3S+ 3D Printer",
    category: "3D Printing",
    price: "999€",
    status: "available",
  },
  {
    id: "1",
    name: "Rigol DS1054Z Oscilloscope",
    category: "Electronics",
    price: "399€",
    status: "checked out",
  },
  {
    id: "2",
    name: "Epilog Zing 24 Laser Cutter",
    category: "Laser Cutting",
    price: "12000€",
    status: "available",
  },
  {
    id: "3",
    name: "Fluke 87V Multimeter",
    category: "Electronics",
    price: "430€",
    status: "available",
  },
  {
    id: "4",
    name: "NVIDIA Jetson AGX Orin",
    category: "Computing",
    price: "899€",
    status: "checked out",
  },
  {
    id: "5",
    name: "Universal Robots UR5e",
    category: "Robotics",
    price: "999€",
    status: "maintenance",
  },
];

// Array com as opções de filtro para facilitar a criação dos botões
const filterOptions = ["All", "Available", "Checked Out", "Maintenance"];

export default function EquipmentPage() {
  // Estado para guardar qual é o filtro selecionado atualmente
  const [activeFilter, setActiveFilter] = useState("All");

  // Filtramos a lista de equipamentos com base no botão selecionado
  const filteredEquipment = equipment.filter((item) => {
    if (activeFilter === "All") return true;
    
    // Comparamos em minúsculas para garantir que "Available" bate certo com "available"
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <main className="flex-1 p-8 bg-white min-h-screen font-sans text-gray-800">

      {/* Header */}
      <Header />

      {/* Title */}
      <h1 className="text-3xl font-bold mb-1">Equipment</h1>
      <p className="text-gray-400 mb-6">{equipment.length} items in inventory</p>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 mb-8">
        
        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 w-96">
          <Search size={18} className="text-gray-400" />
          <input
            className="ml-2 outline-none w-full"
            placeholder="search by name or supplier..."
          />
        </div>

        {/* Geramos os botões de filtro dinamicamente */}
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setActiveFilter(option)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              activeFilter === option
                ? "bg-gray-100 font-medium text-gray-900 border border-gray-200" // Estilo quando está ativo
                : "text-gray-500 hover:bg-gray-50 border border-transparent"      // Estilo quando está inativo
            }`}
          >
            {option}
          </button>
        ))}

      </div>

      {/* Equipment list */}
      <div className="flex flex-col gap-4">

        {/* Agora fazemos map no filteredEquipment em vez do equipment original */}
        {filteredEquipment.map((item) => (
          
          <Link
            key={item.id}
            href={`/equipment/${item.id}`}
            className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >

            {/* Left side */}
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                <ImageIcon className="text-gray-300" />
              </div>

              <div>
                <div className="font-semibold">{item.name}</div>

                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                  {item.category}
                </span>
              </div>

            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">

              <span className="font-medium">{item.price}</span>

              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                {item.status}
              </span>

            </div>

          </Link>
        ))}

        {/* Mensagem caso o filtro não encontre nada */}
        {filteredEquipment.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No equipment found with status "{activeFilter}".
          </div>
        )}

      </div>

    </main>
  );
}