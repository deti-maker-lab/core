import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LedgerPage() {
  const { ledger } = useAuth(); 
  
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  // Lógica original de filtragem mantida!
  const filteredLedger = ledger.filter((log: any) => {
    const matchSearch = log.equip.toLowerCase().includes(search.toLowerCase()) || 
                        log.student.toLowerCase().includes(search.toLowerCase()) ||
                        (log.project && log.project.toLowerCase().includes(search.toLowerCase())) ||
                        log.id.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'All' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 md:p-8">
      
      {/* CABEÇALHO MODERNO */}
      <View className="mb-8 flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <View>
          <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Transaction Ledger</Text>
          <Text className="text-gray-500 text-lg">Immutable history of all lab equipment movements.</Text>
        </View>
        
        {/* Botão de Exportar (Dá um toque muito realista a um painel de Admin) */}
        <TouchableOpacity className="flex-row items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
          <Feather name="download" size={18} color="#4B5563" />
          <Text className="font-bold text-gray-700 text-base">Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA E FILTROS */}
      <View className="flex-row flex-wrap items-center gap-4 mb-8">
        <View className="flex-1 min-w-[250px] flex-row items-center bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-3 text-base text-gray-900" 
            placeholder="Search by ID, student, equipment or project..." 
            value={search} 
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="flex-row border border-gray-200 rounded-2xl p-1.5 bg-white shadow-sm flex-wrap">
          {['All', 'Checked Out', 'Returned'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActionFilter(filter)} 
              className={`px-5 py-2.5 rounded-xl transition-all ${actionFilter === filter ? 'bg-gray-100' : ''}`}
            >
              <Text className={`${actionFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TABELA DO HISTÓRICO (ESTILO ALTA FIDELIDADE) */}
      <View className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Cabeçalho da Tabela */}
        <View className="hidden md:flex flex-row bg-gray-50/50 border-b border-gray-100 p-5">
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[10%]">Log ID</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[25%]">Equipment</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[20%]">Student</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[20%]">Project</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[15%]">Action</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[10%] text-right">Date</Text>
        </View>

        {/* Linhas da Tabela */}
        <View className="gap-0">
          {filteredLedger.length > 0 ? filteredLedger.map((log: any) => (
            <View key={log.id} className="flex-col md:flex-row items-start md:items-center border-b border-gray-50 p-5 hover:bg-gray-50 transition-colors">
              
              {/* Log ID */}
              <View className="w-full md:w-[10%] mb-2 md:mb-0">
                <Text className="font-mono text-gray-400 font-medium bg-gray-100 self-start px-2 py-1 rounded-md text-xs">
                  #{log.id}
                </Text>
              </View>
              
              {/* Equipment */}
              <View className="w-full md:w-[25%] mb-2 md:mb-0 pr-4">
                <Text className="font-bold text-gray-900 leading-tight">{log.equip}</Text>
              </View>
              
              {/* Student (Agora com Avatar!) */}
              <View className="w-full md:w-[20%] flex-row items-center gap-3 mb-3 md:mb-0">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center border border-blue-200">
                  <Text className="font-bold text-blue-700 text-xs">{log.student.charAt(0).toUpperCase()}</Text>
                </View>
                <Text className="text-gray-700 font-medium">{log.student}</Text>
              </View>
              
              {/* Project */}
              <View className="w-full md:w-[20%] mb-2 md:mb-0 pr-4">
                <Text className="text-gray-500 text-sm truncate">{log.project || 'N/A'}</Text>
              </View>
              
              {/* Action (Badges Modernas) */}
              <View className="w-full md:w-[15%] mb-3 md:mb-0">
                <View className={`self-start px-3 py-1.5 rounded-lg border flex-row items-center gap-1.5 ${
                  log.action === 'Returned' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <Feather 
                    name={log.action === 'Returned' ? 'corner-down-left' : 'external-link'} 
                    size={12} 
                    color={log.action === 'Returned' ? '#15803D' : '#1D4ED8'} 
                  />
                  <Text className={`text-[11px] font-bold uppercase tracking-wider ${
                    log.action === 'Returned' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {log.action}
                  </Text>
                </View>
              </View>
              
              {/* Date */}
              <View className="w-full md:w-[10%]">
                <Text className="text-gray-400 text-sm md:text-right font-medium">{log.date}</Text>
              </View>

            </View>
          )) : (
            <View className="py-20 items-center justify-center">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Feather name="clipboard" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No records found</Text>
              <Text className="text-gray-500">Your ledger is empty or no logs match your search.</Text>
            </View>
          )}
        </View>
      </View>

    </ScrollView>
  );
}