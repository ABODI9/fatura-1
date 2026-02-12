// ===============================
// PortalScreen.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { Utensils, LayoutDashboard, User, ArrowRight } from "lucide-react";

export const ModeSelectionScreen  = ({ admT, setAppMode, adminLang, setAdminLang }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="relative mb-10">
        <div className="absolute -inset-10 bg-orange-600/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
          <Utensils className="text-orange-500" size={42} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-black mb-3">{admT?.brand || "Wingi"}</h1>
      <p className="text-white/60 font-bold mb-12">
        {admT?.portalHint || "Choose mode"}
      </p>

      {/* Cards */}
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* Admin */}
        <button
          onClick={() => setAppMode("admin")}
          className="group rounded-2xl p-8 bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="text-blue-400" size={28} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{admT?.admin || "Admin"}</h3>
          <p className="text-sm text-white/60 font-bold mb-3">
            {adminLang === "ar" ? "إدارة المطعم" : adminLang === "tr" ? "Restoran yönetimi" : "Manage restaurant"}
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-400 text-sm font-bold">
            {adminLang === "ar" ? "دخول" : adminLang === "tr" ? "Giriş" : "Enter"}
            <ArrowRight size={16} />
          </div>
        </button>

        {/* Customer */}
        <button
          onClick={() => {
            setAppMode("customer");
            window.location.href = "/";
          }}
          className="group rounded-2xl p-8 bg-orange-600 hover:bg-orange-500 transition-all shadow-2xl"
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <User className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{admT?.customer || "Customer"}</h3>
          <p className="text-sm text-white/80 font-bold mb-3">
            {adminLang === "ar" ? "تصفح القائمة" : adminLang === "tr" ? "Menüye göz at" : "Browse menu"}
          </p>
          <div className="flex items-center justify-center gap-2 text-white text-sm font-bold">
            {adminLang === "ar" ? "ابدأ" : adminLang === "tr" ? "Başla" : "Start"}
            <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {/* Language */}
      <div className="mt-8 flex bg-white/10 border border-white/10 backdrop-blur-md p-1 rounded-xl gap-1">
        {["ar", "tr", "en"].map((l) => (
          <button
            key={l}
            onClick={() => setAdminLang(l)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${
              adminLang === l ? "bg-white text-slate-950" : "text-white/60"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
};