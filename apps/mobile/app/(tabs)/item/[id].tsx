import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Importamos a identidade

export default function EquipmentDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role } = useAuth(); // 'tech' ou 'student'
  
  const equipId = params.id;

  // Lemos os dados que vieram do URL
  const name = params.name ? String(params.name) : 'Unknown Equipment';
  const category = params.category ? String(params.category) : 'General';
  const price = params.price ? String(params.price) : 'N/A';
  const status = params.status ? String(params.status).toLowerCase() : 'unknown';

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Função que manda a ordem para apagar
  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    router.replace({
      pathname: '/equipment',
      params: { deletedEquipId: equipId }
    } as any);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-8">
        
        <TouchableOpacity 
          onPress={() => router.push('/equipment' as any)} 
          className="flex-row items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 self-start mb-6 hover:bg-gray-50"
        >
          <Feather name="arrow-left" size={20} color="#374151" />
          <Text className="font-bold text-gray-700">Back</Text>
        </TouchableOpacity>

        <View className="flex-col md:flex-row gap-6">
          
          {/* COLUNA ESQUERDA (Dinâmica) */}
          <View className="w-full md:w-[40%]">
            
            <View className="bg-white border border-gray-200 rounded-2xl mb-6 overflow-hidden shadow-sm">
              <View className="w-full aspect-video bg-gray-100 items-center justify-center border-b border-gray-200">
                <Feather name="image" size={40} color="#D1D5DB" />
              </View>
              <View className="p-5">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">{name}</Text>
                  <View className={`px-3 py-1 rounded-full border ${
                    status === 'available' ? 'bg-green-50 border-green-200' : 
                    status === 'checked out' ? 'bg-gray-100 border-gray-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <Text className={`text-xs font-bold uppercase ${
                      status === 'available' ? 'text-green-700' :
                      status === 'maintenance' ? 'text-red-600' : 'text-gray-600'
                    }`}>{status}</Text>
                  </View>
                </View>
                <View className="bg-gray-100 self-start px-3 py-1 rounded-md">
                  <Text className="text-xs text-gray-600 font-medium">{category}</Text>
                </View>
              </View>
            </View>

            <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-6">Details</Text>
              
              <View className="gap-5">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Feather name="dollar-sign" size={20} color="#9CA3AF" />
                    <Text className="text-gray-500 font-medium">Price</Text>
                  </View>
                  <Text className="font-bold text-gray-900 text-lg">{price}</Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Feather name="hash" size={20} color="#9CA3AF" />
                    <Text className="text-gray-500 font-medium">Reference</Text>
                  </View>
                  <Text className="font-bold text-gray-900 text-lg">QR-{equipId.slice(-3)}</Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-3">
                    <Feather name="map-pin" size={20} color="#9CA3AF" />
                    <Text className="text-gray-500 font-medium">Location</Text>
                  </View>
                  <Text className="font-bold text-gray-900 text-lg">Storage A</Text>
                </View>
              </View>
              
              {/* BOTÃO REMOVE: Só para Técnicos e se não estiver checked out */}
              {role === 'tech' && status !== 'checked out' && (
                <View className="mt-8 pt-6 border-t border-gray-100">
                  <TouchableOpacity 
                    onPress={() => setIsDeleteModalOpen(true)}
                    className="flex-row items-center justify-center gap-2 bg-red-50 py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                    <Text className="text-red-500 font-bold text-base">Remove Equipment</Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </View>

          {/* COLUNA DIREITA (Estática para placeholder visual) */}
          <View className="flex-1">
            <View className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <Text className="text-xl font-bold text-gray-900 mb-4">Projects With This Equipment</Text>
              
              {status === 'available' ? (
                <View className="p-4 items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Text className="text-gray-500">Not currently assigned to any project.</Text>
                </View>
              ) : (
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center">
                  <Text className="text-gray-900 font-medium text-base">Autonomous Rover v2</Text>
                  <View className="border border-gray-300 px-3 py-1 rounded-full"><Text className="text-xs text-gray-600 font-bold">active</Text></View>
                </View>
              )}
            </View>

            <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <View className="flex-row items-center gap-3 mb-6">
                <Feather name="clock" size={24} color="#374151" />
                <Text className="text-xl font-bold text-gray-900">Recent History</Text>
              </View>

              <View className="gap-3">
                <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="bg-white border border-gray-300 px-3 py-1 rounded-full w-24 items-center"><Text className="text-xs font-bold text-gray-600">added</Text></View>
                    <View>
                      <Text className="font-bold text-gray-900">System Admin</Text>
                      <Text className="text-gray-500 text-xs">Inventory Update</Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-sm">Today</Text>
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* MODAL DE CONFIRMAÇÃO PARA APAGAR EQUIPAMENTO */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-lg items-center">
            
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Feather name="alert-triangle" size={32} color="#EF4444" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">Remove Equipment?</Text>
            <Text className="text-gray-500 text-center mb-8">
              Are you sure you want to permanently delete this equipment from the inventory?
            </Text>

            <View className="w-full gap-3">
              <TouchableOpacity 
                onPress={handleDelete} 
                className="w-full py-3 bg-red-500 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Yes, remove item</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setIsDeleteModalOpen(false)} 
                className="w-full py-3 bg-gray-100 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-700">No, keep it</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}