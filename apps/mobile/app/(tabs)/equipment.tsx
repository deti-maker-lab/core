import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Função auxiliar para injetar imagens reais baseadas na categoria ou nome!
const getEquipImage = (name: string, category: string) => {
  const n = name.toLowerCase();
  if (n.includes('printer')) return 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?q=80&w=800&auto=format&fit=crop';
  if (n.includes('laser')) return 'https://images.unsplash.com/photo-1613143323049-5561332a4e21?q=80&w=800&auto=format&fit=crop';
  if (n.includes('oscilloscope') || n.includes('multimeter')) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop';
  if (n.includes('robot')) return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop';
  if (category.toLowerCase() === 'computing') return 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop';
};

// ==========================================
// MEMÓRIA GLOBAL DOS EQUIPAMENTOS (A TUA LÓGICA ORIGINAL)
// ==========================================
let GLOBAL_EQUIPMENT = [
  { id: '1', name: 'Prusa i3 MK3S+ 3D Printer', category: '3D Printing', price: '999€', status: 'available' },
  { id: '2', name: 'Rigol DS1054Z Oscilloscope', category: 'Electronics', price: '399€', status: 'checked out' },
  { id: '3', name: 'Epilog Zing 24 Laser Cutter', category: 'Laser Cutting', price: '12 000€', status: 'available' },
  { id: '4', name: 'Fluke 87V Multimeter', category: 'Electronics', price: '430€', status: 'available' },
  { id: '5', name: 'NVIDIA Jetson AGX Orin', category: 'Computing', price: '899€', status: 'checked out' },
  { id: '6', name: 'Universal Robots UR5e', category: 'Robotics', price: '999€', status: 'maintenance' },
];

export default function EquipmentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role } = useAuth(); 

  const [equipmentList, setEquipmentList] = useState(GLOBAL_EQUIPMENT);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // ESCUTAR QUANDO UM EQUIPAMENTO É APAGADO (A TUA LÓGICA ORIGINAL)
  useEffect(() => {
    if (params.deletedEquipId) {
      const updatedList = equipmentList.filter((item) => item.id !== params.deletedEquipId);
      setEquipmentList(updatedList);
      GLOBAL_EQUIPMENT = updatedList;
    }
  }, [params.deletedEquipId]);

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesFilter = activeFilter === 'All' || item.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddEquipment = () => {
    if (!newName) return;

    const newItem = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory || 'General',
      price: newPrice ? `${newPrice}€` : 'N/A',
      status: 'available' 
    };

    const updatedList = [newItem, ...equipmentList];
    setEquipmentList(updatedList);
    GLOBAL_EQUIPMENT = updatedList; 
    
    setIsModalOpen(false);
    setNewName(''); setNewCategory(''); setNewPrice('');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4 md:p-8">
        
        {/* CABEÇALHO */}
        <View className="mb-8 flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <View>
            <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Lab Equipment</Text>
            <Text className="text-gray-500 text-lg">Browse {equipmentList.length} items in inventory.</Text>
          </View>
          
          <View className="flex-row gap-4 items-center">
            {role === 'tech' && (
              <TouchableOpacity 
                onPress={() => setIsModalOpen(true)}
                className="flex-row items-center gap-2 px-6 py-3.5 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="font-bold text-white text-base">Add Equipment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* BARRA DE PESQUISA E FILTROS */}
        <View className="flex-row flex-wrap items-center gap-4 mb-8">
          <View className="flex-1 min-w-[250px] flex-row items-center bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search by name or category..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View className="flex-row border border-gray-200 rounded-2xl p-1.5 bg-white shadow-sm flex-wrap">
            {['All', 'Available', 'Checked Out', 'Maintenance'].map((filter) => (
              <TouchableOpacity 
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl transition-all ${activeFilter === filter ? 'bg-gray-100' : ''}`}
              >
                <Text className={`${activeFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GRELHA DE EQUIPAMENTOS (ESTILO ALTA FIDELIDADE) */}
        <View className="flex-row flex-wrap gap-5">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                // A TUA NAVEGAÇÃO ORIGINAL PARA ITEM/[ID]!
                onPress={() => router.push({
                  pathname: `/item/${item.id}` as any,
                  params: { 
                    name: item.name, 
                    category: item.category, 
                    price: item.price, 
                    status: item.status 
                  }
                })}
                className="w-full md:w-[48%] xl:w-[23%] min-w-[250px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-col"
              >
                {/* IMAGEM DO EQUIPAMENTO */}
                <View className="relative w-full h-44 bg-gray-200">
                  <Image source={{ uri: getEquipImage(item.name, item.category) }} className="w-full h-full" resizeMode="cover" />
                  
                  {/* Etiqueta de Preço */}
                  <View className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-700 shadow-sm">
                    <Text className="text-xs font-bold text-white">{item.price}</Text>
                  </View>
                </View>
                
                <View className="p-6 flex-1 flex-col justify-between">
                  <View>
                    <View className="self-start px-2 py-1 mb-3 rounded-md bg-blue-50 border border-blue-100">
                      <Text className="text-[10px] font-bold text-blue-700 uppercase">{item.category}</Text>
                    </View>

                    <Text className="text-xl font-bold text-gray-900 mb-1 leading-tight">{item.name}</Text>
                  </View>
                  
                  <View className="border-t border-gray-100 pt-4 mt-6 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <View className={`w-2.5 h-2.5 rounded-full ${
                        item.status === 'available' ? 'bg-green-500' : 
                        item.status === 'checked out' ? 'bg-gray-400' : 
                        'bg-red-500'
                      }`} />
                      <Text className={`text-sm font-bold capitalize ${
                        item.status === 'available' ? 'text-green-600' : 
                        item.status === 'checked out' ? 'text-gray-500' : 
                        'text-red-600'
                      }`}>{item.status}</Text>
                    </View>

                    <Feather name="arrow-right" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-full py-20 items-center justify-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="cpu" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No equipment found matching your criteria.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL NOVO EQUIPAMENTO (COM ESTÉTICA NOVA) */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            
            <View className="px-6 py-5 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="text-xl font-extrabold text-gray-900">Add New Equipment</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <Feather name="x" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="p-6 gap-5">
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Equipment Name *</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" 
                  placeholder="e.g. Soldering Iron TS100" 
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Category</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" 
                    placeholder="e.g. Electronics"
                    value={newCategory}
                    onChangeText={setNewCategory}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Price (€)</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" 
                    placeholder="e.g. 65"
                    keyboardType="numeric"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
              </View>
            </View>

            <View className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleAddEquipment} className="px-6 py-3 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                <Text className="font-bold text-white">Add Item</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}