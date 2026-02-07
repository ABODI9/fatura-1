// Convert order timestamp to Date object
export function orderDateToJS(order) {
  if (!order) return null;
  
  const ts = order.timestamp || order.createdAt;
  if (!ts) return null;
  
  return new Date(ts);
}

// Get account label from settings
export function getAccLabel(accountId, accSettings, lang = "ar") {
  if (!accountId) return "";
  
  const accounts = accSettings?.accounts || {};
  const accountsMap = {
    cash: { ar: "الصندوق", en: "Cash", tr: "Kasa" },
    bank: { ar: "البنك", en: "Bank", tr: "Banka" },
    sales: { ar: "المبيعات", en: "Sales", tr: "Satışlar" },
    vatOutput: { ar: "ضريبة المبيعات", en: "VAT Output", tr: "KDV" },
    ar: { ar: "العملاء", en: "Accounts Receivable", tr: "Alacaklar" },
    ap: { ar: "الموردون", en: "Accounts Payable", tr: "Borçlar" },
  };
  
  const key = Object.keys(accounts).find(k => accounts[k] === accountId);
  
  if (key && accountsMap[key]) {
    return accountsMap[key][lang] || accountsMap[key].ar;
  }
  
  return accountId;
}

// Normalize Arabic/Hindi digits to Western digits
export function normalizeDigits(str) {
  if (!str) return str;
  
  const arabicToWestern = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return str.replace(/[٠-٩]/g, d => arabicToWestern[d] || d);
}

// Format currency
export function formatCurrency(amount, currency = "TRY") {
  const num = Number(amount || 0);
  return `${num.toFixed(2)} ${currency}`;
}

// Generate unique ID
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}