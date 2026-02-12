// ===============================
// Sidebar.jsx - FULL (Tailwind-safe colors)
// ===============================

import React from "react";
import {
  ShoppingBag,
  Receipt,
  Package,
  Users,
  Truck,
  FileText,
  DollarSign,
  BarChart3,
  TrendingUp,
  Scale,
  Activity,
  Settings,
  UserCog,
  Percent
} from "lucide-react";

export const Sidebar = ({
  adminPage,
  setAdminPage,
  admT,
  adminLang,
  adminSession
}) => {
  const colorClass = {
    orange: "text-orange-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    cyan: "text-cyan-600",
    pink: "text-pink-600",
    green: "text-green-600",
    slate: "text-slate-600",
    amber: "text-amber-600",
    teal: "text-teal-600",
    violet: "text-violet-600",
    rose: "text-rose-600",
  };

  const menuItems = [
    { id: "menu", label: admT?.menuSection || "قائمة الطعام", icon: ShoppingBag, color: "orange" },
    { id: "orders", label: admT?.ordersSection || "الطلبات", icon: Receipt, color: "blue" },
    { id: "inventory", label: admT?.inventorySection || "المخزون", icon: Package, color: "purple" },
    { id: "customers", label: admT?.customersSection || "العملاء", icon: Users, color: "emerald" },
    { id: "vendors", label: admT?.vendorsSection || "الموردين", icon: Truck, color: "indigo" },
    { id: "invoices", label: admT?.invoicesSection || "الفواتير", icon: FileText, color: "cyan" },
    { id: "bills", label: admT?.billsSection || "فواتير المشتريات", icon: Receipt, color: "pink" },
    { id: "finance", label: admT?.financeSection || "المالية", icon: DollarSign, color: "green" },
    { id: "accounting", label: admT?.accountingSection || "المحاسبة", icon: BarChart3, color: "slate" },
    { id: "reports", label: admT?.reportsSection || "التقارير", icon: TrendingUp, color: "amber" },
    { id: "balanceSheet", label: admT?.balanceSheetSection || "الميزانية", icon: Scale, color: "teal" },
    { id: "cashFlow", label: admT?.cashFlowSection || "التدفق النقدي", icon: Activity, color: "blue" },
  ];

  const managementItems = [
    { id: "staff", label: admT?.staffSection || "الموظفين", icon: UserCog, color: "violet" },
    { id: "percentages", label: admT?.percentagesSection || "النسب والخصومات", icon: Percent, color: "rose" },
    { id: "settings", label: admT?.settingsSection || "الإعدادات", icon: Settings, color: "slate" },
  ];

  const title = adminLang === "ar" ? "القائمة" : adminLang === "tr" ? "Menü" : "Menu";
  const mgmt = adminLang === "ar" ? "إدارة" : adminLang === "tr" ? "Yönetim" : "Management";

  return (
    <aside className="xl:col-span-3">
      <div className="bg-white rounded-2xl border p-4 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">{title}</h3>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setAdminPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} className={isActive ? "" : (colorClass[item.color] || "text-slate-600")} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}

          <div className="my-3 px-2">
            <div className="h-px bg-slate-200"></div>
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mt-3 mb-2">{mgmt}</h3>
          </div>

          {managementItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setAdminPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} className={isActive ? "" : (colorClass[item.color] || "text-slate-600")} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
