import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 

export default function LoginPage() {
  const router = useRouter();
  // Importamos o logout aqui!
  const { login, logout } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // O TRUQUE: Assim que a página de Login abre no ecrã, 
  // ela garante que a memória antiga é limpa automaticamente.
  useEffect(() => {
    logout();
  }, []);

  const handleLogin = (role: 'tech' | 'student') => {
    login(role); 
    router.replace('/(tabs)'); 
  };

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-6">
      
      <View className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-200 items-center">
        
        <View className="bg-gray-900 w-16 h-16 rounded-2xl items-center justify-center mb-6 shadow-md">
          <Feather name="share-2" size={32} color="white" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2">DETI Maker Lab</Text>
        <Text className="text-gray-500 mb-8 text-center">Sign in to your account to manage projects and equipment.</Text>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">University Email</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
            <Feather name="mail" size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="name@ua.pt"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="w-full mb-8">
          <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Password</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3">
            <Feather name="lock" size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View className="w-full gap-3">
          <TouchableOpacity 
            onPress={() => handleLogin('student')}
            className="w-full bg-gray-900 py-4 rounded-xl items-center active:bg-gray-800"
          >
            <Text className="text-white font-bold text-lg">Login as Student</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleLogin('tech')}
            className="w-full bg-white border-2 border-gray-200 py-4 rounded-xl items-center active:bg-gray-50"
          >
            <Text className="text-gray-700 font-bold text-lg">Login as Technician</Text>
          </TouchableOpacity>
        </View>

      </View>

      <Text className="mt-8 text-gray-400 text-sm">© 2026 Universidade de Aveiro</Text>
    </View>
  );
}