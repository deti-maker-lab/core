import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 

export default function TechnicianPortalPage() {
  const { transactions, setTransactions, ledger, setLedger, notifications, setNotifications } = useAuth();
  const [techSearch, setTechSearch] = useState('');

  // FUNÇÃO AUXILIAR PARA ENVIAR ALERTAS
  const sendNotification = (student: string, title: string, message: string) => {
    setNotifications([{ id: Date.now().toString(), student, title, message, read: false, date: 'Just now' }, ...notifications]);
  };

  const handleApprove = (id: string) => {
    const t = transactions.find((x: any) => x.id === id);
    setTransactions(transactions.map((tx: any) => tx.id === id ? { ...tx, status: 'ready for pickup' } : tx));
    if (t) sendNotification(t.student, 'Request Approved!', `Your request for ${t.name} is ready for pickup at the lab.`);
  };

  const handleReject = (id: string) => {
    const t = transactions.find((x: any) => x.id === id);
    setTransactions(transactions.filter((tx: any) => tx.id !== id));
    if (t) sendNotification(t.student, 'Request Rejected', `Your request for ${t.name} was rejected by the technician.`);
  };

  const handlePickup = (id: string) => {
    const t = transactions.find((x: any) => x.id === id);
    setTransactions(transactions.map((tx: any) => tx.id === id ? { ...tx, status: 'checked out' } : tx));
    if (t) {
      setLedger([{ id: `L${Date.now().toString().slice(-4)}`, equip: t.name, student: t.student, project: t.project, action: 'Checked Out', date: 'Just now' }, ...ledger]);
      sendNotification(t.student, 'Item Checked Out', `You have successfully picked up ${t.name}. Don't forget to return it on time!`);
    }
  };

  const handleCheckIn = (id: string) => {
    const t = transactions.find((x: any) => x.id === id);
    setTransactions(transactions.filter((tx: any) => tx.id !== id));
    if (t) {
      setLedger([{ id: `L${Date.now().toString().slice(-4)}`, equip: t.name, student: t.student, project: t.project, action: 'Returned', date: 'Just now' }, ...ledger]);
      sendNotification(t.student, 'Return Processed', `Thank you! Your return of ${t.name} has been successfully processed.`);
    }
  };

  const filteredTransactions = transactions.filter((t: any) => 
    t.student.toLowerCase().includes(techSearch.toLowerCase()) || 
    t.name.toLowerCase().includes(techSearch.toLowerCase())
  );

  const pending = filteredTransactions.filter((t: any) => t.status === 'pending approval');
  const ready = filteredTransactions.filter((t: any) => t.status === 'ready for pickup');
  const checkedOut = filteredTransactions.filter((t: any) => t.status === 'checked out');

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 md:p-8">
      
      {/* CABEÇALHO MODERNO */}
      <View className="mb-8 flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <View>
          <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Command Center</Text>
          <Text className="text-gray-500 text-lg">Manage all equipment workflows from one place.</Text>
        </View>
        
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-5 py-3.5 w-full md:max-w-md shadow-sm">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput 
            className="flex-1 ml-3 text-base text-gray-900" 
            placeholder="Search student or equipment..." 
            value={techSearch} 
            onChangeText={setTechSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* AS 3 COLUNAS DO FLUXO DE TRABALHO */}
      <View className="flex-col xl:flex-row gap-6">
        
        {/* COLUNA 1: PENDING APPROVAL */}
        <View className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-200" />
              <Text className="text-xl font-extrabold text-gray-900">Requires Approval</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-lg">
              <Text className="font-bold text-gray-600">{pending.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {pending.length > 0 ? pending.map((item: any) => (
              <View key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <Text className="font-bold text-gray-900 text-base mb-1">{item.name}</Text>
                
                <View className="flex-row items-center gap-2 mb-4 mt-1">
                  <Feather name="user" size={14} color="#6B7280" />
                  <Text className="text-gray-600 text-sm font-medium">{item.student}</Text>
                </View>
                
                <View className="flex-row gap-3 pt-4 border-t border-gray-100">
                  <TouchableOpacity onPress={() => handleReject(item.id)} className="flex-1 py-2.5 items-center rounded-xl border border-red-200 bg-white hover:bg-red-50 transition-colors">
                    <Text className="text-red-600 font-bold text-sm">Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleApprove(item.id)} className="flex-1 py-2.5 items-center rounded-xl bg-green-500 hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                    <Text className="text-white font-bold text-sm">Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )) : (
              <View className="py-12 items-center justify-center">
                <Feather name="check-circle" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 font-medium mt-3 text-center">No pending requests.</Text>
              </View>
            )}
          </View>
        </View>

        {/* COLUNA 2: READY FOR PICKUP */}
        <View className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
              <Text className="text-xl font-extrabold text-gray-900">Awaiting Pickup</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-lg">
              <Text className="font-bold text-gray-600">{ready.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {ready.length > 0 ? ready.map((item: any) => (
              <View key={item.id} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <Text className="font-bold text-blue-900 text-base mb-1">{item.name}</Text>
                
                <View className="flex-row items-center gap-2 mb-4 mt-1">
                  <Feather name="user" size={14} color="#3B82F6" />
                  <Text className="text-blue-800 text-sm font-medium">{item.student}</Text>
                </View>
                
                <TouchableOpacity onPress={() => handlePickup(item.id)} className="w-full py-3.5 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors flex-row gap-2 mt-2 shadow-sm shadow-blue-200">
                  <Feather name="package" size={16} color="white" />
                  <Text className="text-white font-bold text-sm">Confirm Pickup</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <View className="py-12 items-center justify-center">
                <Feather name="inbox" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 font-medium mt-3 text-center">No items waiting.</Text>
              </View>
            )}
          </View>
        </View>

        {/* COLUNA 3: CHECKED OUT */}
        <View className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-3.5 h-3.5 rounded-full bg-gray-400 shadow-sm" />
              <Text className="text-xl font-extrabold text-gray-900">Checked Out</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-lg">
              <Text className="font-bold text-gray-600">{checkedOut.length}</Text>
            </View>
          </View>

          <View className="gap-4">
            {checkedOut.length > 0 ? checkedOut.map((item: any) => (
              <View key={item.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <Text className="font-bold text-gray-900 text-base mb-1">{item.name}</Text>
                
                <View className="flex-row items-center gap-2 mb-4 mt-1">
                  <Feather name="user" size={14} color="#6B7280" />
                  <Text className="text-gray-600 text-sm font-medium">{item.student}</Text>
                </View>
                
                <TouchableOpacity onPress={() => handleCheckIn(item.id)} className="w-full py-3.5 items-center justify-center rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors flex-row gap-2 mt-2 shadow-sm">
                  <Feather name="corner-down-left" size={16} color="white" />
                  <Text className="text-white font-bold text-sm">Process Return</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <View className="py-12 items-center justify-center">
                <Feather name="shield" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 font-medium mt-3 text-center">All items are in the lab.</Text>
              </View>
            )}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}