// ===============================
// InventorySection.jsx - محسّن
// Features: Full Translation + Soft Delete
// ===============================

import React, { useState } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, Edit, Plus, Package, AlertTriangle } from "lucide-react";

export const InventorySection = ({ 
  inventory = [], 
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
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [baselineQuantity, setBaselineQuantity] = useState("");
  const [lowPercent, setLowPercent] = useState("20");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const resetForm = () => {
    setName("");
    setUnit("kg");
    setQuantity("");
    setBaselineQuantity("");
    setLowPercent("20");
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || "");
    setUnit(item.unit || "kg");
    setQuantity(item.quantity || "");
    setBaselineQuantity(item.baselineQuantity || "");
    setLowPercent(item.lowPercent || "20");
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!name || !quantity) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    try {
      const itemData = {
        name,
        unit,
        quantity: Number(quantity),
        baselineQuantity: Number(baselineQuantity) || 0,
        lowPercent: Number(lowPercent) / 100 || 0.2,
        isDeleted: false,
        updatedAt: Date.now(),
        updatedBy: adminSession?.username || "unknown",
      };

      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "inventory", editingId),
          itemData
        );
      } else {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "inventory"), {
          ...itemData,
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

  const openDeleteModal = (item) => {
    setItemToDelete(item);
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
        doc(db, "artifacts", appId, "public", "data", "inventory", itemToDelete.id),
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

  const handleRestore = async (itemId) => {
    if (!confirm(admT?.confirmRestore || "هل تريد استعادة هذا العنصر؟")) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "inventory", itemId),
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

  const handlePermanentDelete = async (itemId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "inventory", itemId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  // Filter items
  const activeItems = inventory.filter(item => !item.isDeleted);
  const deletedItems = inventory.filter(item => item.isDeleted);

  // Calculate alerts
  const lowStockItems = activeItems.filter(item => {
    const qty = Number(item.quantity || 0);
    const base = Number(item.baselineQuantity || 0);
    const percent = Number(item.lowPercent || 0.2);
    return base > 0 && qty > 0 && qty <= base * percent;
  });

  const outOfStockItems = activeItems.filter(item => Number(item.quantity || 0) === 0);

  const getStatusColor = (item) => {
    const qty = Number(item.quantity || 0);
    const base = Number(item.baselineQuantity || 0);
    const percent = Number(item.lowPercent || 0.2);

    if (qty === 0) return "bg-red-100 border-red-300";
    if (base > 0 && qty <= base * percent) return "bg-orange-100 border-orange-300";
    return "bg-white border-slate-200";
  };

  const getStatusBadge = (item) => {
    const qty = Number(item.quantity || 0);
    const base = Number(item.baselineQuantity || 0);
    const percent = Number(item.lowPercent || 0.2);

    if (qty === 0) {
      return (
        <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-black">
          {admT?.outOfStock || "نفذت الكمية"}
        </span>
      );
    }
    if (base > 0 && qty <= base * percent) {
      return (
        <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-black">
          {adminLang === "ar" ? "مخزون منخفض" : adminLang === "tr" ? "Düşük Stok" : "Low Stock"}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
        {adminLang === "ar" ? "متوفر" : adminLang === "tr" ? "Stokta" : "In Stock"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          📦 {admT?.inventorySection || "المخزون"}
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
            {admT?.addInventoryItem || "إضافة صنف للمخزون"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {outOfStockItems.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={20} />
                <h3 className="font-black text-red-900">
                  {admT?.outOfStockItems || "أصناف نفذت"} ({outOfStockItems.length})
                </h3>
              </div>
              <div className="space-y-2">
                {outOfStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="text-sm font-bold text-red-700">
                    • {item.name}
                  </div>
                ))}
                {outOfStockItems.length > 3 && (
                  <div className="text-xs font-bold text-red-600">
                    +{outOfStockItems.length - 3} {adminLang === "ar" ? "المزيد" : "more"}
                  </div>
                )}
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-orange-600" size={20} />
                <h3 className="font-black text-orange-900">
                  {admT?.lowStockItems || "أصناف منخفضة"} ({lowStockItems.length})
                </h3>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} className="text-sm font-bold text-orange-700">
                    • {item.name}: {Number(item.quantity || 0).toFixed(2)} {item.unit}
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <div className="text-xs font-bold text-orange-600">
                    +{lowStockItems.length - 3} {adminLang === "ar" ? "المزيد" : "more"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="text-lg font-black">
            {editingId ? (admT?.edit || "تعديل صنف") : (admT?.addInventoryItem || "إضافة صنف للمخزون")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.inventoryName || "اسم الصنف"} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="دقيق"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.unit || "الوحدة"}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="kg">{adminLang === "ar" ? "كيلوغرام" : "kg"}</option>
                <option value="g">{adminLang === "ar" ? "غرام" : "g"}</option>
                <option value="l">{adminLang === "ar" ? "لتر" : "l"}</option>
                <option value="ml">{adminLang === "ar" ? "ملليلتر" : "ml"}</option>
                <option value="piece">{adminLang === "ar" ? "قطعة" : adminLang === "tr" ? "Adet" : "piece"}</option>
                <option value="box">{adminLang === "ar" ? "صندوق" : adminLang === "tr" ? "Kutu" : "box"}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.quantityAvailable || "الكمية المتوفرة"} *
              </label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.baselineQuantity || "الكمية الأساسية"}
              </label>
              <input
                type="number"
                step="0.01"
                value={baselineQuantity}
                onChange={(e) => setBaselineQuantity(e.target.value)}
                placeholder="500"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                {admT?.lowStockPercent || "نسبة التنبيه للمخزون المنخفض"} (%)
              </label>
              <input
                type="number"
                step="1"
                value={lowPercent}
                onChange={(e) => setLowPercent(e.target.value)}
                placeholder="20"
                className="w-full p-3 rounded-xl border font-bold"
              />
              <p className="text-xs text-slate-500 mt-1 font-bold">
                {adminLang === "ar" 
                  ? "سيظهر تنبيه عندما تصل الكمية إلى هذه النسبة من الكمية الأساسية"
                  : adminLang === "tr"
                  ? "Miktar bu yüzdeye ulaştığında uyarı gösterilir"
                  : "Alert will show when quantity reaches this percentage of baseline"
                }
              </p>
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

      {/* Active Items */}
      {activeItems.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3">
            {admT?.active || "الأصناف النشطة"} ({activeItems.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map((item) => (
              <div key={item.id} className={`border-2 p-4 rounded-2xl hover:shadow-lg transition-all ${getStatusColor(item)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Package className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-bold">
                        {item.unit}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(item)}
                </div>

                <div className="bg-white p-3 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">
                      {admT?.quantityAvailable || "الكمية"}:
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {Number(item.quantity || 0).toFixed(2)} {item.unit}
                    </span>
                  </div>
                  {item.baselineQuantity > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {admT?.baselineQuantity || "الأساسية"}:
                      </span>
                      <span className="text-sm font-bold text-slate-600">
                        {Number(item.baselineQuantity || 0).toFixed(2)} {item.unit}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    {admT?.edit || "تعديل"}
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
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

      {/* Deleted Items */}
      {showDeleted && deletedItems.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3 text-red-600 flex items-center gap-2">
            <Trash2 size={20} />
            {admT?.deletedItems || "الأصناف المحذوفة"} ({deletedItems.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedItems.map((item) => (
              <div key={item.id} className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-lg text-red-900">{item.name}</h4>
                  <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-black text-red-700">
                    {admT?.deleted || "محذوف"}
                  </span>
                </div>

                {item.deleteReason && (
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      {admT?.reasonForDeletion || "سبب الحذف"}:
                    </div>
                    <div className="text-sm font-bold text-red-700">
                      {item.deleteReason}
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-slate-500 mb-3">
                  {admT?.deletedBy || "تم الحذف بواسطة"}: {item.deletedBy || "-"}
                  <br />
                  {admT?.deletionDate || "تاريخ الحذف"}: {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "-"}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={14} />
                    {admT?.restore || "استعادة"}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item.id)}
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
                ? `هل تريد حذف "${itemToDelete?.name}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.name}" silinsin mi?`
                : `Delete "${itemToDelete?.name}"?`
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