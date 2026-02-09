// ===============================
// VendorsSection.jsx - محسّن
// Features: Full Translation + Soft Delete
// ===============================

import React, { useState } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, Edit, Plus, Truck } from "lucide-react";

export const VendorsSection = ({ 
  vendors = [], 
  admT, 
  adminLang, 
  db, 
  appId,
  adminSession 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setContactPerson("");
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setName(vendor.name || "");
    setEmail(vendor.email || "");
    setPhone(vendor.phone || "");
    setAddress(vendor.address || "");
    setContactPerson(vendor.contactPerson || "");
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!name) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    try {
      const vendorData = {
        name,
        email: email || "",
        phone: phone || "",
        address: address || "",
        contactPerson: contactPerson || "",
        isDeleted: false,
        updatedAt: Date.now(),
        updatedBy: adminSession?.username || "unknown",
      };

      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "vendors", editingId),
          vendorData
        );
      } else {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "vendors"), {
          ...vendorData,
          createdAt: Date.now(),
          createdBy: adminSession?.username || "unknown",
        });
      }

      resetForm();
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ أثناء الحفظ");
    }
  };

  const openDeleteModal = (vendor) => {
    setItemToDelete(vendor);
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  const handleSoftDelete = async () => {
    if (!deleteReason.trim()) {
      alert(admT?.required || "مطلوب");
      return;
    }

    if (!itemToDelete) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "vendors", itemToDelete.id),
        {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: adminSession?.username || "unknown",
          deleteReason: deleteReason.trim(),
        }
      );

      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteReason("");
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ أثناء الحذف");
    }
  };

  const handleRestore = async (vendorId) => {
    if (!confirm(admT?.confirmRestore || "هل تريد استعادة هذا العنصر؟")) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "vendors", vendorId),
        {
          isDeleted: false,
          restoredAt: Date.now(),
          restoredBy: adminSession?.username || "unknown",
        }
      );
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const handlePermanentDelete = async (vendorId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "vendors", vendorId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  // Filter vendors
  const activeVendors = vendors.filter(v => !v.isDeleted);
  const deletedVendors = vendors.filter(v => v.isDeleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          🚚 {admT?.vendorsSection || "الموردين"}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-all"
          >
            {showDeleted ? <EyeOff size={18} /> : <Eye size={18} />}
            {showDeleted ? (admT?.hideDeleted || "إخفاء المحذوفات") : (admT?.showDeleted || "إظهار المحذوفات")}
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-black hover:bg-slate-800 transition-all"
          >
            <Plus size={20} />
            {admT?.addNewVendor || "إضافة مورد جديد"}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="text-lg font-black">
            {editingId ? (admT?.edit || "تعديل مورد") : (admT?.addNewVendor || "إضافة مورد جديد")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.vendorName || "اسم المورد"} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="شركة التوريدات المحدودة"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.contactPerson || "جهة الاتصال"}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.email || "البريد الإلكتروني"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@supplier.com"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.phone || "الهاتف"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 555 123 4567"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                {admT?.address || "العنوان"}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اسطنبول، تركيا"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black"
            >
              {editingId ? (admT?.saveChanges || "حفظ التعديلات") : (admT?.save || "حفظ")}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
            >
              {admT?.cancel || "إلغاء"}
            </button>
          </div>
        </div>
      )}

      {/* Active Vendors */}
      {activeVendors.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3">
            {admT?.active || "الموردون النشطون"} ({activeVendors.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white border p-4 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Truck className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{vendor.name}</h4>
                      {vendor.contactPerson && (
                        <p className="text-xs text-slate-500 font-bold">
                          👤 {vendor.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {vendor.email && (
                  <div className="text-sm font-bold text-slate-600 mb-2">
                    ✉️ {vendor.email}
                  </div>
                )}

                {vendor.phone && (
                  <div className="text-sm font-bold text-slate-600 mb-2">
                    📞 {vendor.phone}
                  </div>
                )}

                {vendor.address && (
                  <div className="text-sm font-bold text-slate-600 mb-3">
                    📍 {vendor.address}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    {admT?.edit || "تعديل"}
                  </button>
                  <button
                    onClick={() => openDeleteModal(vendor)}
                    className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} />
                    {admT?.delete || "حذف"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deleted Vendors */}
      {showDeleted && deletedVendors.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3 text-red-600 flex items-center gap-2">
            <Trash2 size={20} />
            {admT?.deletedItems || "الموردون المحذوفون"} ({deletedVendors.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedVendors.map((vendor) => (
              <div key={vendor.id} className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-lg text-red-900">{vendor.name}</h4>
                  <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-black text-red-700">
                    {admT?.deleted || "محذوف"}
                  </span>
                </div>

                {vendor.deleteReason && (
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      {admT?.reasonForDeletion || "سبب الحذف"}:
                    </div>
                    <div className="text-sm font-bold text-red-700">
                      {vendor.deleteReason}
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-slate-500 mb-3">
                  {admT?.deletedBy || "تم الحذف بواسطة"}: {vendor.deletedBy || "-"}
                  <br />
                  {admT?.deletionDate || "تاريخ الحذف"}: {vendor.deletedAt ? new Date(vendor.deletedAt).toLocaleString() : "-"}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(vendor.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={14} />
                    {admT?.restore || "استعادة"}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(vendor.id)}
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black"
                  >
                    {admT?.delete || "حذف نهائي"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4 text-red-700">
              {admT?.confirmDelete || "تأكيد الحذف"}
            </h3>
            
            <p className="font-bold text-slate-700 mb-4">
              {adminLang === "ar" 
                ? `هل تريد حذف المورد "${itemToDelete?.name}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.name}" tedarikçisini silmek istiyor musunuz?`
                : `Delete vendor "${itemToDelete?.name}"?`
              }
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-red-700">
                {admT?.reasonForDeletion || "سبب الحذف"} *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={admT?.enterReason || "أدخل سبب الحذف"}
                rows={3}
                className="w-full p-3 rounded-xl border border-red-300 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSoftDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black"
              >
                {admT?.delete || "حذف"}
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                  setDeleteReason("");
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