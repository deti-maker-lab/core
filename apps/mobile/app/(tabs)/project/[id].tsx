import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; 

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // IMPORTAMOS O LEDGER
  const { role, currentUserName, projects, setProjects, inventory, transactions, setTransactions, ledger, setLedger } = useAuth(); 
  
  const projectId = String(params.id); 
  const title = params.title ? String(params.title) : 'Unknown Project';
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [equipSearch, setEquipSearch] = useState('');
  
  const projectEquipment = transactions.filter((t: any) => t.projectId === projectId);
  
  const status = params.status ? String(params.status).toLowerCase().trim() : 'unknown';
  const course = params.course ? String(params.course) : 'N/A';
  const group = params.group ? String(params.group) : 'N/A';
  const desc = params.desc ? String(params.desc) : 'No description available for this project.';

  let parsedTeam: string[] = [];
  try { if (params.team) parsedTeam = JSON.parse(String(params.team)); } catch (e) {}

  const handleProjectAction = () => {
    setModalConfig({ isOpen: false, type: '' });
    if (modalConfig.type === 'cancel') {
      setProjects(projects.filter((p: any) => p.id !== projectId));
      router.push('/projects' as any);
    } else {
      const newStatus = modalConfig.type === 'approve' ? 'active' : 'rejected';
      setProjects(projects.map((p: any) => p.id === projectId ? { ...p, status: newStatus } : p));
      router.push('/projects' as any);
    }
  };

  const handleAddEquipment = (equip: any) => {
    const initialStatus = role === 'student' ? 'pending approval' : 'checked out';
    const studentName = role === 'student' ? currentUserName : 'Assigned by Tech';
    
    const newTransaction = {
      id: Date.now().toString(),
      equipId: equip.id,
      name: equip.name,
      projectId: projectId,
      project: title, // GUARDAR O NOME DO PROJETO PARA O LEDGER
      student: studentName,
      status: initialStatus,
      date: 'Just now'
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Se o técnico adicionou direto, regista no Ledger que saiu!
    if (initialStatus === 'checked out') {
      setLedger([{ id: `L${Date.now().toString().slice(-4)}`, equip: equip.name, student: studentName, project: title, action: 'Checked Out', date: 'Just now' }, ...ledger]);
    }

    setIsEquipModalOpen(false);
    setEquipSearch('');
  };

  const handleRemoveEquipment = (reqId: string) => {
    const t = transactions.find((x: any) => x.id === reqId);
    
    // Se o equipamento já estava nas mãos do aluno e vai ser removido, é uma DEVOLUÇÃO!
    if (t && t.status === 'checked out') {
      setLedger([{ id: `L${Date.now().toString().slice(-4)}`, equip: t.name, student: t.student, project: title, action: 'Returned', date: 'Just now' }, ...ledger]);
    }

    setTransactions(transactions.filter((tx: any) => tx.id !== reqId));
  };

  const handleApproveEquipment = (reqId: string) => {
    setTransactions(transactions.map((t: any) => t.id === reqId ? { ...t, status: 'ready for pickup' } : t));
  };

  const handleConfirmPickup = (reqId: string) => {
    const t = transactions.find((x: any) => x.id === reqId);
    setTransactions(transactions.map((tx: any) => tx.id === reqId ? { ...tx, status: 'checked out' } : tx));
    
    // Aluno levou o item -> Escreve no Ledger!
    if (t) {
      setLedger([{ id: `L${Date.now().toString().slice(-4)}`, equip: t.name, student: t.student, project: title, action: 'Checked Out', date: 'Just now' }, ...ledger]);
    }
  };

  const filteredInventory = inventory.filter((equip: any) => 
    equip.name.toLowerCase().includes(equipSearch.toLowerCase()) || 
    equip.ref.toLowerCase().includes(equipSearch.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-8">
        
        <TouchableOpacity onPress={() => router.push('/projects' as any)} className="flex-row items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 self-start mb-6">
          <Feather name="arrow-left" size={20} color="#374151" />
          <Text className="font-bold text-gray-700">Back</Text>
        </TouchableOpacity>

        <View className="flex-col md:flex-row gap-6">
          <View className="w-full md:w-[60%]">
            <View className={`bg-white border rounded-2xl p-8 mb-6 shadow-sm ${status === 'rejected' ? 'border-red-100' : 'border-gray-200'}`}>
              <View className="flex-row justify-between items-start mb-4">
                <Text className={`text-3xl font-bold flex-1 mr-4 ${status === 'rejected' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{title}</Text>
                <View className={`px-4 py-2 rounded-full border ${status === 'active' ? 'bg-gray-100 border-gray-200' : status === 'pending' ? 'bg-yellow-50 border-yellow-200' : status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-300'}`}>
                  <Text className={`text-sm font-bold uppercase ${status === 'pending' ? 'text-yellow-700' : status === 'rejected' ? 'text-red-700' : 'text-gray-600'}`}>{status}</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-base leading-relaxed mb-8">{desc}</Text>
              {status === 'pending' && (
                <View className="mt-8 pt-6 border-t border-gray-100">
                  {role === 'student' ? (
                    <TouchableOpacity onPress={() => setModalConfig({ isOpen: true, type: 'cancel' })} className="flex-row items-center justify-center gap-2 bg-red-50 py-3 rounded-xl border border-red-100"><Feather name="trash-2" size={18} color="#EF4444" /><Text className="text-red-500 font-bold text-base">Cancel Proposal</Text></TouchableOpacity>
                  ) : (
                    <View className="flex-row gap-4">
                      <TouchableOpacity onPress={() => setModalConfig({ isOpen: true, type: 'reject' })} className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 py-3 rounded-xl border border-red-100"><Feather name="x-circle" size={18} color="#EF4444" /><Text className="text-red-500 font-bold text-base">Reject</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => setModalConfig({ isOpen: true, type: 'approve' })} className="flex-1 flex-row items-center justify-center gap-2 bg-green-50 py-3 rounded-xl border border-green-200"><Feather name="check-circle" size={18} color="#10B981" /><Text className="text-green-600 font-bold text-base">Approve</Text></TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View className="flex-1">
            <View className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Assigned Equipment</Text>
                {status === 'active' && (
                  <TouchableOpacity onPress={() => setIsEquipModalOpen(true)} className={`p-2 rounded-lg flex-row items-center gap-2 ${role === 'tech' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <Feather name="plus" size={18} color={role === 'tech' ? 'white' : 'black'} />
                    {role === 'tech' && <Text className="text-white font-bold text-sm pr-2">Assign Item</Text>}
                  </TouchableOpacity>
                )}
              </View>
              
              {status === 'pending' ? (
                <View className="p-4 items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50"><Text className="text-gray-500 text-center">Equipment requests unlock after approval.</Text></View>
              ) : status === 'rejected' ? (
                <View className="p-4 items-center justify-center border border-red-100 rounded-xl bg-red-50"><Text className="text-red-500 font-medium text-center">This proposal was rejected.</Text></View>
              ) : (
                <View className="gap-3">
                  {projectEquipment.length > 0 ? projectEquipment.map((equip: any) => (
                    <View key={equip.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex-col gap-3">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-4">
                          <Text className="text-gray-900 font-bold mb-1">{equip.name}</Text>
                          <View className={`self-start px-2 py-0.5 border rounded-full ${equip.status === 'pending approval' ? 'bg-yellow-50 border-yellow-200' : equip.status === 'ready for pickup' ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-300'}`}><Text className={`text-[10px] font-bold uppercase ${equip.status === 'pending approval' ? 'text-yellow-700' : equip.status === 'ready for pickup' ? 'text-blue-600' : 'text-gray-600'}`}>{equip.status}</Text></View>
                        </View>
                      </View>
                      <View className="flex-row justify-end gap-2 border-t border-gray-200 pt-3 mt-1">
                        {role === 'tech' ? (
                          <>
                            {equip.status === 'pending approval' ? (
                              <>
                                <TouchableOpacity onPress={() => handleRemoveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50"><Text className="text-red-600 font-bold text-xs">Reject</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleApproveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg bg-green-500"><Text className="text-white font-bold text-xs">Approve</Text></TouchableOpacity>
                              </>
                            ) : equip.status === 'ready for pickup' ? (
                              <>
                                <TouchableOpacity onPress={() => handleConfirmPickup(equip.id)} className="px-3 py-1.5 rounded-lg bg-blue-500 flex-row items-center gap-1"><Feather name="package" size={14} color="white" /><Text className="text-white font-bold text-xs">Confirm Pickup</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleRemoveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white"><Text className="text-gray-700 font-bold text-xs">Cancel</Text></TouchableOpacity>
                              </>
                            ) : (
                              <TouchableOpacity onPress={() => handleRemoveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white"><Text className="text-gray-700 font-bold text-xs">Check-in Item</Text></TouchableOpacity>
                            )}
                          </>
                        ) : (
                          <>
                            {equip.status === 'pending approval' && (
                              <TouchableOpacity onPress={() => handleRemoveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-red-50"><Text className="text-gray-600 font-bold text-xs">Cancel Request</Text></TouchableOpacity>
                            )}
                            {equip.status === 'checked out' && (
                              <TouchableOpacity onPress={() => handleRemoveEquipment(equip.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100"><Text className="text-gray-600 font-bold text-xs">Return Item</Text></TouchableOpacity>
                            )}
                          </>
                        )}
                      </View>
                    </View>
                  )) : (
                    <Text className="text-gray-400 text-center py-4">No equipment requested yet.</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAIS AQUI (Igual ao anterior) */}
      <Modal visible={isEquipModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-3xl p-6 shadow-lg max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4"><Text className="text-xl font-bold text-gray-900">{role === 'tech' ? 'Assign Equipment' : 'Request Equipment'}</Text><TouchableOpacity onPress={() => { setIsEquipModalOpen(false); setEquipSearch(''); }}><Feather name="x" size={24} color="#4B5563" /></TouchableOpacity></View>
            <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 mb-4"><Feather name="search" size={18} color="#9CA3AF" /><TextInput className="flex-1 ml-3 text-base" placeholder="Search by name..." value={equipSearch} onChangeText={setEquipSearch} /></View>
            <ScrollView className="mb-2">
              <View className="gap-3">
                {filteredInventory.map((equip: any) => (
                  <TouchableOpacity key={equip.id} onPress={() => handleAddEquipment(equip)} className="flex-row justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50"><Text className="font-bold text-gray-900">{equip.name}</Text></TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalConfig.isOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-lg items-center">
            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">{modalConfig.type === 'approve' ? 'Approve Proposal?' : 'Confirm?'}</Text>
            <View className="w-full gap-3 mt-4">
              <TouchableOpacity onPress={handleProjectAction} className="w-full py-3 rounded-xl items-center bg-gray-900"><Text className="font-bold text-white">Confirm</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}