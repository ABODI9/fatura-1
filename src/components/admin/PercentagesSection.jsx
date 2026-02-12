// ===============================
// PercentagesSection.jsx - إدارة النسب والخصومات
// Features: Add, Edit, Delete Percentages
// ===============================

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Percent, ToggleLeft, ToggleRight } from "lucide-react";
import { 
  addPercentage, 
  updatePercentage, 
  deletePercentage, 
  togglePercentageStatus,
  getPercentageTypeLabel,
  PERCENTAGE_TYPES 
} from "../../services/percentages";

export const PercentagesSection = ({
  percentagesData = [],
  db,
  appId,
  admT,
  adminLang
}) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState(null);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
  const [newValue, setNewValue] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
  const [editValue, setEditValue] = useState("");

  // =================== ADD PERCENTAGE ===================
  const handleAddPercentage = async () => {
    const success = await addPercentage({
      name: newName,
      type: newType,
      value: parseFloat(newValue),
      db,
      appId
    });

    if (success) {
      setAddModalOpen(false);
      setNewName("");
      setNewType(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
      setNewValue("");
    }
  };

  // =================== EDIT PERCENTAGE ===================
  const openEditModal = (percentage) => {
    setSelectedPercentage(percentage);
    setEditName(percentage.name);
    setEditType(percentage.type);
    setEditValue(percentage.value.toString());
    setEditModalOpen(true);
  };

  const handleUpdatePercentage = async () => {
    const success = await updatePercentage({
      percentageId: selectedPercentage.id,
      name: editName,
      type: editType,
      value: parseFloat(editValue),
      db,
      appId
    });

    if (success) {
      setEditModalOpen(false);
      setSelectedPercentage(null);
      setEditName("");
      setEditType(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
      setEditValue("");
    }
  };

  // =================== DELETE PERCENTAGE ===================
  const handleDeletePercentage = async (percentageId) => {
    await deletePercentage(percentageId, db, appId);
  };

  // =================== TOGGLE STATUS ===================
  const handleToggleStatus = async (percentage) => {
    await togglePercentageStatus(percentage.id, percentage.isActive, db, appId);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case PERCENTAGE_TYPES.TAX:
        return "📊";
      case PERCENTAGE_TYPES.TOTAL_DISCOUNT:
        return "💰";
      case PERCENTAGE_TYPES.CASH_DISCOUNT:
        return "💵";
      case PERCENTAGE_TYPES.CARD_DISCOUNT:
        return "💳";
      case PERCENTAGE_TYPES.TRANSFER_DISCOUNT:
        return "🏦";
      default:
        return "💰";
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case PERCENTAGE_TYPES.TAX:
        return "bg-red-100 text-red-700 border-red-300";
      case PERCENTAGE_TYPES.TOTAL_DISCOUNT:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case PERCENTAGE_TYPES.CASH_DISCOUNT:
        return "bg-green-100 text-green-700 border-green-300";
      case PERCENTAGE_TYPES.CARD_DISCOUNT:
        return "bg-blue-100 text-blue-700 border-blue-300";
      case PERCENTAGE_TYPES.TRANSFER_DISCOUNT:
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          💰 {admT?.percentagesSection || "النسب والخصومات"}
        </h2>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white font-bold"
        >
          <Plus size={18} />
          {admT?.addPercentage || "إضافة نسبة"}
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
        <div className="font-bold text-sm text-blue-900 mb-2">
          ℹ️ {admT?.percentagesInfo || "معلومات"}
        </div>
        <ul className="text-xs font-bold text-blue-700 space-y-1">
          <li>• {admT?.totalDiscountInfo || "الخصم الإجمالي: يُطبق على جميع الطلبات"}</li>
          <li>• {admT?.paymentDiscountInfo || "خصومات الدفع: تُطبق حسب طريقة الدفع المختارة"}</li>
          <li>• {admT?.taxInfo || "الضريبة: تُضاف إلى الإجمالي النهائي"}</li>
        </ul>
      </div>

      {/* Percentages List */}
      {percentagesData.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border text-center font-bold text-slate-500">
          {admT?.noPercentages || "لا توجد نسب"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {percentagesData.map((percentage) => (
            <div
              key={percentage.id}
              className={`p-4 rounded-2xl border-2 ${
                percentage.isActive !== false
                  ? "bg-white border-slate-200"
                  : "bg-slate-50 border-slate-300 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getTypeIcon(percentage.type)}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">
                      {percentage.name}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg inline-block mt-1 ${getTypeColor(percentage.type)}`}>
                      {getPercentageTypeLabel(percentage.type, adminLang)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-600">
                  {admT?.percentage || "النسبة"}:
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    {percentage.value}
                  </span>
                  <Percent size={18} className="text-slate-600" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(percentage)}
                  className={`flex-1 py-2 rounded-xl font-black flex items-center justify-center gap-1 ${
                    percentage.isActive !== false
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {percentage.isActive !== false ? (
                    <>
                      <ToggleRight size={16} />
                      {admT?.active || "نشط"}
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} />
                      {admT?.inactive || "معطل"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => openEditModal(percentage)}
                  className="px-3 py-2 rounded-xl bg-amber-100 text-amber-700 font-black"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeletePercentage(percentage.id)}
                  className="px-3 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================== ADD MODAL =================== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4">
              {admT?.addPercentage || "إضافة نسبة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.name || "الاسم"} *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={admT?.enterName || "مثال: خصم الكاش 10%"}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.type || "النوع"} *
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                >
                  <option value={PERCENTAGE_TYPES.TOTAL_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TOTAL_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.CASH_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.CASH_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.CARD_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.CARD_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.TRANSFER_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TRANSFER_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.TAX}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TAX, adminLang)}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.percentageValue || "النسبة المئوية"} * (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="10"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold pr-12"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Percent size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddPercentage}
                className="flex-1 py-3 rounded-xl bg-slate-950 text-white font-black"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setNewName("");
                  setNewType(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
                  setNewValue("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.cancel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== EDIT MODAL =================== */}
      {editModalOpen && selectedPercentage && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4">
              {admT?.editPercentage || "تعديل النسبة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.name || "الاسم"} *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.type || "النوع"} *
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                >
                  <option value={PERCENTAGE_TYPES.TOTAL_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TOTAL_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.CASH_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.CASH_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.CARD_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.CARD_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.TRANSFER_DISCOUNT}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TRANSFER_DISCOUNT, adminLang)}
                  </option>
                  <option value={PERCENTAGE_TYPES.TAX}>
                    {getPercentageTypeLabel(PERCENTAGE_TYPES.TAX, adminLang)}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.percentageValue || "النسبة المئوية"} * (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold pr-12"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Percent size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdatePercentage}
                className="flex-1 py-3 rounded-xl bg-slate-950 text-white font-black"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedPercentage(null);
                  setEditName("");
                  setEditType(PERCENTAGE_TYPES.TOTAL_DISCOUNT);
                  setEditValue("");
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