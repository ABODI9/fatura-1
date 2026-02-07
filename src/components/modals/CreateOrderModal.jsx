import React from "react";
import { X, Plus, Minus } from "lucide-react";

export const CreateOrderModal = ({
  createOrderOpen,
  setCreateOrderOpen,
  orderTable,
  setOrderTable,
  orderPay,
  setOrderPay,
  orderDiscount,
  setOrderDiscount,
  selectedVip,
  vipPickerOpen,
  setVipPickerOpen,
  clearVipForOrder,
  menuItems,
  orderItems,
  setOrderItems,
  adminPreviewItems,
  adminSubtotal,
  adminDiscountPercent,
  adminDiscountAmount,
  adminTotal,
  createOrderError,
  submitAdminOrder,
  getLocalizedValue,
  adminLang,
  CURRENCY
}) => {
  if (!createOrderOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-black text-slate-900">إضافة طلب جديد</h3>
          <button
            onClick={() => setCreateOrderOpen(false)}
            className="p-2 bg-slate-50 rounded-2xl text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="number"
            min="0"
            max="100"
            value={orderDiscount}
            onChange={(e) => setOrderDiscount(Number(e.target.value || 0))}
            placeholder="خصم %"
            className="p-3 rounded-xl border"
          />

          <input
            value={orderTable}
            onChange={(e) => setOrderTable(e.target.value)}
            placeholder="اسم المستلم"
            className="p-3 rounded-xl border"
          />

          <select
            value={orderPay}
            onChange={(e) => setOrderPay(e.target.value)}
            className="p-3 rounded-xl border font-black"
          >
            <option value="cash">كاش</option>
            <option value="card">بطاقة</option>
            <option value="iban">تحويل إلى IBAN</option>
          </select>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setVipPickerOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
          >
            + اختيار عميل دائم
          </button>

          {selectedVip && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-700">
                العميل: {selectedVip.name} — خصم {selectedVip.discountPercent}%
              </span>
              <button
                type="button"
                onClick={clearVipForOrder}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
              >
                إزالة
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="font-black text-slate-900 mb-2">اختر المنتجات من المنيو</div>

          {menuItems.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
              المنيو فاضي أو ما زال يحمل… تأكد أنك أضفت منتجات في المنيو أولاً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((m) => {
                const selected = orderItems.find((x) => x.id === m.id);
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100" />
                      )}
                      <div>
                        <div className="font-black text-slate-900">
                          {getLocalizedValue(m, "name", adminLang)}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          {m.price} TL
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setOrderItems((prev) => {
                            const ex = prev.find((x) => x.id === m.id);
                            if (ex) {
                              return prev.map((x) =>
                                x.id === m.id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
                              );
                            }
                            return [...prev, { ...m, quantity: 1 }];
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                      >
                        +
                      </button>

                      <div className="w-8 text-center font-black text-slate-900">
                        {selected?.quantity || 0}
                      </div>

                      <button
                        onClick={() => {
                          setOrderItems((prev) => {
                            const ex = prev.find((x) => x.id === m.id);
                            if (!ex) return prev;
                            if ((ex.quantity || 1) <= 1) return prev.filter((x) => x.id !== m.id);
                            return prev.map((x) =>
                              x.id === m.id ? { ...x, quantity: (x.quantity || 1) - 1 } : x
                            );
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-black"
                      >
                        -
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {adminDiscountPercent > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-orange-50 text-orange-700 font-black space-y-1">
            <div>المجموع قبل الخصم: {adminSubtotal.toFixed(2)} TL</div>
            <div>نسبة الخصم: {adminDiscountPercent}%</div>
            <div>قيمة الخصم: {adminDiscountAmount.toFixed(2)} TL</div>
            <div className="text-slate-900">
              الإجمالي بعد الخصم: {adminTotal.toFixed(2)} TL
            </div>
          </div>
        )}

        {createOrderError && (
          <div className="mt-4 p-3 rounded-xl bg-red-100 text-red-700 font-bold">
            {createOrderError}
          </div>
        )}

        <div className="flex justify-between items-center mt-6 gap-3">
          <button
            onClick={() => {
              setCreateOrderOpen(false);
              setOrderTable("");
              setOrderPay("cash");
              setOrderItems([]);
            }}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={submitAdminOrder}
            disabled={!String(orderTable).trim() || orderItems.length === 0}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black disabled:opacity-40"
          >
            حفظ الطلب
          </button>
        </div>
      </div>
    </div>
  );
};