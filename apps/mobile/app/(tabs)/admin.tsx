import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Modal
} from "react-native";
import { Folder, Cpu, Check, X, AlertTriangle, Users, Clock } from "lucide-react-native";
import { 
  projects as projectsApi, 
  requisitions as reqApi, 
  users as usersApi, 
  equipment as equipmentApi, 
  type Project, 
  type Requisition 
} from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";

type ModalState = {
  type: "approve_project" | "reject_project" | "approve_req" | "reject_req";
  id: number;
  name: string;
};

export default function AdminPage() {
  const { role } = useAuth();
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [pendingReqs, setPendingReqs]         = useState<Requisition[]>([]);
  const [recentActions, setRecentActions]     = useState<Project[]>([]);
  
  const [projectMembers, setProjectMembers]   = useState<Record<number, number>>({});
  const [projectNames, setProjectNames]       = useState<Record<number, string>>({});
  const [assetNames, setAssetNames]           = useState<Record<number, string>>({});
  const [userNames, setUserNames]             = useState<Record<number, string>>({});
  
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing]         = useState(false);

  const [confirmModal, setConfirmModal] = useState<ModalState | null>(null);

  const load = useCallback(async () => {
    try {
      const [allProjects, allReqs] = await Promise.all([projectsApi.list(), reqApi.list()]);
      
      const pNames: Record<number, string> = {};
      allProjects.forEach((p) => { pNames[p.id] = p.name; });
      setProjectNames(pNames);

      const pending = allProjects.filter((p) => p.status === "pending");
      setPendingProjects(pending);

      const memberCounts: Record<number, number> = {};
      await Promise.allSettled(
        pending.map(async (p) => {
          try {
            const detail = await projectsApi.get(p.id);
            memberCounts[p.id] = (detail as any).members?.length ?? 0;
          } catch {
            memberCounts[p.id] = 0;
          }
        })
      );
      setProjectMembers(memberCounts);

      const pendingRequis = (allReqs as Requisition[]).filter((r) => r.status === "pending");
      setPendingReqs(pendingRequis);

      const assetIds = [...new Set(pendingRequis.map((r) => r.snipeit_asset_id).filter((x): x is number => x != null))];
      const aNames: Record<number, string> = {};
      await Promise.allSettled(assetIds.map(async (id) => {
        try { const a = await equipmentApi.get(id); aNames[id] = a.name ?? `Asset #${id}`; }
        catch { aNames[id] = `Asset #${id}`; }
      }));
      setAssetNames(aNames);

      const userIds = [...new Set(pendingRequis.map((r) => r.requested_by))];
      const uNames: Record<number, string> = {};
      await Promise.allSettled(userIds.map(async (id) => {
        try { const u = await usersApi.get(id); uNames[id] = u.name; }
        catch { uNames[id] = `User #${id}`; }
      }));
      setUserNames(uNames);

      const actioned = allProjects
        .filter((p) => ["active", "rejected"].includes((p.status || "").toLowerCase()))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 10);
      setRecentActions(actioned);

    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setActing(true);
    try {
      if (confirmModal.type === "approve_project") {
        await projectsApi.updateStatus(confirmModal.id, "active");
      } else if (confirmModal.type === "reject_project") {
        await projectsApi.updateStatus(confirmModal.id, "rejected");
      } else if (confirmModal.type === "approve_req") {
        await reqApi.approve(confirmModal.id);
      } else if (confirmModal.type === "reject_req") {
        await reqApi.reject(confirmModal.id, "Rejected by lab technician");
      }
      setConfirmModal(null);
      await load();
    } finally { 
      setActing(false); 
    }
  };

  const reqProjectPending = (req: Requisition) => pendingProjects.some((p) => p.id === req.project_id);

  if (loading) return <View className="flex-1 items-center justify-center bg-[#f4f5f7]"><ActivityIndicator size="large" color="#111827" /></View>;

  return (
    <View className="flex-1 bg-[#f4f5f7]">
      <Header />
      
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-1">Admin Portal</Text>
          <Text className="text-sm font-medium text-gray-500">Review and approve pending requests</Text>
        </View>

        {/* Pending Projects Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <Folder size={24} color="#4B5563" />
            <Text className="text-xl font-bold text-gray-900">Pending Proposals</Text>
            <View className="bg-gray-500 w-6 h-6 items-center justify-center rounded-full">
              <Text className="text-white text-xs font-bold">{pendingProjects.length}</Text>
            </View>
          </View>

          {pendingProjects.length === 0 ? (
            <Text className="text-gray-400 text-sm">No pending proposals.</Text>
          ) : pendingProjects.map((proj) => (
            <View key={proj.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-bold text-gray-900 mb-0.5">{proj.name}</Text>
                  {proj.course && <Text className="text-xs font-medium text-gray-400">{proj.course}</Text>}
                </View>
                
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    disabled={acting}
                    onPress={() => setConfirmModal({ type: "reject_project", id: proj.id, name: proj.name })}
                    className="p-2 border border-gray-200 rounded-xl"
                  >
                    <X size={20} color="#4B5563" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={acting}
                    onPress={() => setConfirmModal({ type: "approve_project", id: proj.id, name: proj.name })}
                    className="p-2 bg-gray-900 rounded-xl"
                  >
                    <Check size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-sm text-gray-500 mb-4 leading-relaxed" numberOfLines={3}>
                {proj.description ?? "No description provided."}
              </Text>

              <View className="flex-row items-center gap-6 mb-1">
                <View className="flex-row items-center gap-2">
                  <Users size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-500">{projectMembers[proj.id] ?? "?"} members</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-500">
                    {proj.created_at ? new Date(proj.created_at).toLocaleDateString("en-GB") : "Unknown"}
                  </Text>
                </View>
              </View>

              {proj.tags && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                  {proj.tags.split(",").map((tag, idx) => (
                    <View key={idx} className="px-3 py-1 bg-gray-100 rounded-full">
                      <Text className="text-xs font-bold text-gray-600">{tag.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <Cpu size={24} color="#4B5563" />
            <Text className="text-xl font-bold text-gray-900">Equipment Requests</Text>
            <View className="bg-gray-500 w-6 h-6 items-center justify-center rounded-full">
              <Text className="text-white text-xs font-bold">{pendingReqs.length}</Text>
            </View>
          </View>

          {pendingReqs.length === 0 ? (
            <Text className="text-gray-400 text-sm">No pending equipment requests.</Text>
          ) : pendingReqs.map((req) => {
            const blocked     = reqProjectPending(req);
            const projectName = projectNames[req.project_id] ?? `Project #${req.project_id}`;
            const requester   = userNames[req.requested_by] ?? `User #${req.requested_by}`;
            const assetName   = req.snipeit_asset_id ? (assetNames[req.snipeit_asset_id] ?? `Asset #${req.snipeit_asset_id}`) : "Unknown asset";

            return (
              <View key={req.id} className={`bg-white border rounded-3xl p-6 shadow-sm mb-4 ${blocked ? "border-yellow-200" : "border-gray-200"}`}>
                {blocked && (
                  <View className="flex-row items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2.5 mb-4">
                    <AlertTriangle size={14} color="#D97706" />
                    <Text className="text-yellow-600 text-xs font-semibold flex-1">
                      Approve or reject the project first
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-start gap-4">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900 mb-1">{projectName}</Text>
                    <Text className="text-sm text-gray-400 mb-3">
                      Requested by <Text className="font-medium text-gray-600">{requester}</Text> · {new Date(req.created_at).toLocaleDateString("en-GB")}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      <View className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                        <Cpu size={14} color="#9CA3AF" />
                      </View>
                      <Text className="text-sm font-medium text-gray-700">{assetName}</Text>
                      {req.snipeit_asset_id && (
                        <Text className="text-xs text-gray-400 font-mono">#{req.snipeit_asset_id}</Text>
                      )}
                    </View>
                  </View>

                  {!blocked && (
                    <View className="flex-row gap-2 shrink-0">
                      <TouchableOpacity
                        disabled={acting}
                        onPress={() => setConfirmModal({ type: "reject_req", id: req.id, name: projectName })}
                        className="p-2 border border-gray-200 rounded-xl"
                      >
                        <X size={20} color="#4B5563" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={acting}
                        onPress={() => setConfirmModal({ type: "approve_req", id: req.id, name: projectName })}
                        className="p-2 bg-gray-900 rounded-xl"
                      >
                        <Check size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Recently Actioned</Text>
          {recentActions.length === 0 ? (
            <Text className="text-gray-400 text-sm">No recent actions.</Text>
          ) : recentActions.map((p) => (
            <View key={p.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex-row justify-between items-center mb-3">
              <View className="flex-1 pr-3">
                <Text className="font-bold text-gray-800" numberOfLines={1}>{p.name}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {p.course && `${p.course} · `}
                  {p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : ""}
                </Text>
              </View>
              <View className={`px-4 py-1.5 rounded-xl border ${p.status === "active" ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                <Text className={`text-[10px] font-bold uppercase ${p.status === "active" ? "text-green-600" : "text-red-500"}`}>
                  {p.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!confirmModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full max-w-sm rounded-[24px] p-6 shadow-xl">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {confirmModal?.type.startsWith("approve") ? "Confirm Approval" : "Confirm Rejection"}
            </Text>
            <Text className="text-gray-500 mb-6 leading-relaxed">
              {confirmModal?.type.startsWith("approve") 
                ? "Are you sure you want to approve " 
                : "Are you sure you want to reject "}
              <Text className="font-bold text-gray-700">{confirmModal?.name}</Text>?
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setConfirmModal(null)}
                className="px-5 py-3 border border-gray-200 rounded-xl"
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={acting}
                onPress={handleConfirm}
                className={`px-5 py-3 rounded-xl justify-center items-center ${confirmModal?.type.startsWith("approve") ? "bg-gray-900" : "bg-red-500"}`}
              >
                <Text className="text-white font-semibold">
                  {acting ? "Processing..." : confirmModal?.type.startsWith("approve") ? "Approve" : "Reject"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}