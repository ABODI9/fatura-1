// ===============================
// Sidebar.jsx - محسّن
// Features: Full Translation
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
  Settings
} from "lucide-react";

export const Sidebar = ({ adminPage, setAdminPage, admT, adminLang }) => {
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
    { id: "settings", label: admT?.settingsSection || "الإعدادات", icon: Settings, color: "slate" }
  ];

  return (
    <aside className="xl:col-span-3">
      <div className="bg-white rounded-2xl border p-4 sticky top-[100px]">
        <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">
          {adminLang === "ar" ? "القائمة" : adminLang === "tr" ? "Menü" : "Menu"}
        </h3>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setAdminPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : `text-slate-700 hover:bg-${item.color}-50`
                }`}
              >
                <Icon size={18} className={isActive ? "" : `text-${item.color}-600`} />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};