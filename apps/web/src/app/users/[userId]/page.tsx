import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, UserCircle, Folder, Cpu } from "lucide-react";

// 1. O ARRAY COMPLETO COM OS 9 UTILIZADORES E OS SEUS DADOS
const usersData = [
  { 
    id: "1", name: "André Silva", email: "andrecastrosilva@ua.pt", nmec: "123456", role: "student",
    projects: [{ title: "Solar Charger", status: "active" }],
    requests: [{ name: "Multimeter", project: "Solar Charger", date: "Req. 10 Mar 26", returnDate: "Return by 20-03-26", isReturned: false }]
  },
  { 
    id: "2", name: "Diogo Gomes", email: "dgomes@ua.pt", nmec: "P1234", role: "professor",
    projects: [{ title: "Lab Management System", status: "active" }],
    requests: [] 
  },
  { 
    id: "3", name: "Francisco Wang", email: "franciscowang@ua.pt", nmec: "124567", role: "student",
    projects: [
      { title: "Autonomous Rover v2", status: "active" },
      { title: "CubeSat Structural Testing", status: "completed" }
    ],
    requests: [
      { name: "Rigol DS1054Z Oscilloscope", project: "Autonomous Rover v2", date: "Req. 01 Feb 26", returnDate: "Return by 01-05-26", isReturned: false },
      { name: "Raspberry Pi 5 Cluster", project: "Autonomous Rover v2", date: "Req. 01 Feb 26", returnDate: "Return by 01-05-26", isReturned: false },
      { name: "Prusa i3 MK3S+ 3D Printer", project: "CubeSat Structural Testing", date: "Req. 05 Nov 25", returnDate: "Returned", isReturned: true },
      { name: "Fluke 87V Multimeter", project: "CubeSat Structural Testing", date: "Req. 05 Nov 25", returnDate: "Returned", isReturned: true }
    ]
  },
  { id: "4", name: "Frederico Coletta", email: "fredericocoletta@ua.pt", nmec: "128910", role: "student", projects: [], requests: [] },
  { id: "5", name: "Jakub Suliga", email: "jakub.suliga@ua.pt", nmec: "120394", role: "student", projects: [], requests: [] },
  { id: "6", name: "João Martins", email: "joaodiogomartins@ua.pt", nmec: "120284", role: "student", projects: [], requests: [] },
  { id: "7", name: "Laura Gabryjańczyk", email: "laura.gabryjanczyk@ua.pt", nmec: "121122", role: "student", projects: [], requests: [] },
  { id: "8", name: "Manuel Arez", email: "manuel.arez@ua.pt", nmec: "T9988", role: "tecnician", projects: [], requests: [] },
  { id: "9", name: "Manuel Mendonça", email: "manuel.mendonca@ua.pt", nmec: "123344", role: "student", projects: [], requests: [] },
];

export default async function UserDetails({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const user = usersData.find((u) => u.id === userId);

  if (!user) notFound();

  return (
    <main className="flex-1 bg-white p-8 min-h-screen text-gray-800">
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
        <Bell size={24} />
        <UserCircle size={28} />
      </div>

      <Link href="/users" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 mb-8 text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 flex flex-col items-center p-10 border border-gray-200 rounded-[32px] shadow-sm h-fit text-center bg-white">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-3xl mb-4">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <span className="px-4 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full mb-6">
            {user.role}
          </span>
          <p className="text-gray-400 text-sm mb-1">{user.email}</p>
          <p className="text-gray-300 text-sm font-medium">{user.nmec}</p>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section className="border border-gray-200 rounded-[32px] p-8 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Folder size={20} className="text-gray-400" /> Projects ({user.projects.length})
            </div>
            {user.projects.length > 0 ? (
              <div className="space-y-3">
                {user.projects.map((proj, i) => (
                  <ProjectRow key={i} title={proj.title} status={proj.status} />
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No active projects.</p>}
          </section>

          <section className="border border-gray-200 rounded-[32px] p-8 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg">
              <Cpu size={20} className="text-gray-400" /> Equipment Requests ({user.requests.length})
            </div>
            {user.requests.length > 0 ? (
              <div className="space-y-5">
                {user.requests.map((req, i) => (
                  <EquipmentRow key={i} {...req} />
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No equipment requested.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}

// Funções de Row (ProjectRow e EquipmentRow) mantêm-se iguais às anteriores...
function ProjectRow({ title, status }: { title: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[20px]">
      <div>
        <div className="font-bold text-gray-800">{title}</div>
        <div className="text-xs text-gray-400">Contributor</div>
      </div>
      <span className="px-4 py-1.5 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full shadow-sm">{status}</span>
    </div>
  );
}

function EquipmentRow({ name, project, date, returnDate, isReturned }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><Cpu size={20} /></div>
        <div>
          <div className="text-sm font-bold text-gray-800">{name}</div>
          <div className="text-xs text-gray-400 font-medium">{project}</div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="text-[11px] text-gray-300 font-bold">{date}</span>
        <span className={`px-5 py-1.5 text-[10px] font-bold uppercase rounded-xl transition-all ${isReturned ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 border border-gray-200 shadow-sm'}`}>
          {returnDate}
        </span>
      </div>
    </div>
  );
}