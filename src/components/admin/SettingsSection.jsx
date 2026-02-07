import React, { useState, useEffect } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";

export const SettingsSection = ({ 
  accSettings = {}, 
  accounts = [],
  db, 
  appId,
  ownerConfig,
  adminSession
}) => {
  const [activeTab, setActiveTab] = useState("accounting"); // accounting | accounts | general

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
      alert("تم حفظ الإعدادات بنجاح");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleAddAccount = async () => {
    if (!newAccountCode || !newAccountName) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }

    try {
      if (editingAccountId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "accounts", editingAccountId),
          {
            code: newAccountCode,
            name: newAccountName,
            type: newAccountType,
            updatedAt: Date.now(),
          }
        );
      } else {
        await addDoc(collection(db, "artifacts", appId, "public", "data", "accounts"), {
          code: newAccountCode,
          name: newAccountName,
          type: newAccountType,
          key: newAccountCode,
          balance: 0,
          createdAt: Date.now(),
        });
      }

      setNewAccountCode("");
      setNewAccountName("");
      setNewAccountType("asset");
      setEditingAccountId(null);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء إضافة الحساب");
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccountId(account.id);
    setNewAccountCode(account.code || "");
    setNewAccountName(account.name || "");
    setNewAccountType(account.type || "asset");
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "accounts", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleSaveGeneral = async () => {
    if (adminSession?.role !== "owner") {
      alert("فقط المالك يمكنه تعديل هذه الإعدادات");
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
      alert("تم حفظ الإعدادات بنجاح");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">⚙️ الإعدادات</h2>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setActiveTab("accounting")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            activeTab === "accounting"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          إعدادات المحاسبة
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            activeTab === "accounts"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          دليل الحسابات
        </button>
        {adminSession?.role === "owner" && (
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-2 rounded-xl font-black transition-all ${
              activeTab === "general"
                ? "bg-slate-950 text-white"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            إعدادات عامة
          </button>
        )}
      </div>

      {/* Accounting Settings Tab */}
      {activeTab === "accounting" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black mb-4">الحسابات الافتراضية</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">حساب الصندوق</label>
              <select
                value={cashAccount}
                onChange={(e) => setCashAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">حساب البنك</label>
              <select
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">حساب المبيعات</label>
              <select
                value={salesAccount}
                onChange={(e) => setSalesAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">حساب الضريبة</label>
              <select
                value={vatOutputAccount}
                onChange={(e) => setVatOutputAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">حساب العملاء</label>
              <select
                value={arAccount}
                onChange={(e) => setArAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">حساب الموردين</label>
              <select
                value={apAccount}
                onChange={(e) => setApAccount(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              >
                <option value="">اختر الحساب</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.key}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveAccounting}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black"
          >
            حفظ الإعدادات
          </button>
        </div>
      )}

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="font-black">إضافة حساب جديد</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">رمز الحساب</label>
                <input
                  type="text"
                  value={newAccountCode}
                  onChange={(e) => setNewAccountCode(e.target.value)}
                  placeholder="1001"
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">اسم الحساب</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="النقدية"
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">نوع الحساب</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full p-3 rounded-xl border font-bold"
                >
                  <option value="asset">أصل</option>
                  <option value="liability">خصم</option>
                  <option value="equity">حقوق ملكية</option>
                  <option value="revenue">إيراد</option>
                  <option value="expense">مصروف</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddAccount}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black"
              >
                {editingAccountId ? "حفظ التعديلات" : "إضافة الحساب"}
              </button>
              {editingAccountId && (
                <button
                  onClick={() => {
                    setEditingAccountId(null);
                    setNewAccountCode("");
                    setNewAccountName("");
                    setNewAccountType("asset");
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-right p-4 font-black">الرمز</th>
                  <th className="text-right p-4 font-black">الاسم</th>
                  <th className="text-right p-4 font-black">النوع</th>
                  <th className="text-right p-4 font-black">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-bold">{acc.code}</td>
                    <td className="p-4 font-bold">{acc.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-bold">
                        {acc.type === "asset" && "أصل"}
                        {acc.type === "liability" && "خصم"}
                        {acc.type === "equity" && "حقوق ملكية"}
                        {acc.type === "revenue" && "إيراد"}
                        {acc.type === "expense" && "مصروف"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAccount(acc)}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === "general" && adminSession?.role === "owner" && (
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <h3 className="font-black mb-4">بيانات المالك</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={ownerUsername}
                onChange={(e) => setOwnerUsername(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                className="w-full p-3 rounded-xl border font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSaveGeneral}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black"
          >
            حفظ الإعدادات
          </button>
        </div>
      )}
    </div>
  );
};