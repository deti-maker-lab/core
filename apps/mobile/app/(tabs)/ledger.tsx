import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

const LEDGER = [
  { id: '1', action: 'checkout', equip: 'Rigol DS1054Z Oscilloscope', detail: 'Francisco Coletta -> Smart Greenhouse Monitor', date: 'Mar 12, 2026 14:55' },
  { id: '2', action: 'return', equip: 'Creality Ender-3 V3', detail: 'Francisco Wang -> Prosthetic Hand Project', date: 'Feb 28, 2026 12:32' },
  { id: '3', action: 'checkout', equip: 'Creality Ender-3 V3', detail: 'Francisco Wang -> Prosthetic Hand Project', date: 'Jan 12, 2026 15:34' },
  { id: '4', action: 'maintenance start', equip: 'Universal Robots UR5e', detail: '', date: 'Dec 29, 2025 17:55' },
];

export default function LedgerPage() {
  const [search, setSearch] = useState('');

  return (
    <ScrollView className="flex-1 bg-white p-8">
      
      {/* Cabeçalho */}
      <View className="mb-8 flex-row justify-between items-start">
        <View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Ledger</Text>
          <Text className="text-gray-500 text-lg">Immutable record of all equipment transactions</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity><Feather name="bell" size={24} color="#4B5563" /></TouchableOpacity>
          <TouchableOpacity><Feather name="user" size={24} color="#4B5563" /></TouchableOpacity>
        </View>
      </View>

      {/* Barra de Pesquisa */}
      <View className="flex-row items-center bg-white border border-gray-300 rounded-full px-4 py-3 w-1/2 mb-8">
        <Feather name="search" size={20} color="#9CA3AF" />
        <TextInput 
          className="flex-1 ml-3 text-base"
          placeholder="search by equipment, user or project..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Lista de Transações (Timeline) */}
      <View className="gap-4">
        {LEDGER.map((log, index) => (
          <View key={log.id} className="flex-row">
            
            {/* Coluna da Esquerda (Ícone e Linha da Timeline) */}
            <View className="items-center mr-4 mt-2">
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 z-10">
                <Feather name="link" size={16} color="#6B7280" />
              </View>
              {/* Só desenha a linha se não for o último item da lista */}
              {index !== LEDGER.length - 1 && (
                <View className="w-[2px] h-full bg-gray-200 absolute top-10" />
              )}
            </View>

            {/* Cartão de Transação */}
            <View className="flex-1 bg-white border border-gray-200 rounded-2xl p-5 mb-2 hover:bg-gray-50 transition-colors">
              <View className="flex-row justify-between items-start mb-1">
                <View className="flex-row items-center gap-3">
                  <View className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-gray-600 uppercase">{log.action}</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900">{log.equip}</Text>
                </View>
                <Text className="text-gray-500 text-sm">{log.date}</Text>
              </View>
              
              {/* Só mostra os detalhes se existirem (ex: no maintenance não há utilizador) */}
              {log.detail ? (
                <Text className="text-gray-500 text-sm ml-[100px] mt-1">{log.detail}</Text>
              ) : null}
            </View>
            
          </View>
        ))}
      </View>

    </ScrollView>
  );
}