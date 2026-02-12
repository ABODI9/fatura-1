// ===============================
// AdminLoginScreen.jsx - Improved
// Add: Back button + Remember me (optional)
// ===============================

import React from "react";
import { Lock, User, Key, ArrowLeft, Check } from "lucide-react";

export const AdminLoginScreen = ({
  admT,
  adminLang,
  setAdminLang, // ✅ مهم: أنت تستخدمها تحت
  adminAuthMode,
  setAdminAuthMode,
  adminUsername,
  setAdminUsername,
  adminPassword,
  setAdminPassword,
  ownerPin,
  setOwnerPin,
  adminAuthError,
  handleAdminLogin,
  handleAdminRegister,

  // ✅ جديد (اختياري)
  rememberAdmin,
  setRememberAdmin,
  onBack,
}) => {
  const goBack = () => {
    if (onBack) return onBack();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-black text-xs"
          >
            <ArrowLeft size={16} />
            {admT?.back || "رجوع"}
          </button>

          
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
            <Lock className="text-orange-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">{admT?.brand || "Wingi"}</h1>
          <p className="text-white/60 font-bold">
            {adminAuthMode === "login"
              ? (admT?.adminLogin || "تسجيل دخول الإدارة")
              : (admT?.adminRegister || "إنشاء حساب إدارة")}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                {admT?.username || "اسم المستخدم"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder={admT?.username || "اسم المستخدم"}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                {admT?.password || "كلمة المرور"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={admT?.password || "كلمة المرور"}
                  type="password"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                />
              </div>
            </div>

            {/* Owner PIN */}
            {adminAuthMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  {admT?.ownerPin || "PIN المالك"}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                  <input
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    placeholder={admT?.ownerPin || "PIN المالك"}
                    type="password"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                  />
                </div>
              </div>
            )}

            {/* Remember me (optional) */}
            {typeof rememberAdmin !== "undefined" && typeof setRememberAdmin === "function" && (
              <button
                type="button"
                onClick={() => setRememberAdmin(!rememberAdmin)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-black text-sm"
              >
                <span>{admT?.rememberMe || "تذكرني على هذا الجهاز"}</span>
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                    rememberAdmin ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30 text-white/50"
                  }`}
                >
                  {rememberAdmin ? <Check size={16} /> : null}
                </span>
              </button>
            )}

            {/* Error */}
            {adminAuthError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-xl text-xs font-bold">
                {adminAuthError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={adminAuthMode === "login" ? handleAdminLogin : handleAdminRegister}
              className="w-full py-3 rounded-xl font-black bg-orange-600 hover:bg-orange-500 text-white"
            >
              {adminAuthMode === "login" ? (admT?.login || "دخول") : (admT?.createAccount || "إنشاء")}
            </button>

            {/* Toggle */}
            <button
              onClick={() => setAdminAuthMode(adminAuthMode === "login" ? "register" : "login")}
              className="w-full py-2 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-white/80 text-sm"
            >
              {adminAuthMode === "login"
                ? (admT?.adminRegister || "إنشاء حساب")
                : (admT?.adminLogin || "تسجيل دخول")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
