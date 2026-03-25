import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Nossa Base de Dados Falsa de Utilizadores
const INITIAL_USERS = [
  { id: 'U001', name: 'André Silva', email: 'andrecastrosilva@ua.pt', role: 'student', status: 'active' },
  { id: 'U002', name: 'Francisco Wang', email: 'franciscowang@ua.pt', role: 'student', status: 'active' },
  { id: 'U003', name: 'Frederico Coletta', email: 'fredericocoletta@ua.pt', role: 'student', status: 'active' },
  { id: 'U004', name: 'João Sousa', email: 'joaosousa@ua.pt', role: 'student', status: 'suspended' },
  { id: 'U005', name: 'System Admin', email: 'admin@ua.pt', role: 'tech', status: 'active' },
];

export default function UsersPage() {
  const { role, transactions } = useAuth(); 
  
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                        user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId && u.role !== 'tech') { 
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    }));
  };

  const handleOpenProfile = (user: any) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const getUserItemCount = (userName: string) => {
    return transactions.filter((t: any) => t.student === userName && t.status === 'checked out').length;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 md:p-8">
      
      {/* CABEÇALHO MODERNO */}
      <View className="mb-8 flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <View>
          <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">User Directory</Text>
          <Text className="text-gray-500 text-lg">Manage lab access, accounts, and equipment tracking.</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => setIsAddModalOpen(true)}
          className="flex-row items-center gap-2 px-6 py-3.5 bg-gray-900 rounded-2xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Feather name="user-plus" size={20} color="white" />
          <Text className="font-bold text-white text-base">Add User</Text>
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA E FILTROS */}
      <View className="flex-row flex-wrap items-center gap-4 mb-8">
        <View className="flex-1 min-w-[250px] flex-row items-center bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-3 text-base text-gray-900" 
            placeholder="Search by name or email..." 
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="flex-row border border-gray-200 rounded-2xl p-1.5 bg-white shadow-sm flex-wrap">
          {['All', 'Student', 'Tech'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setRoleFilter(filter)} 
              className={`px-5 py-2.5 rounded-xl transition-all ${roleFilter === filter ? 'bg-gray-100' : ''}`}
            >
              <Text className={`${roleFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* LISTA DE UTILIZADORES (ESTILO ALTA FIDELIDADE) */}
      <View className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Cabeçalho da Tabela */}
        <View className="hidden md:flex flex-row bg-gray-50/50 border-b border-gray-100 p-5">
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[35%]">User Info</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[15%]">Role</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[15%]">Active Items</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[15%]">Status</Text>
          <Text className="font-bold text-gray-400 uppercase tracking-wider text-xs w-[20%] text-right">Action</Text>
        </View>

        <View className="gap-0">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => {
            const activeItemsCount = getUserItemCount(user.name);

            return (
              <TouchableOpacity 
                key={user.id} 
                onPress={() => handleOpenProfile(user)}
                className="flex-col md:flex-row items-start md:items-center border-b border-gray-50 p-5 hover:bg-gray-50 transition-colors group"
              >
                
                {/* Nome e Avatar */}
                <View className="w-full md:w-[35%] flex-row items-center gap-4 mb-3 md:mb-0">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center border shadow-sm ${
                    user.role === 'tech' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  }`}>
                    <Text className={`font-bold text-lg ${user.role === 'tech' ? 'text-white' : 'text-gray-700'}`}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-base mb-0.5">{user.name}</Text>
                    <Text className="text-gray-500 text-sm font-medium">{user.email}</Text>
                  </View>
                </View>
                
                {/* Role */}
                <View className="w-full md:w-[15%] mb-2 md:mb-0">
                  <View className="self-start px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                    <Text className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{user.role}</Text>
                  </View>
                </View>

                {/* Itens */}
                <View className="w-full md:w-[15%] flex-row items-center gap-2 mb-2 md:mb-0">
                  <View className={`p-2 rounded-lg border ${activeItemsCount > 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                    <Feather name="shopping-bag" size={14} color={activeItemsCount > 0 ? '#2563EB' : '#9CA3AF'} />
                  </View>
                  <Text className={`font-bold ${activeItemsCount > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                    {activeItemsCount} {activeItemsCount === 1 ? 'item' : 'items'}
                  </Text>
                </View>

                {/* Status */}
                <View className="w-full md:w-[15%] mb-4 md:mb-0">
                  <View className="flex-row items-center gap-2">
                    <View className={`w-2.5 h-2.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className={`text-sm font-bold capitalize ${user.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                      {user.status}
                    </Text>
                  </View>
                </View>

                {/* Acões */}
                <View className="w-full md:w-[20%] flex-row justify-start md:justify-end gap-3">
                  <Feather name="chevron-right" size={20} color="#D1D5DB" className="hidden md:flex group-hover:text-gray-400" />
                  
                  {user.role !== 'tech' && (
                    <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); toggleUserStatus(user.id); }}
                      className={`px-4 py-2 rounded-xl border ${
                        user.status === 'active' 
                          ? 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50' 
                          : 'bg-gray-900 border-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      <Text className={`font-bold text-xs uppercase tracking-wider ${
                        user.status === 'active' ? 'text-gray-600 hover:text-red-600' : 'text-white'
                      }`}>
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

              </TouchableOpacity>
            );
          }) : (
            <View className="py-20 items-center justify-center">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Feather name="users" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No users found.</Text>
              <Text className="text-gray-500">Adjust your search or filters.</Text>
            </View>
          )}
        </View>
      </View>

      {/* ========================================== */}
      {/* MODAL DO PERFIL DO UTILIZADOR (E EQUIPAMENTO) */}
      {/* ========================================== */}
      <Modal visible={isProfileModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[85%]">
            
            {/* Cabecalho de Cor (Azul para estudantes, Cinza para Tech) */}
            <View className={`h-24 w-full ${selectedUser?.role === 'tech' ? 'bg-gray-900' : 'bg-blue-600'}`} />

            <View className="px-6 pb-6 pt-0 relative">
              {/* Avatar Flutuante */}
              <View className="flex-row justify-between items-end -mt-10 mb-5">
                <View className="w-20 h-20 rounded-2xl bg-white items-center justify-center border-4 border-white shadow-sm">
                  <Text className={`text-3xl font-black ${selectedUser?.role === 'tech' ? 'text-gray-900' : 'text-blue-600'}`}>
                    {selectedUser?.name?.charAt(0)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsProfileModalOpen(false)} className="p-2 bg-gray-100 rounded-full mb-2 hover:bg-gray-200 transition-colors">
                  <Feather name="x" size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-1">{selectedUser?.name}</Text>
                <Text className="text-gray-500 font-medium mb-3">{selectedUser?.email}</Text>
                
                <View className="flex-row gap-2">
                  <View className="self-start px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
                    <Text className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{selectedUser?.role}</Text>
                  </View>
                  <View className={`self-start px-3 py-1 rounded-lg border ${selectedUser?.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${selectedUser?.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>{selectedUser?.status}</Text>
                  </View>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-6">
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Currently Borrowed Items</Text>
                
                <ScrollView className="max-h-60">
                  <View className="gap-3 pb-2">
                    {selectedUser && getUserItemCount(selectedUser.name) > 0 ? (
                      transactions
                        .filter((t: any) => t.student === selectedUser.name && t.status === 'checked out')
                        .map((equip: any) => (
                          <View key={equip.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-4 shadow-sm">
                            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center border border-blue-100">
                              <Feather name="cpu" size={18} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                              <Text className="font-bold text-gray-900 mb-1">{equip.name}</Text>
                              <Text className="text-gray-500 text-xs font-medium">Since: {equip.date}</Text>
                            </View>
                          </View>
                        ))
                    ) : (
                      <View className="p-6 items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <Feather name="check-circle" size={24} color="#10B981" className="mb-3" />
                        <Text className="text-gray-500 font-medium text-center">No equipment currently checked out. All clear!</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>

            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL ADICIONAR UTILIZADOR                   */}
      {/* ========================================== */}
      <Modal visible={isAddModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            
            <View className="px-6 py-5 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="text-xl font-extrabold text-gray-900">Invite User</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <Feather name="x" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <View className="p-6 gap-5">
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Email Address *</Text>
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" placeholder="e.g. student@ua.pt" />
              </View>
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Role</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity className="flex-1 bg-gray-900 rounded-xl py-3.5 items-center shadow-sm">
                    <Text className="text-white font-bold">Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-white border border-gray-200 rounded-xl py-3.5 items-center hover:bg-gray-50">
                    <Text className="text-gray-600 font-bold">Tech</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="px-6 py-5 border-t border-gray-100 bg-gray-50">
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} className="w-full py-3.5 bg-blue-600 rounded-xl items-center hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                <Text className="font-bold text-white text-base">Send Invite Link</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}