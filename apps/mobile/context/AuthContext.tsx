import React, { createContext, useState, useContext } from 'react';

const INITIAL_PROJECTS = [
  { id: '1', title: 'Solar-Powered Weather Station', course: 'PECI', group: 'Group 7', desc: 'Building an autonomous outdoor weather station powered by solar panels.', members: 3, equip: 3, status: 'active', isMine: true, team: ['andrecastrosilva@ua.pt'] },
  { id: '2', title: 'AI Drone Navigation', course: 'MIECT', group: 'Group 1', desc: 'Drone navigation system using AI and computer vision.', members: 2, equip: 0, status: 'pending', isMine: false, team: [] }
];

const INITIAL_INVENTORY = [
  { id: 'e1', name: 'Raspberry Pi 4 Model B', ref: 'QR-012', category: 'Computing', price: '45€', status: 'available' },
  { id: 'e2', name: 'Soldering Iron TS100', ref: 'QR-045', category: 'Tools', price: '65€', status: 'available' },
  { id: 'e3', name: 'Arduino Mega 2560', ref: 'QR-088', category: 'Electronics', price: '35€', status: 'available' },
  { id: 'e4', name: 'Fluke 87V Multimeter', ref: 'QR-102', category: 'Measurement', price: '430€', status: 'available' },
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', equipId: 'e1', name: 'Raspberry Pi 4 Model B', projectId: '2', project: 'AI Drone Navigation', student: 'Francisco Wang', status: 'checked out', date: 'Yesterday' },
  { id: 't2', equipId: 'e2', name: 'Soldering Iron TS100', projectId: '1', project: 'Solar-Powered Weather Station', student: 'Frederico Coletta', status: 'checked out', date: '2 days ago' }
];

const INITIAL_LEDGER = [
  { id: 'L100', equip: 'Arduino Mega 2560', student: 'João Sousa', project: 'Smart Greenhouse Monitor', action: 'Returned', date: '20 Mar 2026, 16:30' },
];

// O NOSSO NOVO SISTEMA DE NOTIFICAÇÕES GLOBAIS
const INITIAL_NOTIFICATIONS = [
  { id: 'n1', student: 'André Silva', title: 'Welcome to Maker Lab!', message: 'Your account is ready. Start by creating a project or requesting equipment.', read: false, date: 'Just now' }
];

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'student' | 'tech' | null>(null);
  const currentUserName = role === 'student' ? 'André Silva' : 'System Admin';
  
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  
  // ESTADO DAS NOTIFICAÇÕES AQUI
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const login = (selectedRole: 'student' | 'tech') => setRole(selectedRole);
  const logout = () => setRole(null);

  return (
    <AuthContext.Provider value={{ 
      role, currentUserName, login, logout, 
      projects, setProjects, 
      inventory, setInventory, 
      transactions, setTransactions,
      ledger, setLedger,
      notifications, setNotifications // <-- EXPORTADO AQUI
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);