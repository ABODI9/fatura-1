import React from "react";

export const Sidebar = ({ adminPage, setAdminPage }) => {
  const navItems = [
    { id: "menu", icon: "🍽️", label: "قائمة الطعام" },
    { id: "orders", icon: "🧾", label: "الطلبات" },
    { id: "inventory", icon: "🧺", label: "المخزون" },
    { id: "finance", icon: "💰", label: "الإيرادات والإخراجات" },
    { id: "accounting", icon: "📘", label: "المحاسبة (قيود يومية)" },
    { id: "reports", icon: "📊", label: "التقارير" },
    { id: "balanceSheet", icon: "📊", label: "الميزانية العمومية" },
    { id: "cashFlow", icon: "💧", label: "التدفقات النقدية" },
    { id: "invoices", icon: "🧾", label: "الفواتير" },
    { id: "customers", icon: "👥", label: "العملاء" },
    { id: "customer_ledger", icon: "📒", label: "كشف حساب عميل" },
    { id: "receipts", icon: "💵", label: "سندات القبض" },
    { id: "vendors", icon: "🏭", label: "الموردون" },
    { id: "bills", icon: "🧾", label: "فواتير المشتريات" },
    { id: "vendorPayments", icon: "💸", label: "سندات صرف الموردين" },
    { id: "settings", icon: "⚙️", label: "إعدادات المحاسبة" },
  ];

  return (
    <aside className="xl:col-span-3">
      <div className="bg-white rounded-[2rem] border p-4 sticky top-[92px]">
        <div className="text-sm font-black text-slate-500 mb-3">Navigation</div>

        <div className="space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setAdminPage(item.id)}
              className={`w-full px-4 py-3 rounded-2xl font-black text-right transition-all ${
                adminPage === item.id
                  ? "bg-slate-950 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};