import React, { useState } from "react";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";

export const InvoicesSection = ({ 
  invoices = [], 
  customers = [], 
  db, 
  appId, 
  CURRENCY 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending"); // pending | paid | overdue

  const resetForm = () => {
    setCustomerId("");
    setInvoiceNumber("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setNotes("");
    setStatus("pending");
    setIsCreating(false);
    setEditingId(null);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
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
    if (!customerId || !invoiceNumber) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const invoiceData = {
      customerId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      items: items.filter((i) => i.description.trim()),
      total: calculateTotal(),
      notes,
      status,
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "invoices", editingId),
          invoiceData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "invoices"),
          { ...invoiceData, createdAt: Date.now() }
        );
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (invoice) => {
    setEditingId(invoice.id);
    setCustomerId(invoice.customerId || "");
    setInvoiceNumber(invoice.invoiceNumber || "");
    setInvoiceDate(invoice.invoiceDate || "");
    setDueDate(invoice.dueDate || "");
    setItems(invoice.items || []);
    setNotes(invoice.notes || "");
    setStatus(invoice.status || "pending");
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "invoices", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const getCustomerName = (id) => {
    const customer = customers.find((c) => c.id === id);
    return customer?.name || "غير معروف";
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
        <h2 className="text-xl font-black">🧾 الفواتير</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black"
        >
          + إضافة فاتورة جديدة
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">
              {editingId ? "تعديل فاتورة" : "فاتورة جديدة"}
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
              <label className="block text-sm font-bold mb-2">العميل *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر العميل</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم الفاتورة *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">تاريخ الفاتورة</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
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
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="الوصف"
                  className="md:col-span-6 p-2 rounded-lg border font-bold"
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

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا توجد فواتير بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-right p-4 font-black">رقم الفاتورة</th>
                  <th className="text-right p-4 font-black">العميل</th>
                  <th className="text-right p-4 font-black">التاريخ</th>
                  <th className="text-right p-4 font-black">الاستحقاق</th>
                  <th className="text-right p-4 font-black">المبلغ</th>
                  <th className="text-right p-4 font-black">الحالة</th>
                  <th className="text-right p-4 font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{invoice.invoiceNumber}</td>
                    <td className="p-4 font-bold">{getCustomerName(invoice.customerId)}</td>
                    <td className="p-4">{invoice.invoiceDate}</td>
                    <td className="p-4">{invoice.dueDate || "-"}</td>
                    <td className="p-4 font-black">
                      {Number(invoice.total || 0).toFixed(2)} {CURRENCY}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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