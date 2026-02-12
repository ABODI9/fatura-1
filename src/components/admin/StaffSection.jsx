// ===============================
// StaffSection.jsx - FIXED - إدارة الموظفين
// Complete with inline Firebase operations
// ===============================

import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users,
  CheckCircle,
  XCircle
} from "lucide-react";

export const StaffSection = ({ db, appId, admT, adminLang }) => {
  const [staff, setStaff] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Add form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("cashier");
  const [showPassword, setShowPassword] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("cashier");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Load staff from Firebase
  useEffect(() => {
    if (!db || !appId) return;

    const staffRef = collection(db, "artifacts", appId, "public", "data", "staff");
    
    const unsubscribe = onSnapshot(staffRef, (snapshot) => {
      const staffList = [];
      snapshot.forEach((doc) => {
        staffList.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      staffList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setStaff(staffList);
    });

    return () => unsubscribe();
  }, [db, appId]);

  // =================== ADD STAFF ===================
  const handleAddStaff = async () => {
    if (!newUsername.trim()) {
      alert(admT?.usernameRequired || "اسم المستخدم مطلوب");
      return;
    }

    if (!newPassword.trim()) {
      alert(admT?.passwordRequired || "كلمة المرور مطلوبة");
      return;
    }

    try {
      // Check if username already exists
      const staffRef = collection(db, "artifacts", appId, "public", "data", "staff");
      const q = query(staffRef, where("username", "==", newUsername.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        alert(admT?.usernameExists || "اسم المستخدم موجود مسبقاً");
        return;
      }

      // Add new staff
      await addDoc(staffRef, {
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole,
        isActive: true,
        createdAt: Date.now()
      });

      alert(admT?.staffAdded || "تم إضافة الموظف بنجاح");
      
      // Reset form
      setAddModalOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewRole("cashier");
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Error: " + error.message);
    }
  };

  // =================== EDIT STAFF ===================
  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setEditUsername(staffMember.username);
    setEditPassword("");
    setEditRole(staffMember.role || "cashier");
    setEditModalOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editUsername.trim()) {
      alert(admT?.usernameRequired || "اسم المستخدم مطلوب");
      return;
    }

    try {
      // Check if username exists (excluding current staff)
      const staffRef = collection(db, "artifacts", appId, "public", "data", "staff");
      const q = query(staffRef, where("username", "==", editUsername.trim()));
      const querySnapshot = await getDocs(q);
      
      const exists = querySnapshot.docs.some(doc => doc.id !== selectedStaff.id);
      if (exists) {
        alert(admT?.usernameExists || "اسم المستخدم موجود مسبقاً");
        return;
      }

      // Update staff
      const staffDocRef = doc(db, "artifacts", appId, "public", "data", "staff", selectedStaff.id);
      
      const updateData = {
        username: editUsername.trim(),
        role: editRole,
        updatedAt: Date.now()
      };

      // Only update password if provided
      if (editPassword.trim()) {
        updateData.password = editPassword.trim();
      }

      await updateDoc(staffDocRef, updateData);

      alert(admT?.staffUpdated || "تم تحديث الموظف بنجاح");
      
      // Reset form
      setEditModalOpen(false);
      setSelectedStaff(null);
      setEditUsername("");
      setEditPassword("");
      setEditRole("cashier");
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("Error: " + error.message);
    }
  };

  // =================== DELETE STAFF ===================
  const handleDeleteStaff = async (staffId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من حذف هذا الموظف؟")) {
      return;
    }

    try {
      const staffDocRef = doc(db, "artifacts", appId, "public", "data", "staff", staffId);
      await deleteDoc(staffDocRef);
      
      alert(admT?.staffDeleted || "تم حذف الموظف بنجاح");
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Users className="text-orange-600" size={28} />
          {admT?.staffSection || "إدارة الموظفين"}
        </h2>
        
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={20} />
          {admT?.addStaff || "إضافة موظف"}
        </button>
      </div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-bold">
            {admT?.noStaff || "لا يوجد موظفين حالياً"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${
                    member.isActive !== false 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {member.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 flex items-center gap-2">
                      {member.username}
                      {member.isActive !== false ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <XCircle size={14} className="text-red-600" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      {member.role === "cashier" 
                        ? (admT?.cashier || "كاشير") 
                        : (admT?.manager || "مدير")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-3">
                {admT?.createdAt || "تاريخ الإضافة"}:{" "}
                {member.createdAt 
                  ? new Date(member.createdAt).toLocaleDateString(
                      adminLang === "ar" ? "ar-SA" : adminLang === "tr" ? "tr-TR" : "en-US"
                    )
                  : "-"}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
                >
                  <Edit2 size={14} />
                  {admT?.edit || "تعديل"}
                </button>
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-1"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
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
                    className="w-full p-3 pr-12 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
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
                  {admT?.role || "الصلاحية"}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
                >
                  <option value="cashier">{admT?.cashier || "كاشير"}</option>
                  <option value="manager">{admT?.manager || "مدير"}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStaff}
                className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-black hover:bg-orange-700 transition-all"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setNewUsername("");
                  setNewPassword("");
                  setNewRole("cashier");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black hover:bg-slate-200 transition-all"
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
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
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
                    className="w-full p-3 pr-12 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
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
                  {admT?.role || "الصلاحية"}
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none"
                >
                  <option value="cashier">{admT?.cashier || "كاشير"}</option>
                  <option value="manager">{admT?.manager || "مدير"}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-black hover:bg-orange-700 transition-all"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedStaff(null);
                  setEditUsername("");
                  setEditPassword("");
                  setEditRole("cashier");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black hover:bg-slate-200 transition-all"
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