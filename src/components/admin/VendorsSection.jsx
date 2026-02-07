import React, { useState } from "react";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";

export const VendorsSection = ({ 
  vendors = [], 
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
  const [paymentTerms, setPaymentTerms] = useState("30"); // days
  const [category, setCategory] = useState(""); // food, beverages, supplies, etc.
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setTaxNumber("");
    setPaymentTerms("30");
    setCategory("");
    setNotes("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("الرجاء إدخال اسم المورد");
      return;
    }

    const vendorData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      taxNumber: taxNumber.trim(),
      paymentTerms: Number(paymentTerms) || 30,
      category: category.trim(),
      notes: notes.trim(),
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "vendors", editingId),
          vendorData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "vendors"),
          { ...vendorData, createdAt: Date.now(), balance: 0 }
        );
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setName(vendor.name || "");
    setEmail(vendor.email || "");
    setPhone(vendor.phone || "");
    setAddress(vendor.address || "");
    setTaxNumber(vendor.taxNumber || "");
    setPaymentTerms(vendor.paymentTerms || "30");
    setCategory(vendor.category || "");
    setNotes(vendor.notes || "");
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "vendors", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">🏭 الموردون</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black"
        >
          + إضافة مورد جديد
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">
              {editingId ? "تعديل مورد" : "مورد جديد"}
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
              <label className="block text-sm font-bold mb-2">اسم المورد *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="شركة المواد الغذائية"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر التصنيف</option>
                <option value="food">مواد غذائية</option>
                <option value="beverages">مشروبات</option>
                <option value="supplies">مستلزمات</option>
                <option value="equipment">معدات</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
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

            <div>
              <label className="block text-sm font-bold mb-2">شروط الدفع (أيام)</label>
              <input
                type="number"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="30"
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
              {editingId ? "حفظ التعديلات" : "إضافة المورد"}
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

      {/* Vendors List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        {vendors.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا يوجد موردون بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-right p-4 font-black">الاسم</th>
                  <th className="text-right p-4 font-black">التصنيف</th>
                  <th className="text-right p-4 font-black">الهاتف</th>
                  <th className="text-right p-4 font-black">البريد</th>
                  <th className="text-right p-4 font-black">الرصيد</th>
                  <th className="text-right p-4 font-black">شروط الدفع</th>
                  <th className="text-right p-4 font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold">{vendor.name}</div>
                      {vendor.taxNumber && (
                        <div className="text-xs text-slate-500">
                          ضريبي: {vendor.taxNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {vendor.category ? (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                          {vendor.category === "food" && "مواد غذائية"}
                          {vendor.category === "beverages" && "مشروبات"}
                          {vendor.category === "supplies" && "مستلزمات"}
                          {vendor.category === "equipment" && "معدات"}
                          {vendor.category === "other" && "أخرى"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-4">{vendor.phone || "-"}</td>
                    <td className="p-4 text-sm">{vendor.email || "-"}</td>
                    <td className="p-4 font-black">
                      {Number(vendor.balance || 0).toFixed(2)} {CURRENCY}
                    </td>
                    <td className="p-4 font-bold">{vendor.paymentTerms || 30} يوم</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
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