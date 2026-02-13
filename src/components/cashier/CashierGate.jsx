// ===============================
// CashierGate.jsx
// PIN-only login (4 digits) + session/day cache
// Works with touch keypad + keyboard (iPad/PC)
// ===============================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { Lock, ArrowLeft, BadgeCheck } from "lucide-react";

const LS_SESSION = "wingi_cashier_session";
const LS_LAST_AUTH_DAY = "wingi_cashier_last_auth_day";

const dayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const onlyDigits = (v) => (v || "").replace(/[^\d]/g, "");
const only4 = (v) => onlyDigits(v).slice(0, 4);

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

export const CashierGate = ({ db, appId, adminLang = "ar", onBack, onReady }) => {
  const today = useMemo(() => dayKey(), []);
  const dir = adminLang === "ar" ? "rtl" : "ltr";

  const [mode, setMode] = useState("loading"); // loading | pin
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const hiddenRef = useRef(null);

  const focusHidden = () => hiddenRef.current?.focus();

  // إذا فيه session اليوم ما نطلب شيء
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION);
      const s = raw ? JSON.parse(raw) : null;
      const lastAuth = localStorage.getItem(LS_LAST_AUTH_DAY);

      if (s && lastAuth === today) {
        onReady?.(s);
        return;
      }

      setMode("pin");
    } catch {
      setMode("pin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode === "pin") focusHidden();
  }, [mode]);

  const staffPath = ["artifacts", appId, "public", "data", "staff"];
  const PIN_LEN = 4;

  const doPinLogin = async (pinValue) => {
    setErr("");
    const entered = only4(pinValue);

    if (entered.length !== PIN_LEN) {
      setErr("أدخل 4 أرقام");
      return;
    }

    setLoading(true);
    try {
      // ✅ نبحث عن موظف مطابق PIN (PIN لازم يكون unique من لوحة الإدارة)
      const qy = query(
        collection(db, ...staffPath),
        where("pin", "==", entered),
        limit(1)
      );

      const snap = await getDocs(qy);
      if (snap.empty) {
        setErr("رمز غير صحيح");
        setPin("");
        focusHidden();
        return;
      }

      const d = snap.docs[0];
      const data = d.data() || {};

      if (data.isActive === false) {
        setErr("هذا الحساب غير نشط. تواصل مع المدير");
        setPin("");
        focusHidden();
        return;
      }

      // ✅ session
      const session = {
        id: d.id,
        username: data.username || "",
        fullName: data.fullName || data.name || "Cashier",
        role: data.role || "cashier",
        pinScope: data.pinScope || "private", // public | private
      };

      localStorage.setItem(LS_SESSION, JSON.stringify(session));
      localStorage.setItem(LS_LAST_AUTH_DAY, today);

      onReady?.(session);
    } catch (e) {
      console.error(e);
      setErr("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d) => {
    if (loading) return;
    setErr("");
    setPin((prev) => {
      if (prev.length >= PIN_LEN) return prev;
      const next = `${prev}${d}`;
      if (next.length === PIN_LEN) doPinLogin(next);
      return next;
    });
    focusHidden();
  };

  const delDigit = () => {
    if (loading) return;
    setErr("");
    setPin((prev) => prev.slice(0, -1));
    focusHidden();
  };

  const clearAll = () => {
    if (loading) return;
    setErr("");
    setPin("");
    focusHidden();
  };

  // ✅ يدعم الكيبورد: أرقام + Enter + Backspace
  const onKeyDown = (e) => {
    if (loading) return;

    if (e.key === "Enter") {
      e.preventDefault();
      doPinLogin(pin);
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

  if (mode === "loading") return null;

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6"
      dir={dir}
      onMouseDown={focusHidden}
      onTouchStart={focusHidden}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="relative w-full max-w-[720px]">
        <button
          onClick={onBack}
          className="absolute -top-12 right-0 text-slate-300 hover:text-white font-bold flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          رجوع
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                <BadgeCheck className="text-orange-600" size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-900">تسجيل دخول الكاشير</h1>
              <p className="text-slate-500 font-bold">أدخل PIN (4 أرقام)</p>

              <PinDots length={pin.length} max={PIN_LEN} />
            </div>

            {/* ✅ input مخفي للكيبورد */}
            <input
              ref={hiddenRef}
              value={pin}
              onChange={(e) => setPin(only4(e.target.value))}
              onKeyDown={onKeyDown}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              className="absolute opacity-0 pointer-events-none"
              aria-hidden="true"
            />

            {err && (
              <div className="mt-8 bg-red-50 border border-red-100 text-red-700 font-bold rounded-2xl px-4 py-3 text-center">
                {err}
              </div>
            )}

            {/* ✅ Keypad بسيط */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
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
                      title="حذف (ضغط مطول يمسح الكل)"
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
              onClick={() => doPinLogin(pin)}
              className="mt-8 w-full max-w-sm mx-auto block h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black disabled:bg-slate-200 disabled:text-slate-500"
            >
              {loading ? "..." : "دخول"}
            </button>

            <p className="mt-4 text-center text-[11px] text-slate-400 font-bold">
              تقدر تدخل باللمس أو بالكيبورد — Enter للدخول، Backspace للحذف
            </p>

            <div className="mt-6 text-center text-slate-500 font-bold text-sm">
              ملاحظة: الـ PIN يحدده المدير من لوحة الموظفين.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
