// ===============================
// CashierPage.jsx - نظام الكاشير الكامل
// Full POS System for Cashier
// ===============================

import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CreditCard,
  Banknote,
  Building2,
  X,
  Check,
  Printer,
  LogOut
} from "lucide-react";

export const CashierPage = ({
  db,
  appId,
  cashierSession,
  onLogout,
  adminLang = "ar",
  CURRENCY = "ريال"
}) => {
  // =================== STATE ===================
  const [menuItems, setMenuItems] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [tableNumber, setTableNumber] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);

  // =================== TRANSLATIONS ===================
  const t = {
    ar: {
      cashier: "الكاشير",
      logout: "تسجيل الخروج",
      cart: "السلة",
      tableNumber: "رقم الطاولة",
      optional: "اختياري",
      emptyCart: "السلة فارغة",
      all: "الكل",
      subtotal: "المجموع الفرعي",
      discount: "الخصم",
      tax: "الضريبة",
      total: "الإجمالي",
      checkout: "إتمام الطلب",
      selectPaymentMethod: "اختر طريقة الدفع",
      cash: "نقداً",
      card: "بطاقة",
      transfer: "تحويل",
      payByCash: "الدفع نقداً",
      payByCard: "الدفع بالبطاقة",
      payByTransfer: "الدفع بالتحويل",
      confirm: "تأكيد",
      cancel: "إلغاء",
      orderCreated: "تم إنشاء الطلب بنجاح",
      orderNumber: "رقم الطلب",
      paymentMethod: "طريقة الدفع",
      print: "طباعة",
      close: "إغلاق",
      cartEmpty: "السلة فارغة"
    },
    en: {
      cashier: "Cashier",
      logout: "Logout",
      cart: "Cart",
      tableNumber: "Table Number",
      optional: "Optional",
      emptyCart: "Empty Cart",
      all: "All",
      subtotal: "Subtotal",
      discount: "Discount",
      tax: "Tax",
      total: "Total",
      checkout: "Checkout",
      selectPaymentMethod: "Select Payment Method",
      cash: "Cash",
      card: "Card",
      transfer: "Transfer",
      payByCash: "Pay by Cash",
      payByCard: "Pay by Card",
      payByTransfer: "Pay by Transfer",
      confirm: "Confirm",
      cancel: "Cancel",
      orderCreated: "Order Created Successfully",
      orderNumber: "Order Number",
      paymentMethod: "Payment Method",
      print: "Print",
      close: "Close",
      cartEmpty: "Cart is empty"
    },
    tr: {
      cashier: "Kasiyer",
      logout: "Çıkış",
      cart: "Sepet",
      tableNumber: "Masa Numarası",
      optional: "İsteğe Bağlı",
      emptyCart: "Boş Sepet",
      all: "Tümü",
      subtotal: "Ara Toplam",
      discount: "İndirim",
      tax: "Vergi",
      total: "Toplam",
      checkout: "Ödeme",
      selectPaymentMethod: "Ödeme Yöntemi Seçin",
      cash: "Nakit",
      card: "Kart",
      transfer: "Transfer",
      payByCash: "Nakit Ödeme",
      payByCard: "Kart Ödeme",
      payByTransfer: "Transfer Ödeme",
      confirm: "Onayla",
      cancel: "İptal",
      orderCreated: "Sipariş Başarıyla Oluşturuldu",
      orderNumber: "Sipariş Numarası",
      paymentMethod: "Ödeme Yöntemi",
      print: "Yazdır",
      close: "Kapat",
      cartEmpty: "Sepet boş"
    }
  };

  const admT = t[adminLang] || t.ar;

  // =================== LOAD DATA ===================
  useEffect(() => {
    if (!db || !appId) return;

    // Load menu items
    const menuUnsub = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "menu"),
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
      }
    );

    // Load percentages/tax settings
    const percentagesUnsub = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "percentages"),
      (snapshot) => {
        const percs = [];
        snapshot.forEach((doc) => {
          percs.push({ id: doc.id, ...doc.data() });
        });
        setPercentages(percs);
      }
    );

    // Load finance settings for tax
    const financeUnsub = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "appConfig"),
      (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === "finance") {
            const data = doc.data();
            setTaxPercent(Number(data?.taxPercent || 0));
          }
        });
      }
    );

    return () => {
      menuUnsub();
      percentagesUnsub();
      financeUnsub();
    };
  }, [db, appId]);

  // =================== CATEGORIES ===================
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.categoryAr || item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return menuItems;
    return menuItems.filter(item => (item.categoryAr || item.category) === selectedCategory);
  }, [menuItems, selectedCategory]);

  // =================== CART FUNCTIONS ===================
  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { 
        ...item, 
        quantity: 1,
        menuItemId: item.id
      }]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(i => 
        i.id === itemId 
          ? { ...i, quantity: newQuantity }
          : i
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setTableNumber("");
    setPaymentMethod("cash");
  };

  // =================== CALCULATIONS ===================
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const cartTaxAmount = useMemo(() => {
    return (cartSubtotal * taxPercent) / 100;
  }, [cartSubtotal, taxPercent]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTaxAmount;
  }, [cartSubtotal, cartTaxAmount]);

  // =================== CHECKOUT ===================
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(admT.cartEmpty);
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmOrder = async () => {
    try {
      // Create order
      const order = {
        items: cart.map(item => ({
          id: item.id,
          menuItemId: item.id,
          name: item.name,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          nameTr: item.nameTr,
          price: item.price,
          quantity: item.quantity
        })),
        table: tableNumber || null,
        total: cartSubtotal,
        taxPercent: taxPercent,
        taxAmount: cartTaxAmount,
        totalWithTax: cartTotal,
        paymentMethod: paymentMethod,
        status: "new",
        timestamp: Date.now(),
        createdBy: cashierSession?.username || "cashier",
        createdAt: Date.now()
      };

      // Save to Firestore
      const docRef = await addDoc(
        collection(db, "artifacts", appId, "public", "data", "orders"),
        order
      );

      console.log("✅ Order created:", docRef.id);

      // Set last order for receipt
      setLastOrder({ ...order, id: docRef.id });

      // Clear cart
      clearCart();
      setShowPaymentModal(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("❌ Error creating order:", error);
      alert("حدث خطأ أثناء إنشاء الطلب");
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={adminLang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xl">
              💰
            </div>
            <div>
              <div className="font-black text-slate-900">{admT.cashier}</div>
              <div className="text-xs font-bold text-slate-500">
                {cashierSession?.username || "Cashier"}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-all flex items-center gap-2"
          >
            <LogOut size={18} />
            {admT.logout}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories */}
          <div className="bg-white p-4 rounded-2xl border">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? admT.all : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-600 hover:shadow-lg transition-all group"
              >
                {item.imageUrl && (
                  <div className="aspect-square rounded-xl bg-slate-100 mb-3 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.nameAr || item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                )}
                
                <h3 className="font-black text-slate-900 mb-1 text-sm">
                  {item.nameAr || item.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-black text-lg">
                    {item.price} {CURRENCY}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl flex items-center gap-2">
                <ShoppingCart size={24} />
                {admT.cart}
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Table Number */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">
                {admT.tableNumber} ({admT.optional})
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="1, 2, 3..."
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
                  <p className="font-bold">{admT.emptyCart}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-sm">
                          {item.nameAr || item.name}
                        </div>
                        <div className="text-orange-600 font-black">
                          {item.price} {CURRENCY}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                      >
                        <Minus size={14} />
                      </button>
                      
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center p-2 rounded-lg border border-slate-300 font-bold"
                        min="1"
                      />
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center font-bold"
                      >
                        <Plus size={14} />
                      </button>
                      
                      <div className="flex-1 text-left font-black">
                        = {(item.price * item.quantity).toFixed(2)} {CURRENCY}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="space-y-2 mb-4 pt-4 border-t">
                <div className="flex justify-between font-bold text-sm">
                  <span>{admT.subtotal}:</span>
                  <span>{cartSubtotal.toFixed(2)} {CURRENCY}</span>
                </div>

                {taxPercent > 0 && (
                  <div className="flex justify-between font-bold text-sm text-red-600">
                    <span>{admT.tax} ({taxPercent}%):</span>
                    <span>+{cartTaxAmount.toFixed(2)} {CURRENCY}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-xl pt-2 border-t">
                  <span>{admT.total}:</span>
                  <span className="text-orange-600">{cartTotal.toFixed(2)} {CURRENCY}</span>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl"
              }`}
            >
              <Receipt size={20} />
              {admT.checkout}
            </button>
          </div>
        </div>
      </div>

      {/* =================== PAYMENT MODAL =================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-2xl mb-6 text-center">
              {admT.selectPaymentMethod}
            </h3>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-3 ${
                  paymentMethod === "cash"
                    ? "border-orange-600 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === "cash" ? "bg-orange-600 text-white" : "bg-slate-100"
                }`}>
                  <Banknote size={24} />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-black">{admT.cash}</div>
                  <div className="text-sm text-slate-600">{admT.payByCash}</div>
                </div>
                {paymentMethod === "cash" && <Check className="text-orange-600" size={24} />}
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-3 ${
                  paymentMethod === "card"
                    ? "border-orange-600 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === "card" ? "bg-orange-600 text-white" : "bg-slate-100"
                }`}>
                  <CreditCard size={24} />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-black">{admT.card}</div>
                  <div className="text-sm text-slate-600">{admT.payByCard}</div>
                </div>
                {paymentMethod === "card" && <Check className="text-orange-600" size={24} />}
              </button>

              <button
                onClick={() => setPaymentMethod("iban")}
                className={`w-full p-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-3 ${
                  paymentMethod === "iban"
                    ? "border-orange-600 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === "iban" ? "bg-orange-600 text-white" : "bg-slate-100"
                }`}>
                  <Building2 size={24} />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-black">{admT.transfer}</div>
                  <div className="text-sm text-slate-600">{admT.payByTransfer}</div>
                </div>
                {paymentMethod === "iban" && <Check className="text-orange-600" size={24} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmOrder}
                className="flex-1 py-4 rounded-xl bg-orange-600 text-white font-black text-lg hover:bg-orange-700"
              >
                {admT.confirm}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-4 rounded-xl bg-slate-100 font-black text-lg hover:bg-slate-200"
              >
                {admT.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== SUCCESS MODAL =================== */}
      {showSuccessModal && lastOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <Check className="text-green-600" size={40} />
              </div>
              <h3 className="font-black text-2xl text-green-600 mb-2">
                {admT.orderCreated}
              </h3>
              <p className="text-slate-600 font-bold">
                {admT.orderNumber}: #{lastOrder.id?.slice(-6)}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <div className="flex justify-between font-bold mb-2">
                <span>{admT.total}:</span>
                <span className="text-orange-600 text-xl font-black">
                  {lastOrder.totalWithTax.toFixed(2)} {CURRENCY}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{admT.paymentMethod}:</span>
                <span className="font-bold">
                  {lastOrder.paymentMethod === "cash" ? admT.cash :
                   lastOrder.paymentMethod === "card" ? admT.card :
                   admT.transfer}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={printReceipt}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                {admT.print}
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setLastOrder(null);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`}</style>

    </div>
  );
};