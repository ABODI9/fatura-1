// ===============================
// BalanceSheetSection.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { Scale } from "lucide-react";

export const BalanceSheetSection = ({ admT, adminLang, accounts = [] }) => {
  const activeAccounts = accounts.filter(a => !a.isDeleted);
  
  const assets = activeAccounts.filter(a => a.type === "asset");
  const liabilities = activeAccounts.filter(a => a.type === "liability");
  const equity = activeAccounts.filter(a => a.type === "equity");

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <Scale size={24} />
        {admT?.balanceSheetSection || "الميزانية"}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white p-6 rounded-2xl border">
          <h3 className="font-black text-lg mb-4 text-blue-900">
            {adminLang === "ar" ? "الأصول" : adminLang === "tr" ? "Varlıklar" : "Assets"}
          </h3>
          {assets.length === 0 ? (
            <p className="text-sm text-slate-500 font-bold">
              {admT?.noData || "لا توجد بيانات"}
            </p>
          ) : (
            <div className="space-y-2">
              {assets.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="font-bold text-sm">{acc.name}</span>
                  <span className="font-black">{Number(acc.balance || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-xl mt-4">
                <span className="font-black">{admT?.total || "المجموع"}</span>
                <span className="font-black text-lg">{totalAssets.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-black text-lg mb-4 text-red-900">
              {adminLang === "ar" ? "الخصوم" : adminLang === "tr" ? "Yükümlülükler" : "Liabilities"}
            </h3>
            {liabilities.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold">{admT?.noData || "لا توجد بيانات"}</p>
            ) : (
              <div className="space-y-2">
                {liabilities.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                    <span className="font-bold text-sm">{acc.name}</span>
                    <span className="font-black">{Number(acc.balance || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-red-600 text-white rounded-xl mt-4">
                  <span className="font-black">{admT?.total || "المجموع"}</span>
                  <span className="font-black text-lg">{totalLiabilities.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-black text-lg mb-4 text-emerald-900">
              {adminLang === "ar" ? "حقوق الملكية" : adminLang === "tr" ? "Özkaynak" : "Equity"}
            </h3>
            {equity.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold">{admT?.noData || "لا توجد بيانات"}</p>
            ) : (
              <div className="space-y-2">
                {equity.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                    <span className="font-bold text-sm">{acc.name}</span>
                    <span className="font-black">{Number(acc.balance || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-emerald-600 text-white rounded-xl mt-4">
                  <span className="font-black">{admT?.total || "المجموع"}</span>
                  <span className="font-black text-lg">{totalEquity.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Check */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg mb-2">
              {adminLang === "ar" ? "المعادلة المحاسبية" : adminLang === "tr" ? "Muhasebe Denklemi" : "Accounting Equation"}
            </h3>
            <p className="text-sm text-slate-300 font-bold">
              {adminLang === "ar" 
                ? "الأصول = الخصوم + حقوق الملكية" 
                : adminLang === "tr" 
                ? "Varlıklar = Yükümlülükler + Özkaynak" 
                : "Assets = Liabilities + Equity"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{totalAssets.toFixed(2)}</div>
            <div className="text-sm text-slate-300 font-bold">
              = {(totalLiabilities + totalEquity).toFixed(2)}
            </div>
          </div>
        </div>
        {Math.abs(totalAssets - (totalLiabilities + totalEquity)) > 0.01 && (
          <div className="mt-4 p-3 bg-red-500 rounded-xl">
            <p className="text-sm font-black">
              ⚠️ {adminLang === "ar" ? "الميزانية غير متوازنة!" : adminLang === "tr" ? "Bilanço dengeli değil!" : "Balance sheet not balanced!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};