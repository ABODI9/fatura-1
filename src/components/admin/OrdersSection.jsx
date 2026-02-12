// ===============================
// OrdersSection.jsx - FULL
// Fix: safeGetPayLabel + safePrintInvoice + Soft Delete
// ===============================

import React, { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, CheckCircle, XCircle, FileText } from "lucide-react";

export const OrdersSection = ({
  ordersTab,
  setOrdersTab,
  listToShow = [],
  oldFrom,
  setOldFrom,
  oldTo,
  setOldTo,
  applyOldOrdersFilter,
  setApplyOldFilter,
  oldFilterError,
  setOldFilterError,
  markOrder,
  deleteOrderPermanently,
  printInvoice,
  getPayLabel,
  CURRENCY,
  admT,
  adminLang,
  db,
  appId,
  adminSession
}) => {
  const [showDeleted, setShowDeleted] = useState(false);

  const safeGetPayLabel = typeof getPayLabel === "function" ? getPayLabel : (m) => (m ? String(m) : "-");
  const safePrintInvoice = typeof printInvoice === "function" ? printInvoice : () => {};
  const safeMarkOrder = typeof markOrder === "function" ? markOrder : () => {};

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  const openDeleteModal = (order) => {
    setItemToDelete(order);
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
        doc(db, "artifacts", appId, "public", "data", "orders", itemToDelete.id),
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

  const handleRestore = async (orderId) => {
    if (!confirm(admT?.confirmRestore || "هل تريد استعادة هذا الطلب؟")) return;

    try {
      await updateDoc(doc(db, "artifacts", appId, "public", "data", "orders", orderId), {
        isDeleted: false,
        restoredAt: Date.now(),
        restoredBy: adminSession?.username || "unknown",
      });
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const handlePermanentDelete = async (orderId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      // إذا عندك deleteOrderPermanently استخدمه، غير كذا احذف مباشرة
      if (typeof deleteOrderPermanently === "function") {
        await deleteOrderPermanently(orderId);
      } else {
        await deleteDoc(doc(db, "artifacts", appId, "public", "data", "orders", orderId));
      }
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const activeOrders = listToShow.filter((o) => !o.isDeleted);
  const deletedOrders = listToShow.filter((o) => o.isDeleted);
  const displayOrders = showDeleted ? [...activeOrders, ...deletedOrders] : activeOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case "prepared":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      ar: { new: "جديد", prepared: "جاهز", cancelled: "ملغي" },
      tr: { new: "Yeni", prepared: "Hazır", cancelled: "İptal" },
      en: { new: "New", prepared: "Prepared", cancelled: "Cancelled" },
    };
    return labels[adminLang]?.[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">📋 {admT?.ordersSection || "الطلبات"}</h2>

        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-all"
        >
          {showDeleted ? <EyeOff size={18} /> : <Eye size={18} />}
          {showDeleted ? (admT?.hideDeleted || "إخفاء المحذوفات") : (admT?.showDeleted || "إظهار المحذوفات")}
        </button>
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setOrdersTab("active")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${ordersTab === "active" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}
        >
          {admT?.activeOrders || "الطلبات النشطة"}
        </button>
        <button
          onClick={() => setOrdersTab("old")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${ordersTab === "old" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}
        >
          {admT?.oldOrders || "الطلبات القديمة"}
        </button>
      </div>

      {ordersTab === "old" && (
        <div className="bg-white p-4 rounded-2xl border space-y-3">
          <h3 className="font-black text-sm">
            {admT?.filter || "تصفية"} {admT?.oldOrders || "الطلبات القديمة"}
          </h3>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold mb-1">{admT?.from || "من"}</label>
              <input
                type="date"
                value={oldFrom}
                onChange={(e) => {
                  setOldFrom?.(e.target.value);
                  setOldFilterError?.("");
                }}
                className="w-full p-2 rounded-xl border font-bold text-sm"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold mb-1">{admT?.to || "إلى"}</label>
              <input
                type="date"
                value={oldTo}
                onChange={(e) => {
                  setOldTo?.(e.target.value);
                  setOldFilterError?.("");
                }}
                className="w-full p-2 rounded-xl border font-bold text-sm"
              />
            </div>

            <button type="button" onClick={applyOldOrdersFilter} className="bg-orange-600 text-white px-5 py-2 rounded-xl font-black">
              {admT?.search || "بحث"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOldFrom?.("");
                setOldTo?.("");
                setApplyOldFilter?.(false);
                setOldFilterError?.("");
              }}
              className="bg-slate-200 px-5 py-2 rounded-xl font-black"
            >
              {admT?.reset || "إلغاء"}
            </button>
          </div>

          {oldFilterError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-black text-sm">{oldFilterError}</div>
          )}
        </div>
      )}

      {displayOrders.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border text-center font-bold text-slate-500">{admT?.noOrders || "لا يوجد طلبات هنا"}</div>
      ) : (
        <div className="space-y-3">
          {displayOrders.map((order) => {
            const isDeleted = !!order.isDeleted;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border-2 ${isDeleted ? "bg-red-50 border-red-300 opacity-75" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-black text-lg ${isDeleted ? "text-red-900" : "text-slate-900"}`}>
                        {order.table ? `${admT?.tableNumber || "الطاولة"}: ${order.table}` : admT?.order || "طلب"}
                      </h4>

                      {isDeleted && (
                        <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-black text-red-700">{admT?.deleted || "محذوف"}</span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-500">{order.timestamp ? new Date(order.timestamp).toLocaleString() : "-"}</div>

                    {!isDeleted && order.status && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">
                      {Number(order.totalWithTax || 0).toFixed(2)} {CURRENCY}
                    </div>
                    {order.paymentMethod && <div className="text-xs font-bold text-slate-600 mt-1">{safeGetPayLabel(order.paymentMethod)}</div>}
                  </div>
                </div>

                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl mb-3">
                    <div className="font-bold text-xs text-slate-600 mb-2">{admT?.items || "العناصر"}:</div>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-700">
                            {item.quantity}x {item.nameAr || item.name}
                          </span>
                          <span className="font-black text-slate-900">
                            {Number(item.price || 0).toFixed(2)} {CURRENCY}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isDeleted && order.deleteReason && (
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <div className="text-xs font-bold text-slate-600 mb-1">{admT?.reasonForDeletion || "سبب الحذف"}:</div>
                    <div className="text-sm font-bold text-red-700">{order.deleteReason}</div>
                  </div>
                )}

                {isDeleted && (
                  <div className="text-xs font-bold text-slate-500 mb-3">
                    {admT?.deletedBy || "تم الحذف بواسطة"}: {order.deletedBy || "-"}
                    <br />
                    {admT?.deletionDate || "تاريخ الحذف"}: {order.deletedAt ? new Date(order.deletedAt).toLocaleString() : "-"}
                  </div>
                )}

                <div className="flex gap-2">
                  {!isDeleted && order.status === "new" && (
                    <>
                      <button
                        onClick={() => safeMarkOrder(order.id, "prepared")}
                        className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} />
                        {admT?.markPrepared || "تجهيز"}
                      </button>

                      <button
                        onClick={() => safeMarkOrder(order.id, "cancelled")}
                        className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} />
                        {admT?.markCancelled || "إلغاء"}
                      </button>
                    </>
                  )}

                  {!isDeleted && (
                    <button
                      onClick={() => safePrintInvoice(order)}
                      className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                    >
                      <FileText size={14} />
                      {admT?.printInvoice || "طباعة"}
                    </button>
                  )}

                  {isDeleted ? (
                    <>
                      <button
                        onClick={() => handleRestore(order.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={14} />
                        {admT?.restore || "استعادة"}
                      </button>
                      <button onClick={() => handlePermanentDelete(order.id)} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black">
                        {admT?.delete || "حذف نهائي"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openDeleteModal(order)}
                      className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      {admT?.delete || "حذف"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4 text-red-700">{admT?.confirmDelete || "تأكيد الحذف"}</h3>

            <p className="font-bold text-slate-700 mb-4">
              {adminLang === "ar"
                ? `هل تريد حذف الطلب "${itemToDelete?.table || "طلب"}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.table || "Sipariş"}" siparişini silmek istiyor musunuz?`
                : `Delete order "${itemToDelete?.table || "Order"}"?`}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-red-700">{admT?.reasonForDeletion || "سبب الحذف"} *</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={admT?.enterReason || "أدخل سبب الحذف"}
                rows={3}
                className="w-full p-3 rounded-xl border border-red-300 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSoftDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black">
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
