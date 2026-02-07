// components/admin/AdminLayout.jsx
import React from "react";
import { X, Utensils, LayoutDashboard, Settings } from "lucide-react";

export const AdminLayout = ({
  adminLang,
  setAdminLang,
  adminSession,
  adminLogout,
  setAppMode,
  setAccountsOpen,
  setCreateOrderOpen,
  cashDiscountPercent,
  setCashDiscountPercent,
  taxPercent,
  setTaxPercent,
  setVipOpen,
  financeDocPath,
  db,
  doc,
  setDoc,
  children,
  inventoryAlerts,
  admT
}) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir={adminLang === "ar" ? "rtl" : "ltr"}>
      <header className="bg-white border-b px-8 py-5 sticky top-0 z-50">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black">
              W
            </div>
            <div className="font-black text-slate-900">Admin</div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
              {["ar", "tr", "en"].map((l) => (
                <button
                  key={l}
                  onClick={() => setAdminLang(l)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    adminLang === l ? "bg-white shadow-sm text-slate-950" : "text-slate-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAppMode("portal")}
              className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl font-black hover:bg-slate-200 transition-all"
            >
              {admT?.goPortal || "العودة للبوابة"}
            </button>

            {adminSession?.role === "owner" && (
              <button
                onClick={() => setAccountsOpen(true)}
                className="bg-slate-950 text-white px-5 py-2 rounded-xl font-black hover:bg-black transition-all"
              >
                Manage Accounts
              </button>
            )}

            <button
              onClick={() => setCreateOrderOpen(true)}
              className="bg-orange-600 text-white px-5 py-2 rounded-xl font-black hover:bg-orange-500 transition-all"
            >
              + إضافة طلب جديد
            </button>

            {/* Cash Discount */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <span className="text-sm font-black text-slate-700">خصم الكاش %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={cashDiscountPercent}
                onChange={async (e) => {
                  const v = Math.min(100, Math.max(0, Number(e.target.value || 0)));
                  setCashDiscountPercent(v);
                  await setDoc(doc(db, ...financeDocPath), { cashDiscountPercent: v, updatedAt: Date.now() }, { merge: true });
                }}
                className="w-20 p-2 rounded-lg border text-center font-black"
              />
            </div>

            {/* Tax */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <span className="text-sm font-black text-slate-700">ضريبة %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={taxPercent}
                onChange={async (e) => {
                  const v = Math.min(100, Math.max(0, Number(e.target.value || 0)));
                  setTaxPercent(v);
                  await setDoc(doc(db, ...financeDocPath), { taxPercent: v, updatedAt: Date.now() }, { merge: true });
                }}
                className="w-20 p-2 rounded-lg border text-center font-black"
              />
            </div>

            <button
              onClick={() => setVipOpen(true)}
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-black hover:bg-emerald-500 transition-all"
            >
              + إضافة عميل دائم
            </button>

            <button
              onClick={adminLogout}
              className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl font-black hover:bg-slate-200 transition-all"
            >
              {admT?.logout || "تسجيل خروج"} ({adminSession?.username})
            </button>
          </div>
        </div>
      </header>

      {/* Inventory Alerts */}
      {(inventoryAlerts?.out?.length > 0 || inventoryAlerts?.low?.length > 0) && (
        <div className="px-6 pt-4 space-y-3">
          {inventoryAlerts.out.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <div className="font-black text-red-700 mb-2">
                🚫 انتهت الكمية — لا يمكن صنع منتج
              </div>
              {inventoryAlerts.out.map((x) => (
                <div key={x.invId} className="text-sm font-bold text-red-700">
                  • {x.name} — المتوفر: {x.qty} — يحتاج: {x.needForOne}
                </div>
              ))}
            </div>
          )}

          {inventoryAlerts.low.length > 0 && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
              <div className="font-black text-orange-700 mb-2">
                ⚠️ المخزون اقترب من الانتهاء (20%)
              </div>
              {inventoryAlerts.low.map((x) => (
                <div key={x.invId} className="text-sm font-bold text-orange-700">
                  • {x.name} — المتبقي: {x.qty} من {x.base}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <main className="p-6 max-w-[1900px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
};