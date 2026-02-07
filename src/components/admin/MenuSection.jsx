import React, { useState } from "react";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { addMenuItem } from "../../services/menu";

export const MenuSection = ({ menuItems, admT, adminLang, db, appId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameTr, setNameTr] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryAr, setCategoryAr] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setNameTr("");
    setPrice(0);
    setCategoryAr("");
    setDescription("");
    setImageUrl("");
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!nameAr.trim()) {
      alert("الرجاء إدخال اسم المنتج بالعربي");
      return;
    }

    const productData = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      nameTr: nameTr.trim(),
      price: Number(price) || 0,
      categoryAr: categoryAr.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      updatedAt: Date.now(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "menu", editingId),
          productData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "menu"),
          { ...productData, createdAt: Date.now() }
        );
      }
      resetForm();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };


  const handleAdd = async () => {
  await addMenuItem(db, {
    nameAr: "برجر",
    price: 100,
    categoryAr: "سندويشات",
    imageUrl: "",
  });
};

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNameAr(item.nameAr || "");
    setNameEn(item.nameEn || "");
    setNameTr(item.nameTr || "");
    setPrice(item.price || 0);
    setCategoryAr(item.categoryAr || "");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "menu", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">🍽️ قائمة الطعام</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black"
        >
          + إضافة منتج جديد
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">
              {editingId ? "تعديل منتج" : "منتج جديد"}
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
              <label className="block text-sm font-bold mb-2">الاسم (عربي) *</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="برجر"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الاسم (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Burger"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الاسم (Türkçe)</label>
              <input
                type="text"
                value={nameTr}
                onChange={(e) => setNameTr(e.target.value)}
                placeholder="Burger"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">السعر</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">التصنيف</label>
              <input
                type="text"
                value={categoryAr}
                onChange={(e) => setCategoryAr(e.target.value)}
                placeholder="برجر"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رابط الصورة</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
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

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.nameAr}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-black text-lg mb-2">{item.nameAr}</h3>
              {item.description && (
                <p className="text-sm text-slate-600 mb-3">{item.description}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-orange-600">{item.price} TRY</span>
                {item.categoryAr && (
                  <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                    {item.categoryAr}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};