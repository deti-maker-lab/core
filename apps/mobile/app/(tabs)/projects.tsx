import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Imagens reais baseadas no nome do projeto
const getProjectImage = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('weather') || t.includes('solar')) return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop';
  if (t.includes('drone')) return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop';
  if (t.includes('greenhouse')) return 'https://images.unsplash.com/photo-1530836369250-ef71a3a5a4fda?q=80&w=800&auto=format&fit=crop';
  if (t.includes('prosthetic') || t.includes('hand')) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop';
};

export default function ProjectsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role, currentUserName, projects, setProjects } = useAuth(); 
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [myProjectsOnly, setMyProjectsOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do formulário 
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const [memberInput, setMemberInput] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // ==========================================
  // ATUALIZAÇÃO DA MEMÓRIA GLOBAL (A TUA LÓGICA ORIGINAL)
  // ==========================================
  useEffect(() => {
    if (params.deletedId) {
      setProjects(projects.filter((p: any) => p.id !== params.deletedId));
    }
    if (params.approvedId) {
      setProjects(projects.map((p: any) => p.id === params.approvedId ? { ...p, status: 'active' } : p));
    }
    if (params.rejectedId) {
      setProjects(projects.map((p: any) => p.id === params.rejectedId ? { ...p, status: 'rejected' } : p));
    }
  }, [params.deletedId, params.approvedId, params.rejectedId]);

  const filteredProjects = projects.filter((p: any) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.course.toLowerCase().includes(search.toLowerCase()) || p.group.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchMine = myProjectsOnly ? p.isMine : true;
    return matchSearch && matchStatus && matchMine;
  });

  const handleAddMember = () => {
    if (memberInput.trim() !== '') {
      setTeamMembers([...teamMembers, memberInput.trim()]);
      setMemberInput(''); 
    }
  };

  const handleRemoveMember = (indexToRemove: number) => {
    setTeamMembers(teamMembers.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateProject = () => {
    if (!newTitle) return;

    const newProject = {
      id: Date.now().toString(),
      title: newTitle,
      course: newCourse || 'N/A',
      group: newGroup || 'N/A',
      desc: newDesc || 'No description provided.',
      members: teamMembers.length + 1,
      equip: 0,
      status: role === 'tech' ? 'active' : 'pending',
      isMine: true,
      team: [currentUserName, ...teamMembers]
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    
    setNewTitle(''); setNewCourse(''); setNewGroup(''); setNewDesc('');
    setTeamMembers([]); setMemberInput('');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4 md:p-8">
        
        {/* CABEÇALHO */}
        <View className="mb-8 flex-col md:flex-row md:justify-between md:items-start gap-6">
          <View>
            <Text className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {role === 'tech' ? 'Manage Projects' : 'Projects'}
            </Text>
            <Text className="text-gray-500 text-lg">
              {role === 'tech' ? 'Review proposals and monitor active projects' : 'All ongoing and past projects'}
            </Text>
          </View>
          
          {role === 'student' && (
            <View className="flex-row gap-4 items-center">
              <TouchableOpacity 
                onPress={() => setMyProjectsOnly(!myProjectsOnly)}
                className={`flex-row items-center gap-2 px-5 py-3.5 rounded-2xl border transition-colors shadow-sm ${
                  myProjectsOnly ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Feather name="bookmark" size={18} color={myProjectsOnly ? 'white' : '#4B5563'} />
                <Text className={`font-bold ${myProjectsOnly ? 'text-white' : 'text-gray-700'}`}>My Projects</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsModalOpen(true)}
                className="flex-row items-center gap-2 px-6 py-3.5 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                <Feather name="plus" size={18} color="white" />
                <Text className="font-bold text-white text-base">New Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* BARRA DE PESQUISA E FILTROS */}
        <View className="flex-row flex-wrap items-center gap-4 mb-8">
          <View className="flex-1 min-w-[250px] flex-row items-center bg-white border border-gray-200 rounded-2xl px-5 py-3.5 shadow-sm">
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="search by name, course or tag..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View className="flex-row flex-wrap border border-gray-200 rounded-2xl p-1.5 bg-white shadow-sm">
            {['All', 'Active', 'Completed', 'Pending', 'Rejected'].map((filter) => (
              <TouchableOpacity 
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`px-5 py-2.5 rounded-xl transition-all ${statusFilter === filter ? 'bg-gray-100' : ''}`}
              >
                <Text className={`${statusFilter === filter ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GRELHA DE PROJETOS MODERNA */}
        <View className="flex-row flex-wrap gap-5">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project: any) => (
              <TouchableOpacity 
                key={project.id} 
                // AQUI ESTÁ O TEU CÓDIGO ORIGINAL QUE ENVIA OS PARAMS CERTOS!
                onPress={() => router.push({
                  pathname: `/project/${project.id}` as any,
                  params: { 
                    title: project.title, 
                    course: project.course, 
                    group: project.group, 
                    desc: project.desc, 
                    status: project.status, 
                    team: JSON.stringify(project.team || []) 
                  }
                })}
                className={`w-full md:w-[48%] xl:w-[32%] bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  project.status === 'rejected' ? 'border-red-100 opacity-80' : 'border-gray-100'
                }`}
              >
                {/* IMAGEM DO PROJETO */}
                <View className="relative w-full h-48 bg-gray-200">
                  <Image source={{ uri: getProjectImage(project.title) }} className="w-full h-full" resizeMode="cover" />
                  
                  <View className="absolute top-4 right-4">
                    <View className={`px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md ${
                      project.status === 'active' ? 'bg-green-100/90 border-green-200' : 
                      project.status === 'pending' ? 'bg-yellow-100/90 border-yellow-200' : 
                      project.status === 'rejected' ? 'bg-red-100/90 border-red-200' :
                      'bg-gray-100/90 border-gray-200'
                    }`}>
                      <Text className={`text-xs font-bold uppercase ${
                        project.status === 'active' ? 'text-green-800' : 
                        project.status === 'pending' ? 'text-yellow-800' : 
                        project.status === 'rejected' ? 'text-red-800' :
                        'text-gray-800'
                      }`}>{project.status}</Text>
                    </View>
                  </View>
                </View>

                <View className="p-6">
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                      <Text className="text-[10px] font-bold text-blue-700 uppercase">{project.course}</Text>
                    </View>
                    <View className="bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                      <Text className="text-[10px] font-bold text-gray-600 uppercase">{project.group}</Text>
                    </View>
                    {project.isMine && (
                      <View className="bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                        <Text className="text-[10px] font-bold text-purple-700 uppercase">Mine</Text>
                      </View>
                    )}
                  </View>

                  <Text className={`text-xl font-bold mb-2 leading-tight ${project.status === 'rejected' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {project.title}
                  </Text>
                  <Text className="text-gray-500 text-sm mb-6 leading-relaxed" numberOfLines={2}>
                    {project.desc}
                  </Text>

                  <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-2">
                        <Feather name="users" size={16} color="#9CA3AF" />
                        <Text className="text-gray-600 font-bold">{project.members}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Feather name="cpu" size={16} color="#9CA3AF" />
                        <Text className="text-gray-600 font-bold">{project.equip}</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-full py-20 items-center justify-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Feather name="folder-minus" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">No projects found.</Text>
              <Text className="text-gray-500">Try adjusting your filters or search query.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE NOVO PROJETO (A Tua Lógica Original, com Estética Nova!) */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90%]">
            
            <View className="px-6 py-5 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="text-xl font-extrabold text-gray-900">New Project</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <Feather name="x" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="p-6">
              <View className="gap-5 pb-6">
                <View>
                  <Text className="text-sm font-bold text-gray-700 mb-2">Project Title *</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" placeholder="e.g. Autonomous Rover" value={newTitle} onChangeText={setNewTitle} />
                </View>
                
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Course</Text>
                    <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" placeholder="e.g. PECI" value={newCourse} onChangeText={setNewCourse} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-700 mb-2">Group Number</Text>
                    <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" placeholder="e.g. Group 7" value={newGroup} onChangeText={setNewGroup} />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                  <TextInput className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base h-28 text-left align-top focus:border-blue-500 focus:bg-white transition-colors" placeholder="Describe the project goals..." multiline numberOfLines={4} value={newDesc} onChangeText={setNewDesc} />
                </View>

                <View className="mt-2 border-t border-gray-100 pt-5">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Team Members</Text>
                  
                  <View className="flex-row gap-2 mb-3">
                    <TextInput className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-blue-500 focus:bg-white transition-colors" placeholder="Add member email..." value={memberInput} onChangeText={setMemberInput} onSubmitEditing={handleAddMember} />
                    <TouchableOpacity onPress={handleAddMember} className="bg-gray-900 px-5 items-center justify-center rounded-xl hover:bg-gray-800">
                      <Text className="font-bold text-white">Add</Text>
                    </TouchableOpacity>
                  </View>

                  {teamMembers.length > 0 && (
                    <View className="gap-2">
                      {teamMembers.map((member, index) => (
                        <View key={index} className="flex-row items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-blue-200 rounded-full items-center justify-center">
                              <Text className="font-bold text-blue-700">{member.charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text className="text-blue-900 font-medium">{member}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveMember(index)} className="p-2">
                            <Feather name="x" size={18} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateProject} className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                <Text className="font-bold text-white">Submit Request</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}