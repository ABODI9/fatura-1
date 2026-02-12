// ===============================
// StaffSection.jsx - إدارة الموظفين
// Features: Add, Edit, Delete Staff
// ===============================

import React, { useState } from "react";
import { UserPlus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { addStaff, updateStaff, deleteStaff } from "../../services/staff";

export const StaffSection = ({
  staffData = [],
  db,
  appId,
  admT,
  adminLang
}) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Add form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("staff");
  const [showPassword, setShowPassword] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("staff");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // =================== ADD STAFF ===================
  const handleAddStaff = async () => {
    const success = await addStaff({
      username: newUsername,
      password: newPassword,
      role: newRole,
      db,
      appId
    });

    if (success) {
      setAddModalOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("staff");
    }
  };

  // =================== EDIT STAFF ===================
  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setEditUsername(staff.username);
    setEditPassword("");
    setEditRole(staff.role);
    setEditModalOpen(true);
  };

  const handleUpdateStaff = async () => {
    const success = await updateStaff({
      staffId: selectedStaff.id,
      username: editUsername,
      password: editPassword,
      role: editRole,
      db,
      appId
    });

    if (success) {
      setEditModalOpen(false);
      setSelectedStaff(null);
      setEditUsername("");
      setEditPassword("");
      setEditRole("staff");
    }
  };

  // =================== DELETE STAFF ===================
  const handleDeleteStaff = async (staffId) => {
    await deleteStaff(staffId, db, appId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          👥 {admT?.staffSection || "إدارة الموظفين"}
        </h2>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white font-bold"
        >
          <UserPlus size={18} />
          {admT?.addStaff || "إضافة موظف"}
        </button>
      </div>

      {/* Staff List */}
      {staffData.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border text-center font-bold text-slate-500">
          {admT?.noStaff || "لا يوجد موظفين"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffData.map((staff) => (
            <div
              key={staff.id}
              className="p-4 rounded-2xl bg-white border-2 border-slate-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-lg">
                    {staff.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">
                      {staff.username}
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      {staff.role === "admin" 
                        ? (admT?.admin || "مدير") 
                        : (admT?.staff || "موظف")}
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-black ${
                  staff.isActive 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {staff.isActive 
                    ? (admT?.active || "نشط") 
                    : (admT?.inactive || "معطل")}
                </div>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-3">
                {admT?.createdAt || "تاريخ الإنشاء"}:{" "}
                {staff.createdAt 
                  ? new Date(staff.createdAt).toLocaleDateString() 
                  : "-"}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(staff)}
                  className="flex-1 py-2 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center gap-1"
                >
                  <Edit2 size={14} />
                  {admT?.edit || "تعديل"}
                </button>
                <button
                  onClick={() => handleDeleteStaff(staff.id)}
                  className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  {admT?.delete || "حذف"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================== ADD MODAL =================== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4">
              {admT?.addStaff || "إضافة موظف"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.username || "اسم المستخدم"} *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={admT?.enterUsername || "أدخل اسم المستخدم"}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.password || "كلمة المرور"} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={admT?.enterPassword || "أدخل كلمة المرور"}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.role || "الدور"}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="staff">{admT?.staff || "موظف"}</option>
                  <option value="admin">{admT?.admin || "مدير"}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStaff}
                className="flex-1 py-3 rounded-xl bg-slate-950 text-white font-black"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setNewUsername("");
                  setNewPassword("");
                  setNewRole("staff");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.cancel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== EDIT MODAL =================== */}
      {editModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4">
              {admT?.editStaff || "تعديل الموظف"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.username || "اسم المستخدم"} *
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.newPassword || "كلمة المرور الجديدة"} ({admT?.optional || "اختياري"})
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={admT?.leaveEmptyToKeep || "اتركه فارغاً للإبقاء على القديمة"}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.role || "الدور"}
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="staff">{admT?.staff || "موظف"}</option>
                  <option value="admin">{admT?.admin || "مدير"}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                className="flex-1 py-3 rounded-xl bg-slate-950 text-white font-black"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedStaff(null);
                  setEditUsername("");
                  setEditPassword("");
                  setEditRole("staff");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.cancel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};