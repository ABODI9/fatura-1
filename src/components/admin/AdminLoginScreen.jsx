// components/admin/AdminLoginScreen.jsx
import React from "react";

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
      <div className="bg-white/10 backdrop-blur-md border border-white/10 w-full max-w-lg p-8 rounded-[3.5rem] shadow-2xl">
        <h2 className="text-3xl font-black mb-2 text-white">
          {adminAuthMode === "login" ? (admT.adminLogin || "تسجيل الدخول") : (admT.adminRegister || "إنشاء حساب")}
        </h2>

        <div className="space-y-3 mt-6">
          <input
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            placeholder={admT.username || "اسم المستخدم"}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none placeholder-white/50"
          />

          <input
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder={admT.password || "كلمة المرور"}
            type="password"
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none placeholder-white/50"
          />

          {adminAuthMode === "register" && (
            <input
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value)}
              placeholder={admT.ownerPin || "كلمة سر المالك"}
              type="password"
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none placeholder-white/50"
            />
          )}

          {adminAuthError && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-3 rounded-2xl text-sm font-bold">
              {adminAuthError}
            </div>
          )}

          <button
            onClick={adminAuthMode === "login" ? handleAdminLogin : handleAdminRegister}
            className="w-full py-4 rounded-2xl font-black bg-orange-600 hover:bg-orange-500 transition-all text-white"
          >
            {adminAuthMode === "login" ? (admT.login || "دخول") : (admT.createAccount || "إنشاء حساب")}
          </button>

          <button
            onClick={() => {
              setAdminAuthMode(adminAuthMode === "login" ? "register" : "login");
            }}
            className="w-full py-4 rounded-2xl font-black bg-white/10 hover:bg-white/15 transition-all text-white"
          >
            {adminAuthMode === "login" ? (admT.adminRegister || "إنشاء حساب إدارة") : (admT.adminLogin || "تسجيل الدخول")}
          </button>
        </div>
      </div>
    </div>
  );
};