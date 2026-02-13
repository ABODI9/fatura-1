// ===============================
// CashierPage.jsx - Super Cashier (Tables + Quick + Active + Archive + Closing + AI)
// Firebase-powered (menu/categories/orders/tables) + Shift Open/Close
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  LayoutGrid,
  Zap,
  Clock,
  Archive,
  Calculator,
  ArrowRight,
  Utensils,
  Plus,
  Minus,
  Sparkles,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  LogOut,
  Search,
  Lock,
} from "lucide-react";

// =============== OPTIONAL: Gemini AI (put your key in .env) ===============
const GEMINI_API_KEY = import.meta?.env?.VITE_GEMINI_API_KEY || "";

async function callGemini(prompt, systemInstruction = "") {
  if (!GEMINI_API_KEY) return "";

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Gemini API Error");
      const json = await res.json();
      return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) {
      if (i === 4) throw e;
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  return "";
}

// =================== TRANSLATIONS (same style as yours) ===================
const T = {
  ar: {
    cashier: "نظام الكاشير",
    logout: "تسجيل الخروج",
    tables: "خريطة الطاولات",
    quick: "طلب سريع",
    active: "النشطة",
    archive: "الأرشيف",
    closing: "إغلاق اليوم (Z)",
    cart: "سلة الطلبات",
    empty: "فارغة",
    occupied: "مشغولة",
    tapToOpen: "اضغط للفتح",
    total: "الإجمالي",
    tax: "الضريبة",
    confirmSave: "تأكيد وحفظ الطلب",
    closeTable: "تحصيل الحساب وإنهاء الطاولة",
    noActive: "لا يوجد طلبات تحت التحضير",
    invoiceNo: "رقم الفاتورة",
    type: "النوع",
    time: "الوقت",
    amount: "القيمة النهائية",
    status: "الحالة",
    done: "مكتملة",
    smartSuggest: "اقتراح ذكي",
    alsoLike: "قد يفضل العميل أيضاً:",
    shiftStart: "بداية الوردية",
    openingCash: "الرصيد الافتتاحي",
    openShift: "فتح الوردية",
    expectedCash: "الكاش المتوقع",
    finalizeClose: "اعتماد الإغلاق النهائي",
    confirmReset: "سيتم تصفير النظام وبدء يوم جديد، هل أنت متأكد؟",
    aiAnalysis: "تحليل ذكي ✨",
    aiTitle: "تحليل الأداء بواسطة Gemini",
    search: "بحث...",
    all: "الكل",
    noItems: "لا يوجد عناصر في هذا القسم",
    deliveryDone: "تم التسليم",
    preparing: "تحضير",
    table: "طاولة",
    quickLabel: "سريع",
  },
  en: {
    cashier: "Cashier",
    logout: "Logout",
    tables: "Tables Map",
    quick: "Quick Order",
    active: "Active",
    archive: "Archive",
    closing: "Closing (Z)",
    cart: "Cart",
    empty: "Empty",
    occupied: "Occupied",
    tapToOpen: "Tap to open",
    total: "Total",
    tax: "Tax",
    confirmSave: "Confirm & Save",
    closeTable: "Close Table",
    noActive: "No active orders",
    invoiceNo: "Invoice",
    type: "Type",
    time: "Time",
    amount: "Amount",
    status: "Status",
    done: "Done",
    smartSuggest: "Smart Suggest",
    alsoLike: "Customer may also like:",
    shiftStart: "Shift Start",
    openingCash: "Opening cash",
    openShift: "Open shift",
    expectedCash: "Expected cash",
    finalizeClose: "Finalize closing",
    confirmReset: "This will reset for a new day. Are you sure?",
    aiAnalysis: "AI Insight ✨",
    aiTitle: "Gemini Performance Insight",
    search: "Search...",
    all: "All",
    noItems: "No items",
    deliveryDone: "Delivered",
    preparing: "Preparing",
    table: "Table",
    quickLabel: "Quick",
  },
  tr: {
    cashier: "Kasiyer",
    logout: "Çıkış",
    tables: "Masa Haritası",
    quick: "Hızlı Sipariş",
    active: "Aktif",
    archive: "Arşiv",
    closing: "Gün Kapatma (Z)",
    cart: "Sepet",
    empty: "Boş",
    occupied: "Dolu",
    tapToOpen: "Açmak için dokun",
    total: "Toplam",
    tax: "Vergi",
    confirmSave: "Onayla ve Kaydet",
    closeTable: "Masayı Kapat",
    noActive: "Aktif sipariş yok",
    invoiceNo: "Fatura",
    type: "Tür",
    time: "Saat",
    amount: "Tutar",
    status: "Durum",
    done: "Tamamlandı",
    smartSuggest: "Akıllı Öneri",
    alsoLike: "Müşteri şunları da isteyebilir:",
    shiftStart: "Vardiya Başlangıcı",
    openingCash: "Açılış kasası",
    openShift: "Vardiyayı aç",
    expectedCash: "Beklenen kasa",
    finalizeClose: "Kapanışı onayla",
    confirmReset: "Sistem sıfırlanacak. Emin misiniz?",
    aiAnalysis: "AI Analiz ✨",
    aiTitle: "Gemini Performans Analizi",
    search: "Ara...",
    all: "Tümü",
    noItems: "Ürün yok",
    deliveryDone: "Teslim edildi",
    preparing: "Hazırlanıyor",
    table: "Masa",
    quickLabel: "Hızlı",
  },
};

