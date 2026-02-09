// ===============================
// AdminLoginScreen.jsx - محسّن
// Features: Full Translation
// ===============================

import React from "react";
import { Lock, User, Key } from "lucide-react";

export const AdminLoginScreen = ({
  admT,
  adminLang,
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
  handleAdminRegister
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
            <Lock className="text-orange-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">{admT?.brand || "Wingi"}</h1>
          <p className="text-white/60 font-bold">
            {adminAuthMode === "login" 
              ? (admT?.adminLogin || "Admin Login")
              : (admT?.adminRegister || "Create Admin")
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
          <div className="space-y-3">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                {admT?.username || "Username"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder={admT?.username || "Username"}
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                {admT?.password || "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={admT?.password || "Password"}
                  type="password"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                />
              </div>
            </div>

            {/* Owner PIN */}
            {adminAuthMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  {admT?.ownerPin || "Owner PIN"}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                  <input
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    placeholder={admT?.ownerPin || "Owner PIN"}
                    type="password"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none font-bold text-sm"
                  />
                </div>
              </div>
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
              {adminAuthMode === "login" ? (admT?.login || "Login") : (admT?.createAccount || "Create")}
            </button>

            {/* Toggle */}
            <button
              onClick={() => setAdminAuthMode(adminAuthMode === "login" ? "register" : "login")}
              className="w-full py-2 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-white/80 text-sm"
            >
              {adminAuthMode === "login" 
                ? (admT?.adminRegister || "Create Account") 
                : (admT?.adminLogin || "Login")
              }
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="mt-6 flex justify-center">
          <div className="flex bg-white/10 border border-white/10 backdrop-blur-md p-1 rounded-xl gap-1">
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
      </div>
    </div>
  );
};