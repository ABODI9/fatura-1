// ===============================
// SettingsSection.jsx - إعدادات المطعم الكاملة
// Professional Restaurant Settings
// ===============================

import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  Settings, 
  Save, 
  Building2, 
  Receipt, 
  CreditCard, 
  Table2,
  Percent,
  Shield
} from "lucide-react";

export const SettingsSection = ({ 
  db, 
  appId,
  ownerConfig,
  adminSession,
  admT,
  adminLang
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // =================== GENERAL SETTINGS ===================
  const [restaurantName, setRestaurantName] = useState("مطعمنا");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currency, setCurrency] = useState("ريال");

  // =================== TABLES SETTINGS ===================
  const [numberOfTables, setNumberOfTables] = useState(20);
  const [tablePrefix, setTablePrefix] = useState("طاولة");
  const [allowCustomTables, setAllowCustomTables] = useState(false);

  // =================== RECEIPT SETTINGS ===================
  const [showLogo, setShowLogo] = useState(false);
  const [receiptFooter, setReceiptFooter] = useState("شكراً لزيارتكم");
  const [showTaxOnReceipt, setShowTaxOnReceipt] = useState(true);
  const [receiptSize, setReceiptSize] = useState("80mm"); // 80mm or A4
  const [autoInvoiceNumber, setAutoInvoiceNumber] = useState(true);
  const [invoicePrefix, setInvoicePrefix] = useState("INV");

  // =================== PAYMENT SETTINGS ===================
  const [enableCash, setEnableCash] = useState(true);
  const [enableCard, setEnableCard] = useState(true);
  const [enableIban, setEnableIban] = useState(true);
  const [ibanNumber, setIbanNumber] = useState("");
  const [ibanName, setIbanName] = useState("");

  // =================== TAX & DISCOUNTS ===================
  const [taxPercent, setTaxPercent] = useState(0);
  const [cashDiscountPercent, setCashDiscountPercent] = useState(0);
  const [enableVip, setEnableVip] = useState(false);
  const [vipDiscountPercent, setVipDiscountPercent] = useState(0);

  // =================== ORDERS SETTINGS ===================
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [preparationTime, setPreparationTime] = useState(15);
  const [allowNotes, setAllowNotes] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState(0);

  // =================== OWNER SETTINGS ===================
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  // =================== LOAD SETTINGS ===================
  useEffect(() => {
    loadAllSettings();
  }, [db, appId]);

  const loadAllSettings = async () => {
    if (!db || !appId) return;

    try {
      // Load general settings
      const generalDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "general")
      );
      if (generalDoc.exists()) {
        const data = generalDoc.data();
        setRestaurantName(data.restaurantName || "مطعمنا");
        setRestaurantPhone(data.restaurantPhone || "");
        setRestaurantAddress(data.restaurantAddress || "");
        setTaxNumber(data.taxNumber || "");
        setCurrency(data.currency || "ريال");
      }

      // Load tables settings
      const tablesDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "tables")
      );
      if (tablesDoc.exists()) {
        const data = tablesDoc.data();
        setNumberOfTables(data.numberOfTables || 20);
        setTablePrefix(data.tablePrefix || "طاولة");
        setAllowCustomTables(data.allowCustomTables || false);
      }

      // Load receipt settings
      const receiptDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "receipt")
      );
      if (receiptDoc.exists()) {
        const data = receiptDoc.data();
        setShowLogo(data.showLogo || false);
        setReceiptFooter(data.receiptFooter || "شكراً لزيارتكم");
        setShowTaxOnReceipt(data.showTaxOnReceipt !== false);
        setReceiptSize(data.receiptSize || "80mm");
        setAutoInvoiceNumber(data.autoInvoiceNumber !== false);
        setInvoicePrefix(data.invoicePrefix || "INV");
      }

      // Load payment settings
      const paymentsDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "payments")
      );
      if (paymentsDoc.exists()) {
        const data = paymentsDoc.data();
        setEnableCash(data.enableCash !== false);
        setEnableCard(data.enableCard !== false);
        setEnableIban(data.enableIban !== false);
        setIbanNumber(data.ibanNumber || "");
        setIbanName(data.ibanName || "");
      }

      // Load finance settings (tax & discounts)
      const financeDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "finance")
      );
      if (financeDoc.exists()) {
        const data = financeDoc.data();
        setTaxPercent(Number(data.taxPercent || 0));
        setCashDiscountPercent(Number(data.cashDiscountPercent || 0));
        setEnableVip(data.enableVip || false);
        setVipDiscountPercent(Number(data.vipDiscountPercent || 0));
      }

      // Load orders settings
      const ordersDoc = await getDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "orders")
      );
      if (ordersDoc.exists()) {
        const data = ordersDoc.data();
        setAcceptOrders(data.acceptOrders !== false);
        setPreparationTime(data.preparationTime || 15);
        setAllowNotes(data.allowNotes !== false);
        setMinOrderAmount(Number(data.minOrderAmount || 0));
      }

      // Load owner config
      if (ownerConfig) {
        setOwnerUsername(ownerConfig.ownerUsername || "");
        setOwnerPassword(ownerConfig.ownerPassword || "");
      }

    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // =================== SAVE FUNCTIONS ===================
  const saveGeneralSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "general"),
        {
          restaurantName,
          restaurantPhone,
          restaurantAddress,
          taxNumber,
          currency,
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const saveTablesSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "tables"),
        {
          numberOfTables: Number(numberOfTables),
          tablePrefix,
          allowCustomTables,
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const saveReceiptSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "receipt"),
        {
          showLogo,
          receiptFooter,
          showTaxOnReceipt,
          receiptSize,
          autoInvoiceNumber,
          invoicePrefix,
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const savePaymentSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "payments"),
        {
          enableCash,
          enableCard,
          enableIban,
          ibanNumber,
          ibanName,
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const saveFinanceSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "finance"),
        {
          taxPercent: Number(taxPercent),
          cashDiscountPercent: Number(cashDiscountPercent),
          enableVip,
          vipDiscountPercent: Number(vipDiscountPercent),
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        },
        { merge: true }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const saveOrdersSettings = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "orders"),
        {
          acceptOrders,
          preparationTime: Number(preparationTime),
          allowNotes,
          minOrderAmount: Number(minOrderAmount),
          updatedAt: Date.now(),
          updatedBy: adminSession?.username || "unknown"
        }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  const saveOwnerSettings = async () => {
    if (adminSession?.role !== "owner" && adminSession?.role !== "admin") {
      alert("فقط المالك يستطيع تعديل هذه الإعدادات");
      return;
    }

    setLoading(true);
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "adminConfig", "owner"),
        {
          ownerUsername,
          ownerPassword,
          updatedAt: Date.now()
        },
        { merge: true }
      );
      alert(admT?.success || "تم الحفظ بنجاح ✓");
    } catch (error) {
      console.error(error);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <Settings size={24} />
        {admT?.settingsSection || "الإعدادات"}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border overflow-x-auto">
        {[
          { id: "general", label: "عام", icon: Building2 },
          { id: "tables", label: "الطاولات", icon: Table2 },
          { id: "receipt", label: "الإيصال", icon: Receipt },
          { id: "payments", label: "الدفع", icon: CreditCard },
          { id: "finance", label: "الضرائب والخصومات", icon: Percent },
          { id: "orders", label: "الطلبات", icon: Settings },
          ...(adminSession?.role === "owner" || adminSession?.role === "admin" 
            ? [{ id: "owner", label: "المالك", icon: Shield }] 
            : [])
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-slate-950 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =================== GENERAL TAB =================== */}
      {activeTab === "general" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">معلومات المطعم</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم المطعم *</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="مطعم الذواقة"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="+966 50 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">العنوان</label>
              <input
                type="text"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="الرياض، المملكة العربية السعودية"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الرقم الضريبي</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="300012345600003"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">العملة</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="ريال"
              />
            </div>
          </div>

          <button
            onClick={saveGeneralSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== TABLES TAB =================== */}
      {activeTab === "tables" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">إعدادات الطاولات</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">عدد الطاولات *</label>
              <input
                type="number"
                value={numberOfTables}
                onChange={(e) => setNumberOfTables(e.target.value)}
                min="1"
                max="999"
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                سيتم عرض الطاولات من 1 إلى {numberOfTables}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">تسمية الطاولة</label>
              <input
                type="text"
                value={tablePrefix}
                onChange={(e) => setTablePrefix(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="طاولة"
              />
              <p className="text-xs text-slate-500 mt-1">
                مثال: {tablePrefix} 5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
            <input
              type="checkbox"
              id="customTables"
              checked={allowCustomTables}
              onChange={(e) => setAllowCustomTables(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="customTables" className="font-bold">
              السماح بإدخال رقم طاولة مخصص
            </label>
          </div>

          <button
            onClick={saveTablesSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== RECEIPT TAB =================== */}
      {activeTab === "receipt" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">إعدادات الإيصال</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">رسالة نهاية الإيصال</label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                placeholder="شكراً لزيارتكم، نتمنى رؤيتكم مجدداً"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">حجم الإيصال</label>
                <select
                  value={receiptSize}
                  onChange={(e) => setReceiptSize(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                >
                  <option value="80mm">80mm (حراري)</option>
                  <option value="A4">A4 (ورق عادي)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">بادئة رقم الفاتورة</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
                  placeholder="INV"
                />
                <p className="text-xs text-slate-500 mt-1">
                  مثال: {invoicePrefix}-0001
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                <input
                  type="checkbox"
                  id="showTax"
                  checked={showTaxOnReceipt}
                  onChange={(e) => setShowTaxOnReceipt(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="showTax" className="font-bold">
                  إظهار الضريبة في الإيصال
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                <input
                  type="checkbox"
                  id="autoNumber"
                  checked={autoInvoiceNumber}
                  onChange={(e) => setAutoInvoiceNumber(e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="autoNumber" className="font-bold">
                  ترقيم تلقائي للفواتير
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 opacity-50">
                <input
                  type="checkbox"
                  id="showLogo"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="w-5 h-5"
                  disabled
                />
                <label htmlFor="showLogo" className="font-bold">
                  إظهار شعار المطعم (قريباً)
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={saveReceiptSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== PAYMENTS TAB =================== */}
      {activeTab === "payments" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">طرق الدفع</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input
                type="checkbox"
                id="enableCash"
                checked={enableCash}
                onChange={(e) => setEnableCash(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="enableCash" className="font-bold">
                تفعيل الدفع نقداً
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input
                type="checkbox"
                id="enableCard"
                checked={enableCard}
                onChange={(e) => setEnableCard(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="enableCard" className="font-bold">
                تفعيل الدفع بالبطاقة
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input
                type="checkbox"
                id="enableIban"
                checked={enableIban}
                onChange={(e) => setEnableIban(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="enableIban" className="font-bold">
                تفعيل التحويل البنكي
              </label>
            </div>
          </div>

          {enableIban && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <h4 className="font-black text-sm">معلومات الحساب البنكي</h4>
              
              <div>
                <label className="block text-sm font-bold mb-2">رقم الآيبان</label>
                <input
                  type="text"
                  value={ibanNumber}
                  onChange={(e) => setIbanNumber(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 font-bold focus:border-blue-600 focus:outline-none"
                  placeholder="SA0000000000000000000000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">اسم المستفيد</label>
                <input
                  type="text"
                  value={ibanName}
                  onChange={(e) => setIbanName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 font-bold focus:border-blue-600 focus:outline-none"
                  placeholder="مطعم الذواقة"
                />
              </div>
            </div>
          )}

          <button
            onClick={savePaymentSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== FINANCE TAB =================== */}
      {activeTab === "finance" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">الضرائب والخصومات</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">نسبة الضريبة (%)</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">خصم الدفع نقداً (%)</label>
              <input
                type="number"
                value={cashDiscountPercent}
                onChange={(e) => setCashDiscountPercent(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableVip"
                checked={enableVip}
                onChange={(e) => setEnableVip(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="enableVip" className="font-bold">
                تفعيل خصم VIP
              </label>
            </div>

            {enableVip && (
              <div>
                <label className="block text-sm font-bold mb-2">نسبة خصم VIP (%)</label>
                <input
                  type="number"
                  value={vipDiscountPercent}
                  onChange={(e) => setVipDiscountPercent(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full p-3 rounded-xl border-2 font-bold focus:border-purple-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            onClick={saveFinanceSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== ORDERS TAB =================== */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black text-lg mb-4">إعدادات الطلبات</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input
                type="checkbox"
                id="acceptOrders"
                checked={acceptOrders}
                onChange={(e) => setAcceptOrders(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="acceptOrders" className="font-bold">
                قبول الطلبات (تفعيل/إيقاف)
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <input
                type="checkbox"
                id="allowNotes"
                checked={allowNotes}
                onChange={(e) => setAllowNotes(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="allowNotes" className="font-bold">
                السماح بإضافة ملاحظات على الطلب
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">وقت التحضير الافتراضي (دقيقة)</label>
              <input
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                min="0"
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الحد الأدنى للطلب ({currency})</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                min="0"
                step="0.1"
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-orange-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={saveOrdersSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2 hover:bg-emerald-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}

      {/* =================== OWNER TAB =================== */}
      {activeTab === "owner" && (adminSession?.role === "owner" || adminSession?.role === "admin") && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-red-600" size={24} />
            <h3 className="font-black text-lg text-red-600">إعدادات المالك</h3>
          </div>
          
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4">
            <p className="text-sm font-bold text-red-700">
              ⚠️ تحذير: هذه الإعدادات حساسة ويجب التعامل معها بحذر
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={ownerUsername}
                onChange={(e) => setOwnerUsername(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full p-3 rounded-xl border-2 font-bold focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={saveOwnerSettings}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-black flex items-center gap-2 hover:bg-red-700 disabled:bg-slate-300"
          >
            <Save size={18} />
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}
    </div>
  );
};