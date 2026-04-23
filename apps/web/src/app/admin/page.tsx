"use client";

import { useState, useEffect, useCallback } from "react";
import { Folder, Cpu, X, Check, Users, Clock, AlertTriangle } from "lucide-react";
import {
  projects as projectsApi,
  requisitions as requisitionsApi,
  equipment as equipmentApi,
  users as usersApi,
  type Project,
  type RequisitionDetail,
  type EquipmentCatalogItem,
} from "@/lib/api";
import Header from "@/app/components/header";
import { useTranslation } from "react-i18next";

export default function TechnicianPortal() {
  const { t } = useTranslation();
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [pendingReqs, setPendingReqs]         = useState<RequisitionDetail[]>([]);
  const [recentActions, setRecentActions]     = useState<Project[]>([]);
  const [projectMembers, setProjectMembers]   = useState<Record<number, number>>({});
  const [projectNames, setProjectNames]       = useState<Record<number, string>>({});
  const [equipmentNames, setEquipmentNames]   = useState<Record<number, string>>({});
  const [userNames, setUserNames]             = useState<Record<number, string>>({});
  const [loading, setLoading]                 = useState(true);
  const [acting, setActing]                   = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    type: "approve_project" | "reject_project" | "approve_req" | "reject_req";
    id: number;
    name: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [allProjects, allReqs] = await Promise.all([
        projectsApi.list(),
        requisitionsApi.list(),
      ]);

      const pNames: Record<number, string> = {};
      allProjects.forEach((p) => { pNames[p.id] = p.name; });
      setProjectNames(pNames);

      const pending = allProjects.filter((p) => p.status === "pending");
      setPendingProjects(pending);

      const memberCounts: Record<number, number> = {};
      await Promise.allSettled(
        pending.map(async (p) => {
          const detail = await projectsApi.get(p.id);
          memberCounts[p.id] = detail.members?.length ?? 0;
        })
      );
      setProjectMembers(memberCounts);

      const pendingRequis = allReqs.filter((r) => r.status === "pending");
      setPendingReqs(pendingRequis);

      const allItems = pendingRequis.flatMap((r) => r.items.filter((i) => i.equipment_id));
      const eNames: Record<number, string> = {};
      await Promise.allSettled(
        allItems.map(async (item) => {
          try {
            const asset = await equipmentApi.get(item.equipment_id!);
            eNames[item.equipment_id!] = asset.name ?? `Asset #${item.equipment_id}`;
          } catch {
            eNames[item.equipment_id!] = `Asset #${item.equipment_id}`;
          }
        })
      );
      setEquipmentNames(eNames);

      const userIds = [...new Set(pendingRequis.map((r) => r.requested_by))];
      const uNames: Record<number, string> = {};
      await Promise.allSettled(
        userIds.map(async (id) => {
          const u = await usersApi.get(id);
          uNames[id] = u.name;
        })
      );
      setUserNames(uNames);

      const actioned = allProjects
        .filter((p) => ["active", "rejected"].includes(p.status))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setRecentActions(actioned);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        await requisitionsApi.approve(confirmModal.id);
      } else if (confirmModal.type === "reject_req") {
        await requisitionsApi.reject(confirmModal.id, "Rejected by lab technician");
      }
      setConfirmModal(null);
      await load();
    } finally { setActing(false); }
  };

  const reqProjectPending = (req: RequisitionDetail) =>
    pendingProjects.some((p) => p.id === req.project_id);

  return (
    <main className="flex-1 p-8 bg-[#f4f5f7] min-h-screen font-sans text-gray-900">
      <Header/>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{t("admin.title")}</h1>
        <p className="text-gray-500 font-medium">{t("admin.subtitle")}</p>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">{t("common.loading")}</div>
      ) : (
        <div className="flex flex-col gap-10">

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Folder size={24} className="text-gray-600" />
              <h2 className="text-xl font-bold">{t("admin.pendingProposals")}</h2>
              <span className="bg-gray-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {pendingProjects.length}
              </span>
            </div>

            {pendingProjects.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("admin.noPendingProposals")}</p>
            ) : (
              pendingProjects.map((proj) => (
                <div key={proj.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{proj.name}</h3>
                      {proj.course && <span className="text-xs text-gray-400 font-medium">{proj.course}</span>}
                    </div>
                    <div className="flex gap-3">
                      <button
                        disabled={acting}
                        onClick={() => setConfirmModal({ type: "reject_project", id: proj.id, name: proj.name })}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <X size={16} /> {t("admin.reject")}
                      </button>
                      <button
                        disabled={acting}
                        onClick={() => setConfirmModal({ type: "approve_project", id: proj.id, name: proj.name })}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Check size={16} /> {t("admin.approve")}
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-4xl">
                    {proj.description || t("admin.noDescription")}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Users size={16} /> {projectMembers[proj.id] ?? "?"} {t("admin.members")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {new Date(proj.created_at).toLocaleDateString("pt-PT")}
                    </div>
                  </div>

                  {proj.tags && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {proj.tags.split(",").map((t) => (
                        <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={24} className="text-gray-600" />
              <h2 className="text-xl font-bold">{t("admin.pendingEquipmentRequests")}</h2>
              <span className="bg-gray-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {pendingReqs.length}
              </span>
            </div>

            {pendingReqs.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("admin.noPendingEquipmentRequests")}</p>
            ) : (
              pendingReqs.map((req) => {
                const blocked = reqProjectPending(req);
                const projectName = projectNames[req.project_id] ?? `Project #${req.project_id}`;
                const requesterName = userNames[req.requested_by] ?? `User #${req.requested_by}`;

                return (
                  <div key={req.id} className={`bg-white border rounded-2xl p-6 shadow-sm mb-4 ${blocked ? "border-yellow-200" : "border-gray-200"}`}>
                    {blocked && (
                      <div className="flex items-center gap-2 text-yellow-600 text-xs font-semibold mb-3 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                        <AlertTriangle size={14} />
                        {t("admin.approveRejectProjectFirst", { projectName })}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-1">
                          {projectName}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          {t("admin.requestedBy")} <span className="font-medium text-gray-600">{requesterName}</span>
                          {" · "}{new Date(req.created_at).toLocaleDateString("pt-PT")}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {req.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                                <Cpu size={12} className="text-gray-400" />
                              </div>
                              <span className="text-gray-700 font-medium">
                                {equipmentNames[item.equipment_id!] ?? `Asset #${item.equipment_id}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!blocked && (
                        <div className="flex gap-3 shrink-0">
                          <button
                            disabled={acting}
                            onClick={() => setConfirmModal({ type: "reject_req", id: req.id, name: projectName })}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <X size={16} /> {t("admin.reject")}
                          </button>
                          <button
                            disabled={acting}
                            onClick={() => setConfirmModal({ type: "approve_req", id: req.id, name: projectName })}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            <Check size={16} /> {t("admin.approve")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4">{t("admin.recentlyActioned")}</h2>
            {recentActions.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("admin.noRecentActions")}</p>
            ) : (
              recentActions.map((p) => (
                <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-gray-800">{p.name}</div>
                    <div className="text-gray-400 text-sm mt-0.5">
                      {p.course && `${p.course} · `}
                      {new Date(p.created_at).toLocaleDateString("pt-PT")}
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 text-[11px] font-bold uppercase rounded-xl border ${
                    p.status === "active"
                      ? "bg-green-50 border-green-100 text-green-600"
                      : "bg-red-50 border-red-100 text-red-500"
                  }`}>
                    {t(`statistics.status.${p.status}`, p.status)}
                  </span>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-2">
              {confirmModal.type.startsWith("approve") ? t("admin.confirmApproval") : t("admin.confirmRejection")}
            </h2>
            <p className="text-gray-500 mb-6">
              {confirmModal.type.startsWith("approve") ? t("admin.confirmApproveText") + " " : t("admin.confirmRejectText") + " "}
              <span className="font-semibold text-gray-700">{confirmModal.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50"
              >
                {t("admin.cancel")}
              </button>
              <button
                disabled={acting}
                onClick={handleConfirm}
                className={`px-6 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                  confirmModal.type.startsWith("approve")
                    ? "bg-gray-900 hover:bg-gray-700"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {acting ? t("admin.processing") : confirmModal.type.startsWith("approve") ? t("admin.approve") : t("admin.reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}