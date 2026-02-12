// ===============================
// App.jsx (FULL) - Staff Gate + Admin + Cashier + Customer Tables/Menu
// FIX: no "t before init" + table/order link + safer props
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
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { CheckCircle } from "lucide-react";

import { LuxuryShell } from "./components/shared/LuxuryShell";
import { ModeSelectionScreen } from "./components/shared/ModeSelectionScreen";

import { AdminLoginScreen } from "./components/admin/AdminLoginScreen";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Sidebar } from "./components/admin/Sidebar";

import { CashierLogin } from "./components/cashier/CashierLogin";
import { CashierPage } from "./components/cashier/CashierPage";

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
import { StaffSection } from "./components/admin/StaffSection";
import { PercentagesSection } from "./components/admin/PercentagesSection";


import { TableSelection } from "./components/customer/TableSelection";
import { Menu } from "./components/customer/Menu";
import { Cart } from "./components/customer/Cart";
import { NotesModal } from "./components/customer/NotesModal";

import { CreateOrderModal } from "./components/modals/CreateOrderModal";
import { VipModal } from "./components/modals/VipModal";

import { appId, CURRENCY } from "./config/constants";
import { auth, db } from "./config/firebase";

import { orderDateToJS, normalizeDigits } from "./utils/helpers";
import { translations } from "./translations";

import { adminLogin, adminRegister, adminLogout as performAdminLogout } from "./services/auth";

import "./App.css";

