import React, { useMemo } from "react";
import { getAccountBalances } from "../../services/accounting";

export const BalanceSheetSection = ({ journalEntries, accSettings, CURRENCY }) => {
  const balances = useMemo(
    () => getAccountBalances(journalEntries),
    [journalEntries]
  );

  const assets = [
    { id: accSettings?.accounts?.cash || "cash", name: "Cash / صندوق" },
    { id: accSettings?.accounts?.bank || "bank", name: "Bank / بنك" },
    { id: accSettings?.accounts?.ar || "ar", name: "Accounts Receivable / عملاء" },
  ];

  const liabilities = [
    { id: accSettings?.accounts?.ap || "ap", name: "Accounts Payable / موردين" },
    {
      id: accSettings?.accounts?.vatOutput || "vat_output",
      name: "VAT Output / ضريبة",
    },
  ];

  const totalAssets = assets.reduce(
    (s, a) => s + Math.max(0, balances[a.id] || 0),
    0
  );

  const totalLiabilities = liabilities.reduce(
    (s, l) => s + Math.max(0, -(balances[l.id] || 0)),
    0
  );

  const equity = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">📊 الميزانية العمومية</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* الأصول */}
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-3">الأصول</div>
          {assets.map((a) => (
            <div key={a.id} className="flex justify-between py-1 font-bold">
              <span>{a.name}</span>
              <span dir="ltr">{(balances[a.id] || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-black">
            <span>إجمالي الأصول</span>
            <span dir="ltr">{totalAssets.toFixed(2)}</span>
          </div>
        </div>

        {/* الخصوم وحقوق الملكية */}
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-3">الخصوم</div>
          {liabilities.map((l) => (
            <div key={l.id} className="flex justify-between py-1 font-bold">
              <span>{l.name}</span>
              <span dir="ltr">{Math.abs(balances[l.id] || 0).toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between py-2 font-bold">
            <span>حقوق الملكية</span>
            <span dir="ltr">{equity.toFixed(2)}</span>
          </div>

          <div className="border-t mt-2 pt-2 flex justify-between font-black">
            <span>إجمالي الخصوم + حقوق الملكية</span>
            <span dir="ltr">{(totalLiabilities + equity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};