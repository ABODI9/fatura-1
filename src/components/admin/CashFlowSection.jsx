// ===============================
// CashFlowSection.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const CashFlowSection = ({ admT, adminLang }) => {
  // Placeholder data - في المستقبل سيتم جلبها من Firebase
  const cashFlowData = {
    operating: 15000,
    investing: -5000,
    financing: 3000
  };

  const netCashFlow = cashFlowData.operating + cashFlowData.investing + cashFlowData.financing;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <DollarSign size={24} />
        {admT?.cashFlowSection || "التدفق النقدي"}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Operating Activities */}
        <div className="bg-white p-6 rounded-2xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm">
              {adminLang === "ar" ? "الأنشطة التشغيلية" : adminLang === "tr" ? "İşletme Faaliyetleri" : "Operating Activities"}
            </h3>
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            +{cashFlowData.operating.toLocaleString()} TRY
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2">
            {adminLang === "ar" ? "من المبيعات والعمليات" : adminLang === "tr" ? "Satış ve operasyonlardan" : "From sales and operations"}
          </p>
        </div>

        {/* Investing Activities */}
        <div className="bg-white p-6 rounded-2xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm">
              {adminLang === "ar" ? "الأنشطة الاستثمارية" : adminLang === "tr" ? "Yatırım Faaliyetleri" : "Investing Activities"}
            </h3>
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div className="text-3xl font-black text-red-600">
            {cashFlowData.investing.toLocaleString()} TRY
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2">
            {adminLang === "ar" ? "استثمارات وأصول" : adminLang === "tr" ? "Yatırımlar ve varlıklar" : "Investments and assets"}
          </p>
        </div>

        {/* Financing Activities */}
        <div className="bg-white p-6 rounded-2xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm">
              {adminLang === "ar" ? "الأنشطة التمويلية" : adminLang === "tr" ? "Finansman Faaliyetleri" : "Financing Activities"}
            </h3>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-black text-blue-600">
            +{cashFlowData.financing.toLocaleString()} TRY
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2">
            {adminLang === "ar" ? "قروض ورأس مال" : adminLang === "tr" ? "Krediler ve sermaye" : "Loans and capital"}
          </p>
        </div>
      </div>

      {/* Net Cash Flow */}
      <div className={`p-6 rounded-2xl ${netCashFlow >= 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg mb-2">
              {adminLang === "ar" ? "صافي التدفق النقدي" : adminLang === "tr" ? "Net Nakit Akışı" : "Net Cash Flow"}
            </h3>
            <p className="text-sm text-white/80 font-bold">
              {adminLang === "ar" ? "للفترة الحالية" : adminLang === "tr" ? "Mevcut dönem için" : "For current period"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black">
              {netCashFlow >= 0 ? "+" : ""}{netCashFlow.toLocaleString()} TRY
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
        <DollarSign className="mx-auto mb-4 text-slate-400" size={64} />
        <h3 className="font-black text-xl text-slate-700 mb-2">
          {adminLang === "ar" ? "قريباً" : adminLang === "tr" ? "Yakında" : "Coming Soon"}
        </h3>
        <p className="text-slate-500 font-bold">
          {adminLang === "ar" 
            ? "تقارير تدفق نقدي تفصيلية قيد التطوير" 
            : adminLang === "tr" 
            ? "Detaylı nakit akışı raporları geliştiriliyor" 
            : "Detailed cash flow reports under development"}
        </p>
      </div>
    </div>
  );
};