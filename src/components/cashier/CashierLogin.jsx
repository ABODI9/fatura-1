import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Lock, ArrowLeft } from "lucide-react";

const onlyDigits = (v) => (v || "").replace(/[^\d]/g, "");

const PinDots = ({ length, max = 4 }) => (
  <div className="flex items-center justify-center gap-3 mt-4">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full ${i < length ? "bg-slate-900" : "bg-slate-200"}`}
      />
    ))}
  </div>
);

export const CashierLogin = ({ db, appId, onLogin, onBack, adminLang = "ar" }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hiddenRef = useRef(null);

  const t = {
    ar: {
      title: "دخول الكاشير",
      subtitle: "أدخل PIN (4 أرقام)",
      pin: "PIN",
      back: "رجوع",
      wrong: "PIN غير صحيح",
      inactive: "هذا الحساب غير نشط. تواصل مع المدير",
      generic: "حدث خطأ أثناء تسجيل الدخول",
    },
    en: {
      title: "Cashier Login",
      subtitle: "Enter PIN (4 digits)",
      pin: "PIN",
      back: "Back",
      wrong: "Wrong PIN",
      inactive: "Account inactive. Contact admin",
      generic: "Login error",
    },
    tr: {
      title: "Kasiyer Girişi",
      subtitle: "PIN girin (4 hane)",
      pin: "PIN",
      back: "Geri",
      wrong: "Yanlış PIN",
      inactive: "Hesap pasif. Yöneticiye başvurun",
      generic: "Giriş hatası",
    },
  };

  const admT = t[adminLang] || t.ar;
  const dir = adminLang === "ar" ? "rtl" : "ltr";
  const PIN_LEN = 4;

  const focusHidden = () => {
    // يخلي الكيبورد يشتغل حتى لو المستخدم ضغط على الشاشة
    hiddenRef.current?.focus();
  };

  useEffect(() => {
    focusHidden();
  }, []);

  const submit = async (pinValue) => {
    const p = onlyDigits(pinValue);
    if (p.length !== PIN_LEN) return;

    setError("");
    setLoading(true);

    try {
      // ✅ نبحث عن الموظف بواسطة pin (لا يتكرر)
      const qy = query(
        collection(db, "artifacts", appId, "public", "data", "staff"),
        where("pin", "==", p)
      );

      const snap = await getDocs(qy);

      if (snap.empty) {
        setError(admT.wrong);
        setLoading(false);
        setPin("");
        focusHidden();
        return;
      }

      const staffDoc = snap.docs[0];
      const staffData = staffDoc.data() || {};

      if (staffData.isActive === false) {
        setError(admT.inactive);
        setLoading(false);
        setPin("");
        focusHidden();
        return;
      }

      onLogin?.({
        id: staffDoc.id,
        username: staffData.username,
        role: staffData.role || "cashier",
        fullName: staffData.fullName || staffData.username,
        pin: staffData.pin,
      });
    } catch (e) {
      console.error(e);
      setError(admT.generic);
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d) => {
    if (loading) return;
    setError("");
    setPin((prev) => {
      if (prev.length >= PIN_LEN) return prev;
      const next = `${prev}${d}`;
      if (next.length === PIN_LEN) submit(next);
      return next;
    });
    focusHidden();
  };

  const delDigit = () => {
    if (loading) return;
    setError("");
    setPin((prev) => prev.slice(0, -1));
    focusHidden();
  };

  const clearAll = () => {
    if (loading) return;
    setError("");
    setPin("");
    focusHidden();
  };

  // ✅ يدعم الكيبورد: أرقام + Enter + Backspace
  const onKeyDown = (e) => {
    if (loading) return;

    if (e.key === "Enter") {
      e.preventDefault();
      submit(pin);
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      delDigit();
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      addDigit(e.key);
    }
  };

  const keys = ["1","2","3","4","5","6","7","8","9","clear","0","del"];

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-6"
      dir={dir}
      onMouseDown={focusHidden}
      onTouchStart={focusHidden}
    >
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-slate-900 font-black flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          {admT.back}
        </button>

        <div className="bg-white rounded-3xl border shadow-sm p-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 mx-auto mb-3 flex items-center justify-center">
              <Lock className="text-orange-600" size={26} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">{admT.title}</h1>
            <p className="text-slate-500 font-bold mt-1">{admT.subtitle}</p>
            <PinDots length={pin.length} max={PIN_LEN} />
          </div>

          {/* ✅ input مخفي للكيبورد (iPad keyboard / physical keyboard) */}
          <input
            ref={hiddenRef}
            value={pin}
            onChange={(e) => setPin(onlyDigits(e.target.value).slice(0, PIN_LEN))}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            className="absolute opacity-0 pointer-events-none"
            aria-hidden="true"
          />

          {error && (
            <div className="mt-6 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-black text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-8 grid grid-cols-3 gap-4">
            {keys.map((k) => {
              if (k === "del") {
                return (
                  <button
                    key={k}
                    onClick={delDigit}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      clearAll();
                    }}
                    className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg"
                  >
                    ⌫
                  </button>
                );
              }

              if (k === "clear") {
                return (
                  <button
                    key={k}
                    onClick={clearAll}
                    className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm"
                  >
                    مسح
                  </button>
                );
              }

              return (
                <button
                  key={k}
                  onClick={() => addDigit(k)}
                  className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-2xl font-black active:scale-[0.98]"
                >
                  {k}
                </button>
              );
            })}
          </div>

          <button
            disabled={loading || pin.length !== PIN_LEN}
            onClick={() => submit(pin)}
            className="mt-6 w-full h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black disabled:bg-slate-200 disabled:text-slate-500"
          >
            {loading ? "..." : "دخول"}
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400 font-bold">
            تقدر تدخل باللمس أو بالكيبورد — Enter للدخول، Backspace للحذف
          </p>
        </div>
      </div>
    </div>
  );
};
