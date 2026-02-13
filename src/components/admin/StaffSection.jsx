// ===============================
// StaffSection.jsx - إدارة الموظفين والكاشير
// Staff & Cashier Management Section
// ===============================

import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot 
} from "firebase/firestore";
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserX, 
  Shield,
  DollarSign
} from "lucide-react";

export const StaffSection = ({ db, appId, adminLang = "ar" }) => {
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "cashier",
    phone: "",
    salary: "",
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const t = {
    ar: {
      staffManagement: "إدارة الموظفين",
      addStaff: "إضافة موظف",
      editStaff: "تعديل موظف",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      role: "الدور الوظيفي",
      phone: "رقم الهاتف",
      salary: "الراتب",
      active: "نشط",
      inactive: "غير نشط",
      cashier: "كاشير",
      manager: "مدير",
      admin: "مدير نظام",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      confirmDelete: "هل أنت متأكد من حذف هذا الموظف؟",
      noStaff: "لا يوجد موظفين",
      addFirstStaff: "أضف أول موظف للبدء",
      status: "الحالة",
      actions: "الإجراءات",
      enterUsername: "أدخل اسم المستخدم",
      enterPassword: "أدخل كلمة المرور",
      enterFullName: "أدخل الاسم الكامل",
      enterPhone: "أدخل رقم الهاتف",
      enterSalary: "أدخل الراتب",
      optional: "اختياري",
      required: "مطلوب",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
    },
    en: {
      staffManagement: "Staff Management",
      addStaff: "Add Staff",
      editStaff: "Edit Staff",
      username: "Username",
      password: "Password",
      fullName: "Full Name",
      role: "Role",
      phone: "Phone Number",
      salary: "Salary",
      active: "Active",
      inactive: "Inactive",
      cashier: "Cashier",
      manager: "Manager",
      admin: "Admin",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      confirmDelete: "Are you sure you want to delete this staff member?",
      noStaff: "No staff members",
      addFirstStaff: "Add your first staff member to get started",
      status: "Status",
      actions: "Actions",
      enterUsername: "Enter username",
      enterPassword: "Enter password",
      enterFullName: "Enter full name",
      enterPhone: "Enter phone number",
      enterSalary: "Enter salary",
      optional: "Optional",
      required: "Required",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    tr: {
      staffManagement: "Personel Yönetimi",
      addStaff: "Personel Ekle",
      editStaff: "Personeli Düzenle",
      username: "Kullanıcı Adı",
      password: "Şifre",
      fullName: "Tam Ad",
      role: "Rol",
      phone: "Telefon Numarası",
      salary: "Maaş",
      active: "Aktif",
      inactive: "Pasif",
      cashier: "Kasiyer",
      manager: "Müdür",
      admin: "Yönetici",
      save: "Kaydet",
      cancel: "İptal",
      delete: "Sil",
      edit: "Düzenle",
      confirmDelete: "Bu personeli silmek istediğinizden emin misiniz?",
      noStaff: "Personel yok",
      addFirstStaff: "Başlamak için ilk personelinizi ekleyin",
      status: "Durum",
      actions: "İşlemler",
      enterUsername: "Kullanıcı adını girin",
      enterPassword: "Şifreyi girin",
      enterFullName: "Tam adı girin",
      enterPhone: "Telefon numarasını girin",
      enterSalary: "Maaşı girin",
      optional: "İsteğe Bağlı",
      required: "Gerekli",
      showPassword: "Şifreyi göster",
      hidePassword: "Şifreyi gizle",
    }
  };

  const admT = t[adminLang] || t.ar;

  // Load staff
  useEffect(() => {
    if (!db || !appId) return;

    const unsubscribe = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "staff"),
      (snapshot) => {
        const staffList = [];
        snapshot.forEach((doc) => {
          staffList.push({ id: doc.id, ...doc.data() });
        });
        setStaff(staffList);
      }
    );

    return () => unsubscribe();
  }, [db, appId]);

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "cashier",
      phone: "",
      salary: "",
      isActive: true,
    });
    setShowPassword(false);
  };

  const handleAdd = async () => {
    if (!formData.username || !formData.password || !formData.fullName) {
      alert("الرجاء ملء الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "staff"),
        {
          ...formData,
          createdAt: Date.now(),
        }
      );
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedStaff) return;
    
    setLoading(true);
    try {
      const staffRef = doc(db, "artifacts", appId, "public", "data", "staff", selectedStaff.id);
      await updateDoc(staffRef, {
        ...formData,
        updatedAt: Date.now(),
      });
      resetForm();
      setShowEditModal(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error("Error updating staff:", error);
      alert("حدث خطأ أثناء تحديث الموظف");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm(admT.confirmDelete)) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "staff", staffId));
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("حدث خطأ أثناء حذف الموظف");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      username: staffMember.username,
      password: staffMember.password,
      fullName: staffMember.fullName,
      role: staffMember.role || "cashier",
      phone: staffMember.phone || "",
      salary: staffMember.salary || "",
      isActive: staffMember.isActive !== false,
    });
    setShowEditModal(true);
  };

  const toggleStatus = async (staffMember) => {
    setLoading(true);
    try {
      const staffRef = doc(db, "artifacts", appId, "public", "data", "staff", staffMember.id);
      await updateDoc(staffRef, {
        isActive: !staffMember.isActive,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={adminLang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{admT.staffManagement}</h2>
            <p className="text-sm text-slate-600 font-bold">{staff.length} {admT.staffManagement}</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          {admT.addStaff}
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {staff.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-black text-xl text-slate-900 mb-2">{admT.noStaff}</h3>
            <p className="text-slate-600 font-bold mb-6">{admT.addFirstStaff}</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {admT.addStaff}
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.fullName}</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.username}</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.role}</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.phone}</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.status}</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900">{admT.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{member.fullName}</div>
                    {member.salary && (
                      <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <DollarSign size={12} />
                        {member.salary}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">
                      {member.username}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      member.role === "admin" ? "bg-purple-100 text-purple-700" :
                      member.role === "manager" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {member.role === "admin" ? admT.admin :
                       member.role === "manager" ? admT.manager :
                       admT.cashier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-600">
                      {member.phone || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(member)}
                      disabled={loading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        member.isActive !== false
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {member.isActive !== false ? (
                        <>
                          <UserCheck size={14} />
                          {admT.active}
                        </>
                      ) : (
                        <>
                          <UserX size={14} />
                          {admT.inactive}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                        title={admT.edit}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title={admT.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-2xl mb-6 text-slate-900">
              {showAddModal ? admT.addStaff : admT.editStaff}
            </h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.fullName} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={admT.enterFullName}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.username} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={admT.enterUsername}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.password} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={admT.enterPassword}
                    className={`w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all ${adminLang === "ar" ? "pr-12" : "pl-12"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${adminLang === "ar" ? "right-4" : "left-4"}`}
                    title={showPassword ? admT.hidePassword : admT.showPassword}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.role}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all"
                >
                  <option value="cashier">{admT.cashier}</option>
                  <option value="manager">{admT.manager}</option>
                  <option value="admin">{admT.admin}</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.phone} <span className="text-slate-400">({admT.optional})</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={admT.enterPhone}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  {admT.salary} <span className="text-slate-400">({admT.optional})</span>
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder={admT.enterSalary}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700">
                  {admT.active}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={showAddModal ? handleAdd : handleEdit}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  loading
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                ) : (
                  admT.save
                )}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedStaff(null);
                }}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-all"
              >
                {admT.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};