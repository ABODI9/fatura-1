import React from "react";

export const InventorySection = ({
  inventory,
  invNewName,
  setInvNewName,
  invNewCost,
  setInvNewCost,
  invNewSell,
  setInvNewSell,
  invNewUnit,
  setInvNewUnit,
  invNewQty,
  setInvNewQty,
  invNewError,
  setInvNewLinksOpen,
  handleAddInventory,
  openEditInventory,
  setInvLinkTarget,
  setInvLinkOpen,
  deleteInventory
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">المخزون</h2>

      <div className="bg-white p-4 rounded-2xl border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={invNewName}
            onChange={(e) => setInvNewName(e.target.value)}
            placeholder="اسم المادة"
            className="p-3 rounded-xl border"
          />

          <input
            type="number"
            value={invNewCost}
            onChange={(e) => setInvNewCost(e.target.value)}
            className="p-3 rounded-xl border"
            placeholder="سعر الشراء"
          />

          <input
            type="number"
            value={invNewSell}
            onChange={(e) => setInvNewSell(e.target.value)}
            className="p-3 rounded-xl border"
            placeholder="سعر البيع"
          />

          <select
            value={invNewUnit}
            onChange={(e) => setInvNewUnit(e.target.value)}
            className="p-3 rounded-xl border font-black"
          >
            <option value="g">جرام (g)</option>
            <option value="ml">مل (ml)</option>
            <option value="piece">قطعة</option>
            <option value="none">بدون كمية</option>
          </select>

          <input
            type="number"
            value={invNewQty}
            onChange={(e) => setInvNewQty(e.target.value)}
            className="p-3 rounded-xl border"
            placeholder="الكمية"
          />
        </div>

        <button
          onClick={() => setInvNewLinksOpen(true)}
          className="px-4 py-3 rounded-xl bg-slate-950 text-white font-black"
        >
          + ربط منتجات من المنيو
        </button>

        <button
          onClick={handleAddInventory}
          className="w-full py-3 rounded-xl bg-orange-600 text-white font-black"
        >
          + إضافة للمخزون
        </button>

        {invNewError && (
          <div className="text-sm font-black text-red-600">
            {invNewError}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        {inventory.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 font-bold">
            لا يوجد عناصر مخزون
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl border flex justify-between items-center"
              >
                <button
                  onClick={() => openEditInventory(inv)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
                >
                  تعديل
                </button>

                <div>
                  <div className="font-black">{inv.name}</div>
                  <div className="text-xs text-slate-500 font-bold">
                    الكمية: {inv.quantity} {inv.unit}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInvLinkTarget(inv);
                      setInvLinkOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                  >
                    ربط
                  </button>

                  <button
                    onClick={() => deleteInventory(inv.id)}
                    className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};