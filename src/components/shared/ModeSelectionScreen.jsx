// ===============================
// PortalScreen.jsx - صفحة اختيار وضع الدخول
// ===============================

import React from "react";
import { User, Grid } from "lucide-react";

export const ModeSelectionScreen = ({ admT, setAppMode, adminLang, setAdminLang }) => {
  const goTo = (mode) => {
    // نخزن الوضع المطلوب مرة وحدة فقط
    sessionStorage.setItem("wingi_next_mode", mode);

    // نغير المسار حسب الوضع
    if (mode === "cashier") {
      window.location.assign("/cashier");
      return;
    }

    if (mode === "admin") {
      window.location.assign("/admin");
      return;
    }

    // fallback
    setAppMode(mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-3xl bg-orange-600 mx-auto mb-6 flex items-center justify-center text-5xl shadow-2xl">
            🍽️
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Wingi</h1>
          <p className="text-slate-400 font-bold text-lg">
            {admT?.selectLoginMode || "اختر وضع الدخول"}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cashier Mode */}
          <button
            onClick={() => goTo("cashier")}
            className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl hover:shadow-2xl hover:scale-105 transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {admT?.cashier || "الكاشير"}
            </h2>
            <p className="text-orange-100 font-bold">
              {admT?.cashierAccess || "نظام الكاشير"}
            </p>
            <div className="mt-4 text-white font-black flex items-center justify-center gap-2">
              {admT?.start || "ابدأ"}
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>

          {/* Admin Mode */}
          <button
            onClick={() => goTo("admin")}
            className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 rounded-3xl border-2 border-slate-600 hover:shadow-2xl hover:scale-105 transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {admT?.admin || "الإدارة"}
            </h2>
            <p className="text-slate-400 font-bold">
              {admT?.adminAccess || "إدارة المطعم"}
            </p>
            <div className="mt-4 text-white font-black flex items-center justify-center gap-2">
              {admT?.login || "دخول"}
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-2 mt-8">
          {["ar", "tr", "en"].map((lang) => (
            <button
              key={lang}
              onClick={() => setAdminLang(lang)}
              className={`px-6 py-2 rounded-xl font-black uppercase transition-all ${
                adminLang === lang
                  ? "bg-orange-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
