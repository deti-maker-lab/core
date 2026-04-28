import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; // A vossa base de dados local!

export default function Home() {
  const { projects, inventory } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Cálculos dinâmicos baseados no vosso AuthContext
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;
  const availableEquipment = inventory.filter((e: any) => e.status === 'available').length;
  const checkedOut = projects.filter((p: any) => p.status === 'pending').length;
  const labMembers = 45; // Fixo temporariamente (o mock não tem lista de users)

  const recentProjects = [...projects].slice(0, 4);

  return (
    <ScrollView className="flex-1 bg-[#f4f5f7] p-5">
      
      {/* Hero Section (Igual à Web) */}
      <View className="mb-6 mt-4 items-center">
        <Text className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
          DETI Maker Lab
        </Text>
        <Text className="text-4xl font-extrabold text-indigo-600 text-center tracking-tight mb-2">
          App
        </Text>
        <Text className="text-base text-gray-500 font-medium text-center">
          Your space for innovation
        </Text>
      </View>

      {/* Barra de Pesquisa */}
      <View className="relative w-full mb-8">
        <View className="absolute left-4 top-4 z-10">
          <Feather name="search" size={20} color="#9ca3af" />
        </View>
        <TextInput
          className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white text-gray-900 font-medium text-base shadow-sm"
          placeholder="Search projects, equipments..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats Cards (Em grelha 2x2 para o telemóvel) */}
      <View className="flex-row flex-wrap justify-between mb-8">
        <StatCard icon="folder" iconColor="#3b82f6" iconBg="bg-blue-50" value={String(activeProjects)} label="Active Projects" />
        <StatCard icon="cpu" iconColor="#14b8a6" iconBg="bg-teal-50" value={String(availableEquipment)} label="Equipment" />
        <StatCard icon="users" iconColor="#a855f7" iconBg="bg-purple-50" value={String(labMembers)} label="Lab Members" />
        <StatCard icon="activity" iconColor="#eab308" iconBg="bg-yellow-50" value={String(checkedOut)} label="Checked Out" />
      </View>

      {/* Recent Projects */}
      <View className="mb-6">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[22px] font-bold text-gray-900">Recent Projects</Text>
          <TouchableOpacity>
            <Text className="text-indigo-600 font-medium text-sm">View All</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.length === 0 ? (
          <Text className="text-gray-400 text-center py-6">No projects found</Text>
        ) : (
          <View className="gap-4 mb-8">
            {recentProjects.map((proj: any) => (
              <ProjectCard 
                key={proj.id} 
                title={proj.title} 
                desc={proj.desc} 
                status={proj.status} 
                course={proj.course}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Sub-Componentes Exatamente com o mesmo design Tailwind da Web

function StatCard({ icon, iconColor, iconBg, value, label }: { icon: any; iconColor: string; iconBg: string; value: string; label: string; }) {
  return (
    <TouchableOpacity className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm w-[48%] mb-4 h-40 justify-between">
      <View className="flex-row justify-between items-start">
        <View className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <Feather name="arrow-up-right" size={20} color="#9ca3af" />
      </View>
      <View>
        <Text className="text-[32px] font-bold text-gray-900 leading-none mb-1">{value}</Text>
        <Text className="text-sm text-gray-500 font-medium">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ProjectCard({ title, desc, status, course }: { title: string; desc: string; status: string; course: string }) {
  return (
    <TouchableOpacity className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex-row h-[120px]">
      <View className="w-[100px] bg-blue-50 items-center justify-center border-r border-gray-50">
        <Feather name="folder" size={32} color="#93c5fd" />
      </View>
      <View className="p-4 flex-1 justify-between">
        <View>
          <Text className="font-bold text-gray-900 text-base mb-1" numberOfLines={1}>{title}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={2}>{desc}</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          {course && <Text className="text-xs text-gray-400 font-medium">{course}</Text>}
          {course && <View className="w-1 h-1 rounded-full bg-gray-300" />}
          <Text className="text-xs text-gray-400 font-medium capitalize">{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}