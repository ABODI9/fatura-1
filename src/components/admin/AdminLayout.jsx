// ===============================
// AdminLayout.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { LogOut, Bell } from "lucide-react";

export const AdminLayout = ({
  adminLang,
  setAdminLang,
  adminSession,
  adminLogout,
  children,
  inventoryAlerts,
  admT
}) => {
  const totalAlerts = (inventoryAlerts?.out?.length || 0) + (inventoryAlerts?.low?.length || 0);

  return (
    <div className="min-h-screen bg-slate-50" dir={adminLang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black">
              W
            </div>
            <div>
              <div className="font-black text-slate-900">{admT?.brand || "Wingi"}</div>
              <div className="text-xs font-bold text-slate-500">{admT?.admin || "Admin"}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Alerts */}
            {totalAlerts > 0 && (
              <div className="relative">
                <button className="p-2 rounded-lg bg-red-100 text-red-700">
                  <Bell size={18} />
                </button>
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                  {totalAlerts}
                </span>
              </div>
            )}

            {/* Language */}
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
              {["ar", "tr", "en"].map((l) => (
                <button
                  key={l}
                  onClick={() => setAdminLang(l)}
                  className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                    adminLang === l ? "bg-slate-950 text-white" : "text-slate-500"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                {adminSession?.username?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <span className="text-xs font-bold">{adminSession?.username || "Admin"}</span>
            </div>

            {/* Logout */}
            <button
              onClick={adminLogout}
              className="p-2 rounded-lg bg-red-100 text-red-700"
              title={admT?.logout || "Logout"}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">{children}</main>
    </div>
  );
};