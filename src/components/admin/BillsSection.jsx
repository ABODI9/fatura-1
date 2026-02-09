// ===============================
// BillsSection.jsx - محسّن
// Features: Full Translation + Soft Delete
// ===============================

import React, { useState } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, Edit, Plus, Receipt, DollarSign } from "lucide-react";

export const BillsSection = ({ 
  bills = [], 
  vendors = [],
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
  const [vendorId, setVendorId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ inventoryId: "", quantity: 1, price: 0 }]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const resetForm = () => {
    setVendorId("");
    setBillNumber("");
    setBillDate("");
    setDueDate("");
    setItems([{ inventoryId: "", quantity: 1, price: 0 }]);
    setNotes("");
    setStatus("pending");
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (bill) => {
    setEditingId(bill.id);
    setVendorId(bill.vendorId || "");
    setBillNumber(bill.billNumber || "");
    setBillDate(bill.billDate || "");
    setDueDate(bill.dueDate || "");
    setItems(bill.items || [{ inventoryId: "", quantity: 1, price: 0 }]);
    setNotes(bill.notes || "");
    setStatus(bill.status || "pending");
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!vendorId || !billNumber || !billDate) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    try {
      const billData = {
        vendorId,
        billNumber,
        billDate,
        dueDate: dueDate || billDate,
        items,
        notes: notes || "",
        status,
        total,
        isDeleted: false,
        updatedAt: Date.now(),
        updatedBy: adminSession?.username || "unknown",
      };

      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "bills", editingId),
          billData
        );
      } else {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "bills"), {
          ...billData,
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

  const openDeleteModal = (bill) => {
    setItemToDelete(bill);
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
        doc(db, "artifacts", appId, "public", "data", "bills", itemToDelete.id),
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

  const handleRestore = async (billId) => {
    if (!confirm(admT?.confirmRestore || "هل تريد استعادة هذا العنصر؟")) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "bills", billId),
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

  const handlePermanentDelete = async (billId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "bills", billId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const addItem = () => {
    setItems([...items, { inventoryId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const getVendorName = (id) => {
    const vendor = vendors.find(v => v.id === id);
    return vendor?.name || (adminLang === "ar" ? "غير معروف" : adminLang === "tr" ? "Bilinmeyen" : "Unknown");
  };

  const getInventoryName = (id) => {
    const inv = inventory.find(i => i.id === id);
    return inv?.name || (adminLang === "ar" ? "غير معروف" : adminLang === "tr" ? "Bilinmeyen" : "Unknown");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      ar: { pending: "قيد الانتظار", paid: "مدفوعة", overdue: "متأخرة" },
      tr: { pending: "Beklemede", paid: "Ödendi", overdue: "Gecikmiş" },
      en: { pending: "Pending", paid: "Paid", overdue: "Overdue" }
    };
    return labels[adminLang]?.[status] || status;
  };

  // Filter bills
  const activeBills = bills.filter(bill => !bill.isDeleted);
  const deletedBills = bills.filter(bill => bill.isDeleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          🧾 {admT?.billsSection || "فواتير المشتريات"}
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
            {admT?.addNewBill || "إضافة فاتورة مشتريات"}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="text-lg font-black">
            {editingId ? (admT?.edit || "تعديل فاتورة") : (admT?.addNewBill || "إضافة فاتورة مشتريات")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.vendor || "المورد"} *
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">-- {admT?.select || "اختر"} --</option>
                {vendors.filter(v => !v.isDeleted).map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.billNumber || "رقم الفاتورة"} *
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="BILL-001"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.billDate || "تاريخ الفاتورة"} *
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.dueDate || "تاريخ الاستحقاق"}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.status || "الحالة"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="pending">{getStatusLabel("pending")}</option>
                <option value="paid">{getStatusLabel("paid")}</option>
                <option value="overdue">{getStatusLabel("overdue")}</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-bold mb-2">
              {admT?.items || "العناصر"}
            </label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <select
                      value={item.inventoryId}
                      onChange={(e) => updateItem(index, "inventoryId", e.target.value)}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                    >
                      <option value="">-- {admT?.select || "اختر صنف"} --</option>
                      {inventory.filter(inv => !inv.isDeleted).map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      placeholder={admT?.quantity || "الكمية"}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                      placeholder={admT?.price || "السعر"}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                    />
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 font-black"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="mt-3 w-full py-2 rounded-xl bg-blue-100 text-blue-700 font-black"
            >
              + {admT?.addItem || "إضافة عنصر"}
            </button>
          </div>

          {/* Total */}
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">{admT?.total || "المجموع الكلي"}:</span>
              <span className="text-2xl font-black text-slate-900">
                {items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} TRY
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold mb-2">
              {admT?.notes || "ملاحظات"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border font-bold"
            />
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

      {/* Active Bills */}
      {activeBills.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3">
            {admT?.active || "الفواتير النشطة"} ({activeBills.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBills.map((bill) => (
              <div key={bill.id} className="bg-white border p-4 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Receipt className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">{bill.billNumber}</h4>
                      <p className="text-xs text-slate-500 font-bold">
                        {getVendorName(bill.vendorId)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(bill.status)}`}>
                    {getStatusLabel(bill.status)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">
                      {admT?.total || "المجموع"}:
                    </span>
                    <span className="text-xl font-black text-slate-900 flex items-center gap-1">
                      <DollarSign size={16} />
                      {Number(bill.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">
                      {admT?.billDate || "التاريخ"}:
                    </span>
                    <span className="font-bold text-slate-600">
                      {bill.billDate}
                    </span>
                  </div>
                  {bill.dueDate && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-bold text-slate-500">
                        {admT?.dueDate || "الاستحقاق"}:
                      </span>
                      <span className="font-bold text-slate-600">
                        {bill.dueDate}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(bill)}
                    className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    {admT?.edit || "تعديل"}
                  </button>
                  <button
                    onClick={() => openDeleteModal(bill)}
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

      {/* Deleted Bills */}
      {showDeleted && deletedBills.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3 text-red-600 flex items-center gap-2">
            <Trash2 size={20} />
            {admT?.deletedItems || "الفواتير المحذوفة"} ({deletedBills.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deletedBills.map((bill) => (
              <div key={bill.id} className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-lg text-red-900">{bill.billNumber}</h4>
                  <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-black text-red-700">
                    {admT?.deleted || "محذوف"}
                  </span>
                </div>

                {bill.deleteReason && (
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      {admT?.reasonForDeletion || "سبب الحذف"}:
                    </div>
                    <div className="text-sm font-bold text-red-700">
                      {bill.deleteReason}
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-slate-500 mb-3">
                  {admT?.deletedBy || "تم الحذف بواسطة"}: {bill.deletedBy || "-"}
                  <br />
                  {admT?.deletionDate || "تاريخ الحذف"}: {bill.deletedAt ? new Date(bill.deletedAt).toLocaleString() : "-"}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(bill.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={14} />
                    {admT?.restore || "استعادة"}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(bill.id)}
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
                ? `هل تريد حذف الفاتورة "${itemToDelete?.billNumber}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.billNumber}" faturasını silmek istiyor musunuz?`
                : `Delete bill "${itemToDelete?.billNumber}"?`
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