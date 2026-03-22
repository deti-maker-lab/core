import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Ícones nativos do Expo!

export default function Dashboard() {
  return (
    // ScrollView para podermos rolar a página para baixo
    <ScrollView className="flex-1 bg-gray-50 p-6">
      
      {/* Header */}
      <View className="flex-row justify-between items-center mt-10 mb-8">
        <View>
          <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
          <Text className="text-gray-500 mt-1">DETI Maker Lab</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm border border-gray-200">
            <Feather name="bell" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm border border-gray-200">
            <Feather name="user" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards (Lado a Lado) */}
      <View className="flex-row justify-between mb-8 gap-4">
        <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
          <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-3">
            <Feather name="folder" size={20} color="#3B82F6" />
          </View>
          <Text className="text-3xl font-bold text-gray-800">39</Text>
          <Text className="text-gray-500 text-xs mt-1 font-medium uppercase">Active Projects</Text>
        </View>
        
        <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
          <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center mb-3">
            <Feather name="cpu" size={20} color="#10B981" />
          </View>
          <Text className="text-3xl font-bold text-gray-800">1904</Text>
          <Text className="text-gray-500 text-xs mt-1 font-medium uppercase">Equipments</Text>
        </View>
      </View>

      {/* Quick Actions / Recent */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Recently Actioned</Text>
        
        {/* Cartão de Projeto 1 */}
        <TouchableOpacity className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-200 mb-4 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">Autonomous Rover v2</Text>
            <Text className="text-gray-400 text-sm">franciscowang@ua.pt</Text>
          </View>
          <View className="bg-gray-100 px-4 py-2 rounded-full">
            <Text className="text-gray-600 text-xs font-bold uppercase">Approved</Text>
          </View>
        </TouchableOpacity>

        {/* Cartão de Projeto 2 */}
        <TouchableOpacity className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-200 mb-4 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800 mb-1">Prosthetic Hand Project</Text>
            <Text className="text-gray-400 text-sm">fredericocoletta@ua.pt</Text>
          </View>
          <View className="bg-gray-100 px-4 py-2 rounded-full">
            <Text className="text-gray-600 text-xs font-bold uppercase">Approved</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}