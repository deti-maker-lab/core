import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EquipmentDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Isto apanha o ID do URL (ex: 1, 2, 3...)

  return (
    <ScrollView className="flex-1 bg-gray-50 p-8">
      
      {/* Botão de Voltar - Agora força a ida para a página de Equipment */}
      <TouchableOpacity 
        onPress={() => router.push('/equipment' as any)} 
        className="flex-row items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 self-start mb-6 hover:bg-gray-50"
      >
        <Feather name="arrow-left" size={20} color="#374151" />
        <Text className="font-bold text-gray-700">Back</Text>
      </TouchableOpacity>

      {/* Estrutura de 2 Colunas (Lado a lado em ecrãs grandes) */}
      <View className="flex-col md:flex-row gap-6">
        
        {/* COLUNA ESQUERDA (Imagem e Detalhes) */}
        <View className="w-full md:w-[40%]">
          
          {/* Cartão de Imagem e Título */}
          <View className="bg-white border border-gray-200 rounded-2xl mb-6 overflow-hidden shadow-sm">
            <View className="w-full aspect-video bg-gray-100 items-center justify-center border-b border-gray-200">
              <Feather name="image" size={40} color="#D1D5DB" />
            </View>
            <View className="p-5">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">Raspberry Pi 5 Cluster</Text>
                <View className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <Text className="text-xs font-bold text-gray-600">checked out</Text>
                </View>
              </View>
              <View className="bg-gray-100 self-start px-3 py-1 rounded-md">
                <Text className="text-xs text-gray-600 font-medium">computing</Text>
              </View>
            </View>
          </View>

          {/* Cartão de Detalhes */}
          <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-6">Details</Text>
            
            <View className="gap-5">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Feather name="dollar-sign" size={20} color="#9CA3AF" />
                  <Text className="text-gray-500 font-medium">Price</Text>
                </View>
                <Text className="font-bold text-gray-900 text-lg">399€</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Feather name="hash" size={20} color="#9CA3AF" />
                  <Text className="text-gray-500 font-medium">Reference</Text>
                </View>
                <Text className="font-bold text-gray-900 text-lg">QR063</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Feather name="map-pin" size={20} color="#9CA3AF" />
                  <Text className="text-gray-500 font-medium">Location</Text>
                </View>
                <Text className="font-bold text-gray-900 text-lg">Arm061</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Text className="text-gray-400 font-medium ml-[2px]">Condition</Text> 
                </View>
                <Text className="font-bold text-gray-900 text-lg">Good</Text>
              </View>
            </View>
          </View>
        </View>

        {/* COLUNA DIREITA (Projetos e Histórico) */}
        <View className="flex-1">
          
          {/* Projetos */}
          <View className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Projects With This Equipment (2)</Text>
            
            <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 font-medium text-base">Autonomous Rover v2</Text>
              <View className="border border-gray-300 px-3 py-1 rounded-full"><Text className="text-xs text-gray-600 font-bold">active</Text></View>
            </View>

            <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row justify-between items-center">
              <Text className="text-gray-900 font-medium text-base">CubeSat Structural Testing</Text>
              <View className="border border-gray-300 px-3 py-1 rounded-full"><Text className="text-xs text-gray-600 font-bold">completed</Text></View>
            </View>
          </View>

          {/* Histórico */}
          <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center gap-3 mb-6">
              <Feather name="clock" size={24} color="#374151" />
              <Text className="text-xl font-bold text-gray-900">Full History (3)</Text>
            </View>

            <View className="gap-3">
              {/* Log 1 */}
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="bg-gray-200 px-3 py-1 rounded-full w-24 items-center"><Text className="text-xs font-bold text-gray-700">checkout</Text></View>
                  <View>
                    <Text className="font-bold text-gray-900">Frederico Coletta</Text>
                    <Text className="text-gray-500 text-xs">Autonomous Rover v2</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-sm">12 Mar 2026, 19:04</Text>
              </View>

              {/* Log 2 */}
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="bg-white border border-gray-300 px-3 py-1 rounded-full w-24 items-center"><Text className="text-xs font-bold text-gray-600">return</Text></View>
                  <View>
                    <Text className="font-bold text-gray-900">Francisco Wang</Text>
                    <Text className="text-gray-500 text-xs">CubeSat Structural Testing</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-sm">28 Feb 2026, 14:48</Text>
              </View>

              {/* Log 3 */}
              <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="bg-gray-200 px-3 py-1 rounded-full w-24 items-center"><Text className="text-xs font-bold text-gray-700">checkout</Text></View>
                  <View>
                    <Text className="font-bold text-gray-900">Francisco Wang</Text>
                    <Text className="text-gray-500 text-xs">CubeSat Structural Testing</Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-sm">03 Feb 2026, 12:01</Text>
              </View>
            </View>

          </View>

        </View>

      </View>
    </ScrollView>
  );
}