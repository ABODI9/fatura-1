// ===============================
// SettingsSection.jsx - محسّن
// Features: Full Translation
// ===============================

import React, { useState, useEffect } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Settings, Star, Trash2, Edit, Plus, Save, Shield } from "lucide-react";

export const SettingsSection = ({ 
  accSettings = {}, 
  accounts = [],
  db, 
  appId,
  ownerConfig,
  adminSession,
  admT,
  adminLang
}) => {
  const [activeTab, setActiveTab] = useState("accounting");

  // Accounting settings
  const [cashAccount, setCashAccount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [salesAccount, setSalesAccount] = useState("");
  const [vatOutputAccount, setVatOutputAccount] = useState("");
  const [arAccount, setArAccount] = useState("");
  const [apAccount, setApAccount] = useState("");

  // Account creation
  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("asset");
  const [isGolden, setIsGolden] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);

  // General settings
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  useEffect(() => {
    if (accSettings?.accounts) {
      setCashAccount(accSettings.accounts.cash || "");
      setBankAccount(accSettings.accounts.bank || "");
      setSalesAccount(accSettings.accounts.sales || "");
      setVatOutputAccount(accSettings.accounts.vatOutput || "");
      setArAccount(accSettings.accounts.ar || "");
      setApAccount(accSettings.accounts.ap || "");
    }
  }, [accSettings]);

  useEffect(() => {
    if (ownerConfig) {
      setOwnerUsername(ownerConfig.ownerUsername || "");
      setOwnerPassword(ownerConfig.ownerPassword || "");
    }
  }, [ownerConfig]);

  const handleSaveAccounting = async () => {
    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "appConfig", "accounting"),
        {
          accounts: {
            cash: cashAccount,
            bank: bankAccount,
            sales: salesAccount,
            vatOutput: vatOutputAccount,
            ar: arAccount,
            ap: apAccount,
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      alert(admT?.success || "تم حفظ الإعدادات بنجاح");
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ أثناء الحفظ");
    }
  };

  const resetAccountForm = () => {
    setNewAccountCode("");
    setNewAccountName("");
    setNewAccountType("asset");
    setIsGolden(false);
    setEditingAccountId(null);
  };

  const handleAddAccount = async () => {
    if (!newAccountCode || !newAccountName) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    try {
      const accountData = {
        code: newAccountCode,
        name: newAccountName,
        type: newAccountType,
        key: newAccountCode,
        balance: 0,
        isGolden: isGolden,
        isDeleted: false,
        updatedAt: Date.now(),
        updatedBy: adminSession?.username || "unknown",
      };

      if (editingAccountId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "accounts", editingAccountId),
          accountData
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "accounts"), 
          {
            ...accountData,
            createdAt: Date.now(),
            createdBy: adminSession?.username || "unknown",
          }
        );
      }

      resetAccountForm();
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccountId(account.id);
    setNewAccountCode(account.code || "");
    setNewAccountName(account.name || "");
    setNewAccountType(account.type || "asset");
    setIsGolden(account.isGolden || false);
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "accounts", id));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const handleSaveGeneral = async () => {
    if (adminSession?.role !== "owner") {
      alert(adminLang === "ar" ? "فقط المالك" : "Owner only");
      return;
    }

    try {
      await setDoc(
        doc(db, "artifacts", appId, "public", "data", "adminConfig", "owner"),
        {
          ownerUsername,
          ownerPassword,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      alert(admT?.success || "نجح");
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "خطأ");
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      ar: { asset: "أصول", liability: "خصوم", equity: "حقوق ملكية", revenue: "إيرادات", expense: "مصروفات" },
      tr: { asset: "Varlık", liability: "Yükümlülük", equity: "Özkaynak", revenue: "Gelir", expense: "Gider" },
      en: { asset: "Asset", liability: "Liability", equity: "Equity", revenue: "Revenue", expense: "Expense" }
    };
    return labels[adminLang]?.[type] || type;
  };

  const activeAccounts = accounts.filter(a => !a.isDeleted);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        <Settings size={24} />
        {admT?.settingsSection || "الإعدادات"}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setActiveTab("accounting")}
          className={`flex-1 py-3 rounded-xl font-black ${activeTab === "accounting" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}
        >
          {admT?.accountingSettings || "المحاسبة"}
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex-1 py-3 rounded-xl font-black ${activeTab === "accounts" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}
        >
          {admT?.chartOfAccounts || "الحسابات"}
        </button>
        {adminSession?.role === "owner" && (
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-3 rounded-xl font-black ${activeTab === "general" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}
          >
            {admT?.generalSettings || "عام"}
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "accounting" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: admT?.cashAccount || "الكاش", value: cashAccount, setter: setCashAccount },
              { label: admT?.bankAccount || "البنك", value: bankAccount, setter: setBankAccount },
              { label: admT?.salesAccount || "المبيعات", value: salesAccount, setter: setSalesAccount },
              { label: admT?.vatOutputAccount || "الضريبة", value: vatOutputAccount, setter: setVatOutputAccount },
              { label: admT?.arAccount || "المدينين", value: arAccount, setter: setArAccount },
              { label: admT?.apAccount || "الدائنين", value: apAccount, setter: setApAccount }
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-bold mb-2">{field.label}</label>
                <select value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full p-3 rounded-xl border font-bold">
                  <option value="">--</option>
                  {activeAccounts.map(acc => <option key={acc.id} value={acc.code}>{acc.code} - {acc.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={handleSaveAccounting} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-2">
            <Save size={18} /> {admT?.save || "حفظ"}
          </button>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" value={newAccountCode} onChange={(e) => setNewAccountCode(e.target.value)} placeholder="1010" className="p-3 rounded-xl border font-bold" />
              <input type="text" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder={admT?.accountName || "الاسم"} className="p-3 rounded-xl border font-bold" />
              <select value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)} className="p-3 rounded-xl border font-bold">
                {["asset", "liability", "equity", "revenue", "expense"].map(t => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="gold" checked={isGolden} onChange={(e) => setIsGolden(e.target.checked)} className="w-5 h-5" />
              <label htmlFor="gold" className="font-bold flex items-center gap-2"><Star className="text-yellow-500" size={18} />{admT?.isGolden || "ذهبي"}</label>
            </div>
            <button onClick={handleAddAccount} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-black"><Plus size={18} /> {admT?.save || "حفظ"}</button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border space-y-2">
            {activeAccounts.map(acc => (
              <div key={acc.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${acc.isGolden ? "bg-yellow-50 border-yellow-400" : "bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  {acc.isGolden && <Star className="text-yellow-500" size={18} />}
                  <div>
                    <div className="font-black">{acc.code} - {acc.name}</div>
                    <div className="text-xs font-bold text-slate-600">{getTypeLabel(acc.type)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditAccount(acc)} className="p-2 rounded-lg bg-blue-100 text-blue-700"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 rounded-lg bg-red-100 text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "general" && adminSession?.role === "owner" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-orange-600" size={24} />
            <h3 className="font-black">{admT?.generalSettings || "عام"}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} placeholder={admT?.ownerUsername || "المستخدم"} className="p-3 rounded-xl border font-bold" />
            <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder={admT?.ownerPassword || "الكلمة"} className="p-3 rounded-xl border font-bold" />
          </div>
          <button onClick={handleSaveGeneral} className="px-8 py-3 rounded-xl bg-orange-600 text-white font-black flex items-center gap-2">
            <Save size={18} /> {admT?.save || "حفظ"}
          </button>
        </div>
      )}
    </div>
  );
};