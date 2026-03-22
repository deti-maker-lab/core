import { Tabs, useRouter, usePathname, Redirect } from 'expo-router';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const { role, logout } = useAuth();

  if (!role) {
    return <Redirect href="/login" />;
  }

  const handleLogout = () => {
    logout(); 
  };

  const NavItem = ({ icon, route }: { icon: any, route: string }) => {
    const isActive = pathname === route || (pathname === '/' && route === '/index');
    return (
      <TouchableOpacity
        onPress={() => router.push(route as any)}
        className={`p-3 mb-4 rounded-xl items-center justify-center transition-colors ${
          isActive ? 'bg-gray-200' : 'bg-transparent hover:bg-gray-100'
        }`}
      >
        <Feather name={icon} size={24} color={isActive ? '#111827' : '#6B7280'} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 flex-row bg-white">
      
      {/* 1. SIDEBAR (COMPUTADOR/TABLET) */}
      {!isMobile && (
        <View className="w-20 border-r border-gray-200 bg-gray-50 items-center py-6 justify-between h-full">
          <View className="w-full px-4 items-center">
            <View className="mb-8"><Feather name="share-2" size={28} color="#111827" /></View>
            
            <NavItem icon="home" route="/" />
            <NavItem icon="folder" route="/projects" />
            <NavItem icon="cpu" route="/equipment" />
            
            {role === 'tech' && (
              <>
                <NavItem icon="users" route="/users" />
                <NavItem icon="book" route="/ledger" />
                <View className="w-8 h-[1px] bg-gray-300 my-4" />
                <NavItem icon="tool" route="/technician" />
              </>
            )}
          </View>

          <TouchableOpacity onPress={handleLogout} className="p-3 mb-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
            <Feather name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* 2. ÁREA PRINCIPAL */}
      <View className="flex-1 bg-white">
        <Tabs 
          screenOptions={{ 
            headerShown: isMobile,
            headerTitle: 'DETI Maker Lab',
            headerRight: () => isMobile ? (
              <TouchableOpacity onPress={handleLogout} className="mr-4 p-2 bg-red-50 rounded-full">
                <Feather name="log-out" size={18} color="#EF4444" />
              </TouchableOpacity>
            ) : null,
            tabBarActiveTintColor: '#111827',
            tabBarStyle: isMobile ? { borderTopWidth: 1, borderTopColor: '#E5E7EB' } : { display: 'none' }
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({color}) => <Feather name="home" size={24} color={color} /> }} />
          <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({color}) => <Feather name="folder" size={24} color={color} /> }} />
          <Tabs.Screen name="equipment" options={{ title: 'Equipment', tabBarIcon: ({color}) => <Feather name="cpu" size={24} color={color} /> }} />
          
          {/* Páginas ocultas da barra de baixo */}
          <Tabs.Screen name="users" options={{ href: null }} />
          <Tabs.Screen name="ledger" options={{ href: null }} />
          <Tabs.Screen name="technician" options={{ href: null }} />
          <Tabs.Screen name="item/[id]" options={{ href: null }} />
          <Tabs.Screen name="project/[id]" options={{ href: null }} /> {/* <-- Rota da página de detalhes ocultada aqui! */}
        </Tabs>
      </View>

    </View>
  );
}