import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Passámos a lista para uma variável inicial
const INITIAL_PROJECTS = [
  { id: '1', title: 'Solar-Powered Weather Station', course: 'PECI', group: 'Group 7', desc: 'Building an autonomous outdoor weather station powered by solar panels, using ESP32 and LoRa for wireless data transmission to a central dashboard.', members: 6, equip: 3, status: 'active', isMine: true },
  { id: '2', title: 'Autonomous Rover v2', course: 'PECI', group: 'Group 3', desc: 'Building a self-navigating rover for the campus competition using SLAM and LiDAR.', members: 5, equip: 4, status: 'active', isMine: false },
  { id: '3', title: 'Smart Greenhouse Monitor', course: 'PECI', group: 'Group 4', desc: 'IoT-based environmental monitoring system for the campus greenhouse using LoRa and custom PCBs.', members: 5, equip: 3, status: 'active', isMine: false },
  { id: '4', title: 'Prosthetic Hand Project', course: 'PECI', group: 'Group 13', desc: '3D-printed prosthetic hand with EMG sensor control for low-cost accessibility.', members: 6, equip: 11, status: 'active', isMine: true },
  { id: '5', title: 'CubeSat Structural Testing', course: 'PECI', group: 'Group 7', desc: 'Vibration and thermal testing for the university\'s CubeSat mission payload.', members: 5, equip: 9, status: 'completed', isMine: false },
];

export default function ProjectsPage() {
  const router = useRouter();
  
  // A nossa lista de projetos agora é dinâmica!
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  
  // Estados para os filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [myProjectsOnly, setMyProjectsOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para o formulário do Novo Projeto
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Lógica inteligente de filtragem (agora usa a variável 'projects')
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.course.toLowerCase().includes(search.toLowerCase()) || p.group.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchMine = myProjectsOnly ? p.isMine : true;
    return matchSearch && matchStatus && matchMine;
  });

  // Função para criar o projeto
  const handleCreateProject = () => {
    if (!newTitle) return; // Proteção: exige pelo menos um título

    const newProject = {
      id: Date.now().toString(), // Cria um ID único baseado na hora
      title: newTitle,
      course: newCourse || 'N/A',
      group: newGroup || 'N/A',
      desc: newDesc || 'No description provided.',
      members: 1, // Tu és o criador
      equip: 0,
      status: 'pending', // Projetos novos começam como pendentes!
      isMine: true
    };

    // Adiciona o projeto novo ao topo da lista
    setProjects([newProject, ...projects]);
    
    // Fecha o modal e limpa o formulário
    setIsModalOpen(false);
    setNewTitle(''); setNewCourse(''); setNewGroup(''); setNewDesc('');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-8">
        
        {/* Cabeçalho */}
        <View className="mb-8 flex-col md:flex-row md:justify-between md:items-start gap-4">
          <View>
            <Text className="text-4xl font-bold text-gray-900 mb-2">Projects</Text>
            <Text className="text-gray-500 text-lg">All ongoing and past projects</Text>
          </View>
          
          <View className="flex-row gap-4 items-center">
            <TouchableOpacity 
              onPress={() => setMyProjectsOnly(!myProjectsOnly)}
              className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                myProjectsOnly ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Feather name="bookmark" size={18} color={myProjectsOnly ? 'white' : '#4B5563'} />
              <Text className={`font-bold ${myProjectsOnly ? 'text-white' : 'text-gray-700'}`}>My Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsModalOpen(true)}
              className="flex-row items-center gap-2 px-4 py-3 bg-gray-500 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <Feather name="plus" size={18} color="white" />
              <Text className="font-bold text-white">New Project</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de Pesquisa e Filtros */}
        <View className="flex-row flex-wrap items-center gap-4 mb-8">
          <View className="flex-1 min-w-[250px] flex-row items-center bg-white border border-gray-300 rounded-full px-4 py-3">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-base"
              placeholder="search by name, course or tag..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          
          <View className="flex-row border border-gray-300 rounded-full p-1 bg-gray-50">
            {['All', 'Active', 'Completed', 'Pending'].map((filter) => (
              <TouchableOpacity 
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`px-5 py-2 rounded-full ${statusFilter === filter ? 'bg-white shadow-sm border border-gray-200' : ''}`}
              >
                <Text className={`${statusFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de Projetos */}
        <View className="gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <TouchableOpacity 
                key={project.id} 
                // AQUI ESTÁ A MAGIA! Mandamos os dados todos pelo URL para a página de detalhes!
                onPress={() => router.push({
                  pathname: `/project/${project.id}` as any,
                  params: { 
                    title: project.title, 
                    course: project.course, 
                    group: project.group, 
                    desc: project.desc, 
                    status: project.status 
                  }
                })}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-colors"
              >
                
                <View className="flex-row flex-wrap items-center gap-3 mb-2">
                  <Text className="text-xl font-bold text-gray-900">{project.title}</Text>
                  <View className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full"><Text className="text-xs font-bold text-gray-600">{project.course}</Text></View>
                  <View className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full"><Text className="text-xs font-bold text-gray-600">{project.group}</Text></View>
                </View>

                <Text className="text-gray-500 text-sm mb-4 leading-relaxed" numberOfLines={2}>
                  {project.desc}
                </Text>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center gap-2">
                      <Feather name="users" size={18} color="#9CA3AF" />
                      <Text className="text-gray-600 font-bold">{project.members}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Feather name="cpu" size={18} color="#9CA3AF" />
                      <Text className="text-gray-600 font-bold">{project.equip}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className={`px-4 py-1.5 rounded-full border ${
                      project.status === 'active' ? 'bg-gray-100 border-gray-200' : 
                      project.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-300'
                    }`}>
                      <Text className={`text-xs font-bold uppercase ${project.status === 'pending' ? 'text-yellow-700' : 'text-gray-600'}`}>{project.status}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </View>

              </TouchableOpacity>
            ))
          ) : (
            <View className="py-10 items-center justify-center">
              <Feather name="folder-minus" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 font-medium">No projects found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL POP-UP */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-lg">
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">New Project Proposal</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <Feather name="x" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Project Title</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3" 
                  placeholder="e.g. Autonomous Rover" 
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>
              
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Course/Tag</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3" 
                    placeholder="e.g. PECI"
                    value={newCourse}
                    onChangeText={setNewCourse}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Group</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3" 
                    placeholder="e.g. Group 7"
                    value={newGroup}
                    onChangeText={setNewGroup}
                  />
             </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 h-24" 
                  placeholder="Briefly describe your project goals..."
                  multiline 
                  textAlignVertical="top"
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </View>
            </View>

            <View className="flex-row justify-end gap-3 mt-8">
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-300">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              
              {/* Botão de Gravar */}
              <TouchableOpacity onPress={handleCreateProject} className="px-6 py-3 bg-gray-900 rounded-xl">
                <Text className="font-bold text-white">Submit Proposal</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}