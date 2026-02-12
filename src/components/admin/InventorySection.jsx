// ===============================
// InventorySection.jsx - محسّن
// Features: Product Linking + Waste Management + Cost Price
// ===============================

import React, { useState } from "react";
import { 
  Trash2, 
  Edit2, 
  Link2, 
  AlertCircle, 
  Package,
  PackageX 
} from "lucide-react";
import {
  moveToWaste,
  restoreFromWaste,
  deleteInventory,
  linkProductsToInventory,
  checkLowStock,
  calculateTotalInventoryValue
} from "../../services/inventory";  

export const InventorySection = ({
  inventoryTab,
  setInventoryTab,
  inventoryData = [],
  menuItems = [],
  db,
  appId,
  adminSession,
  admT,
  adminLang,
  CURRENCY,
  onEdit
}) => {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // فلترة عناصر المخزون
  const activeInventory = inventoryData.filter(item => !item.isWaste);
  const wasteInventory = inventoryData.filter(item => item.isWaste);
  const displayInventory = inventoryTab === "active" ? activeInventory : wasteInventory;

  // حساب قيمة المخزون الإجمالية
  const totalValue = calculateTotalInventoryValue(activeInventory);

  // =================== LINK PRODUCTS MODAL ===================
  const openLinkModal = (item) => {
    setSelectedInventoryItem(item);
    // تحميل المنتجات المربوطة حالياً
    const linked = item.linkedProducts || [];
    setSelectedProducts(linked);
    setLinkModalOpen(true);
  };

  const toggleProductLink = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.productId === product.id);
      if (exists) {
        return prev.filter(p => p.productId !== product.id);
      } else {
        return [...prev, {
          productId: product.id,
          productName: product.nameAr || product.name,
          usageAmount: 1 // القيمة الافتراضية
        }];
      }
    });
  };

  const updateUsageAmount = (productId, amount) => {
    setSelectedProducts(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, usageAmount: Number(amount) || 0 } 
          : p
      )
    );
  };

  const handleSaveLinks = async () => {
    const success = await linkProductsToInventory({
      inventoryId: selectedInventoryItem.id,
      linkedProducts: selectedProducts,
      db,
      appId
    });

    if (success) {
      setLinkModalOpen(false);
      setSelectedInventoryItem(null);
      setSelectedProducts([]);
    }
  };

  // =================== ACTIONS ===================
  const handleMoveToWaste = async (itemId) => {
    await moveToWaste(itemId, db, appId, adminSession?.username);
  };

  const handleRestoreFromWaste = async (itemId) => {
    await restoreFromWaste(itemId, db, appId, adminSession?.username);
  };

  const handleDelete = async (itemId) => {
    await deleteInventory(itemId, db, appId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          📦 {admT?.inventorySection || "المخزون"}
        </h2>
        
        {inventoryTab === "active" && (
          <div className="bg-white px-4 py-2 rounded-xl border">
            <div className="text-xs font-bold text-slate-600">
              {admT?.totalValue || "القيمة الإجمالية"}
            </div>
            <div className="text-lg font-black text-slate-900">
              {totalValue.toFixed(2)} {CURRENCY}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setInventoryTab("active")}
          className={`flex-1 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            inventoryTab === "active"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          <Package size={18} />
          {admT?.activeInventory || "عناصر المخزون"}
        </button>
        <button
          onClick={() => setInventoryTab("waste")}
          className={`flex-1 py-2 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            inventoryTab === "waste"
              ? "bg-red-600 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          <PackageX size={18} />
          {admT?.wasteInventory || "هدر المخزون"}
        </button>
      </div>

      {/* Inventory List */}
      {displayInventory.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border text-center font-bold text-slate-500">
          {admT?.noItems || "لا توجد عناصر"}
        </div>
      ) : (
        <div className="space-y-3">
          {displayInventory.map((item) => {
            const isLowStock = checkLowStock(item);
            const isWaste = item.isWaste;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 ${
                  isWaste
                    ? "bg-red-50 border-red-300"
                    : isLowStock
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-black text-lg ${
                        isWaste ? "text-red-900" : "text-slate-900"
                      }`}>
                        {item.name}
                      </h4>
                      {isLowStock && !isWaste && (
                        <AlertCircle size={18} className="text-yellow-600" />
                      )}
                    </div>

                    <div className="flex gap-4 text-sm font-bold text-slate-600">
                      <span>
                        {admT?.quantity || "الكمية"}: <span className="text-slate-900">{item.quantity}</span> {item.unit}
                      </span>
                      <span>
                        {admT?.costPrice || "سعر التكلفة"}: <span className="text-slate-900">{item.costPrice}</span> {CURRENCY}
                      </span>
                    </div>

                    {/* Linked Products */}
                    {!isWaste && item.linkedProducts && item.linkedProducts.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Link2 size={14} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-600">
                          {item.linkedProducts.length} {admT?.linkedProducts || "منتج مربوط"}
                        </span>
                      </div>
                    )}

                    {/* Low Stock Warning */}
                    {isLowStock && !isWaste && (
                      <div className="mt-2 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-lg inline-block">
                        {admT?.lowStock || "مخزون منخفض"}
                      </div>
                    )}

                    {/* Waste Info */}
                    {isWaste && (
                      <div className="mt-2 text-xs font-bold text-red-600">
                        {admT?.wastedBy || "تم الهدر بواسطة"}: {item.wastedBy || "-"}
                        <br />
                        {admT?.wasteDate || "تاريخ الهدر"}: {item.wastedAt ? new Date(item.wastedAt).toLocaleDateString() : "-"}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">
                      {(item.quantity * item.costPrice).toFixed(2)} {CURRENCY}
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      {admT?.totalValue || "القيمة"}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {!isWaste ? (
                    <>
                      <button
                        onClick={() => openLinkModal(item)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center gap-1"
                      >
                        <Link2 size={14} />
                        {admT?.linkProducts || "ربط المنتجات"}
                      </button>
                      
                      <button
                        onClick={() => onEdit(item)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center gap-1"
                      >
                        <Edit2 size={14} />
                        {admT?.edit || "تعديل"}
                      </button>
                      
                      <button
                        onClick={() => handleMoveToWaste(item.id)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center gap-1"
                      >
                        <PackageX size={14} />
                        {admT?.moveToWaste || "هدر"}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 min-w-[120px] py-2 rounded-xl bg-red-100 text-red-700 font-black flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        {admT?.delete || "حذف"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestoreFromWaste(item.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black"
                      >
                        {admT?.restore || "استعادة"}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black"
                      >
                        {admT?.deleteForever || "حذف نهائي"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================== LINK PRODUCTS MODAL =================== */}
      {linkModalOpen && selectedInventoryItem && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl">
                {admT?.linkProducts || "ربط المنتجات"} - {selectedInventoryItem.name}
              </h3>
              <button
                onClick={() => {
                  setLinkModalOpen(false);
                  setSelectedInventoryItem(null);
                  setSelectedProducts([]);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm font-bold text-slate-600 mb-4">
              {admT?.selectProductsAndUsage || "اختر المنتجات وحدد كمية الاستخدام لكل منتج"}
            </p>

            <div className="space-y-2 mb-6">
              {menuItems.map((product) => {
                const linkedProduct = selectedProducts.find(p => p.productId === product.id);
                const isLinked = !!linkedProduct;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isLinked
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isLinked}
                        onChange={() => toggleProductLink(product)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="font-bold text-sm">
                          {product.nameAr || product.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          {product.price} {CURRENCY}
                        </div>
                      </div>

                      {isLinked && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-600">
                            {admT?.usageAmount || "كمية الاستخدام"}:
                          </label>
                          <input
                            type="number"
                            value={linkedProduct.usageAmount}
                            onChange={(e) => updateUsageAmount(product.id, e.target.value)}
                            min="0.1"
                            step="0.1"
                            className="w-20 p-2 rounded-lg border border-blue-300 font-bold text-sm"
                          />
                          <span className="text-xs font-bold text-slate-600">
                            {selectedInventoryItem.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveLinks}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black"
              >
                {admT?.save || "حفظ"}
              </button>
              <button
                onClick={() => {
                  setLinkModalOpen(false);
                  setSelectedInventoryItem(null);
                  setSelectedProducts([]);
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