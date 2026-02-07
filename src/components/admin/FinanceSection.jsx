import React, { useMemo, useState } from "react";
import { orderDateToJS } from "../../utils/helpers";

export const FinanceSection = ({ orders, menuItems, inventory, CURRENCY }) => {
  const [financeMode, setFinanceMode] = useState("daily");
  const [finDate, setFinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [finFrom, setFinFrom] = useState("");
  const [finTo, setFinTo] = useState("");

  const inFinanceRange = (order) => {
    const d = orderDateToJS(order);
    if (!d) return false;

    const ymd = d.toISOString().slice(0, 10);

    if (financeMode === "daily") {
      return ymd === finDate;
    }

    if (finFrom && ymd < finFrom) return false;
    if (finTo && ymd > finTo) return false;
    return true;
  };

  const financeWithInventory = useMemo(() => {
    const filteredOrders = (orders || []).filter((o) => {
      if (!inFinanceRange(o)) return false;
      if (o.status !== "prepared") return false;
      return true;
    });

    const soldMap = new Map();
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const q = Number(it.quantity || 1);
        soldMap.set(it.id, (soldMap.get(it.id) || 0) + q);
      });
    });

    const invMap = new Map(inventory.map((x) => [x.id, x]));
    const invUsageTotalMap = new Map();

    const rows = menuItems.map((m) => {
      const soldQty = soldMap.get(m.id) || 0;
      const cost = Number(m.cost || 0);
      const sell = Number(m.price || 0);

      const recipe = Array.isArray(m.recipe) ? m.recipe : [];

      const usage = recipe
        .map((ing) => {
          const invId = ing.invId;
          const needForOne = Number(ing.amountPerOne || 0);
          if (!invId || needForOne <= 0 || soldQty <= 0) return null;

          const inv = invMap.get(invId);
          if (!inv || inv.unit === "none") return null;

          const used = needForOne * soldQty;
          invUsageTotalMap.set(invId, (invUsageTotalMap.get(invId) || 0) + used);

          return {
            invId,
            invName: inv.name || invId,
            unit: inv.unit,
            used,
            perOne: needForOne,
          };
        })
        .filter(Boolean);

      return {
        id: m.id,
        name: m.nameAr || m.nameEn || m.nameTr || m.name || m.id,
        cost,
        sell,
        soldQty,
        netOne: sell - cost,
        netTotal: (sell - cost) * soldQty,
        usage,
      };
    });

    const invRows = Array.from(invUsageTotalMap.entries())
      .map(([invId, used]) => {
        const inv = invMap.get(invId) || {};
        return {
          invId,
          name: inv.name || invId,
          unit: inv.unit || "-",
          used: Number(used || 0),
          currentQty: inv.unit === "none" ? "" : Number(inv.quantity || 0),
        };
      })
      .sort((a, b) => (b.used || 0) - (a.used || 0));

    return {
      rows,
      invRows,
      totalNet: rows.reduce((s, r) => s + Number(r.netTotal || 0), 0),
    };
  }, [orders, menuItems, inventory, financeMode, finDate, finFrom, finTo]);

  const exportInventoryCSV = () => {
    const rows = [
      ["المادة", "الاستخدام", "الوحدة", "المتبقي"],
      ...financeWithInventory.invRows.map((i) => [
        i.name,
        i.used,
        i.unit,
        i.currentQty,
      ]),
    ];

    const csv = rows
      .map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_usage.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">💰 الإيرادات والإخراجات</h2>

      <button
        onClick={exportInventoryCSV}
        className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black"
      >
        تصدير المخزون إلى Excel
      </button>

      <div className="bg-white p-4 rounded-2xl border">
        <h3 className="font-black mb-3">📦 إجمالي استخدام المخزون</h3>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-right p-2">المادة</th>
              <th className="text-right p-2">الاستخدام</th>
              <th className="text-right p-2">الوحدة</th>
              <th className="text-right p-2">المتبقي</th>
            </tr>
          </thead>
          <tbody>
            {financeWithInventory.invRows.map((i) => (
              <tr key={i.invId} className="border-t">
                <td className="p-2 font-black">{i.name}</td>
                <td className="p-2">{i.used}</td>
                <td className="p-2">{i.unit}</td>
                <td className="p-2">{i.currentQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-2xl border flex gap-3 flex-wrap">
        <button
          onClick={() => setFinanceMode("daily")}
          className={`px-4 py-2 rounded-xl font-black ${
            financeMode === "daily" ? "bg-black text-white" : "bg-slate-100"
          }`}
        >
          يومي
        </button>

        <button
          onClick={() => setFinanceMode("range")}
          className={`px-4 py-2 rounded-xl font-black ${
            financeMode === "range" ? "bg-black text-white" : "bg-slate-100"
          }`}
        >
          فترة
        </button>

        {financeMode === "daily" ? (
          <input
            type="date"
            value={finDate}
            onChange={(e) => setFinDate(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
        ) : (
          <>
            <input
              type="date"
              value={finFrom}
              onChange={(e) => setFinFrom(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
            <input
              type="date"
              value={finTo}
              onChange={(e) => setFinTo(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
          </>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border font-black text-emerald-700 text-xl">
        صافي الربح: {financeWithInventory.totalNet.toFixed(2)} {CURRENCY}
      </div>

      <div className="bg-white p-4 rounded-2xl border overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          <thead>
            <tr>
              <th className="text-right p-2">المنتج</th>
              <th className="text-right p-2">التكلفة</th>
              <th className="text-right p-2">البيع</th>
              <th className="text-right p-2">المباع</th>
              <th className="text-right p-2">استهلاك المخزون</th>
              <th className="text-right p-2">صافي الربح الاجمالي</th>
            </tr>
          </thead>
          <tbody>
            {financeWithInventory.rows.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-2 font-black">{r.name}</td>
                <td className="p-2">{r.cost}</td>
                <td className="p-2">{r.sell}</td>
                <td className="p-2">{r.soldQty}</td>

                <td className="p-2 text-sm">
                  {!r.usage || r.usage.length === 0 ? (
                    <span className="text-slate-400 font-bold">-</span>
                  ) : (
                    <div className="space-y-1">
                      {r.usage.map((u) => (
                        <div key={u.invId} className="font-bold text-slate-700">
                          • {u.invName}: {u.used} {u.unit}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                <td className="p-2 text-emerald-700 font-black">
                  {Number(r.netTotal || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};