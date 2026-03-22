import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router'; // <-- Importado aqui!

const EQUIPMENT = [
  { id: '1', name: 'Prusa i3 MK3S+ 3D Printer', category: '3D Printing', price: '999€', status: 'available' },
  { id: '2', name: 'Rigol DS1054Z Oscilloscope', category: 'Electronics', price: '399€', status: 'checked out' },
  { id: '3', name: 'Epilog Zing 24 Laser Cutter', category: 'Laser Cutting', price: '12 000€', status: 'available' },
  { id: '4', name: 'Fluke 87V Multimeter', category: 'Electronics', price: '430€', status: 'available' },
  { id: '5', name: 'NVIDIA Jetson AGX Orin', category: 'Computing', price: '899€', status: 'checked out' },
  { id: '6', name: 'Universal Robots UR5e', category: 'Robotics', price: '999€', status: 'maintenance' },
];

export default function EquipmentPage() {
  const router = useRouter(); // <-- Inicializado aqui!
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredEquipment = EQUIPMENT.filter((item) => {
    const matchesFilter = activeFilter === 'All' || item.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <ScrollView className="flex-1 bg-white p-8">
      
      {/* Cabeçalho */}
      <View className="mb-8 flex-row justify-between items-start">
        <View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Equipment</Text>
          <Text className="text-gray-500 text-lg">1904 items in inventory</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity><Feather name="bell" size={24} color="#4B5563" /></TouchableOpacity>
          <TouchableOpacity><Feather name="user" size={24} color="#4B5563" /></TouchableOpacity>
        </View>
      </View>

      {/* Barra de Pesquisa e Filtros */}
      <View className="flex-row items-center gap-4 mb-8">
        <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-3 text-base"
            placeholder="search by name or supplier..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <View className="flex-row border border-gray-300 rounded-full p-1 bg-gray-50">
          {['All', 'Available', 'Checked Out', 'Maintenance'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full ${activeFilter === filter ? 'bg-white shadow-sm border border-gray-200' : ''}`}
            >
              <Text className={`${activeFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Equipamentos */}
      <View className="gap-3">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => router.push(`/item/${item.id}` as any)}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center hover:bg-gray-50 transition-colors"
            >
              
              <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
                <Feather name="image" size={20} color="#9CA3AF" />
              </View>

              <View className="flex-1 flex-row items-center gap-3">
                <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                <View className="bg-gray-100 px-2 py-1 rounded-md">
                  <Text className="text-xs text-gray-600 font-medium">{item.category}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-6">
                <Text className="text-gray-900 font-bold">{item.price}</Text>
                
                <View className={`px-3 py-1 rounded-full w-28 items-center ${
                  item.status === 'available' ? 'bg-gray-100' : 
                  item.status === 'checked out' ? 'bg-gray-50 border border-gray-200' : 
                  'bg-red-50 border border-red-100'
                }`}>
                  <Text className={`text-xs font-bold uppercase ${
                    item.status === 'maintenance' ? 'text-red-500' : 'text-gray-600'
                  }`}>{item.status}</Text>
                </View>

                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </View>

            </TouchableOpacity>
          ))
        ) : (
          <View className="py-10 items-center justify-center">
            <Feather name="inbox" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 font-medium">No equipment found matching your criteria.</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}