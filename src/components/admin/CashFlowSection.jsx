import React, { useMemo } from "react";
import { getCashFlow } from "../../services/accounting";

export const CashFlowSection = ({ journalEntries, accSettings, CURRENCY }) => {
  const cashFlow = useMemo(
    () =>
      getCashFlow(journalEntries, {
        cash: accSettings?.accounts?.cash || "cash",
        bank: accSettings?.accounts?.bank || "bank",
      }),
    [journalEntries, accSettings]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">💧 قائمة التدفقات النقدية</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-2">المتحصلات النقدية</div>
          <div className="text-2xl font-black" dir="ltr">
            {cashFlow.inflow.toFixed(2)} {CURRENCY}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-2">المدفوعات النقدية</div>
          <div className="text-2xl font-black" dir="ltr">
            {cashFlow.outflow.toFixed(2)} {CURRENCY}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-2">صافي التدفق النقدي</div>
          <div
            className={`text-2xl font-black ${
              cashFlow.net >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
            dir="ltr"
          >
            {cashFlow.net.toFixed(2)} {CURRENCY}
          </div>
        </div>
      </div>
    </div>
  );
};