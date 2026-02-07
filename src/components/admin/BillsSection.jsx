import React, { useState } from "react";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";

export const BillsSection = ({ 
  bills = [], 
  vendors = [], 
  inventory = [],
  db, 
  appId, 
  CURRENCY 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [vendorId, setVendorId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ inventoryId: "", description: "", quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending"); // pending | paid | overdue

  const resetForm = () => {
    setVendorId("");
    setBillNumber("");
    setBillDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setItems([{ inventoryId: "", description: "", quantity: 1, unitPrice: 0 }]);
    setNotes("");
    setStatus("pending");
    setIsCreating(false);
    setEditingId(null);
  };

  const addItem = () => {
    setItems([...items, { inventoryId: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const handleSave = async () => {
    if (!vendorId || !billNumber) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const billData = {
      vendorId,
      billNumber,
      billDate,
      dueDate,
      items: items.filter((i) => i.description.trim() || i.inventoryId),
      total: calculateTotal(),
      notes,
      status,
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "bills", editingId),
          billData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "bills"),
          { ...billData, createdAt: Date.now() }
        );
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (bill) => {
    setEditingId(bill.id);
    setVendorId(bill.vendorId || "");
    setBillNumber(bill.billNumber || "");
    setBillDate(bill.billDate || "");
    setDueDate(bill.dueDate || "");
    setItems(bill.items || []);
    setNotes(bill.notes || "");
    setStatus(bill.status || "pending");
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "bills", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const getVendorName = (id) => {
    const vendor = vendors.find((v) => v.id === id);
    return vendor?.name || "غير معروف";
  };

  const getInventoryName = (id) => {
    const inv = inventory.find((i) => i.id === id);
    return inv?.name || "";
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
    switch (status) {
      case "paid":
        return "مدفوعة";
      case "overdue":
        return "متأخرة";
      default:
        return "قيد الانتظار";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">🧾 فواتير المشتريات</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black"
        >
          + إضافة فاتورة مشتريات
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">
              {editingId ? "تعديل فاتورة" : "فاتورة مشتريات جديدة"}
            </h3>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">المورد *</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر المورد</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم الفاتورة *</label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="BILL-001"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">تاريخ الفاتورة</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="paid">مدفوعة</option>
                <option value="overdue">متأخرة</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">البنود</label>
              <button
                onClick={addItem}
                className="text-sm bg-slate-100 px-3 py-1 rounded-lg font-bold"
              >
                + إضافة بند
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid md:grid-cols-12 gap-3 items-center">
                <select
                  value={item.inventoryId}
                  onChange={(e) => {
                    updateItem(index, "inventoryId", e.target.value);
                    if (e.target.value) {
                      updateItem(index, "description", getInventoryName(e.target.value));
                    }
                  }}
                  className="md:col-span-3 p-2 rounded-lg border font-bold"
                >
                  <option value="">اختر من المخزون (اختياري)</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="الوصف"
                  className="md:col-span-3 p-2 rounded-lg border font-bold"
                />

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  placeholder="الكمية"
                  className="md:col-span-2 p-2 rounded-lg border font-bold"
                />

                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  placeholder="السعر"
                  className="md:col-span-2 p-2 rounded-lg border font-bold"
                />

                <div className="md:col-span-1 font-black text-slate-700">
                  {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="md:col-span-1 text-red-600 hover:text-red-700 font-bold"
                  disabled={items.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="text-left font-black text-xl pt-3 border-t">
              المجموع: {calculateTotal().toFixed(2)} {CURRENCY}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">ملاحظات</label>
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
              {editingId ? "حفظ التعديلات" : "إنشاء الفاتورة"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {bills.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا توجد فواتير مشتريات بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-right p-4 font-black">رقم الفاتورة</th>
                  <th className="text-right p-4 font-black">المورد</th>
                  <th className="text-right p-4 font-black">التاريخ</th>
                  <th className="text-right p-4 font-black">الاستحقاق</th>
                  <th className="text-right p-4 font-black">المبلغ</th>
                  <th className="text-right p-4 font-black">الحالة</th>
                  <th className="text-right p-4 font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{bill.billNumber}</td>
                    <td className="p-4 font-bold">{getVendorName(bill.vendorId)}</td>
                    <td className="p-4">{bill.billDate}</td>
                    <td className="p-4">{bill.dueDate || "-"}</td>
                    <td className="p-4 font-black">
                      {Number(bill.total || 0).toFixed(2)} {CURRENCY}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(
                          bill.status
                        )}`}
                      >
                        {getStatusLabel(bill.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};