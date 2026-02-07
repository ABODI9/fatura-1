import React, { useState } from "react";
import { getAccLabel } from "../../utils/helpers";

export const AccountingSection = ({
  journalEntries,
  CURRENCY,
  accSettings,
  accounts,
  lang,
  exportJournalPDF,
}) => {
  const [openJournalId, setOpenJournalId] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">📘 المحاسبة</h2>
        <div className="text-sm font-bold text-slate-500">
          آخر القيود: {journalEntries.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-3">قيود اليومية</div>

        <button
          onClick={() => exportJournalPDF()}
          className="px-5 py-3 rounded-2xl bg-slate-950 text-white font-black mb-4"
        >
          🧾 تصدير PDF (قيود اليومية)
        </button>

        {journalEntries.length === 0 ? (
          <div className="text-sm text-slate-500 font-bold">
            لا يوجد قيود بعد. جرّب "تم التحضير" لطلب جديد.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="text-right p-2">التاريخ</th>
                  <th className="text-right p-2">الوصف</th>
                  <th className="text-right p-2">المرجع</th>
                  <th className="text-right p-2">الإجمالي</th>
                  <th className="text-right p-2">بنود</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map((j) => {
                  const total = Number(j.totalDebit || 0);
                  const linesCount = Array.isArray(j.lines) ? j.lines.length : 0;

                  return (
                    <React.Fragment key={j.id}>
                      <tr
                        className="border-t cursor-pointer hover:bg-slate-50"
                        onClick={() =>
                          setOpenJournalId((p) => (p === j.id ? null : j.id))
                        }
                      >
                        <td className="p-2 font-bold">{j.date || "-"}</td>

                        <td className="p-2 font-bold">
                          {j.memo || "طلب بيع"}{" "}
                          <span dir="ltr">{j.refText}</span>
                        </td>

                        <td className="p-2 text-sm text-slate-600 font-bold">
                          <span className="opacity-70">{j.refType || "order"}</span>{" "}
                          <span dir="ltr" className="font-mono">
                            #{j.refId}
                          </span>
                        </td>

                        <td className="p-2 font-black">
                          {Number.isFinite(total) ? total.toFixed(2) : "0.00"}{" "}
                          {CURRENCY}
                        </td>

                        <td className="p-2 text-sm text-slate-600 font-bold">
                          {linesCount} بند
                        </td>
                      </tr>

                      {openJournalId === j.id && (
                        <tr className="bg-slate-50">
                          <td colSpan={5} className="p-3">
                            <div className="font-black mb-2">تفاصيل القيد</div>

                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-500">
                                  <th className="text-right p-2">الحساب</th>
                                  <th className="text-right p-2">مدين</th>
                                  <th className="text-right p-2">دائن</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(j.lines || []).map((l, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="p-2 font-bold">
                                      {getAccLabel(l.accountId, accSettings, lang)}
                                    </td>
                                    <td className="p-2 font-black" dir="ltr">
                                      {Number(l.debit || 0).toFixed(2)}
                                    </td>
                                    <td className="p-2 font-black" dir="ltr">
                                      {Number(l.credit || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};