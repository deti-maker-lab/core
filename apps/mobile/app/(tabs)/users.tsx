import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

// Dados falsos baseados no teu wireframe
const USERS = [
  { id: '1', name: 'André Silva', email: 'andrecastrosilva@ua.pt', nmec: '??????', role: 'student', initial: 'A' },
  { id: '2', name: 'Diogo Gomes', email: 'dgomes@ua.pt', nmec: '------', role: 'professor', initial: 'D' },
  { id: '3', name: 'Francisco Wang', email: 'franciscowang@ua.pt', nmec: '??????', role: 'student', initial: 'F' },
  { id: '4', name: 'Frederico Coletta', email: 'fredericocoletta@ua.pt', nmec: '??????', role: 'student', initial: 'F' },
  { id: '5', name: 'Jakub Suliga', email: 'jakub.suliga@ua.pt', nmec: '??????', role: 'student', initial: 'J' },
  { id: '6', name: 'João Martins', email: 'joaodiogomartins@ua.pt', nmec: '120284', role: 'student', initial: 'J' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <ScrollView className="flex-1 bg-white p-8">
      
      {/* Cabeçalho */}
      <View className="mb-8 flex-row justify-between items-start">
        <View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Users</Text>
          <Text className="text-gray-500 text-lg">87 lab participants</Text>
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
            placeholder="search by name, email or nmec..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <View className="flex-row border border-gray-300 rounded-full p-1 bg-gray-50">
          {['All', 'Students', 'Professors', 'Technician'].map((filter) => (
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

      {/* Grelha de Utilizadores */}
      <View className="flex-row flex-wrap gap-4">
        {USERS.map((user) => (
          <View key={user.id} className="w-[31%] min-w-[300px] bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-4">
            
            {/* Avatar */}
            <View className="w-14 h-14 bg-gray-200 rounded-full items-center justify-center">
              <Text className="text-xl font-bold text-gray-600">{user.initial}</Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{user.name}</Text>
              <Text className="text-gray-500 text-sm">{user.email}</Text>
              <Text className="text-gray-400 text-sm mb-2">{user.nmec}</Text>
              
              <View className="bg-gray-100 self-start px-3 py-1 rounded-full">
                <Text className="text-xs font-bold text-gray-600 uppercase">{user.role}</Text>
              </View>
            </View>

          </View>
        ))}
      </View>

    </ScrollView>
  );
}