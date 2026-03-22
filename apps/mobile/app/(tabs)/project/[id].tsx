import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProjectDetailsPage() {
  const router = useRouter();
  
  // Apanhamos a informação que enviámos pelo link no ficheiro anterior!
  const params = useLocalSearchParams();
  
  // Se faltar informação (se viermos de um link antigo), usamos valores por defeito
  const title = params.title || 'Unknown Project';
  const status = params.status || 'unknown';
  const course = params.course || 'N/A';
  const group = params.group || 'N/A';
  const desc = params.desc || 'No description available for this project.';

  return (
    <ScrollView className="flex-1 bg-gray-50 p-8">
      
      <TouchableOpacity 
        onPress={() => router.push('/projects' as any)} 
        className="flex-row items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 self-start mb-6 hover:bg-gray-50"
      >
        <Feather name="arrow-left" size={20} color="#374151" />
        <Text className="font-bold text-gray-700">Back</Text>
      </TouchableOpacity>

      <View className="flex-col md:flex-row gap-6">
        
        {/* COLUNA ESQUERDA (Detalhes do Projeto Dinâmicos) */}
        <View className="w-full md:w-[60%]">
          
          <View className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-3xl font-bold text-gray-900 flex-1 mr-4">{title}</Text>
              <View className={`px-4 py-2 rounded-full border ${
                status === 'active' ? 'bg-gray-100 border-gray-200' : 
                status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-300'
              }`}>
                <Text className={`text-sm font-bold uppercase ${status === 'pending' ? 'text-yellow-700' : 'text-gray-600'}`}>{status}</Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="bg-gray-100 px-3 py-1.5 rounded-lg"><Text className="text-xs font-bold text-gray-700">{course}</Text></View>
              <View className="bg-gray-100 px-3 py-1.5 rounded-lg"><Text className="text-xs font-bold text-gray-700">{group}</Text></View>
            </View>

            <Text className="text-gray-600 text-base leading-relaxed mb-8">
              {desc}
            </Text>

            <Text className="text-lg font-bold text-gray-900 mb-4">Team Members</Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <View className="w-8 h-8 bg-gray-900 rounded-full items-center justify-center">
                  <Text className="font-bold text-white">Y</Text>
                </View>
                <Text className="text-gray-900 font-bold">You (Creator)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* COLUNA DIREITA (Equipamentos) */}
        <View className="flex-1">
          <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Requested Equipment</Text>
            
            {status === 'pending' ? (
              <View className="p-4 items-center justify-center border border-dashed border-gray-300 rounded-xl">
                 <Text className="text-gray-500 text-center">Equipment requests unlock after project approval.</Text>
              </View>
            ) : (
              <View className="gap-3">
                {[
                  { name: 'Fluke 87V Multimeter', status: 'checked out' },
                  { name: 'Siglent SDG2042X Signal Generator', status: 'checked out' }
                ].map((equip, index) => (
                  <View key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-col gap-2">
                    <Text className="text-gray-900 font-bold">{equip.name}</Text>
                    <View className="self-start px-3 py-1 bg-white border border-gray-300 rounded-full">
                      <Text className="text-xs font-bold text-gray-500 uppercase">{equip.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

          </View>
        </View>

      </View>
    </ScrollView>
  );
}