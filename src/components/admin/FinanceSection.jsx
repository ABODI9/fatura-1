// ===============================
// FinanceSection.jsx - محسّن
// Features: Full Translation
// ===============================

import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { DollarSign, Percent, Save } from "lucide-react";

export const FinanceSection = ({
  taxPercent,
  setTaxPercent,
  cashDiscountPercent,
  setCashDiscountPercent,
  financeDocPath,
  db,
  doc: docRef,
  setDoc: setDocRef,
  admT,
  adminLang
}) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage("");

    try {
      const [artifacts, appId, publicPath, data, appConfig, finance] = financeDocPath;
      
      await setDoc(
        doc(db, artifacts, appId, publicPath, data, appConfig, finance),
        {
          taxPercent: Number(taxPercent) || 0,
          cashDiscountPercent: Number(cashDiscountPercent) || 0,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      setMessage(admT?.success || "تم الحفظ بنجاح");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setMessage(admT?.errorOccurred || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          💰 {admT?.financeSection || "المالية"}
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border space-y-6">
        <div>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Percent size={20} />
            {admT?.financeSection || "إعدادات المالية"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tax Percentage */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.taxPercent || "نسبة الضريبة"} (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full p-4 pr-12 rounded-xl border-2 border-slate-200 font-black text-lg focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="18"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                  %
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-bold">
                {adminLang === "ar"
                  ? "نسبة الضريبة المطبقة على جميع الطلبات"
                  : adminLang === "tr"
                  ? "Tüm siparişlere uygulanan vergi oranı"
                  : "Tax percentage applied to all orders"}
              </p>
              
              {/* Example */}
              {taxPercent > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                  <div className="text-xs font-bold text-blue-900 mb-1">
                    {adminLang === "ar" ? "مثال:" : adminLang === "tr" ? "Örnek:" : "Example:"}
                  </div>
                  <div className="text-sm font-bold text-blue-700">
                    100 TRY + {taxPercent}% = {(100 + (100 * taxPercent / 100)).toFixed(2)} TRY
                  </div>
                </div>
              )}
            </div>

            {/* Cash Discount */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {admT?.cashDiscountPercent || "نسبة خصم الكاش"} (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={cashDiscountPercent}
                  onChange={(e) => setCashDiscountPercent(e.target.value)}
                  className="w-full p-4 pr-12 rounded-xl border-2 border-slate-200 font-black text-lg focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="5"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                  %
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-bold">
                {adminLang === "ar"
                  ? "نسبة الخصم عند الدفع نقداً"
                  : adminLang === "tr"
                  ? "Nakit ödeme için indirim oranı"
                  : "Discount percentage for cash payments"}
              </p>

              {/* Example */}
              {cashDiscountPercent > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="text-xs font-bold text-emerald-900 mb-1">
                    {adminLang === "ar" ? "مثال:" : adminLang === "tr" ? "Örnek:" : "Example:"}
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    100 TRY - {cashDiscountPercent}% = {(100 - (100 * cashDiscountPercent / 100)).toFixed(2)} TRY
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`w-full md:w-auto px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              saving
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
            }`}
          >
            <Save size={20} />
            {saving
              ? (adminLang === "ar" ? "جاري الحفظ..." : adminLang === "tr" ? "Kaydediliyor..." : "Saving...")
              : (admT?.saveSettings || "حفظ الإعدادات")}
          </button>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl font-bold ${
                message.includes("نجاح") || message.includes("success") || message.includes("başarı")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Percent className="text-white" size={24} />
            </div>
            <div>
              <h4 className="font-black text-blue-900">
                {admT?.taxPercent || "الضريبة"}
              </h4>
              <p className="text-2xl font-black text-blue-600">
                {taxPercent}%
              </p>
            </div>
          </div>
          <p className="text-sm font-bold text-blue-700">
            {adminLang === "ar"
              ? "يتم إضافتها تلقائياً على جميع الطلبات"
              : adminLang === "tr"
              ? "Tüm siparişlere otomatik olarak eklenir"
              : "Automatically added to all orders"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h4 className="font-black text-emerald-900">
                {admT?.discount || "خصم الكاش"}
              </h4>
              <p className="text-2xl font-black text-emerald-600">
                {cashDiscountPercent}%
              </p>
            </div>
          </div>
          <p className="text-sm font-bold text-emerald-700">
            {adminLang === "ar"
              ? "يتم تطبيقه عند اختيار الدفع نقداً"
              : adminLang === "tr"
              ? "Nakit ödeme seçildiğinde uygulanır"
              : "Applied when cash payment is selected"}
          </p>
        </div>
      </div>
    </div>
  );
};