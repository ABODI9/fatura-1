// ===============================
// OrdersSection.jsx - محسّن ومُصلح بالكامل
// Features: Receipt + Return + All Fixes
// ===============================

import React, { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, RotateCcw, Eye, EyeOff, CheckCircle, XCircle, FileText, Undo2, Printer } from "lucide-react";

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
  
  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Receipt modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  // Return modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);

  // =================== DELETE FUNCTIONS ===================
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
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "orders", orderId),
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

  const handlePermanentDelete = async (orderId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "orders", orderId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  // =================== RECEIPT FUNCTIONS ===================
  const openReceiptModal = (order) => {
    setSelectedOrderForReceipt(order);
    setReceiptModalOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // =================== RETURN FUNCTIONS ===================
  const openReturnModal = (order) => {
    setOrderToReturn(order);
    setSelectedReturnItems([]);
    setReturnModalOpen(true);
  };

  const toggleReturnItem = (itemIndex) => {
    setSelectedReturnItems(prev => {
      if (prev.includes(itemIndex)) {
        return prev.filter(i => i !== itemIndex);
      } else {
        return [...prev, itemIndex];
      }
    });
  };

  const handleSaveReturn = async () => {
    // التحقق من اختيار عناصر
    if (selectedReturnItems.length === 0) {
      alert(admT?.selectAtLeastOneItem || "الرجاء اختيار عنصر واحد على الأقل");
      return;
    }

    // التحقق من وجود البيانات المطلوبة
    if (!db || !appId || !orderToReturn?.id) {
      alert("خطأ: بيانات الطلب غير مكتملة");
      console.error("Missing data:", { 
        hasDb: !!db, 
        hasAppId: !!appId, 
        hasOrderId: !!orderToReturn?.id 
      });
      return;
    }

    try {
      // تجهيز العناصر المرتجعة
      const returnedItems = selectedReturnItems.map(idx => ({
        ...orderToReturn.items[idx],
        returnedAt: Date.now()
      }));
      
      console.log("📦 Returning order:", {
        orderId: orderToReturn.id,
        itemsCount: returnedItems.length,
        user: adminSession?.username || "unknown"
      });

      // تحديث الطلب في Firestore
      const orderRef = doc(db, "artifacts", appId, "public", "data", "orders", orderToReturn.id);
      
      await updateDoc(orderRef, {
        status: "returned",
        returnedItems: returnedItems,
        returnedAt: Date.now(),
        returnedBy: adminSession?.username || "unknown",
        updatedAt: Date.now()
      });

      console.log("✅ Order returned successfully!");

      // إغلاق النافذة
      setReturnModalOpen(false);
      setOrderToReturn(null);
      setSelectedReturnItems([]);
      
      // رسالة نجاح
      alert(admT?.returnedSuccessfully || "تم إرجاع الطلب بنجاح ✓");
      
    } catch (error) {
      console.error("❌ Error returning order:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // رسائل خطأ واضحة
      let errorMessage = "حدث خطأ أثناء الإرجاع";
      
      if (error.code === 'permission-denied') {
        errorMessage = "ليس لديك صلاحية لإرجاع الطلبات. الرجاء التواصل مع المدير.";
      } else if (error.code === 'not-found') {
        errorMessage = "الطلب غير موجود في النظام";
      } else if (error.code === 'unavailable') {
        errorMessage = "لا يوجد اتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.";
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // =================== FILTER ORDERS ===================
  const activeOrders = listToShow.filter(o => !o.isDeleted && o.status !== "returned");
  const oldOrders = listToShow.filter(o => !o.isDeleted && o.status !== "returned");
  const returnedOrders = listToShow.filter(o => !o.isDeleted && o.status === "returned");
  const deletedOrders = listToShow.filter(o => o.isDeleted);

  let displayOrders = [];
  if (ordersTab === "active") {
    displayOrders = showDeleted ? [...activeOrders, ...deletedOrders] : activeOrders;
  } else if (ordersTab === "old") {
    displayOrders = showDeleted ? [...oldOrders, ...deletedOrders] : oldOrders;
  } else if (ordersTab === "returned") {
    displayOrders = returnedOrders;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "prepared":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "returned":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      ar: { new: "جديد", prepared: "جاهز", cancelled: "ملغي", returned: "مرتجع" },
      tr: { new: "Yeni", prepared: "Hazır", cancelled: "İptal", returned: "İade" },
      en: { new: "New", prepared: "Prepared", cancelled: "Cancelled", returned: "Returned" }
    };
    return labels[adminLang]?.[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          📋 {admT?.ordersSection || "الطلبات"}
        </h2>
        {ordersTab !== "returned" && (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-all"
          >
            {showDeleted ? <EyeOff size={18} /> : <Eye size={18} />}
            {showDeleted ? (admT?.hideDeleted || "إخفاء المحذوفات") : (admT?.showDeleted || "إظهار المحذوفات")}
          </button>
        )}
      </div>

      {/* Tabs - مع تبويب الطلبات المرتجعة */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setOrdersTab("active")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            ordersTab === "active"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {admT?.activeOrders || "الطلبات النشطة"}
        </button>
        <button
          onClick={() => setOrdersTab("old")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            ordersTab === "old"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {admT?.oldOrders || "الطلبات القديمة"}
        </button>
        <button
          onClick={() => setOrdersTab("returned")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            ordersTab === "returned"
              ? "bg-orange-600 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {admT?.returnedOrders || "الطلبات المرتجعة"}
        </button>
      </div>

      {/* Old Orders Filter */}
      {ordersTab === "old" && (
        <div className="bg-white p-4 rounded-2xl border space-y-3">
          <h3 className="font-black text-sm">
            {admT?.filter || "تصفية"} {admT?.oldOrders || "الطلبات القديمة"}
          </h3>
          
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold mb-1">
                {admT?.from || "من"}
              </label>
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
              <label className="block text-xs font-bold mb-1">
                {admT?.to || "إلى"}
              </label>
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

            <button
              type="button"
              onClick={applyOldOrdersFilter}
              className="bg-orange-600 text-white px-5 py-2 rounded-xl font-black"
            >
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
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-black text-sm">
              {oldFilterError}
            </div>
          )}
        </div>
      )}

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border text-center font-bold text-slate-500">
          {admT?.noOrders || "لا يوجد طلبات هنا"}
        </div>
      ) : (
        <div className="space-y-3">
          {displayOrders.map((order) => {
            const isDeleted = order.isDeleted;
            const isReturned = order.status === "returned";
            
            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border-2 ${
                  isDeleted
                    ? "bg-red-50 border-red-300 opacity-75"
                    : isReturned
                    ? "bg-orange-50 border-orange-300"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-black text-lg ${
                        isDeleted ? "text-red-900" : 
                        isReturned ? "text-orange-900" : 
                        "text-slate-900"
                      }`}>
                        {order.table
                          ? `${admT?.tableNumber || "الطاولة"}: ${order.table}`
                          : admT?.order || "طلب"}
                      </h4>
                      {isDeleted && (
                        <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-black text-red-700">
                          {admT?.deleted || "محذوف"}
                        </span>
                      )}
                      {isReturned && (
                        <span className="px-3 py-1 rounded-full bg-orange-200 text-xs font-black text-orange-700">
                          {admT?.returned || "مرتجع"}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-500">
                      {order.timestamp
                        ? new Date(order.timestamp).toLocaleString()
                        : "-"}
                    </div>

                    {/* عرض اسم الشخص الذي حضّر الطلب */}
                    {order.preparedBy && (
                      <div className="text-xs font-bold text-emerald-600 mt-1">
                        {admT?.preparedBy || "تم التحضير بواسطة"}: {order.preparedBy}
                      </div>
                    )}

                    {/* عرض اسم الشخص الذي أرجع الطلب */}
                    {order.returnedBy && (
                      <div className="text-xs font-bold text-orange-600 mt-1">
                        {admT?.returnedBy || "تم الإرجاع بواسطة"}: {order.returnedBy}
                      </div>
                    )}

                    {!isDeleted && order.status !== "new" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">
                      {Number(order.totalWithTax || order.total || 0).toFixed(2)} {CURRENCY}
                    </div>
                    {order.paymentMethod && (
                      <div className="text-xs font-bold text-slate-600 mt-1">
                        {getPayLabel(order.paymentMethod)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl mb-3">
                    <div className="font-bold text-xs text-slate-600 mb-2">
                      {admT?.items || "العناصر"}:
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
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

                {/* Returned Items - عرض العناصر المرتجعة */}
                {isReturned && order.returnedItems && order.returnedItems.length > 0 && (
                  <div className="bg-orange-100 p-3 rounded-xl mb-3 border border-orange-300">
                    <div className="font-bold text-xs text-orange-700 mb-2">
                      {admT?.returnedItems || "العناصر المرتجعة"}:
                    </div>
                    <div className="space-y-1">
                      {order.returnedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-bold text-orange-800">
                            {item.quantity}x {item.nameAr || item.name}
                          </span>
                          <span className="font-black text-orange-900">
                            {Number(item.price || 0).toFixed(2)} {CURRENCY}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete Reason */}
                {isDeleted && order.deleteReason && (
                  <div className="bg-white p-3 rounded-xl mb-3">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      {admT?.reasonForDeletion || "سبب الحذف"}:
                    </div>
                    <div className="text-sm font-bold text-red-700">
                      {order.deleteReason}
                    </div>
                  </div>
                )}

                {isDeleted && (
                  <div className="text-xs font-bold text-slate-500 mb-3">
                    {admT?.deletedBy || "تم الحذف بواسطة"}: {order.deletedBy || "-"}
                    <br />
                    {admT?.deletionDate || "تاريخ الحذف"}:{" "}
                    {order.deletedAt
                      ? new Date(order.deletedAt).toLocaleString()
                      : "-"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {/* زر عرض الإيصال - يظهر في النشطة والقديمة */}
                  {!isDeleted && (ordersTab === "active" || ordersTab === "old") && (
                    <button
                      onClick={() => openReceiptModal(order)}
                      className="flex-1 min-w-[120px] py-2 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center gap-1"
                    >
                      <FileText size={14} />
                      {admT?.viewReceipt || "عرض الإيصال"}
                    </button>
                  )}

                  {!isDeleted && order.status === "new" && (
                    <>
                      <button
                        onClick={() => markOrder(order.id, "prepared")}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} />
                        {admT?.markPrepared || "تم التحضير"}
                      </button>
                      <button
                        onClick={() => markOrder(order.id, "cancelled")}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} />
                        {admT?.markCancelled || "إلغاء"}
                      </button>
                    </>
                  )}

                  {/* زر الإرجاع - يظهر في الطلبات القديمة فقط */}
                  {!isDeleted && !isReturned && ordersTab === "old" && (order.status === "prepared" || order.status === "cancelled") && (
                    <button
                      onClick={() => openReturnModal(order)}
                      className="flex-1 min-w-[120px] py-2 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center gap-1"
                    >
                      <Undo2 size={14} />
                      {admT?.returnOrder || "إرجاع"}
                    </button>
                  )}

                  {!isDeleted && printInvoice && (
                    <button
                      onClick={() => printInvoice(order)}
                      className="flex-1 min-w-[120px] py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                    >
                      <Printer size={14} />
                      {admT?.printInvoice || "طباعة"}
                    </button>
                  )}

                  {isDeleted ? (
                    <>
                      <button
                        onClick={() => handleRestore(order.id)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={14} />
                        {admT?.restore || "استعادة"}
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(order.id)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-red-600 text-white font-black"
                      >
                        {admT?.delete || "حذف نهائي"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openDeleteModal(order)}
                      className="flex-1 min-w-[120px] py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
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

      {/* =================== RECEIPT MODAL =================== */}
      {receiptModalOpen && selectedOrderForReceipt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl">
                {admT?.receipt || "الإيصال"}
              </h3>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Receipt Content */}
            <div className="border-2 border-slate-200 rounded-2xl p-6 mb-4 receipt-content">
              <div className="text-center mb-6 pb-4 border-b-2 border-dashed">
                <h2 className="font-black text-2xl mb-2">
                  {admT?.restaurantName || "مطعمنا"}
                </h2>
                <p className="text-sm font-bold text-slate-600">
                  {admT?.orderNumber || "رقم الطلب"}: #{selectedOrderForReceipt.id?.slice(-6)}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {selectedOrderForReceipt.timestamp
                    ? new Date(selectedOrderForReceipt.timestamp).toLocaleString()
                    : "-"}
                </p>
              </div>

              {/* Table Info */}
              {selectedOrderForReceipt.table && (
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="font-bold">
                    {admT?.tableNumber || "رقم الطاولة"}: <span className="font-black">{selectedOrderForReceipt.table}</span>
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <h4 className="font-black text-sm mb-3">
                  {admT?.items || "العناصر"}:
                </h4>
                {selectedOrderForReceipt.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between mb-2">
                    <span className="font-bold text-sm">
                      {item.quantity}x {item.nameAr || item.name}
                    </span>
                    <span className="font-black text-sm">
                      {Number((item.price * item.quantity) || 0).toFixed(2)} {CURRENCY}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-bold">
                  <span>{admT?.subtotal || "المجموع الفرعي"}:</span>
                  <span>{Number(selectedOrderForReceipt.subtotal || 0).toFixed(2)} {CURRENCY}</span>
                </div>

                {selectedOrderForReceipt.discount > 0 && (
                  <div className="flex justify-between font-bold text-green-600">
                    <span>{admT?.discount || "الخصم"}:</span>
                    <span>-{Number(selectedOrderForReceipt.discount || 0).toFixed(2)} {CURRENCY}</span>
                  </div>
                )}

                {selectedOrderForReceipt.taxAmount > 0 && (
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>{admT?.tax || "الضريبة"}:</span>
                    <span>+{Number(selectedOrderForReceipt.taxAmount || 0).toFixed(2)} {CURRENCY}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-lg pt-2 border-t-2 border-slate-300">
                  <span>{admT?.total || "الإجمالي"}:</span>
                  <span>{Number(selectedOrderForReceipt.totalWithTax || selectedOrderForReceipt.total || 0).toFixed(2)} {CURRENCY}</span>
                </div>
              </div>

              {/* Payment Method */}
              {selectedOrderForReceipt.paymentMethod && (
                <div className="pt-4 border-t border-slate-200 text-center">
                  <p className="text-sm font-bold text-slate-600">
                    {admT?.paymentMethod || "طريقة الدفع"}: <span className="font-black">{getPayLabel(selectedOrderForReceipt.paymentMethod)}</span>
                  </p>
                </div>
              )}

              {/* Status */}
              {selectedOrderForReceipt.status && (
                <div className="text-center mt-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-black ${getStatusColor(selectedOrderForReceipt.status)}`}>
                    {getStatusLabel(selectedOrderForReceipt.status)}
                  </span>
                </div>
              )}

              <div className="text-center mt-6 text-xs text-slate-500 font-bold">
                {admT?.thankYou || "شكراً لزيارتكم"}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                {admT?.print || "طباعة"}
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.close || "إغلاق"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== RETURN MODAL =================== */}
      {returnModalOpen && orderToReturn && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4 text-orange-700">
              {admT?.returnOrder || "إرجاع الطلب"}
            </h3>

            <p className="font-bold text-slate-700 mb-4">
              {admT?.selectItemsToReturn || "اختر العناصر المراد إرجاعها"}:
            </p>

            <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
              {orderToReturn.items?.map((item, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReturnItems.includes(idx)
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedReturnItems.includes(idx)}
                    onChange={() => toggleReturnItem(idx)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {item.quantity}x {item.nameAr || item.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {Number((item.price * item.quantity) || 0).toFixed(2)} {CURRENCY}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveReturn}
                className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-black"
              >
                {admT?.saveReturn || "حفظ الإرجاع"}
              </button>
              <button
                onClick={() => {
                  setReturnModalOpen(false);
                  setOrderToReturn(null);
                  setSelectedReturnItems([]);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.cancel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== DELETE MODAL =================== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4 text-red-700">
              {admT?.confirmDelete || "تأكيد الحذف"}
            </h3>

            <p className="font-bold text-slate-700 mb-4">
              {adminLang === "ar"
                ? `هل تريد حذف الطلب "${itemToDelete?.table || "طلب"}"؟`
                : adminLang === "tr"
                ? `"${itemToDelete?.table || "Sipariş"}" siparişini silmek istiyor musunuz?`
                : `Delete order "${itemToDelete?.table || "Order"}"?`}
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

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content,
          .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};