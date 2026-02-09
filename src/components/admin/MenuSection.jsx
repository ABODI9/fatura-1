// ===============================
// MenuSection.jsx - محسّن
// Features: Full Translation + Soft Delete
// ===============================

import React, { useState } from "react";
import { doc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, Edit, Plus } from "lucide-react";

export const MenuSection = ({ 
  menuItems = [], 
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
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameTr, setNameTr] = useState("");
  const [price, setPrice] = useState("");
  const [categoryAr, setCategoryAr] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  const [categoryTr, setCategoryTr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionTr, setDescriptionTr] = useState("");
  const [isOffer, setIsOffer] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setNameTr("");
    setPrice("");
    setCategoryAr("");
    setCategoryEn("");
    setCategoryTr("");
    setImageUrl("");
    setDescription("");
    setDescriptionEn("");
    setDescriptionTr("");
    setIsOffer(false);
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setNameAr(item.nameAr || "");
    setNameEn(item.nameEn || "");
    setNameTr(item.nameTr || "");
    setPrice(item.price || "");
    setCategoryAr(item.categoryAr || "");
    setCategoryEn(item.categoryEn || "");
    setCategoryTr(item.categoryTr || "");
    setImageUrl(item.imageUrl || item.image || "");
    setDescription(item.description || "");
    setDescriptionEn(item.descriptionEn || "");
    setDescriptionTr(item.descriptionTr || "");
    setIsOffer(item.isOffer || false);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!nameAr || !price) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    try {
      const itemData = {
        nameAr,
        nameEn: nameEn || nameAr,
        nameTr: nameTr || nameAr,
        name: nameAr,
        price: Number(price),
        categoryAr: categoryAr || "عام",
        categoryEn: categoryEn || categoryAr || "General",
        categoryTr: categoryTr || categoryAr || "Genel",
        imageUrl: imageUrl || "",
        image: imageUrl || "",
        description: description || "",
        descriptionEn: descriptionEn || description || "",
        descriptionTr: descriptionTr || description || "",
        isOffer: isOffer || false,
        isDeleted: false,
        updatedAt: Date.now(),
        updatedBy: adminSession?.username || "unknown",
      };

      if (editingId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "menu", editingId),
          itemData
        );
      } else {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "menu"), {
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
        doc(db, "artifacts", appId, "public", "data", "menu", itemToDelete.id),
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
        doc(db, "artifacts", appId, "public", "data", "menu", itemId),
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
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "menu", itemId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  // Filter items
  const activeItems = menuItems.filter(item => !item.isDeleted);
  const deletedItems = menuItems.filter(item => item.isDeleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          🍽️ {admT?.menuSection || "قائمة الطعام"}
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
            {admT?.addNewItem || "إضافة منتج جديد"}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="text-lg font-black">
            {editingId ? (admT?.editItem || "تعديل منتج") : (admT?.addNewItem || "إضافة منتج جديد")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.nameAr || "الاسم (عربي)"}
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="برجر"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.nameEn || "الاسم (English)"}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Burger"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.nameTr || "الاسم (Türkçe)"}
              </label>
              <input
                type="text"
                value={nameTr}
                onChange={(e) => setNameTr(e.target.value)}
                placeholder="Burger"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.price || "السعر"}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.categoryAr || "التصنيف (عربي)"}
              </label>
              <input
                type="text"
                value={categoryAr}
                onChange={(e) => setCategoryAr(e.target.value)}
                placeholder="برجر"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.categoryEn || "التصنيف (English)"}
              </label>
              <input
                type="text"
                value={categoryEn}
                onChange={(e) => setCategoryEn(e.target.value)}
                placeholder="Burgers"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.categoryTr || "التصنيف (Türkçe)"}
              </label>
              <input
                type="text"
                value={categoryTr}
                onChange={(e) => setCategoryTr(e.target.value)}
                placeholder="Burgerler"
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.imageUrl || "رابط الصورة"}
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                {admT?.descriptionAr || "الوصف (عربي)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.descriptionEn || "الوصف (English)"}
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.descriptionTr || "الوصف (Türkçe)"}
              </label>
              <textarea
                value={descriptionTr}
                onChange={(e) => setDescriptionTr(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isOffer"
                checked={isOffer}
                onChange={(e) => setIsOffer(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="isOffer" className="font-bold">
                {admT?.isOffer || "عرض خاص"} 🔥
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black"
            >
              {editingId ? (admT?.saveChanges || "حفظ التعديلات") : (admT?.save || "إضافة المنتج")}
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
            {admT?.active || "المنتجات النشطة"} ({activeItems.length})
          </h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">

            {activeItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all">
                {(() => {
  const img = item.imageUrl || item.image || item.photoURL;
  if (!img) return null;

  return (
    <div className="w-full aspect-[16/9] bg-white flex items-center justify-center overflow-hidden">
      <img
        src={img}
        alt={item.nameAr}
        className="max-w-full max-h-full object-contain p-3"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      {item.isOffer && (
        <span className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-black bg-red-500 text-white">
          🔥 {admT?.offer || "عرض"}
        </span>
      )}
    </div>
  );
})()}


                <div className="p-4">
                  <h3 className="font-black text-lg mb-2">{item.nameAr}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-orange-600 text-xl">{item.price} TRY</span>
                    {item.categoryAr && (
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                        {item.categoryAr}
                      </span>
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
            {admT?.deletedItems || "المنتجات المحذوفة"} ({deletedItems.length})
          </h3>
          <div className="grid md:grid-cols-5 lg:grid-cols-5 gap-5">
            {deletedItems.map((item) => (
              <div
  key={item.id}
  className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all"
>
  {(() => {
    const img = item.imageUrl || item.image || item.photoURL;
    if (!img) return null;

    return (
      <div className="w-full h-24 bg-white flex items-center justify-center overflow-hidden">
        <img
          src={img}
          alt={item.nameAr}
          className="max-w-full max-h-full object-contain p-1"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>
    );
  })()}

  <div className="p-3">
    <h3 className="font-black text-sm mb-1">{item.nameAr}</h3>

    <div className="flex items-center justify-between mb-2">
      <span className="font-black text-orange-600 text-sm">{item.price} TRY</span>
      {item.categoryAr && (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold">
          {item.categoryAr}
        </span>
      )}
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => handleEdit(item)}
        className="flex-1 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center gap-1"
      >
        <Edit size={12} />
        {admT?.edit || "تعديل"}
      </button>

      <button
        onClick={() => openDeleteModal(item)}
        className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-700 font-black text-xs flex items-center justify-center gap-1"
      >
        <Trash2 size={12} />
        {admT?.delete || "حذف"}
      </button>
    </div>
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
                ? `هل تريد حذف "${itemToDelete?.nameAr}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.nameTr || itemToDelete?.nameAr}" silinsin mi?`
                : `Delete "${itemToDelete?.nameEn || itemToDelete?.nameAr}"?`
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