export default function App() {
  // =========================
  // [S01] BASIC STATE FIRST (so we can use them safely in routes)
  // =========================

  const [user, setUser] = useState(null);

  // Languages
  const [lang, setLang] = useState("ar");
  const [adminLang, setAdminLang] = useState("ar");

  // Admin auth
  const [adminSession, setAdminSession] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState("login");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [ownerPin, setOwnerPin] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [ownerConfig, setOwnerConfig] = useState(null);

  // Cashier auth
  const [cashierSession, setCashierSession] = useState(null);
  const [cashierAuthError, setCashierAuthError] = useState("");

  // Customer flow
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
  const [vipList, setVipList] = useState([]);

  // Finance settings doc
  const [taxPercent, setTaxPercent] = useState(0);
  const [cashDiscountPercent, setCashDiscountPercent] = useState(0);

  // Old orders filter
  const [oldFrom, setOldFrom] = useState("");
  const [oldTo, setOldTo] = useState("");
  const [applyOldFilter, setApplyOldFilter] = useState(false);
  const [oldFilterError, setOldFilterError] = useState("");

  // Modals
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  // =========================
  // [S02] PATHS
  // =========================
  const adminUsersColPath = ["artifacts", appId, "public", "data", "adminUsers"];
  const ownerDocPath = ["artifacts", appId, "public", "data", "adminConfig", "owner"];
  const vipCustomersColPath = ["artifacts", appId, "public", "data", "vipCustomers"];
  const financeDocPath = ["artifacts", appId, "public", "data", "appConfig", "finance"];
  const accountingDocPath = ["artifacts", appId, "public", "data", "appConfig", "accounting"];

  // NEW: tables collection
  const tablesColPath = ["artifacts", appId, "public", "data", "tables"];

  // =========================
  // [S03] i18n
  // =========================
  const t = translations[lang] || translations.ar;
  const admT = translations[adminLang] || translations.ar;

  // =========================
  // [S04] ROUTE FLAGS (safe now)
  // =========================
  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  const isAdminRoute = path.startsWith("/admin");
  const isCashierRoute = path.startsWith("/cashier");
  const isStaffGateRoute = path === "/";

  const isCustomerTablesRoute = path.startsWith("/tables");
  const isCustomerMenuRoute = path.startsWith("/menu");

  // =========================
  // [S05] HELPERS
  // =========================
  const getPayLabel = (m) => {
    if (m === "cash") return adminLang === "ar" ? "كاش" : "Cash";
    if (m === "card") return adminLang === "ar" ? "بطاقة" : "Card";
    if (m === "iban") return adminLang === "ar" ? "تحويل (IBAN)" : "IBAN";
    return adminLang === "ar" ? "غير محدد" : "Unknown";
  };

  const persistTable = (tableNumber) => {
    try {
      localStorage.setItem("wingi_customer_table", JSON.stringify({ table: tableNumber, at: Date.now() }));
    } catch {}
  };

  const loadPersistedTable = () => {
    try {
      const raw = localStorage.getItem("wingi_customer_table");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.table ?? null;
    } catch {
      return null;
    }
  };

  const clearPersistedTable = () => {
    try {
      localStorage.removeItem("wingi_customer_table");
    } catch {}
  };

  // Update table status in Firestore
  const setTableStatus = async (tableNumber, patch) => {
    const tableId = String(tableNumber);
    const ref = doc(db, ...tablesColPath, tableId);
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

  // =========================
  // [S06] EFFECTS (Auth + Sessions + Data)
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

  // Load cashier session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("wingi_cashier_session");
    if (!raw) return;
    try {
      setCashierSession(JSON.parse(raw));
    } catch {}
  }, []);

  // Load customer table from localStorage (so /menu works after refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = loadPersistedTable();
    if (saved && !table) setTable(saved);
  }, [table]);

  // Ensure owner exists
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
      }
    };

    ensureOwner();
  }, [user]);

  // Owner config live
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, ...ownerDocPath), (snap) => {
      if (snap.exists()) setOwnerConfig(snap.data());
    });
    return () => unsub();
  }, [user]);

  // Finance config live
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

  // Main data live
  useEffect(() => {
    if (!user) return;

    const unsubMenu = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "menu"),
      (snap) => setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubOrders = onSnapshot(collection(db, "artifacts", appId, "public", "data", "orders"), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setOrders(arr);
    });

    const unsubInv = onSnapshot(collection(db, "artifacts", appId, "public", "data", "inventory"), (snap) =>
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubJournal = onSnapshot(
      query(collection(db, "artifacts", appId, "public", "data", "journalEntries"), orderBy("createdAt", "desc"), limit(50)),
      (snap) => setJournalEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
    );

    const unsubAccounts = onSnapshot(
      query(collection(db, "artifacts", appId, "public", "data", "accounts"), orderBy("code", "asc")),
      (snap) => setAccounts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })))
    );

    const unsubInvoices = onSnapshot(collection(db, "artifacts", appId, "public", "data", "invoices"), (snap) =>
      setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubCustomers = onSnapshot(collection(db, "artifacts", appId, "public", "data", "customers"), (snap) =>
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubVendors = onSnapshot(collection(db, "artifacts", appId, "public", "data", "vendors"), (snap) =>
      setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const unsubBills = onSnapshot(collection(db, "artifacts", appId, "public", "data", "bills"), (snap) =>
      setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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
  // [S07] COMPUTED
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

  const categories = useMemo(() => ["All", ...new Set(menuItems.map((i) => i.categoryAr).filter(Boolean))], [menuItems]);
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
    if (lang === "tr")
      return pick(item, [`${key}Tr`, `${key}_tr`, `${key}TR`, `${key}En`, `${key}_en`, `${key}Ar`, `${key}_ar`, key]);
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
  // [S08] HANDLERS
  // =========================
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

  // ✅ CUSTOMER starts table: link table <-> order (occupied)
  const handleCustomerChooseTable = async (tableNumber) => {
    setTable(tableNumber);
    persistTable(tableNumber);

    setCart([]);
    setPaymentMethod(null);
    setOrderStatus(null);

    try {
      await setTableStatus(tableNumber, { status: "occupied" });
    } catch (e) {
      console.error("setTableStatus occupied error:", e);
    }

    window.location.href = "/menu";
  };

  // ✅ When customer completes order: create order + attach to table activeOrderId
  const handleCompleteOrder = async () => {
    try {
      setOrderStatus("sending");

      const created = await addDoc(collection(db, "artifacts", appId, "public", "data", "orders"), {
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

      // link table to active order id
      if (table) {
        await setTableStatus(table, { status: "occupied", activeOrderId: created.id });
      }

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
    setAdminAuthError("");
  };

  const adminLogout = () => {
    performAdminLogout();
    setAdminSession(null);
    setIsOwner(false);
    try {
      localStorage.removeItem("wingi_admin_session");
    } catch {}
    window.location.href = "/";
  };

  // optional: invoice print stub (so OrdersSection never crashes)
  const printInvoice = (order) => {
    // ضع هنا pdf/print logic إذا عندك
    console.log("printInvoice:", order?.id);
  };

  // =========================
  // [S09] ROUTES (NOW SAFE)
  // =========================

  // 1) Staff gate on "/"
  if (isStaffGateRoute) {
    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <ModeSelectionScreen
          admT={admT}
          adminLang={adminLang}
          setAdminLang={setAdminLang}
          onGoAdmin={() => (window.location.href = "/admin")}
          onGoCashier={() => (window.location.href = "/cashier")}
        />
      </LuxuryShell>
    );
  }

  // 2) Cashier
  if (isCashierRoute) {
    if (!cashierSession) {
      return (
        <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
          <CashierLogin
            db={db}
            appId={appId}
            adminLang={adminLang}
            cashierAuthError={cashierAuthError}
            setCashierAuthError={setCashierAuthError}
            onBack={() => (window.location.href = "/")}
            onLogin={(session) => {
              setCashierSession(session);
              try {
                localStorage.setItem("wingi_cashier_session", JSON.stringify(session));
              } catch {}
            }}
          />
        </LuxuryShell>
      );
    }

    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <CashierPage
          db={db}
          appId={appId}
          adminLang={adminLang}
          CURRENCY={CURRENCY}
          cashierSession={cashierSession}
          // ✅ give cashier ability to change table state
          setTableStatus={setTableStatus}
          tablesColPath={tablesColPath}
          onLogout={() => {
            try {
              localStorage.removeItem("wingi_cashier_session");
            } catch {}
            setCashierSession(null);
            window.location.href = "/";
          }}
        />
      </LuxuryShell>
    );
  }

  // 3) Admin
  if (isAdminRoute) {
    if (!adminSession) {
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

    return (
      <AdminLayout
        adminLang={adminLang}
        setAdminLang={setAdminLang}
        adminSession={adminSession}
        adminLogout={adminLogout}
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
        admT={admT}
      >
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Sidebar
            adminPage={adminPage}
            setAdminPage={setAdminPage}
            admT={admT}
            adminLang={adminLang}
            adminSession={adminSession}
          />

          <section className="xl:col-span-9 space-y-6">
            {adminPage === "menu" && (
              <MenuSection menuItems={menuItems} admT={admT} adminLang={adminLang} db={db} appId={appId} />
            )}

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
                deleteOrderPermanently={deleteOrderPermanently}
                printInvoice={printInvoice}
                getPayLabel={getPayLabel}
                CURRENCY={CURRENCY}
                admT={admT}
                adminLang={adminLang}
                db={db}
                appId={appId}
                adminSession={adminSession}
              />
            )}

            {adminPage === "inventory" && <InventorySection inventory={inventory} menuItems={menuItems} db={db} appId={appId} admT={admT} />}

            {adminPage === "finance" && <FinanceSection orders={orders} menuItems={menuItems} inventory={inventory} CURRENCY={CURRENCY} />}

            {adminPage === "accounting" && <AccountingSection journalEntries={journalEntries} CURRENCY={CURRENCY} accSettings={{}} accounts={accounts} lang={lang} />}

            {adminPage === "reports" && <ReportsSection journalEntries={journalEntries} CURRENCY={CURRENCY} accSettings={{}} accounts={accounts} lang={lang} />}

            {adminPage === "balanceSheet" && <BalanceSheetSection journalEntries={journalEntries} accSettings={{}} CURRENCY={CURRENCY} />}

            {adminPage === "cashFlow" && <CashFlowSection journalEntries={journalEntries} accSettings={{}} CURRENCY={CURRENCY} />}

            {adminPage === "invoices" && <InvoicesSection invoices={invoices} customers={customers} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "customers" && <CustomersSection customers={customers} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "vendors" && <VendorsSection vendors={vendors} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "bills" && <BillsSection bills={bills} vendors={vendors} inventory={inventory} db={db} appId={appId} CURRENCY={CURRENCY} />}

            {adminPage === "settings" && (
              <SettingsSection
                accSettings={{}}
                accounts={accounts}
                db={db}
                appId={appId}
                ownerConfig={ownerConfig}
                adminSession={adminSession}
                admT={admT}
                adminLang={adminLang}
              />
            )}

            {adminPage === "staff" && (
  <StaffSection
    db={db}
    appId={appId}
    adminSession={adminSession}
    admT={admT}
    adminLang={adminLang}
  />
)}

{adminPage === "percentages" && (
  <PercentagesSection
    db={db}
    appId={appId}
    adminSession={adminSession}
    admT={admT}
    adminLang={adminLang}
  />
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

        {vipOpen && (
          <VipModal
            isOpen={vipOpen}
            onClose={() => setVipOpen(false)}
            vipList={vipList}
            db={db}
            vipCustomersColPath={vipCustomersColPath}
          />
        )}
      </AdminLayout>
    );
  }

  // 4) Customer /tables
  if (isCustomerTablesRoute) {
    return (
      <TableSelection
        t={t}
        lang={lang}
        setLang={setLang}
        table={table}
        setTable={setTable}
        handleStartOrder={handleCustomerChooseTable}
      />
    );
  }

  // 5) Customer /menu
  if (isCustomerMenuRoute) {
    if (!table) {
      // try load from storage
      const saved = loadPersistedTable();
      if (saved) {
        setTable(saved);
      } else {
        window.location.href = "/tables";
        return null;
      }
    }

    return (
      <>
        <Menu
          t={t}
          lang={lang}
          table={table}
          setView={() => {}}
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

            <h2 className="text-4xl font-black text-slate-950 mb-4">{t.orderSuccess || "تم إرسال الطلب"}</h2>

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
      </>
    );
  }

  // fallback
  if (typeof window !== "undefined") window.location.href = "/";
  return null;
}
