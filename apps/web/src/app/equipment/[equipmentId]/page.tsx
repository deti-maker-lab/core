// src/app/equipment/[equipmentId]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, UserCircle, Image as ImageIcon, History, DollarSign, Hash, MapPin, CheckCircle2 } from "lucide-react";

// Mantive o teu array original
const equipment = [
  {
    id: "0",
    name: "Prusa i3 MK3S+ 3D Printer",
    price: "999€",
    category: "3D Printing",
    status: "available", // Adicionei status aos primeiros para não dar erro visual
  },
  {
    id: "1",
    name: "Rigol DS1054Z Oscilloscope",
    price: "399€",
    category: "Electronics",
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

export default async function EquipmentDetails({
  params,
}: {
  params: Promise<{ equipmentId: string }>;
}) {
  const { equipmentId } = await params;
  const item = equipment.find((e) => e.id === equipmentId);

  if (!item) {
    notFound();
  }

  // A partir daqui é a estrutura baseada no teu desenho (image_6.png)
  return (
    <main className="flex-1 bg-white p-8 min-h-screen font-sans text-gray-800">
      {/* Header com Notificações */}
      <div className="flex justify-end items-center gap-4 mb-6 text-gray-400">
        <Bell size={24} />
        <UserCircle size={28} />
      </div>

      {/* Botão Back */}
      <Link href="/equipment" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-8 text-sm font-medium">
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lado Esquerdo: Info Principal e Detalhes */}
        <div className="flex flex-col gap-6">
          {/* Card Principal do Produto */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100">
              <ImageIcon size={80} className="text-gray-200" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                    {item.category}
                  </span>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full whitespace-nowrap">
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card de Detalhes */}
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Details</h2>
            <div className="space-y-4">
              <DetailRow icon={<DollarSign size={20}/>} label="Price" value={item.price} />
              <DetailRow icon={<Hash size={20}/>} label="Reference" value={`REF-${item.id.padStart(3, '0')}`} />
              <DetailRow icon={<MapPin size={20}/>} label="Location" value="Main Lab" />
              <DetailRow icon={<CheckCircle2 size={20}/>} label="Condition" value="Good" />
            </div>
          </div>
        </div>

        {/* Lado Direito: Projetos e Histórico (Dados Estáticos Fictícios) */}
        <div className="flex flex-col gap-6">
          {/* Projects with this equipment */}
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Projects With This Equipment (2)</h2>
            <div className="space-y-3">
              <ProjectItem title="Autonomous Rover v2" status="active" />
              <ProjectItem title="CubeSat Structural Testing" status="completed" />
            </div>
          </div>

          {/* Full History */}
          <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} />
              <h2 className="text-lg font-bold">Full History (3)</h2>
            </div>
            <div className="space-y-4">
              <HistoryRow type="checkout" user="Frederico Coletta" project="Autonomous Rover v2" date="12 Mar 2026, 19:04" />
              <HistoryRow type="return" user="Francisco Wang" project="CubeSat Structural Testing" date="28 Feb 2026, 14:48" />
              <HistoryRow type="checkout" user="Francisco Wang" project="CubeSat Structural Testing" date="03 Feb 2026, 12:01" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

// Sub-componentes
function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-gray-500">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
}

function ProjectItem({ title, status }: { title: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <span className="font-semibold text-gray-700">{title}</span>
      <span className="px-3 py-1 border border-gray-200 text-gray-400 text-[10px] font-bold uppercase rounded-full">{status}</span>
    </div>
  );
}

function HistoryRow({ type, user, project, date }: { type: 'checkout' | 'return', user: string, project: string, date: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <span className="w-16 text-center px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-md">{type}</span>
        <div>
          <div className="text-sm font-bold text-gray-800">{user}</div>
          <div className="text-xs text-gray-400">{project}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 font-medium">{date}</div>
    </div>
  );
}