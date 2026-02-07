import React, { useState } from "react";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";

export const CustomersSection = ({ 
  customers = [], 
  db, 
  appId, 
  CURRENCY 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [creditLimit, setCreditLimit] = useState(0);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setTaxNumber("");
    setCreditLimit(0);
    setNotes("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("الرجاء إدخال اسم العميل");
      return;
    }

    const customerData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      taxNumber: taxNumber.trim(),
      creditLimit: Number(creditLimit) || 0,
      notes: notes.trim(),
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "customers", editingId),
          customerData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "customers"),
          { ...customerData, createdAt: Date.now(), balance: 0 }
        );
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setName(customer.name || "");
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
    setAddress(customer.address || "");
    setTaxNumber(customer.taxNumber || "");
    setCreditLimit(customer.creditLimit || 0);
    setNotes(customer.notes || "");
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "customers", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">👥 العملاء</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black"
        >
          + إضافة عميل جديد
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">
              {editingId ? "تعديل عميل" : "عميل جديد"}
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
              <label className="block text-sm font-bold mb-2">الاسم *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 555 123 4567"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الرقم الضريبي</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="123456789"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">العنوان</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع، الحي، المدينة"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                حد الائتمان ({CURRENCY})
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="0"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">ملاحظات</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black"
            >
              {editingId ? "حفظ التعديلات" : "إضافة العميل"}
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

      {/* Customers List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا يوجد عملاء بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-right p-4 font-black">الاسم</th>
                  <th className="text-right p-4 font-black">الهاتف</th>
                  <th className="text-right p-4 font-black">البريد</th>
                  <th className="text-right p-4 font-black">الرصيد</th>
                  <th className="text-right p-4 font-black">حد الائتمان</th>
                  <th className="text-right p-4 font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold">{customer.name}</div>
                      {customer.taxNumber && (
                        <div className="text-xs text-slate-500">
                          ضريبي: {customer.taxNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{customer.phone || "-"}</td>
                    <td className="p-4 text-sm">{customer.email || "-"}</td>
                    <td className="p-4 font-black">
                      {Number(customer.balance || 0).toFixed(2)} {CURRENCY}
                    </td>
                    <td className="p-4 font-bold">
                      {Number(customer.creditLimit || 0).toFixed(2)} {CURRENCY}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
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