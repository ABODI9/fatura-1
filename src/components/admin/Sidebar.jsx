// ===============================
// Sidebar.jsx - محسّن مع الموظفين والنسب
// Features: Full Translation + Staff + Percentages
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
  adminSession // لتحديد صلاحيات الأدمن
}) => {
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

  // أقسام الأدمن فقط
  const adminOnlyItems = [
    { id: "staff", label: admT?.staffSection || "الموظفين", icon: UserCog, color: "violet" },
    { id: "percentages", label: admT?.percentagesSection || "النسب والخصومات", icon: Percent, color: "rose" },
    { id: "settings", label: admT?.settingsSection || "الإعدادات", icon: Settings, color: "slate" }
  ];

  return (
    <aside className="xl:col-span-3">
      <div className="bg-white rounded-2xl border p-4 sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">
          {adminLang === "ar" ? "القائمة" : adminLang === "tr" ? "Menü" : "Menu"}
        </h3>
        
        <nav className="space-y-1">
          {/* القائمة الرئيسية */}
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
                    : `text-slate-700 hover:bg-slate-50`
                }`}
              >
                <Icon 
                  size={18} 
                  className={isActive ? "" : `text-${item.color}-600`} 
                />
                <span className="flex-1 text-right">{item.label}</span>
              </button>
            );
          })}

          {/* فاصل */}
          {adminSession?.role === "admin" && (
            <div className="my-3 px-2">
              <div className="h-px bg-slate-200"></div>
              <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mt-3 mb-2">
                {adminLang === "ar" ? "إدارة" : adminLang === "tr" ? "Yönetim" : "Management"}
              </h3>
            </div>
          )}

          {/* قائمة الأدمن فقط */}
          {adminSession?.role === "admin" && adminOnlyItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setAdminPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : `text-slate-700 hover:bg-slate-50`
                }`}
              >
                <Icon 
                  size={18} 
                  className={isActive ? "" : `text-${item.color}-600`} 
                />
                <span className="flex-1 text-right">{item.label}</span>
                
                {/* شارة للأدمن فقط */}
                {!isActive && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    {adminLang === "ar" ? "أدمن" : adminLang === "tr" ? "Admin" : "Admin"}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};