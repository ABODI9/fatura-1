import React from "react";
import { Utensils, LayoutDashboard, User } from "lucide-react";

export const PortalScreen = ({ admT, setAppMode, adminLang, setAdminLang }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="relative mb-10">
        <div className="absolute -inset-10 bg-orange-600/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-[2.5rem] bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
          <Utensils className="text-orange-500" size={42} />
        </div>
      </div>

      <h1 className="text-5xl font-black tracking-tighter mb-4">
        {admT.brand || "Wingi"}
      </h1>
      <p className="text-white/50 font-bold mb-12">{admT.portalHint || "اختر وضع الدخول"}</p>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setAppMode("admin")}
          className="group rounded-[3rem] p-10 bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all text-center"
        >
          <LayoutDashboard className="mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform" size={44} />
          <div className="text-2xl font-black">{admT.admin || "الإدارة"}</div>
        </button>

        <button
          onClick={() => {
            setAppMode("customer");
            window.location.href = "/";
          }}
          className="group rounded-[3rem] p-10 bg-orange-600 hover:bg-orange-500 transition-all text-center shadow-2xl shadow-orange-900/30"
        >
          <User className="mx-auto mb-6 text-white group-hover:scale-110 transition-transform" size={44} />
          <div className="text-2xl font-black text-white">{admT.customer || "العملاء"}</div>
        </button>
      </div>

      <div className="mt-10 flex bg-white/10 border border-white/10 backdrop-blur-md p-1 rounded-2xl gap-1">
        {["ar", "tr", "en"].map((l) => (
          <button
            key={l}
            onClick={() => setAdminLang(l)}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
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