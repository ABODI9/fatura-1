import { addDoc, collection } from "firebase/firestore";

export async function createJournalEntry({
  date,
  memo,
  lines,
  refType,
  refId,
  refText,
  db,
  appId
}) {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    console.error("Journal entry not balanced", { totalDebit, totalCredit });
    throw new Error("Journal entry must be balanced");
  }

  try {
    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "journalEntries"),
      {
        date,
        memo,
        lines,
        totalDebit,
        totalCredit,
        refType: refType || "manual",
        refId: refId || "",
        refText: refText || "",
        createdAt: Date.now(),
      }
    );
  } catch (e) {
    console.error("Failed to create journal entry:", e);
    throw e;
  }
}

export async function postSalesEntryForOrder({
  order,
  accSettings,
  db,
  appId
}) {
  const accounts = accSettings?.accounts || {
    cash: "cash",
    bank: "bank",
    sales: "sales",
    vatOutput: "vat_output",
    ar: "ar",
  };

  const total = Number(order.totalWithTax || order.total || 0);
  const taxAmount = Number(order.taxAmount || 0);
  const salesAmount = total - taxAmount;

  const paymentMethod = order.paymentMethod || "cash";
  let debitAccount = accounts.cash;

  if (paymentMethod === "card" || paymentMethod === "iban") {
    debitAccount = accounts.bank;
  }

  const lines = [
    {
      accountId: debitAccount,
      debit: total,
      credit: 0,
    },
    {
      accountId: accounts.sales,
      debit: 0,
      credit: salesAmount,
    },
  ];

  if (taxAmount > 0) {
    lines.push({
      accountId: accounts.vatOutput,
      debit: 0,
      credit: taxAmount,
    });
  }

  const date = new Date().toISOString().slice(0, 10);

  await createJournalEntry({
    date,
    memo: `مبيعات - طاولة ${order.table}`,
    lines,
    refType: "order",
    refId: order.id || "",
    refText: `Table ${order.table}`,
    db,
    appId,
  });
}

export function getAccountBalances(journalEntries) {
  const balances = {};

  for (const entry of journalEntries || []) {
    for (const line of entry.lines || []) {
      const accountId = line.accountId;
      if (!accountId) continue;

      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      balances[accountId] = (balances[accountId] || 0) + debit - credit;
    }
  }

  return balances;
}

export function getCashFlow(journalEntries, cashAccounts = {}) {
  const { cash = "cash", bank = "bank" } = cashAccounts;

  let inflow = 0;
  let outflow = 0;

  for (const entry of journalEntries || []) {
    for (const line of entry.lines || []) {
      if (line.accountId === cash || line.accountId === bank) {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        inflow += debit;
        outflow += credit;
      }
    }
  }

  return {
    inflow,
    outflow,
    net: inflow - outflow,
  };
}