import React from "react";

export const OrdersSection = ({
  ordersTab,
  setOrdersTab,

  // يدعم الاثنين: orders أو listToShow
  orders,
  listToShow,

  oldFrom,
  setOldFrom,
  oldTo,
  setOldTo,
  applyOldOrdersFilter,
  setApplyOldFilter,
  oldFilterError,
  setOldFilterError,

  markOrder,
  printInvoice,
  deleteOrderPermanently,
  getPayLabel,
  setReceiptView,
  setReceiptOpen,

  CURRENCY,
}) => {
  const safeList = Array.isArray(listToShow)
    ? listToShow
    : Array.isArray(orders)
    ? orders
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">الطلبات</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setOrdersTab("active")}
            className={`px-4 py-2 rounded-xl font-black ${
              ordersTab === "active"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            الطلبات النشطة
          </button>

          <button
            onClick={() => setOrdersTab("old")}
            className={`px-4 py-2 rounded-xl font-black ${
              ordersTab === "old"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            الطلبات القديمة
          </button>
        </div>
      </div>

      {ordersTab === "old" && (
        <div className="bg-white border rounded-2xl p-4">
          <div className="font-black mb-3">فلترة الطلبات حسب التاريخ</div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <div className="text-xs font-bold text-slate-500">من تاريخ</div>
              <input
                type="date"
                value={oldFrom || ""}
                onChange={(e) => {
                  setOldFrom?.(e.target.value);
                  setOldFilterError?.("");
                }}
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500">إلى تاريخ</div>
              <input
                type="date"
                value={oldTo || ""}
                onChange={(e) => {
                  setOldTo?.(e.target.value);
                  setOldFilterError?.("");
                }}
                className="border rounded-xl px-3 py-2"
              />
            </div>

            <button
              type="button"
              onClick={applyOldOrdersFilter}
              className="bg-orange-600 text-white px-5 py-3 rounded-2xl font-black"
            >
              بحث
            </button>

            <button
              type="button"
              onClick={() => {
                setOldFrom?.("");
                setOldTo?.("");
                setApplyOldFilter?.(false);
                setOldFilterError?.("");
              }}
              className="bg-slate-200 px-5 py-3 rounded-2xl font-black"
            >
              إلغاء
            </button>
          </div>

          {oldFilterError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-black">
              {oldFilterError}
            </div>
          )}
        </div>
      )}

      {safeList.length === 0 ? (
        <div className="p-5 rounded-2xl bg-white border font-bold text-slate-500">
          لا يوجد طلبات هنا
        </div>
      ) : (
        <div className="space-y-3">
          {safeList.map((o) => (
            <div key={o.id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-black text-slate-900">
                    {o.table ? `المستلم/الطاولة: ${o.table}` : "طلب"}
                  </div>

                  <div className="text-xs font-bold text-slate-500 mt-1">
                    {o.timestamp ? new Date(o.timestamp).toLocaleString() : ""}
                  </div>

                  {o.status !== "new" && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black ${
                          o.status === "prepared"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {o.status === "prepared" ? "✅ تم التحضير" : "⛔ تم الإلغاء"}
                      </span>

                      {o.closedBy && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                          👤 تم بواسطة: {o.closedBy}
                        </span>
                      )}

                      {o.closedAt && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                          🕐 وقت الإغلاق: {new Date(o.closedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                      💳 الدفع: {getPayLabel?.(o.paymentMethod)}
                    </span>

                    {Number(o.discountPercent || 0) > 0 && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-700">
                        🔻 خصم: {Number(o.discountPercent || 0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-black text-slate-900 text-right space-y-1">
                  {Number(o.discountPercent || 0) > 0 ? (
                    <>
                      <div className="text-sm text-slate-500 font-black">
                        قبل الخصم: {Number(o.subtotal || 0).toFixed(2)} TL
                      </div>

                      <div className="text-sm text-orange-600 font-black">
                        خصم ({Number(o.discountPercent || 0)}%): -
                        {Number(o.discountAmount || 0).toFixed(2)} TL
                      </div>

                      <div className="text-sm font-black">
                        بعد الخصم: {Number(o.total || 0).toFixed(2)} TL
                      </div>
                    </>
                  ) : (
                    <div className="text-sm font-black">
                      قبل الضريبة: {Number(o.total || 0).toFixed(2)} TL
                    </div>
                  )}

                  {Number(o.taxPercent || 0) > 0 && (
                    <>
                      <div className="text-sm text-blue-700 font-black">
                        ضريبة ({Number(o.taxPercent || 0)}%):
                        {Number(o.taxAmount || 0).toFixed(2)} TL
                      </div>

                      <div className="text-lg font-black text-slate-900">
                        الإجمالي بعد الضريبة:
                        {Number(
                          o.totalWithTax ||
                            Number(o.total || 0) + Number(o.taxAmount || 0)
                        ).toFixed(2)}{" "}
                        TL
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {(Array.isArray(o.items) ? o.items : []).map((it, idx) => (
                  <div key={idx} className="text-sm font-bold text-slate-700">
                    • {it.quantity}x {it.nameAr || it.nameEn || it.nameTr || it.id}
                    {it.note ? (
                      <span className="text-slate-500"> — 📝 {it.note}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {ordersTab === "old" && (
                <button
                  onClick={() => deleteOrderPermanently?.(o.id)}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-2xl font-black hover:bg-red-500"
                >
                  حذف الطلب
                </button>
              )}

              {o.status === "new" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => markOrder?.(o.id, "prepared")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black"
                  >
                    تم التحضير
                  </button>

                  <button
                    onClick={() => markOrder?.(o.id, "cancelled")}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-black"
                  >
                    إلغاء
                  </button>

                  <button
                    onClick={() => printInvoice?.(o)}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                  >
                    طباعة فاتورة
                  </button>
                </div>
              )}

              {o.receiptDataUrl && (
                <button
                  onClick={() => {
                    setReceiptView?.(o.receiptDataUrl);
                    setReceiptOpen?.(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-black"
                >
                  عرض الإيصال
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
