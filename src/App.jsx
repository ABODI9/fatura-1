// ===============================
// App.jsx (Full + Fixed)
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

import { CheckCircle } from "lucide-react";

// UI Components
import { LuxuryShell } from "./components/shared/LuxuryShell";
import { PortalScreen } from "./components/admin/PortalScreen";
import { AdminLoginScreen } from "./components/admin/AdminLoginScreen";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Sidebar } from "./components/admin/Sidebar";

import { MenuSection } from "./components/admin/MenuSection";
import { OrdersSection } from "./components/admin/OrdersSection";
import { InventorySection } from "./components/admin/InventorySection";
import { FinanceSection } from "./components/admin/FinanceSection";
import { AccountingSection } from "./components/admin/AccountingSection";
import { ReportsSection } from "./components/admin/ReportsSection";
import { BalanceSheetSection } from "./components/admin/BalanceSheetSection";
import { CashFlowSection } from "./components/admin/CashFlowSection";
import { InvoicesSection } from "./components/admin/InvoicesSection";
import { CustomersSection } from "./components/admin/CustomersSection";
import { VendorsSection } from "./components/admin/VendorsSection";
import { BillsSection } from "./components/admin/BillsSection";
import { SettingsSection } from "./components/admin/SettingsSection";

import { TableSelection } from "./components/customer/TableSelection";
import { Menu } from "./components/customer/Menu";
import { Cart } from "./components/customer/Cart";
import { NotesModal } from "./components/customer/NotesModal";

import { CreateOrderModal } from "./components/modals/CreateOrderModal";
import { VipModal } from "./components/modals/VipModal";

// Config
import { appId, CURRENCY } from "./config/constants";
import { auth, db } from "./config/firebase";

// Utils + i18n
import { orderDateToJS, normalizeDigits } from "./utils/helpers";
import { translations } from "./translations";

// Services
import { adminLogin, adminRegister, adminLogout as performAdminLogout } from "./services/auth";

import "./App.css";

