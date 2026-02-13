// ===============================
// CashierLogin.jsx - تسجيل دخول الكاشير
// Cashier Login Screen
// ===============================

import React, { useState } from "react";
import { Eye, EyeOff, User, LogIn, Lock } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";

export const CashierLogin = ({ db, appId, onLogin, onBack, adminLang = "ar" }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = {
    ar: {
      cashierLogin: "تسجيل دخول الكاشير",
      enterCredentials: "أدخل بيانات الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      enterUsername: "أدخل اسم المستخدم",
      enterPassword: "أدخل كلمة المرور",
      login: "تسجيل الدخول",
      back: "رجوع",
      fillAllFields: "الرجاء ملء جميع الحقول",
      incorrectCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
      accountInactive: "هذا الحساب غير نشط. الرجاء التواصل مع المدير",
      genericError: "حدث خطأ أثناء تسجيل الدخول",
    },
    en: {
      cashierLogin: "Cashier Login",
      enterCredentials: "Enter your credentials",
      username: "Username",
      password: "Password",
      enterUsername: "Enter username",
      enterPassword: "Enter password",
      login: "Login",
      back: "Back",
      fillAllFields: "Please fill all fields",
      incorrectCredentials: "Incorrect username or password",
      accountInactive: "This account is inactive. Please contact admin",
      genericError: "Login error",
    },
    tr: {
      cashierLogin: "Kasiyer Girişi",
      enterCredentials: "Giriş bilgilerini girin",
      username: "Kullanıcı Adı",
      password: "Şifre",
      enterUsername: "Kullanıcı adını girin",
      enterPassword: "Şifreyi girin",
      login: "Giriş",
      back: "Geri",
      fillAllFields: "Lütfen tüm alanları doldurun",
      incorrectCredentials: "Yanlış kullanıcı adı veya şifre",
      accountInactive: "Bu hesap aktif değil. Lütfen yöneticiye başvurun",
      genericError: "Giriş hatası",
    },
  };

  const admT = t[adminLang] || t.ar;

  const handleLogin = async () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(admT.fillAllFields);
      return;
    }

    setLoading(true);

    try {
      // البحث في جدول الموظفين
      const staffQuery = query(
        collection(db, "artifacts", appId, "public", "data", "staff"),
        where("username", "==", username.trim())
      );

      const staffSnapshot = await getDocs(staffQuery);

      if (staffSnapshot.empty) {
        setError(admT.incorrectCredentials);
        setLoading(false);
        return;
      }

      const staffDoc = staffSnapshot.docs[0];
      const staffData = staffDoc.data();

      // التحقق من كلمة المرور
      if (staffData.password !== password.trim()) {
        setError(admT.incorrectCredentials);
        setLoading(false);
        return;
      }

      // التحقق من الحساب نشط
      if (staffData.isActive === false) {
        setError(admT.accountInactive);
        setLoading(false);
        return;
      }

      // تسجيل الدخول ناجح
      onLogin({
        id: staffDoc.id,
        username: staffData.username,
        role: staffData.role || "cashier",
        fullName: staffData.fullName || staffData.username,
      });
    } catch (e) {
      console.error("Login error:", e);
      setError(admT.genericError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" dir={adminLang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-md w-full">
        {/* زر الرجوع */}
        <button
          onClick={onBack}
          className={`text-slate-400 hover:text-white font-bold mb-6 flex items-center gap-2 ${adminLang === "ar" ? "" : "flex-row-reverse"}`}
        >
          {adminLang === "ar" ? "←" : "→"} {admT.back}
        </button>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 mx-auto mb-4 flex items-center justify-center">
              <Lock size={32} className="text-orange-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {admT.cashierLogin}
            </h2>
            <p className="text-slate-600 font-bold">{admT.enterCredentials}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm text-center">
              {error}
            </div>
          )}

          {/* اسم المستخدم */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-slate-700">
              {admT.username}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder={admT.enterUsername}
                className={`w-full p-4 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none transition-all ${adminLang === "ar" ? "pr-12" : "pl-12"}`}
                autoFocus
                disabled={loading}
              />
              <User
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${adminLang === "ar" ? "right-4" : "left-4"}`}
                size={20}
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-slate-700">
              {admT.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder={admT.enterPassword}
                className={`w-full p-4 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none transition-all ${adminLang === "ar" ? "pr-12" : "pl-12"}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${adminLang === "ar" ? "right-4" : "left-4"}`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-slate-400 text-white cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn size={20} />
                {admT.login}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};