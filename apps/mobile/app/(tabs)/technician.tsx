import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TechnicianPortalPage() {
  return (
    <ScrollView className="flex-1 bg-white p-8">
      
      {/* Cabeçalho */}
      <View className="mb-10 flex-row justify-between items-start">
        <View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Technician Portal</Text>
          <Text className="text-gray-500 text-lg">Manage lab inventory and review project proposals</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity><Feather name="bell" size={24} color="#4B5563" /></TouchableOpacity>
          <TouchableOpacity><Feather name="user" size={24} color="#4B5563" /></TouchableOpacity>
        </View>
      </View>

      {/* SECÇÃO 1: Pending Project Proposals */}
      <View className="mb-10">
        <View className="flex-row items-center gap-3 mb-4">
          <Feather name="folder" size={24} color="#374151" />
          <Text className="text-xl font-bold text-gray-800">Pending Project Proposals</Text>
          <View className="bg-gray-500 rounded-full w-7 h-7 items-center justify-center ml-2">
            <Text className="text-white font-bold text-sm">1</Text>
          </View>
        </View>

        {/* Cartão de Projeto Pendente */}
        <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-xl font-bold text-gray-900">Solar-Powered Weather Station</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
                <Feather name="x-circle" size={18} color="#4B5563" />
                <Text className="text-gray-700 font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200">
                <Feather name="check-circle" size={18} color="#111827" />
                <Text className="text-gray-900 font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-gray-500 mb-4 leading-relaxed w-3/4">
            Building an autonomous outdoor weather station powered by solar panels, using ESP32 and LoRa for wireless data transmission to a central dashboard.
          </Text>

          <View className="flex-row items-center gap-6 mb-5">
            <View className="flex-row items-center gap-2">
              <Feather name="users" size={18} color="#6B7280" />
              <Text className="text-gray-500 font-medium">3 members</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="cpu" size={18} color="#6B7280" />
              <Text className="text-gray-500 font-medium">3 equipment requested</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="clock" size={18} color="#6B7280" />
              <Text className="text-gray-500 font-medium">by franciscowang@ua.pt</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="bg-gray-100 px-3 py-1.5 rounded-md"><Text className="text-xs text-gray-700">Fluke 87V Multimeter</Text></View>
            <View className="bg-gray-100 px-3 py-1.5 rounded-md"><Text className="text-xs text-gray-700">Siglent SDG2042X Signal Generator</Text></View>
            <View className="bg-gray-100 px-3 py-1.5 rounded-md"><Text className="text-xs text-gray-700">Dremel 4300 Rotary Tool</Text></View>
          </View>
        </View>
      </View>


      {/* SECÇÃO 2: Pending Equipment Requests */}
      <View className="mb-10">
        <View className="flex-row items-center gap-3 mb-4">
          <Feather name="cpu" size={24} color="#374151" />
          <Text className="text-xl font-bold text-gray-800">Pending Equipment Requests</Text>
          <View className="bg-gray-500 rounded-full w-7 h-7 items-center justify-center ml-2">
            <Text className="text-white font-bold text-sm">2</Text>
          </View>
        </View>

        <View className="gap-4">
          {/* Equipamento 1 */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-1">Universal Robots UR5e</Text>
              <Text className="text-gray-500 text-sm mb-1">Project: Autonomous Rover v2 · By franciscowang@ua.pt</Text>
              <Text className="text-gray-400 text-sm">Return by: 01-06-2026</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
                <Feather name="x-circle" size={18} color="#4B5563" />
                <Text className="text-gray-700 font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200">
                <Feather name="check-circle" size={18} color="#111827" />
                <Text className="text-gray-900 font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Equipamento 2 */}
          <View className="bg-white border border-gray-200 rounded-2xl p-5 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-lg font-bold text-gray-900 mb-1">Raspberry Pi 5 Cluster</Text>
              <Text className="text-gray-500 text-sm mb-1">Project: Autonomous Rover v2 · By franciscowang@ua.pt</Text>
              <Text className="text-gray-400 text-sm">Return by: 01-06-2026</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50">
                <Feather name="x-circle" size={18} color="#4B5563" />
                <Text className="text-gray-700 font-bold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200">
                <Feather name="check-circle" size={18} color="#111827" />
                <Text className="text-gray-900 font-bold">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>


      {/* SECÇÃO 3: Recently Actioned */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Recently Actioned</Text>
        
        <View className="gap-3">
          {[
            { title: 'Autonomous Rover v2', author: 'franciscowang@ua.pt' },
            { title: 'Prosthetic Hand Project', author: 'fredericocoletta@ua.pt' },
            { title: 'CubeSat Structural Testing', author: 'fredericocoletta@ua.pt' },
          ].map((item, index) => (
            <View key={index} className="bg-white border border-gray-200 rounded-2xl p-5 flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-gray-900 mb-1">{item.title}</Text>
                <Text className="text-gray-500 text-sm">{item.author}</Text>
              </View>
              <View className="bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                <Text className="text-gray-600 font-bold text-xs uppercase">Approved</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}