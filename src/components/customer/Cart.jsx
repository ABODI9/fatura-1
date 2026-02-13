import React from "react";
import { ShoppingCart, X, Minus, Plus, Banknote, CreditCard } from "lucide-react";

export const Cart = ({
  t,
  lang = "ar", // . جديد
  isCartOpen,
  setIsCartOpen,
  cart = [],
  setCart,
  getLocalizedValue, // ممكن توصل أو لا
  paymentMethod,
  setPaymentMethod,
  receiptDataUrl,
  setReceiptDataUrl,
  receiptError,
  setReceiptError,
  cartSubtotal = 0,
  cartTaxP = 0,
  cartTaxAmount = 0,
  cartTotalWithTax = 0,
  handleCompleteOrder,
  CURRENCY = "TL",
}) => {
  // . fallback: حتى لو نسيت تمرر getLocalizedValue من App ما ينهار
  const safeGetLocalizedValue =
    typeof getLocalizedValue === "function"
      ? getLocalizedValue
      : (item, key) => {
          if (!item) return "";
          if (lang === "ar") return item[`${key}Ar`] ?? item[key] ?? "";
          if (lang === "tr")
            return item[`${key}Tr`] ?? item[`${key}En`] ?? item[`${key}Ar`] ?? item[key] ?? "";
          return item[`${key}En`] ?? item[`${key}Ar`] ?? item[key] ?? "";
        };

  if (!isCartOpen) return null;

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex justify-end" dir={dir}>
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black">{t?.cart || "السلة"}</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-3 bg-slate-50 rounded-2xl text-slate-400"
            aria-label="close-cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-grow p-8 space-y-6 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <ShoppingCart size={80} strokeWidth={1} />
              <p className="mt-4 font-black">{t?.emptyCart || "السلة فارغة"}</p>
            </div>
          ) : (
            cart.map((it, idx) => (
              <div
                key={it._key || `${it.id || "item"}-${idx}`}
                className="bg-slate-50 p-5 rounded-[2rem] flex justify-between items-center"
              >
                <div className="max-w-[65%]">
                  <p className="font-black text-slate-900">
                    {safeGetLocalizedValue(it, "name")}
                  </p>

                  {it.note && (
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      📝 {it.note}
                    </p>
                  )}

                  <p className="text-xs text-orange-600 font-bold">
                    {((it.price || 0) * (it.quantity || 1)).toFixed(2)} {CURRENCY}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
                  <button
                    onClick={() => {
                      const nc = [...cart];
                      const current = { ...nc[idx] };
                      const q = Number(current.quantity || 1);

                      if (q > 1) {
                        current.quantity = q - 1;
                        nc[idx] = current;
                      } else {
                        nc.splice(idx, 1);
                      }
                      setCart(nc);
                    }}
                    className="text-slate-300"
                    aria-label="minus"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-black w-4 text-center">{it.quantity || 1}</span>

                  <button
                    onClick={() => {
                      const nc = [...cart];
                      const current = { ...nc[idx] };
                      const q = Number(current.quantity || 1);
                      current.quantity = q + 1;
                      nc[idx] = current;
                      setCart(nc);
                    }}
                    className="text-slate-950"
                    aria-label="plus"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Payment */}
          {cart.length > 0 && (
            <div className="pt-6 space-y-4">
              <p className="font-black text-slate-900">{t?.payment || "طريقة الدفع"}</p>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setPaymentMethod("cash");
                    setReceiptDataUrl("");
                    setReceiptError?.("");
                  }}
                  className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "cash"
                      ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <Banknote size={24} />
                  <span className="text-xs font-black">{t?.cash || "كاش"}</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod("card");
                    setReceiptDataUrl("");
                    setReceiptError?.("");
                  }}
                  className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-black">{t?.card || "كرت"}</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod("iban");
                    setReceiptError?.("");
                  }}
                  className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "iban"
                      ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
                      : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  <Banknote size={24} />
                  <span className="text-xs font-black">{t?.iban || "IBAN"}</span>
                </button>
              </div>

              {paymentMethod === "iban" && (
                <div className="mt-4 bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="font-black text-slate-900">
                    {t?.ibanInfoTitle || "معلومات التحويل"}
                  </div>

                  <div className="text-sm font-bold text-slate-700">
                    {t?.tableLabel || "رقم الطاولة"}: <span className="font-black">wingi</span>
                  </div>

                  <div className="text-sm font-bold text-slate-700 break-all">
                    IBAN: <span className="font-black">TR00000000000000000000000000000000000</span>
                  </div>

                  <div className="text-sm font-black text-red-600">
                    {t?.receiptRequired || "رفع صورة الإيصال مطلوب"}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setReceiptDataUrl("");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setReceiptDataUrl(String(reader.result || ""));
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-sm"
                  />

                  {!!receiptError && (
                    <div className="text-sm font-black text-red-600">{receiptError}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-10 bg-slate-50 border-t space-y-6">
            <div className="flex justify-between items-start gap-6">
              <span className="text-slate-400 font-bold">{t?.total || "المجموع"}</span>

              <div className="space-y-2 text-sm font-bold text-slate-800 min-w-[170px]">
                <div className="flex justify-between">
                  <span>{t?.subtotal || "الإجمالي قبل الضريبة"}</span>
                  <span>{Number(cartSubtotal).toFixed(2)} {CURRENCY}</span>
                </div>

                {Number(cartTaxP) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>{t?.tax || "ضريبة"} ({Number(cartTaxP)}%)</span>
                      <span>{Number(cartTaxAmount).toFixed(2)} {CURRENCY}</span>
                    </div>

                    <div className="flex justify-between font-black text-xl text-slate-950">
                      <span>{t?.grandTotal || "الإجمالي"}</span>
                      <span>{Number(cartTotalWithTax).toFixed(2)} {CURRENCY}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              disabled={!paymentMethod || (paymentMethod === "iban" && !receiptDataUrl)}
              onClick={handleCompleteOrder}
              className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-200 disabled:opacity-30 active:scale-95 transition-all"
            >
              {t?.completeOrder || "إتمام الطلب"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