const DEFAULT_TABLES_COUNT = 12;

export const CashierPage = ({
  db,
  appId,
  cashierSession,
  onLogout,
  adminLang = "ar",
  CURRENCY = "ريال",

  // optional (you already pass these in App.jsx)
  setTableStatus: externalSetTableStatus,
  tablesColPath,
}) => {
  const t = T[adminLang] || T.ar;

  // =================== UI STATE ===================
  const [activeTab, setActiveTab] = useState("tables");
  const [selectedTable, setSelectedTable] = useState(null);

  // Shift
  const [shift, setShift] = useState({
    isOpen: false,
    startTime: null,
    openingCash: 0,
    cashier: cashierSession?.fullName || cashierSession?.username || "Cashier",
  });
  const [openingCashInput, setOpeningCashInput] = useState("");

  // Menu + categories
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);

  // Tables (from Firestore)
  const [tables, setTables] = useState([]);

  // Cart
  const [cart, setCart] = useState([]);

  // Tax config
  const [taxPercent, setTaxPercent] = useState(15);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiInsight, setAiInsight] = useState("");

  // =================== PATHS ===================
  const menuPath = ["artifacts", appId, "public", "data", "menu"];
  const catsPath = ["artifacts", appId, "public", "data", "categories"];
  const ordersPath = ["artifacts", appId, "public", "data", "orders"];
  const configFinanceDoc = ["artifacts", appId, "public", "data", "appConfig", "finance"];

  const resolvedTablesColPath = tablesColPath || ["artifacts", appId, "public", "data", "tables"];

  // =================== HELPERS ===================
  const dir = adminLang === "ar" ? "rtl" : "ltr";

  const getItemName = (item) => {
    if (adminLang === "ar") return item.nameAr || item.name || "";
    if (adminLang === "tr") return item.nameTr || item.name || item.nameEn || "";
    return item.nameEn || item.name || item.nameAr || "";
  };

  const getCatName = (cat) => {
    if (adminLang === "ar") return cat.nameAr || cat.name || "";
    if (adminLang === "tr") return cat.nameTr || cat.name || cat.nameEn || "";
    return cat.nameEn || cat.name || cat.nameAr || "";
  };

  const setTableStatusInternal = async (tableNumber, patch) => {
    // if App.jsx passed function, use it
    if (typeof externalSetTableStatus === "function") {
      return externalSetTableStatus(tableNumber, patch);
    }
    // else do it here
    const tableId = String(tableNumber);
    const ref = doc(db, ...resolvedTablesColPath, tableId);
    await setDoc(
      ref,
      {
        number: Number(tableNumber),
        updatedAt: Date.now(),
        ...patch,
      },
      { merge: true }
    );
  };

  // =================== LOAD DATA ===================
  useEffect(() => {
    if (!db || !appId) return;

    // menu
    const unsubMenu = onSnapshot(collection(db, ...menuPath), (snap) => {
      setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // categories
    const unsubCats = onSnapshot(collection(db, ...catsPath), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // orders
    const unsubOrders = onSnapshot(
      query(collection(db, ...ordersPath), orderBy("timestamp", "desc")),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    // finance config (tax)
    const unsubFinance = onSnapshot(doc(db, ...configFinanceDoc), (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() || {};
      setTaxPercent(Number(d.taxPercent || 15));
    });

    // tables
    const unsubTables = onSnapshot(collection(db, ...resolvedTablesColPath), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // if empty -> create local default
      if (arr.length === 0) {
        const local = Array.from({ length: DEFAULT_TABLES_COUNT }, (_, i) => ({
          id: String(i + 1),
          number: i + 1,
          status: "empty",
          activeOrderId: null,
        }));
        setTables(local);
      } else {
        // normalize
        const normalized = arr
          .map((x) => ({
            id: x.id,
            number: Number(x.number || x.id),
            status: x.status || "empty",
            activeOrderId: x.activeOrderId || null,
          }))
          .sort((a, b) => a.number - b.number);
        setTables(normalized);
      }
    });

    return () => {
      unsubMenu();
      unsubCats();
      unsubOrders();
      unsubFinance();
      unsubTables();
    };
  }, [db, appId]);

  // =================== DERIVED ===================
  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    if (filterCategory !== "all") {
      // your menu uses category / categoryAr / categoryId depending on your data
      items = items.filter((x) => x.category === filterCategory || x.categoryId === filterCategory || x.categoryAr === filterCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      items = items.filter((x) => {
        const a = (x.nameAr || "").toLowerCase();
        const e = (x.nameEn || "").toLowerCase();
        const tr = (x.nameTr || "").toLowerCase();
        const n = (x.name || "").toLowerCase();
        return a.includes(q) || e.includes(q) || tr.includes(q) || n.includes(q);
      });
    }

    return items;
  }, [menuItems, filterCategory, searchTerm]);

  const activeOrders = useMemo(() => orders.filter((o) => (o.status || "new") === "new"), [orders]);
  const archivedOrders = useMemo(() => orders.filter((o) => (o.status || "new") !== "new"), [orders]);

  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0), [cart]);
  const vat = useMemo(() => (cartSubtotal * Math.max(0, Number(taxPercent || 0))) / 100, [cartSubtotal, taxPercent]);
  const grandTotal = useMemo(() => cartSubtotal + vat, [cartSubtotal, vat]);

  // =================== CART ACTIONS ===================
  const addToCart = (item) => {
    const id = item.id;
    const exist = cart.find((c) => c.id === id);
    if (exist) {
      setCart(cart.map((c) => (c.id === id ? { ...c, quantity: (c.quantity || 1) + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.id !== id) return x;
          const next = Math.max(0, Number(x.quantity || 1) + delta);
          return { ...x, quantity: next };
        })
        .filter((x) => Number(x.quantity || 0) > 0)
    );
  };

  // =================== ORDER ACTIONS ===================
  const handleProcessOrder = async (type, tableNumber = null) => {
    if (cart.length === 0) return;

    const orderData = {
      items: cart.map((i) => ({
        id: i.id,
        menuItemId: i.id,
        name: i.name || "",
        nameAr: i.nameAr || "",
        nameEn: i.nameEn || "",
        nameTr: i.nameTr || "",
        price: Number(i.price || 0),
        quantity: Number(i.quantity || 1),
        category: i.category || i.categoryAr || i.categoryId || "",
      })),
      subtotal: cartSubtotal,
      taxPercent: Number(taxPercent || 0),
      taxAmount: vat,
      total: grandTotal,
      status: "new",
      timestamp: Date.now(),
      type: type, // "Quick" | "Dine-in"
      table: tableNumber ? String(tableNumber) : null,
      createdBy: cashierSession?.username || "cashier",
      createdById: cashierSession?.id || "",
    };

    const docRef = await addDoc(collection(db, ...ordersPath), orderData);

    // link table
    if (type === "Dine-in" && tableNumber) {
      await setTableStatusInternal(tableNumber, { status: "occupied", activeOrderId: docRef.id });
    }

    setCart([]);
    setAiSuggestions([]);
    setSelectedTable(null);
    setActiveTab(type === "Quick" ? "active" : "tables");
  };

  const completeOrder = async (order) => {
    // mark as done
    const ref = doc(db, ...ordersPath, order.id);
    await setDoc(ref, { status: "done", completedAt: Date.now() }, { merge: true });

    // if dine-in, free table
    if (order?.type === "Dine-in" && order?.table) {
      await setTableStatusInternal(order.table, { status: "empty", activeOrderId: null });
    }
  };

  const closeTable = async (tableNumber) => {
    // find order by activeOrderId if exists
    const tRow = tables.find((x) => String(x.number) === String(tableNumber) || String(x.id) === String(tableNumber));
    const activeId = tRow?.activeOrderId;

    if (activeId) {
      const ref = doc(db, ...ordersPath, activeId);
      await setDoc(ref, { status: "done", completedAt: Date.now() }, { merge: true });
    }

    await setTableStatusInternal(tableNumber, { status: "empty", activeOrderId: null });
    setSelectedTable(null);
    setCart([]);
  };

  // =================== AI ACTIONS ===================
  const getAISuggestions = async () => {
    if (cart.length === 0) return;
    if (!GEMINI_API_KEY) return; // silent if not configured

    setAiLoading(true);
    const itemsList = cart.map((i) => getItemName(i)).join(", ");
    const prompt = `العميل يطلب الآن: ${itemsList}. اقترح 3 أصناف إضافية من القائمة تتماشى مع هذا الطلب لزيادة المبيعات. أجب بالأسماء فقط مفصولة بفاصلة.`;
    try {
      const res = await callGemini(prompt, "أنت خبير مبيعات في مطعم. ردك: أسماء أصناف فقط.");
      if (res) setAiSuggestions(res.split(",").map((s) => s.trim()).filter(Boolean));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const generateDailyInsight = async () => {
    if (!GEMINI_API_KEY) return;
    if (archivedOrders.length === 0) return;

    setAiLoading(true);
    const salesSummary = archivedOrders
      .slice(0, 50)
      .map((o) => {
        const names = (o.items || []).map((x) => x.nameAr || x.name || "").join(" - ");
        return `${names} (Total ${Number(o.total || 0).toFixed(2)})`;
      })
      .join("\n");

    const prompt = `ملخص مبيعات اليوم:\n${salesSummary}\nقدم تحليلًا ذكيًا في 4 نقاط قصيرة: أفضل صنف، وقت الذروة التقريبي، اقتراح لتحسين المبيعات، ونصيحة للمخزون غداً.`;
    try {
      const res = await callGemini(prompt, "أنت محلل بيانات مطاعم ذكي. أجب بالعربية بشكل مختصر.");
      setAiInsight(res || "");
    } catch (e) {
      setAiInsight("عذراً، فشل الاتصال بمحلل الذكاء الاصطناعي.");
    } finally {
      setAiLoading(false);
    }
  };

  // =================== SHIFT ===================
  const openShift = () => {
    const cash = Number(openingCashInput || 0);
    setShift({
      isOpen: true,
      startTime: new Date().toLocaleString(),
      openingCash: cash,
      cashier: cashierSession?.fullName || cashierSession?.username || "Cashier",
    });
    setActiveTab("tables");
  };

  // =================== VIEW: SHIFT START ===================
  if (!shift.isOpen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir={dir}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-100 rounded-full">
              <Lock className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{t.shiftStart}</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.openingCash} ({CURRENCY})
              </label>
              <input
                type="number"
                value={openingCashInput}
                onChange={(e) => setOpeningCashInput(e.target.value)}
                className="w-full p-4 border-2 border-slate-100 rounded-xl text-2xl font-bold focus:border-orange-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <button
              onClick={openShift}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold transition-all"
            >
              {t.openShift}
            </button>

            <button
              onClick={onLogout}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =================== MAIN LAYOUT ===================
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-black" dir={dir}>      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all">
        <div className="p-6 text-center border-b border-slate-800">
          <h1 className="hidden lg:block text-xl font-black text-orange-500 tracking-wider">
            {t.cashier}
          </h1>
          <Utensils className="lg:hidden mx-auto text-orange-500" />
        </div>

        <nav className="flex-1 p-2 space-y-2">
          <NavItem active={activeTab === "tables"} onClick={() => { setActiveTab("tables"); setSelectedTable(null); }} icon={<LayoutGrid />} label={t.tables} />
          <NavItem active={activeTab === "quick"} onClick={() => { setActiveTab("quick"); setSelectedTable(null); }} icon={<Zap />} label={t.quick} />
          <NavItem active={activeTab === "active"} onClick={() => setActiveTab("active")} icon={<Clock />} label={t.active} />
          <NavItem active={activeTab === "archive"} onClick={() => setActiveTab("archive")} icon={<Archive />} label={t.archive} />

          <div className="pt-4 mt-4 border-t border-slate-800">
            <NavItem active={activeTab === "closing"} onClick={() => setActiveTab("closing")} icon={<Calculator />} label={t.closing} />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut size={22} />
              <span className="hidden lg:block font-black text-xs tracking-tight uppercase">
                {t.logout}
              </span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 lg:p-6">

          {/* TABLES VIEW (Map Only) */}
          {activeTab === "tables" && !selectedTable && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800">{t.tables}</h2>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-slate-500">
                    <div className="w-3 h-3 bg-white border rounded" /> {t.empty}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <div className="w-3 h-3 bg-orange-500 rounded" /> {t.occupied}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {tables.map((table) => {
                  const isEmpty = (table.status || "empty") === "empty";
                  const labelTotal = isEmpty ? t.tapToOpen : t.occupied;
                  return (
                    <button
                      key={table.id}
                      onClick={() => {
                        setSelectedTable(table);
                        setActiveTab("tables");
                        setAiSuggestions([]);

                        // If table is occupied, load its active order items (best effort)
                        if (!isEmpty && table.activeOrderId) {
                          const ord = orders.find((o) => o.id === table.activeOrderId);
                          setCart((ord?.items || []).map((x) => ({ ...x, id: x.menuItemId || x.id })));
                        } else {
                          setCart([]);
                        }
                      }}
                      className={`relative h-40 rounded-3xl border-b-8 transition-all flex flex-col items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95
                        ${isEmpty
                          ? "bg-white border-slate-200 text-slate-800 hover:border-orange-500"
                          : "bg-orange-500 border-orange-700 text-white shadow-lg"
                        }`}
                    >
                      <div className={`p-3 rounded-full ${isEmpty ? "bg-slate-50 text-slate-400" : "bg-orange-400 text-white"}`}>
                        <Utensils size={24} />
                      </div>
                      <span className="text-xl font-black">{t.table} {table.number}</span>
                      <span className="text-xs font-bold opacity-75">{labelTotal}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MENU + CART VIEW (Quick OR Selected Table) */}
          {(activeTab === "quick" || (activeTab === "tables" && selectedTable)) && (
            <div className="flex h-full gap-6 animate-in fade-in zoom-in duration-300">
              {/* Left: Menu */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border shadow-sm">
                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      if (activeTab === "tables") setCart([]);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"
                  >
                    <ArrowRight size={24} />
                  </button>

                  <h2 className="text-xl font-black text-slate-800">
                    {selectedTable ? `${t.tables} - ${t.table} ${selectedTable.number}` : t.quick}
                  </h2>

                  <div className="flex-1" />

                  <div className="relative w-[240px] max-w-[45vw]">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t.search}
                      className={`w-full px-4 py-2 rounded-xl border-2 border-slate-200 font-bold focus:border-orange-600 focus:outline-none ${adminLang === "ar" ? "pr-10" : "pl-10"}`}
                    />
                    <Search
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${adminLang === "ar" ? "right-3" : "left-3"}`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                      filterCategory === "all" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.all}
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-5 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                        filterCategory === cat.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getCatName(cat)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="p-4 rounded-2xl border-b-4 bg-white hover:border-orange-500 transition-all text-right flex flex-col justify-between h-40 shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <Utensils size={20} />
                      </div>

                      <div className="space-y-1 mt-2">
                        <span className="font-bold text-slate-800 block leading-tight line-clamp-2">{getItemName(item)}</span>
                        <span className="text-sm text-slate-400 block">{item.categoryAr || item.category || ""}</span>
                      </div>

                      <span className="text-xl font-black text-slate-900 mt-2">
                        {Number(item.price || 0)} <small className="text-[10px] font-normal">{CURRENCY}</small>
                      </span>
                    </button>
                  ))}

                  {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                      <Utensils size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">{t.noItems}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Cart */}
              <div className="w-[400px] bg-white rounded-3xl shadow-2xl flex flex-col border border-slate-100 overflow-hidden">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-lg">{t.cart}</h3>
                    <p className="text-[10px] text-slate-400">
                      {selectedTable ? `${t.table} ${selectedTable.number}` : t.quick}
                    </p>
                  </div>

                  {cart.length > 0 && (
                    <button
                      onClick={getAISuggestions}
                      disabled={!GEMINI_API_KEY}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-300 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors"
                      title={!GEMINI_API_KEY ? "ضع VITE_GEMINI_API_KEY في .env لتفعيل" : ""}
                    >
                      {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {t.smartSuggest}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                      <Plus size={40} />
                      <p className="font-bold">ابدأ بإضافة الأصناف</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center animate-in slide-in-from-right-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">{getItemName(item)}</h4>
                          <p className="text-xs text-slate-400">
                            {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)} {CURRENCY}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 px-2 border">
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-7 h-7 bg-white rounded-xl shadow-sm text-orange-600 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                          <span className="text-sm font-black w-5 text-center text-black">{Number(item.quantity || 1)}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-7 h-7 bg-white rounded-xl shadow-sm text-orange-600 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {aiSuggestions.length > 0 && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                      <p className="text-xs font-black text-indigo-700 flex items-center gap-2">
                        <Sparkles size={14} /> {t.alsoLike}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const hit = menuItems.find((mi) => {
                                const name = (mi.nameAr || mi.nameEn || mi.nameTr || mi.name || "");
                                return name.includes(s) || s.includes(name);
                              });
                              if (hit) addToCart(hit);
                            }}
                            className="text-[10px] bg-white text-indigo-800 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-sm font-bold hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t space-y-3">
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>
                      {t.tax} ({Number(taxPercent || 0)}%)
                    </span>
                    <span>
                      {vat.toFixed(2)} {CURRENCY}
                    </span>
                  </div>

                  <div className="flex justify-between text-2xl font-black text-slate-900">
                    <span>{t.total}</span>
                    <span>
                      {grandTotal.toFixed(2)} {CURRENCY}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <button
                      disabled={cart.length === 0}
                      onClick={() => handleProcessOrder(selectedTable ? "Dine-in" : "Quick", selectedTable?.number)}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 transition-all active:scale-95"
                    >
                      {t.confirmSave}
                    </button>

                    {selectedTable && (selectedTable.status || "empty") === "occupied" && (
                      <button
                        onClick={() => closeTable(selectedTable.number)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold transition-all"
                      >
                        {t.closeTable}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE ORDERS */}
          {activeTab === "active" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border p-4 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-lg">#{order.id?.slice(-6)}</span>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      order.type === "Quick" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {order.type === "Quick" ? t.quickLabel : `${t.table} ${order.table || "-"}`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-bold">
                          {Number(item.quantity || 1)}x {item.nameAr || item.name || ""}
                        </span>
                        <span className="text-slate-400">
                          {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)} {CURRENCY}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2 border-t font-black text-orange-600">
                    <span>{t.total}</span>
                    <span>{Number(order.total || 0).toFixed(2)} {CURRENCY}</span>
                  </div>

                  <button
                    onClick={() => completeOrder(order)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> {t.deliveryDone}
                  </button>
                </div>
              ))}

              {activeOrders.length === 0 && (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300">
                  <Clock size={48} className="mb-2 opacity-20" />
                  <p>{t.noActive}</p>
                </div>
              )}
            </div>
          )}

          {/* ARCHIVE */}
          {activeTab === "archive" && (
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-5">{t.invoiceNo}</th>
                    <th className="p-5">{t.type}</th>
                    <th className="p-5">{t.time}</th>
                    <th className="p-5">{t.amount}</th>
                    <th className="p-5">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {archivedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-black text-slate-700">#{order.id?.slice(-6)}</td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          order.type === "Quick" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {order.type === "Quick" ? t.quickLabel : `${t.table} ${order.table || "-"}`}
                        </span>
                      </td>
                      <td className="p-5 text-slate-400 text-sm font-medium">
                        {order.completedAt ? new Date(order.completedAt).toLocaleTimeString() : new Date(order.timestamp || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="p-5 font-black text-slate-900">{Number(order.total || 0).toFixed(2)} {CURRENCY}</td>
                      <td className="p-5">
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> {t.done}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CLOSING */}
          {activeTab === "closing" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs text-slate-400 mb-1">إجمالي المبيعات</p>
                    <h3 className="text-3xl font-black">
                      {archivedOrders.reduce((s, o) => s + Number(o.total || 0), 0).toFixed(2)}{" "}
                      <small className="text-xs">{CURRENCY}</small>
                    </h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-white/5">
                    <Calculator size={100} />
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs text-slate-400 mb-1">إجمالي الفواتير</p>
                    <h3 className="text-3xl font-black">{archivedOrders.length}</h3>
                  </div>
                </div>

                <button
                  onClick={generateDailyInsight}
                  disabled={aiLoading || archivedOrders.length === 0 || !GEMINI_API_KEY}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                  title={!GEMINI_API_KEY ? "ضع VITE_GEMINI_API_KEY في .env لتفعيل" : ""}
                >
                  {aiLoading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={32} />}
                  <span className="font-black text-lg">{t.aiAnalysis}</span>
                </button>
              </div>

              {aiInsight && (
                <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2rem] animate-in fade-in slide-in-from-bottom-6">
                  <h4 className="font-black text-indigo-900 text-xl mb-6 flex items-center gap-3">
                    <Sparkles className="text-indigo-600" /> {t.aiTitle}
                  </h4>
                  <div className="text-indigo-800 text-base leading-loose whitespace-pre-line font-medium">
                    {aiInsight}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2rem] p-10 border-2 border-slate-50 shadow-sm space-y-8">
                <div className="flex justify-between items-end border-b pb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">إغلاق الوردية النهائية</h3>
                    <p className="text-slate-400 text-sm mt-1">تأكد من مطابقة الكاش الفعلي مع النظام قبل الإنهاء</p>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-slate-400">{t.expectedCash}</p>
                    <p className="text-3xl font-black text-orange-600">
                      {(Number(shift.openingCash || 0) + archivedOrders.reduce((s, o) => s + Number(o.total || 0), 0) * 0.7).toFixed(2)}{" "}
                      {CURRENCY}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>الرصيد الافتتاحي:</span>
                      <span>{Number(shift.openingCash || 0).toFixed(2)} {CURRENCY}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>مبيعات الشبكة (30%):</span>
                      <span>{(archivedOrders.reduce((s, o) => s + Number(o.total || 0), 0) * 0.3).toFixed(2)} {CURRENCY}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(t.confirmReset)) {
                        // reset local shift only (orders remain in Firestore)
                        setShift({ ...shift, isOpen: false });
                        setOpeningCashInput("");
                        setAiInsight("");
                        setAiSuggestions([]);
                        setCart([]);
                        setSelectedTable(null);
                        setActiveTab("tables");
                      }
                    }}
                      className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-slate-200"
                  >
                    {t.finalizeClose}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </main>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 
      ${active
        ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20 translate-x-1"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
  >
    <div className={`${active ? "scale-110" : ""} transition-transform`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="hidden lg:block font-black text-xs tracking-tight uppercase">{label}</span>
  </button>
);
