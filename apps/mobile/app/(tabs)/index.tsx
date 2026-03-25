import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Função auxiliar para dar imagens reais e bonitas aos projetos (Baseado no título)
const getProjectImage = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('weather') || t.includes('solar')) return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop';
  if (t.includes('drone')) return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop';
  if (t.includes('greenhouse')) return 'https://images.unsplash.com/photo-1530836369250-ef71a3a5a4fda?q=80&w=800&auto=format&fit=crop';
  if (t.includes('prosthetic') || t.includes('hand')) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop';
  // Imagem de laboratório/hardware por defeito
  return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop';
};

export default function DashboardHomePage() {
  const router = useRouter();
  const { currentUserName, projects, inventory, transactions, notifications, setNotifications } = useAuth(); 

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const myNotifications = notifications.filter((n: any) => n.student === currentUserName);
  const unreadCount = myNotifications.filter((n: any) => !n.read).length;

  const myActiveProjects = projects.filter((p: any) => p.isMine && p.status === 'active').length;
  const myCheckedOutItems = transactions.filter((t: any) => t.student === currentUserName && t.status === 'checked out').length;
  const availableEquipCount = inventory.length; 
  const myPendingApprovals = transactions.filter((t: any) => t.student === currentUserName && (t.status === 'pending approval' || t.status === 'ready for pickup')).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => 
      n.student === currentUserName ? { ...n, read: true } : n
    ));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 md:p-8">
      
      {/* ========================================== */}
      {/* NOVO HERO BANNER BONITO COM IMAGEM DE FUNDO  */}
      {/* ========================================== */}
      <View className="relative w-full h-72 rounded-3xl overflow-hidden mb-10 shadow-sm mt-2">
        {/* Imagem de fundo (Dark Lab theme) */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop' }} 
          className="absolute w-full h-full"
        />
        {/* Overlay escuro para ler bem o texto */}
        <View className="absolute w-full h-full bg-gray-900/60" />
        
        <View className="flex-1 p-6 md:p-10 justify-between">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">DETI Maker Lab</Text>
              <Text className="text-gray-200 text-lg md:text-xl font-medium">Your space for innovation</Text>
            </View>

            {/* SINO DE NOTIFICAÇÕES (Agora com estilo mais premium) */}
            <TouchableOpacity 
              onPress={() => setIsNotifModalOpen(true)}
              className="relative p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/30 transition-colors"
            >
              <Feather name="bell" size={24} color="white" />
              {unreadCount > 0 && (
                <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-transparent" />
              )}
            </TouchableOpacity>
          </View>

          {/* BARRA DE PESQUISA DENTRO DO BANNER */}
          <View className="flex-row items-center bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl px-5 py-4 w-full max-w-2xl shadow-lg">
            <Feather name="search" size={22} color="#6B7280" />
            <TextInput 
              className="flex-1 ml-3 text-base font-medium text-gray-900" 
              placeholder="Search projects, equipments, users..." 
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>

      {/* ========================================== */}
      {/* CARTÕES DE ESTATÍSTICAS COLORIDOS E MODERNOS */}
      {/* ========================================== */}
      <View className="flex-row flex-wrap justify-between gap-4 mb-12">
        
        <View className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100">
              <Feather name="folder" size={26} color="#2563EB" />
            </View>
            <Text className="text-4xl font-black text-gray-900">{myActiveProjects}</Text>
          </View>
          <Text className="text-gray-500 font-semibold uppercase text-xs tracking-wider">My Active Projects</Text>
        </View>

        <View className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-14 h-14 bg-purple-50 rounded-2xl items-center justify-center border border-purple-100">
              <Feather name="shopping-bag" size={26} color="#9333EA" />
            </View>
            <Text className="text-4xl font-black text-gray-900">{myCheckedOutItems}</Text>
          </View>
          <Text className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Checked Out Items</Text>
        </View>

        <View className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-14 h-14 bg-green-50 rounded-2xl items-center justify-center border border-green-100">
              <Feather name="cpu" size={26} color="#16A34A" />
            </View>
            <Text className="text-4xl font-black text-gray-900">{availableEquipCount}</Text>
          </View>
          <Text className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Lab Equipment</Text>
        </View>

        <View className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl items-center justify-center">
              <Feather name="clock" size={26} color="#EA580C" />
            </View>
            <Text className="text-4xl font-black text-gray-900">{myPendingApprovals}</Text>
          </View>
          <Text className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Pending / Ready</Text>
        </View>
      </View>

      {/* ========================================== */}
      {/* PROJETOS RECENTES (AGORA COM IMAGENS REAIS)  */}
      {/* ========================================== */}
      <View>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Recent Projects</Text>
          <TouchableOpacity onPress={() => router.push('/projects' as any)}>
            <Text className="text-blue-600 font-bold hover:underline">View all</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-5">
          {projects.filter((p: any) => p.status === 'active').slice(0, 4).map((project: any) => (
            <TouchableOpacity 
              key={project.id} 
              onPress={() => router.push(`/project/${project.id}` as any)} 
              className="w-[23%] min-w-[280px] bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl shadow-sm transition-all duration-200 transform hover:-translate-y-1"
            >
              {/* MAGIA DAS IMAGENS AQUI */}
              <View className="w-full h-40 bg-gray-200">
                <Image 
                  source={{ uri: getProjectImage(project.title) }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              <View className="p-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    <Text className="text-[10px] font-bold text-blue-700 uppercase">{project.course}</Text>
                  </View>
                </View>

                <Text className="text-xl font-bold text-gray-900 mb-2 truncate leading-tight">{project.title}</Text>
                <Text className="text-gray-500 text-sm mb-5 leading-relaxed" numberOfLines={2}>{project.desc}</Text>
                
                <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                  <View className="flex-row items-center gap-2">
                    <Feather name="users" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs font-bold">{project.members} members</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Feather name="cpu" size={16} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs font-bold">{project.equip} items</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ========================================== */}
      {/* MODAL DE NOTIFICAÇÕES (MANTÉM-SE IGUAL)      */}
      {/* ========================================== */}
      <Modal visible={isNotifModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-end p-4 md:p-8">
          <View className="bg-white w-full max-w-sm rounded-3xl shadow-2xl h-full max-h-[600px] overflow-hidden">
            
            <View className="p-6 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="text-xl font-bold text-gray-900">Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotifModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <Feather name="x" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
              {myNotifications.length > 0 ? myNotifications.map((notif: any) => (
                <View key={notif.id} className={`p-4 rounded-2xl mb-3 border ${notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'}`}>
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className={`font-bold flex-1 pr-2 ${notif.read ? 'text-gray-900' : 'text-blue-900'}`}>{notif.title}</Text>
                    {!notif.read && <View className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                  </View>
                  <Text className={`text-sm mb-3 ${notif.read ? 'text-gray-500' : 'text-blue-800/80'}`}>{notif.message}</Text>
                  <Text className="text-xs text-gray-400 font-medium">{notif.date}</Text>
                </View>
              )) : (
                <View className="items-center justify-center py-10">
                  <Feather name="bell-off" size={32} color="#D1D5DB" />
                  <Text className="text-gray-400 mt-4 font-medium">No notifications yet.</Text>
                </View>
              )}
            </ScrollView>

            {unreadCount > 0 && (
              <View className="p-4 border-t border-gray-100 bg-white">
                <TouchableOpacity onPress={markAllAsRead} className="w-full py-3 items-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Text className="font-bold text-gray-700">Mark all as read</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}