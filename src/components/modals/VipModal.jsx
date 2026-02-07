import React from "react";
import { X } from "lucide-react";

export const VipModal = ({
  vipOpen,
  setVipOpen,
  vipEdit,
  setVipEdit,
  vipName,
  setVipName,
  vipDiscount,
  setVipDiscount,
  vipError,
  setVipError,
  addVipCustomer,
  updateVipCustomer,
  deleteVipCustomer,
  vipList
}) => {
  if (!vipOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-black text-slate-900">العملاء الدائمون</h3>
          <button
            type="button"
            onClick={() => {
              setVipOpen(false);
              setVipEdit(null);
              setVipName("");
              setVipDiscount(0);
              setVipError("");
            }}
            className="p-2 bg-slate-50 rounded-2xl text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl mb-5">
          <div className="font-black text-slate-800 mb-3">
            {vipEdit ? "تعديل عميل" : "إضافة عميل"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={vipName}
              onChange={(e) => setVipName(e.target.value)}
              placeholder="اسم العميل"
              className="p-3 rounded-xl border"
            />

            <input
              type="number"
              min="0"
              max="100"
              value={vipDiscount}
              onChange={(e) => setVipDiscount(Number(e.target.value || 0))}
              placeholder="خصم %"
              className="p-3 rounded-xl border text-center font-black"
            />

            <button
              type="button"
              onClick={vipEdit ? updateVipCustomer : addVipCustomer}
              className="py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-all"
            >
              {vipEdit ? "حفظ التعديل" : "إضافة"}
            </button>
          </div>

          {vipEdit && (
            <button
              type="button"
              onClick={() => {
                setVipEdit(null);
                setVipName("");
                setVipDiscount(0);
                setVipError("");
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-white border font-black text-slate-700"
            >
              إلغاء التعديل
            </button>
          )}

          {vipError && (
            <div className="mt-3 p-3 rounded-xl bg-red-100 text-red-700 font-bold">
              {vipError}
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[55vh] overflow-y-auto">
          {vipList.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
              لا يوجد عملاء دائمين بعد
            </div>
          ) : (
            vipList.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border flex items-center justify-between"
              >
                <div>
                  <div className="font-black text-slate-900">{c.name}</div>
                  <div className="text-xs font-black text-orange-600">
                    خصم {Number(c.discountPercent || 0)}%
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVipEdit(c);
                      setVipName(c.name || "");
                      setVipDiscount(Number(c.discountPercent || 0));
                      setVipError("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
                  >
                    تعديل
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteVipCustomer(c)}
                    className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};