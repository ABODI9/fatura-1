// ===============================
// ReportsSection.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

export const ReportsSection = ({ admT, adminLang }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <BarChart3 size={24} />
        {admT?.reportsSection || "التقارير"}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <h3 className="font-black text-lg mb-2">
            {adminLang === "ar" ? "تقرير المبيعات" : adminLang === "tr" ? "Satış Raporu" : "Sales Report"}
          </h3>
          <p className="text-sm text-slate-600 font-bold">
            {adminLang === "ar" 
              ? "عرض تفصيلي للمبيعات حسب الفترة" 
              : adminLang === "tr" 
              ? "Dönem bazında satış detayları" 
              : "Detailed sales by period"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <FileText className="text-emerald-600" size={24} />
          </div>
          <h3 className="font-black text-lg mb-2">
            {adminLang === "ar" ? "تقرير المخزون" : adminLang === "tr" ? "Envanter Raporu" : "Inventory Report"}
          </h3>
          <p className="text-sm text-slate-600 font-bold">
            {adminLang === "ar" 
              ? "حالة المخزون والتنبيهات" 
              : adminLang === "tr" 
              ? "Stok durumu ve uyarılar" 
              : "Stock status and alerts"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <BarChart3 className="text-purple-600" size={24} />
          </div>
          <h3 className="font-black text-lg mb-2">
            {adminLang === "ar" ? "تقرير مالي" : adminLang === "tr" ? "Mali Rapor" : "Financial Report"}
          </h3>
          <p className="text-sm text-slate-600 font-bold">
            {adminLang === "ar" 
              ? "الإيرادات والمصروفات" 
              : adminLang === "tr" 
              ? "Gelir ve giderler" 
              : "Revenue and expenses"}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
        <BarChart3 className="mx-auto mb-4 text-slate-400" size={64} />
        <h3 className="font-black text-xl text-slate-700 mb-2">
          {adminLang === "ar" ? "قريباً" : adminLang === "tr" ? "Yakında" : "Coming Soon"}
        </h3>
        <p className="text-slate-500 font-bold">
          {adminLang === "ar" 
            ? "التقارير التفصيلية قيد التطوير" 
            : adminLang === "tr" 
            ? "Detaylı raporlar geliştiriliyor" 
            : "Detailed reports under development"}
        </p>
      </div>
    </div>
  );
};