"use client";

import { useState } from "react";
import { 
  Bell, UserCircle, Folder, Cpu, 
  X, Check, Users, Clock
} from "lucide-react";

export default function TechnicianPortal() {
  // Estado para controlar o modal de rejeição
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState("");

  // Funções para abrir e fechar o modal
  const handleRejectClick = (itemName: string) => {
    setItemToReject(itemName);
    setIsRejectModalOpen(true);
  };

  const closeModal = () => {
    setIsRejectModalOpen(false);
    setItemToReject("");
  };

  return (
    <main className="flex-1 bg-gray-50 p-8 min-h-screen font-sans text-gray-800 relative">
      {/* Top Header */}
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
        <Bell size={24} className="cursor-pointer hover:text-gray-600 transition-colors" />
        <UserCircle size={28} className="cursor-pointer hover:text-gray-600 transition-colors" />
      </div>

      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Technician Portal</h1>
        <p className="text-gray-500 font-medium">Manage lab inventory and review project proposals</p>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* --- Pending Project Proposals --- */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Folder size={24} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Pending Project Proposals</h2>
            <span className="bg-gray-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">1</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Solar-Powered Weather Station</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleRejectClick("Solar-Powered Weather Station")}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={16} /> Reject
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-4xl">
              Building an autonomous outdoor weather station powered by solar panels, using ESP32 and LoRa for wireless data transmission to a central dashboard.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium mb-4">
              <div className="flex items-center gap-2"><Users size={18}/> 3 members</div>
              <div className="flex items-center gap-2"><Cpu size={18}/> 3 equipment requested</div>
              <div className="flex items-center gap-2"><Clock size={18}/> by franciscowang@ua.pt</div>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Fluke 87V Multimeter</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Siglent SDG2042X Signal Generator</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Dremel 4300 Rotary Tool</span>
            </div>
          </div>
        </section>


        {/* --- Pending Equipment Requests --- */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={24} className="text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Pending Equipment Requests</h2>
            <span className="bg-gray-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">2</span>
          </div>

          <div className="flex flex-col gap-4">
            <EquipmentRequestCard 
              name="Universal Robots UR5e" 
              project="Autonomous Rover v2" 
              user="franciscowang@ua.pt" 
              returnDate="01-06-2026"
              onReject={() => handleRejectClick("Universal Robots UR5e")}
            />
            <EquipmentRequestCard 
              name="Raspberry Pi 5 Cluster" 
              project="Autonomous Rover v2" 
              user="franciscowang@ua.pt" 
              returnDate="01-06-2026"
              onReject={() => handleRejectClick("Raspberry Pi 5 Cluster")}
            />
          </div>
        </section>

        {/* --- Recently Actioned --- */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recently Actioned</h2>
          <div className="flex flex-col gap-4">
            <ActionedCard title="Autonomous Rover v2" user="franciscowang@ua.pt" status="Approved" />
            <ActionedCard title="Prosthetic Hand Project" user="fredericocoletta@ua.pt" status="Approved" />
            <ActionedCard title="CubeSat Structural Testing" user="fredericocoletta@ua.pt" status="Approved" />
          </div>
        </section>

      </div>

      {/* --- Reject Modal Overlay --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-[24px] p-8 shadow-xl">
            
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Reject Project Proposal</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-500 mb-6">
              Rejecting: <span className="font-semibold text-gray-700">{itemToReject}</span>
            </p>

            <div className="mb-6">
              <label className="block text-gray-800 font-bold mb-2">Reason for rejection</label>
              <textarea 
                className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Explain why this proposal is being rejected..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={closeModal} // Numa app real, isto enviaria os dados
                className="px-6 py-3 bg-gray-400 text-white font-bold rounded-xl hover:bg-gray-500 transition-colors shadow-sm"
              >
                Reject & Notify
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}

// Sub-componentes para manter o código principal limpo
function EquipmentRequestCard({ name, project, user, returnDate, onReject }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{name}</h3>
        <p className="text-gray-500 text-sm mt-1">
          Project: {project} · By {user}
        </p>
        <p className="text-gray-400 text-sm mt-1">Return by: {returnDate}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onReject} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <X size={16} /> Reject
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Check size={16} /> Approve
        </button>
      </div>
    </div>
  );
}

function ActionedCard({ title, user, status }: { title: string, user: string, status: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
      <div>
        <h3 className="text-md font-bold text-gray-800">{title}</h3>
        <p className="text-gray-400 text-sm mt-0.5">{user}</p>
      </div>
      <span className="px-4 py-1.5 bg-gray-200 text-gray-600 text-[11px] font-bold uppercase rounded-xl">
        {status}
      </span>
    </div>
  );
}