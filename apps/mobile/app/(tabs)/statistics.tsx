import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  FolderOpen,
  Cpu,
  Users,
  TrendingUp,
  CheckCircle2,
  BarChart2,
} from "lucide-react-native";
import {
  projects as projectsApi,
  equipment as equipmentApi,
  users as usersApi,
  requisitions as requisitionsApi,
  type Project,
  type EquipmentCatalogItem,
  type User,
  type Requisition,
} from "../../lib/api";
import Header from "../../components/Header";

const { width } = Dimensions.get("window");

function StatCard({ label, value, sub, icon, color, iconBg }: any) {
  return (
    <View className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm mb-4 w-full">
      <View className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </View>
      <Text className="text-4xl font-black text-gray-900 mb-1">{value}</Text>
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</Text>
      {sub && <Text className="text-[10px] text-gray-400 mt-2 font-semibold">{sub}</Text>}
    </View>
  );
}

function CustomBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View className="flex-row items-center gap-3 mb-3">
      <Text className="w-24 text-xs font-bold text-gray-600 uppercase" numberOfLines={1}>{label}</Text>
      <View className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <View className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </View>
      <Text className="w-6 text-xs font-black text-gray-400 text-right">{value}</Text>
    </View>
  );
}

export default function StatisticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [equipment, setEquipment] = useState<EquipmentCatalogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [p, e, u, r] = await Promise.allSettled([
        projectsApi.list(),
        equipmentApi.catalog(),
        usersApi.list(),
        requisitionsApi.list(),
      ]);

      if (p.status === "fulfilled") setProjects(p.value);
      if (e.status === "fulfilled") setEquipment(e.value);
      if (u.status === "fulfilled") setUsers(u.value);
      if (r.status === "fulfilled") setRequisitions(r.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const availableEquipment = equipment.filter((e) => e.available).length;
  const checkedOut = equipment.filter((e) => !e.available).length;
  const students = users.filter((u) => u.role === "student").length;
  const pendingReqs = requisitions.filter((r) => r.status === "pending").length;

  const courseCounts: Record<string, number> = {};
  projects.forEach((p) => { if (p.course) courseCounts[p.course] = (courseCounts[p.course] ?? 0) + 1; });
  const topCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCourse = topCourses[0]?.[1] ?? 1;

  const now = new Date();
  const months = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    return { 
        label: d.toLocaleDateString("pt-PT", { month: "short" }).toUpperCase().replace('.', ''), 
        year: d.getFullYear(), 
        month: d.getMonth() 
    };
  });
  
  const projectsPerMonth = months.map(({ label, year, month }) => {
    const count = projects.filter((p) => {
      const d = new Date(p.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    return { label, count };
  });
  const maxMonth = Math.max(...projectsPerMonth.map((m) => m.count), 1);

  if (loading) {
    return (
      <View className="flex-1 bg-[#f4f5f7] items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Stats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f4f5f7]">
      <Header />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        <View className="mb-8">
          <Text className="text-3xl font-black text-gray-900 tracking-tight">Estatísticas</Text>
          <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider">Laboratório de Eletrónica</Text>
        </View>

        <StatCard 
          label="Total Projetos" value={projects.length} 
          sub={`${activeProjects} projetos ativos no momento`} 
          icon={<FolderOpen size={24} color="#2563eb" />} iconBg="bg-blue-100" 
        />
        <StatCard 
          label="Equipamento" value={equipment.length} 
          sub={`${availableEquipment} itens disponíveis para reserva`} 
          icon={<Cpu size={24} color="#0d9488" />} iconBg="bg-teal-100" 
        />
        <StatCard 
          label="Membros" value={users.length} 
          sub={`${students} alunos registados no sistema`} 
          icon={<Users size={24} color="#9333ea" />} iconBg="bg-purple-100" 
        />
        <StatCard 
          label="Requisições" value={requisitions.length} 
          sub={`${pendingReqs} pedidos aguardam aprovação`} 
          icon={<TrendingUp size={24} color="#d97706" />} iconBg="bg-amber-100" 
        />

        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="p-2 bg-gray-50 rounded-lg"><FolderOpen size={18} color="#6b7280" /></View>
            <Text className="font-black text-gray-800 uppercase text-sm tracking-widest">Status de Projetos</Text>
          </View>
          <CustomBar label="Ativos" value={activeProjects} max={projects.length} color="bg-green-500" />
          <CustomBar label="Pendentes" value={projects.filter(p=>p.status==='pending').length} max={projects.length} color="bg-yellow-500" />
          <CustomBar label="Concluídos" value={projects.filter(p=>p.status==='completed').length} max={projects.length} color="bg-blue-500" />
          <CustomBar label="Rejeitados" value={projects.filter(p=>p.status==='rejected').length} max={projects.length} color="bg-red-500" />
        </View>

        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
            <View className="flex-row items-center gap-3 mb-6">
                <View className="p-2 bg-gray-50 rounded-lg"><Cpu size={18} color="#6b7280" /></View>
                <Text className="font-black text-gray-800 uppercase text-sm tracking-widest">Uso de Equipamento</Text>
            </View>
            <View className="mb-6">
                <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-gray-500 font-bold text-xs">TAXA DE OCUPAÇÃO</Text>
                    <Text className="text-2xl font-black text-gray-900">
                        {equipment.length > 0 ? Math.round((checkedOut / equipment.length) * 100) : 0}%
                    </Text>
                </View>
                <View className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                    <View 
                        className="h-full bg-teal-500 rounded-full" 
                        style={{ width: `${equipment.length > 0 ? (checkedOut / equipment.length) * 100 : 0}%` }} 
                    />
                </View>
            </View>
            <CustomBar label="Em Uso" value={checkedOut} max={equipment.length} color="bg-orange-500" />
            <CustomBar label="Disponível" value={availableEquipment} max={equipment.length} color="bg-teal-500" />
        </View>

        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-3 mb-8">
            <View className="p-2 bg-gray-50 rounded-lg"><BarChart2 size={18} color="#6b7280" /></View>
            <Text className="font-black text-gray-800 uppercase text-sm tracking-widest">Novos Projetos</Text>
          </View>
          <View className="flex-row items-end justify-between h-40 px-2">
            {projectsPerMonth.map((m, i) => (
              <View key={i} className="items-center flex-1">
                <View 
                  className="w-8 bg-blue-500 rounded-t-lg" 
                  style={{ height: m.count > 0 ? (m.count / maxMonth) * 100 : 4 }} 
                />
                <Text className="text-[10px] font-black text-gray-400 mt-2">{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="p-2 bg-gray-50 rounded-lg"><TrendingUp size={18} color="#6b7280" /></View>
            <Text className="font-black text-gray-800 uppercase text-sm tracking-widest">Cursos Dominantes</Text>
          </View>
          {topCourses.map(([course, count]) => (
            <CustomBar key={course} label={course} value={count} max={maxCourse} color="bg-indigo-500" />
          ))}
        </View>

        <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
            <View className="flex-row items-center gap-3 mb-6">
                <View className="p-2 bg-gray-50 rounded-lg"><CheckCircle2 size={18} color="#6b7280" /></View>
                <Text className="font-black text-gray-800 uppercase text-sm tracking-widest">Fluxo de Material</Text>
            </View>
            <View className="flex-row flex-wrap justify-between">
                {[
                    { label: "Pendente", val: pendingReqs, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Em Uso", val: requisitions.filter(r=>r.status==='checked_out').length, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Entregue", val: requisitions.filter(r=>r.status==='returned').length, color: "text-green-600", bg: "bg-green-50" },
                ].map((item, idx) => (
                    <View key={idx} className={`${item.bg} rounded-2xl p-4 items-center mb-2`} style={{ width: '31%' }}>
                        <Text className={`text-xl font-black ${item.color}`}>{item.val}</Text>
                        <Text className="text-[8px] font-bold text-gray-500 uppercase">{item.label}</Text>
                    </View>
                ))}
            </View>
        </View>
      </ScrollView>
    </View>
  );
}