export default function App() {
  // =========================
  // [S02] Router & Mode
  // =========================
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAdminRoute = path.startsWith("/admin");

  // =========================
  // [S03] State
  // =========================
 
// بهذا:
const [appMode, setAppMode] = useState(() => {
  // إذا كان في صفحة admin وفيه session محفوظ، ارجع "admin"
  if (isAdminRoute) {
    const savedSession = localStorage.getItem("wingi_admin_session");
    if (savedSession) {
      return "admin"; // يرجع مباشرة للـ admin
    }
    return "portal"; // لو ما فيه session، يرجع للـ portal
  }
  return "customer";
});

// وعدّل دالة setAppMode لحفظها في localStorage:
const handleSetAppMode = (mode) => {
  setAppMode(mode);
  if (mode === "admin") {
    localStorage.setItem("wingi_app_mode", "admin");
  } else {
    localStorage.removeItem("wingi_app_mode");
  }
};
  const [user, setUser] = useState(null);

  // Languages
  const [lang, setLang] = useState("ar");
  const [adminLang, setAdminLang] = useState("ar");

  // Customer
  const [view, setView] = useState("selection");
  const [table, setTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState("");
  const [receiptError, setReceiptError] = useState("");

  // Notes modal
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesItem, setNotesItem] = useState(null);
  const [notesText, setNotesText] = useState("");

  // Admin auth
  const [adminSession, setAdminSession] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState("login");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [ownerPin, setOwnerPin] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [ownerConfig, setOwnerConfig] = useState(null);

  // Admin UI
  const [adminPage, setAdminPage] = useState("menu");
  const [ordersTab, setOrdersTab] = useState("active");

  // Data
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);

  // Accounting settings (basic)
  const [accSettings] = useState({
    accounts: {
      cash: "cash",
      bank: "bank",
      sales: "sales",
      vatOutput: "vat_output",
      ar: "ar",
      ap: "ap",
    },
  });

  // Modals
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  // VIP
  const [vipList, setVipList] = useState([]);

  // Finance (settings doc)
  const [taxPercent, setTaxPercent] = useState(0);
  const [cashDiscountPercent, setCashDiscountPercent] = useState(0);

  // Old orders filter
  const [oldFrom, setOldFrom] = useState("");
  const [oldTo, setOldTo] = useState("");
  const [applyOldFilter, setApplyOldFilter] = useState(false);
  const [oldFilterError, setOldFilterError] = useState("");

  // Admin receipt modal state (for OrdersSection)
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptView, setReceiptView] = useState(null);

  // =========================
  // [S04] Firestore Paths
  // =========================
  const adminUsersColPath = ["artifacts", appId, "public", "data", "adminUsers"];
  const ownerDocPath = ["artifacts", appId, "public", "data", "adminConfig", "owner"];
  const vipCustomersColPath = ["artifacts", appId, "public", "data", "vipCustomers"];
  const financeDocPath = ["artifacts", appId, "public", "data", "appConfig", "finance"];

  // =========================
  // [S05] Translations
  // =========================
  const t = translations[lang] || translations.ar;
  const admT = translations[adminLang] || translations.ar;

  // =========================
  // Helpers used by OrdersSection
  // =========================
  const getPayLabel = (m) => {
    if (m === "cash") return adminLang === "ar" ? "كاش" : "Cash";
    if (m === "card") return adminLang === "ar" ? "بطاقة" : "Card";
    if (m === "iban") return adminLang === "ar" ? "تحويل (IBAN)" : "IBAN";
    return adminLang === "ar" ? "غير محدد" : "Unknown";
  };

  const applyOldOrdersFilter = () => {
    setOldFilterError("");

    if (!oldFrom && !oldTo) {
      setApplyOldFilter(false);
      return;
    }

    if (oldFrom && Number.isNaN(new Date(oldFrom).getTime())) {
      setOldFilterError(adminLang === "ar" ? "تاريخ البداية غير صحيح" : "Invalid from date");
      return;
    }

    if (oldTo && Number.isNaN(new Date(oldTo).getTime())) {
      setOldFilterError(adminLang === "ar" ? "تاريخ النهاية غير صحيح" : "Invalid to date");
      return;
    }

    if (oldFrom && oldTo) {
      const f = new Date(oldFrom);
      const tt = new Date(oldTo);
      if (f > tt) {
        setOldFilterError(adminLang === "ar" ? "تاريخ البداية أكبر من النهاية" : "From date is after To date");
        return;
      }
    }

    setApplyOldFilter(true);
  };

  const markOrder = async (orderId, nextStatus) => {
    try {
      const ref = doc(db, "artifacts", appId, "public", "data", "orders", orderId);
      await setDoc(ref, { status: nextStatus, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.error("markOrder error:", e);
    }
  };

  const deleteOrderPermanently = async (orderId) => {
    try {
      const ref = doc(db, "artifacts", appId, "public", "data", "orders", orderId);
      await deleteDoc(ref);
    } catch (e) {
      console.error("deleteOrderPermanently error:", e);
    }
  };

  const printInvoice = (order) => {
    try {
      if (!order) return;

      const itemsHtml = (order.items || [])
        .map(
          (it) => `
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${
              it.nameAr || it.nameEn || it.nameTr || it.name || "-"
            }</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${
              it.quantity || 1
            }</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${
              (it.price || 0).toFixed(2)
            } ${CURRENCY}</td>
          </tr>`
        )
        .join("");

      const html = `
      <html>
      <head>
        <title>Invoice</title>
        <meta charset="utf-8" />
      </head>
      <body style="font-family:Arial; padding:24px;">
        <h2 style="margin:0 0 10px;">Invoice</h2>
        <div style="margin-bottom:10px;">Table: <b>${order.table || "-"}</b></div>
        <div style="margin-bottom:16px;">Date: ${new Date(order.timestamp || Date.now()).toLocaleString()}</div>

        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;">Item</th>
              <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #333;">Qty</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #333;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top:16px; text-align:right;">
          <div>Subtotal: <b>${(order.total || 0).toFixed(2)} ${CURRENCY}</b></div>
          <div>Tax: <b>${(order.taxAmount || 0).toFixed(2)} ${CURRENCY}</b></div>
          <div style="font-size:18px;margin-top:8px;">
            Total: <b>${(order.totalWithTax || (order.total || 0)).toFixed(2)} ${CURRENCY}</b>
          </div>
        </div>

        <script>window.onload = () => window.print();</script>
      </body>
      </html>
      `;

      const w = window.open("", "_blank", "width=900,height=700");
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error("printInvoice error:", e);
    }
  };

  // =========================
  // [S06] Effects
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth init error:", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const ensureOwner = async () => {
      const ref = doc(db, ...ownerDocPath);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          ownerUsername: "admin",
          ownerPassword: "12344321",
          updatedAt: Date.now(),
        });
        return;
      }

      const data = snap.data() || {};
      if (!data.ownerUsername || !data.ownerPassword) {
        await setDoc(
          ref,
          {
            ownerUsername: data.ownerUsername || "admin",
            ownerPassword: data.ownerPassword || "12344321",
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
    };

    ensureOwner();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const ensureFinance = async () => {
      const ref = doc(db, ...financeDocPath);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          cashDiscountPercent: 0,
          taxPercent: 0,
          updatedAt: Date.now(),
        });
        return;
      }

      const data = snap.data() || {};
      if (typeof data.cashDiscountPercent !== "number" || typeof data.taxPercent !== "number") {
        await setDoc(
          ref,
          {
            cashDiscountPercent: Number(data.cashDiscountPercent || 0),
            taxPercent: Number(data.taxPercent || 0),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
    };

    ensureFinance();
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("wingi_admin_session");
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setAdminSession(s);
      setIsOwner(s?.role === "owner");
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, ...ownerDocPath), (snap) => {
      if (snap.exists()) setOwnerConfig(snap.data());
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!adminSession) return;

    const unsub = onSnapshot(collection(db, ...vipCustomersColPath), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setVipList(arr);
    });

    return () => unsub();
  }, [user, adminSession]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, ...financeDocPath), (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() || {};
      setCashDiscountPercent(Number(d.cashDiscountPercent || 0));
      setTaxPercent(Number(d.taxPercent || 0));
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubMenu = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "menu"),
      (snap) => setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubOrders = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "orders"),
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setOrders(arr);
      }
    );

    const unsubInv = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "inventory"),
      (snap) => setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubJournal = onSnapshot(
      query(collection(db, "artifacts", appId, "public", "data", "journalEntries"), orderBy("createdAt", "desc"), limit(50)),
      (snap) => setJournalEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
    );

    const unsubAccounts = onSnapshot(
      query(collection(db, "artifacts", appId, "public", "data", "accounts"), orderBy("code", "asc")),
      (snap) => setAccounts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
    );

    const unsubInvoices = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "invoices"),
      (snap) => setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubCustomers = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "customers"),
      (snap) => setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubVendors = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "vendors"),
      (snap) => setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubBills = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "bills"),
      (snap) => setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubMenu();
      unsubOrders();
      unsubInv();
      unsubJournal();
      unsubAccounts();
      unsubInvoices();
      unsubCustomers();
      unsubVendors();
      unsubBills();
    };
  }, [user]);

  // =========================
  // [S07] Computed
  // =========================
  const computedOutOfStock = useMemo(() => {
    const invMap = new Map(inventory.map((x) => [x.id, x]));
    const outMap = {};

    for (const m of menuItems) {
      const recipe = Array.isArray(m.recipe) ? m.recipe : [];
      if (recipe.length === 0) {
        outMap[m.id] = false;
        continue;
      }

      let out = false;
      for (const ing of recipe) {
        const inv = invMap.get(ing.invId);
        if (!inv) {
          out = true;
          break;
        }
        if (inv.unit === "none") continue;

        const invQty = Number(inv.quantity || 0);
        const need = Number(ing.amountPerOne || 0);
        if (need > 0 && invQty < need) {
          out = true;
          break;
        }
      }

      outMap[m.id] = out;
    }

    return outMap;
  }, [inventory, menuItems]);

  const inventoryAlerts = useMemo(() => {
    const invMap = new Map(inventory.map((x) => [x.id, x]));
    const usedInv = new Map();

    for (const m of menuItems) {
      const recipe = Array.isArray(m.recipe) ? m.recipe : [];
      for (const r of recipe) {
        if (!r?.invId) continue;
        const need = Number(r.amountPerOne || 0);
        if (need <= 0) continue;

        const prev = usedInv.get(r.invId);
        if (!prev || need < prev) usedInv.set(r.invId, need);
      }
    }

    const out = [];
    const low = [];

    for (const [invId, minNeedForOne] of usedInv.entries()) {
      const inv = invMap.get(invId);
      if (!inv || inv.unit === "none") continue;

      const qty = Number(inv.quantity || 0);
      const base = Number(inv.baselineQuantity || 0);
      const lowPercent = Number(inv.lowPercent ?? 0.2);

      if (qty < minNeedForOne) {
        out.push({ invId, name: inv.name || inv.id, qty, needForOne: minNeedForOne });
        continue;
      }

      if (base > 0 && qty <= base * lowPercent) {
        low.push({ invId, name: inv.name || inv.id, qty, base });
      }
    }

    return { out, low };
  }, [inventory, menuItems]);

  const categories = useMemo(() => {
    return ["All", ...new Set(menuItems.map((i) => i.categoryAr).filter(Boolean))];
  }, [menuItems]);

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter((i) => i.categoryAr === activeCategory);
  }, [menuItems, activeCategory]);

  const getLocalizedValue = (item, key) => {
    if (!item) return "";
    const pick = (obj, keys) => {
      for (const k of keys) {
        if (obj && obj[k] !== undefined && obj[k] !== null && String(obj[k]).length > 0) return obj[k];
      }
      return "";
    };

    if (lang === "ar") return pick(item, [`${key}Ar`, `${key}_ar`, `${key}AR`, key]);
    if (lang === "tr") return pick(item, [`${key}Tr`, `${key}_tr`, `${key}TR`, `${key}En`, `${key}_en`, `${key}Ar`, `${key}_ar`, key]);
    return pick(item, [`${key}En`, `${key}_en`, `${key}Ar`, `${key}_ar`, key]);
  };

  const activeOrders = useMemo(() => orders.filter((o) => o.status === "new"), [orders]);

  const oldOrders = useMemo(() => {
    let list = orders.filter((o) => o.status !== "new");

    if (applyOldFilter && (oldFrom || oldTo)) {
      list = list.filter((o) => {
        const d = orderDateToJS(o);
        if (!d) return false;

        if (oldFrom) {
          const from = new Date(oldFrom);
          if (d < from) return false;
        }
        if (oldTo) {
          const to = new Date(oldTo);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
        return true;
      });
    }

    return list;
  }, [orders, applyOldFilter, oldFrom, oldTo]);

  const listToShow = ordersTab === "active" ? activeOrders : oldOrders;

  const cartSubtotal = cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const cartTaxP = Math.min(100, Math.max(0, Number(taxPercent || 0)));
  const cartTaxAmount = (cartSubtotal * cartTaxP) / 100;
  const cartTotalWithTax = cartSubtotal + cartTaxAmount;

  // =========================
  // [S08] Handlers
  // =========================
  const handleStartOrder = (tableNumber) => {
    setTable(tableNumber);
    setCart([]);
    setPaymentMethod(null);
    setOrderStatus(null);
    setView("menu");
  };

  const addToCartWithNote = (item, note) => {
    if (computedOutOfStock[item?.id]) return;

    const cleanNote = (note || "").trim();
    const key = `${item.id}__${cleanNote}`;

    const exist = cart.find((c) => c._key === key);
    if (exist) {
      setCart(cart.map((c) => (c._key === key ? { ...c, quantity: (c.quantity || 1) + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1, note: cleanNote, _key: key }]);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      setOrderStatus("sending");

      await addDoc(collection(db, "artifacts", appId, "public", "data", "orders"), {
        table,
        items: cart,
        total: cartSubtotal,
        taxPercent: cartTaxP,
        taxAmount: cartTaxAmount,
        totalWithTax: cartTotalWithTax,
        paymentMethod,
        status: "new",
        timestamp: Date.now(),
        receiptDataUrl: paymentMethod === "iban" ? receiptDataUrl : "",
      });

      setOrderStatus("completed");
      setCart([]);
      setIsCartOpen(false);
      setPaymentMethod(null);
      setReceiptDataUrl("");
      setReceiptError("");
    } catch (e) {
      console.error(e);
      setOrderStatus(null);
      setReceiptError("فشل إرسال الطلب، حاول مرة ثانية.");
    }
  };

  const handleAdminLogin = async () => {
    const result = await adminLogin({
      adminUsername,
      adminPassword,
      ownerConfig,
      db,
      adminUsersColPath,
      normalizeDigits,
      admT,
    });

    if (result.error) {
      setAdminAuthError(result.error);
      return;
    }

    setAdminSession(result.session);
    setIsOwner(result.session.role === "owner");
    localStorage.setItem("wingi_admin_session", JSON.stringify(result.session));
    setAdminAuthError("");
  };

  const handleAdminRegister = async () => {
    const result = await adminRegister({
      adminUsername,
      adminPassword,
      ownerPin,
      ownerConfig,
      db,
      adminUsersColPath,
      normalizeDigits,
      admT,
    });

    if (result.error) {
      setAdminAuthError(result.error);
      return;
    }

    setAdminSession(result.session);
    setIsOwner(false);
    localStorage.setItem("wingi_admin_session", JSON.stringify(result.session));
    setAdminAuthError("");
  };

  const adminLogout = () => {
    performAdminLogout();
    setAdminSession(null);
    setIsOwner(false);
    localStorage.removeItem("wingi_admin_session");
  };

  // =========================
  // [S09] Admin route returns
  // =========================
  if (isAdminRoute && appMode === "portal") {
    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <PortalScreen admT={admT} setAppMode={setAppMode} adminLang={adminLang} setAdminLang={setAdminLang} />
      </LuxuryShell>
    );
  }

  if (isAdminRoute && appMode === "admin" && !adminSession) {
    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <AdminLoginScreen
          admT={admT}
          adminLang={adminLang}
          adminAuthMode={adminAuthMode}
          setAdminAuthMode={setAdminAuthMode}
          adminUsername={adminUsername}
          setAdminUsername={setAdminUsername}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          ownerPin={ownerPin}
          setOwnerPin={setOwnerPin}
          adminAuthError={adminAuthError}
          handleAdminLogin={handleAdminLogin}
          handleAdminRegister={handleAdminRegister}
        />
      </LuxuryShell>
    );
  }

  if (isAdminRoute && appMode === "admin" && adminSession) {
    return (
      <AdminLayout
        adminLang={adminLang}
        setAdminLang={setAdminLang}
        adminSession={adminSession}
        adminLogout={adminLogout}
        setAppMode={setAppMode}
        setAccountsOpen={setAccountsOpen}
        setCreateOrderOpen={setCreateOrderOpen}
        cashDiscountPercent={cashDiscountPercent}
        setCashDiscountPercent={setCashDiscountPercent}
        taxPercent={taxPercent}
        setTaxPercent={setTaxPercent}
        setVipOpen={setVipOpen}
        financeDocPath={financeDocPath}
        db={db}
        doc={doc}
        setDoc={setDoc}
        inventoryAlerts={inventoryAlerts}
        admT={admT}
      >
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Sidebar adminPage={adminPage} setAdminPage={setAdminPage} />

          <section className="xl:col-span-9 space-y-6">
            {adminPage === "menu" && <MenuSection menuItems={menuItems} admT={admT} adminLang={adminLang} db={db} appId={appId} />}

            {adminPage === "orders" && (
              <OrdersSection
                ordersTab={ordersTab}
                setOrdersTab={setOrdersTab}
                listToShow={listToShow}
                oldFrom={oldFrom}
                setOldFrom={setOldFrom}
                oldTo={oldTo}
                setOldTo={setOldTo}
                applyOldOrdersFilter={applyOldOrdersFilter}
                setApplyOldFilter={setApplyOldFilter}
                oldFilterError={oldFilterError}
                setOldFilterError={setOldFilterError}
                markOrder={markOrder}
                printInvoice={printInvoice}
                deleteOrderPermanently={deleteOrderPermanently}
                getPayLabel={getPayLabel}
                setReceiptView={setReceiptView}
                setReceiptOpen={setReceiptOpen}
                CURRENCY={CURRENCY}
              />
            )}

            {adminPage === "inventory" && <InventorySection inventory={inventory} menuItems={menuItems} db={db} appId={appId} admT={admT} />}

            {adminPage === "finance" && <FinanceSection orders={orders} menuItems={menuItems} inventory={inventory} CURRENCY={CURRENCY} />}

            {adminPage === "accounting" && (
              <AccountingSection journalEntries={journalEntries} CURRENCY={CURRENCY} accSettings={accSettings} accounts={accounts} lang={lang} />
            )}

            {adminPage === "reports" && (
              <ReportsSection journalEntries={journalEntries} CURRENCY={CURRENCY} accSettings={accSettings} accounts={accounts} lang={lang} />
            )}

            {adminPage === "balanceSheet" && <BalanceSheetSection journalEntries={journalEntries} accSettings={accSettings} CURRENCY={CURRENCY} />}

            {adminPage === "cashFlow" && <CashFlowSection journalEntries={journalEntries} accSettings={accSettings} CURRENCY={CURRENCY} />}

            {adminPage === "invoices" && <InvoicesSection invoices={invoices} customers={customers} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "customers" && <CustomersSection customers={customers} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "vendors" && <VendorsSection vendors={vendors} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "bills" && (
              <BillsSection bills={bills} vendors={vendors} inventory={inventory} db={db} appId={appId} CURRENCY={CURRENCY} />
            )}

            {adminPage === "settings" && (
              <SettingsSection accSettings={accSettings} accounts={accounts} db={db} appId={appId} ownerConfig={ownerConfig} adminSession={adminSession} />
            )}
          </section>
        </div>

        {createOrderOpen && (
          <CreateOrderModal
            isOpen={createOrderOpen}
            onClose={() => setCreateOrderOpen(false)}
            menuItems={menuItems}
            db={db}
            appId={appId}
            CURRENCY={CURRENCY}
          />
        )}

        {vipOpen && <VipModal isOpen={vipOpen} onClose={() => setVipOpen(false)} vipList={vipList} db={db} vipCustomersColPath={vipCustomersColPath} />}
      </AdminLayout>
    );
  }

  // =========================
  // [S10] Customer route returns
  // =========================
  if (appMode === "customer" && view === "selection") {
    return <TableSelection t={t} lang={lang} setLang={setLang} table={table} setTable={setTable} handleStartOrder={handleStartOrder} />;
  }

  if (appMode === "customer" && view === "menu") {
    return (
      <>
        <Menu
          t={t}
          lang={lang}
          table={table}
          setView={setView}
          cart={cart}
          setIsCartOpen={setIsCartOpen}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          filteredItems={filteredItems}
          getLocalizedValue={getLocalizedValue}
          computedOutOfStock={computedOutOfStock}
          setNotesItem={setNotesItem}
          setNotesText={setNotesText}
          setNotesOpen={setNotesOpen}
        />

        {isCartOpen && (
          <Cart
            t={t}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            receiptDataUrl={receiptDataUrl}
            setReceiptDataUrl={setReceiptDataUrl}
            receiptError={receiptError}
            setReceiptError={setReceiptError}
            cartSubtotal={cartSubtotal}
            cartTaxP={cartTaxP}
            cartTaxAmount={cartTaxAmount}
            cartTotalWithTax={cartTotalWithTax}
            handleCompleteOrder={handleCompleteOrder}
            table={table}
            getLocalizedValue={getLocalizedValue}
            CURRENCY={CURRENCY}
          />
        )}

        {notesOpen && (
          <NotesModal
            t={t}
            lang={lang}
            notesOpen={notesOpen}
            setNotesOpen={setNotesOpen}
            notesItem={notesItem}
            notesText={notesText}
            setNotesText={setNotesText}
            addToCartWithNote={addToCartWithNote}
            getLocalizedValue={getLocalizedValue}
          />
        )}

        {orderStatus === "completed" && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-10 text-center">
            <div className="relative mb-10">
              <div className="absolute -inset-8 bg-emerald-100 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-32 h-32 bg-emerald-500 text-white rounded-[3.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200">
                <CheckCircle size={64} />
              </div>
            </div>

            <h2 className="text-4xl font-black text-slate-950 mb-4">{t.orderSuccess}</h2>

            <div className="bg-slate-50 px-8 py-4 rounded-3xl mb-12">
              <p className="text-slate-500 font-bold">
                طاولتك رقم <span className="text-slate-950 text-2xl font-black">{table}</span>
              </p>
            </div>

            <button
              onClick={() => setOrderStatus(null)}
              className="w-full max-w-xs py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl"
            >
              العودة للمنيو
            </button>
          </div>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
              body { font-family: 'Noto Sans Arabic', sans-serif; }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              input[type="number"]::-webkit-outer-spin-button,
              input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              input[type="number"] { -moz-appearance: textfield; }
            `,
          }}
        />
      </>
    );
  }

  return null;
}
