// ===============================
// Improved AccountingSection.jsx
// Features: Golden Accounts + Soft Delete
// ===============================

import React, { useState, useEffect } from "react";
import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { Star, Trash2, RotateCcw, Eye, EyeOff } from "lucide-react";

export const AccountingSection = ({ 
  accounts = [], 
  journalEntries = [], 
  db, 
  appId,
  admT, 
  adminLang,
  adminSession
}) => {
  const [activeTab, setActiveTab] = useState("accounts"); // accounts | journal
  const [showDeleted, setShowDeleted] = useState(false);

  // Account form
  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("asset");
  const [isGolden, setIsGolden] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Journal form
  const [entryDate, setEntryDate] = useState("");
  const [entryReference, setEntryReference] = useState("");
  const [entryRows, setEntryRows] = useState([
    { accountId: "", debit: "", credit: "" }
  ]);

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
        createdAt: Date.now(),
        createdBy: adminSession?.username || "unknown",
      };

      if (editingAccountId) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "accounts", editingAccountId),
          {
            ...accountData,
            updatedAt: Date.now(),
            updatedBy: adminSession?.username || "unknown",
          }
        );
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "accounts"), 
          accountData
        );
      }

      resetAccountForm();
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccountId(account.id);
    setNewAccountCode(account.code || "");
    setNewAccountName(account.name || "");
    setNewAccountType(account.type || "asset");
    setIsGolden(account.isGolden || false);
  };

  const openDeleteModal = (account) => {
    setItemToDelete(account);
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  const handleSoftDelete = async () => {
    if (!deleteReason.trim()) {
      alert(admT?.required || "مطلوب");
      return;
    }

    if (!itemToDelete) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "accounts", itemToDelete.id),
        {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedBy: adminSession?.username || "unknown",
          deleteReason: deleteReason.trim(),
        }
      );

      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteReason("");
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ أثناء الحذف");
    }
  };

  const handleRestore = async (accountId) => {
    if (!confirm(admT?.confirmRestore || "هل تريد استعادة هذا العنصر؟")) return;

    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "accounts", accountId),
        {
          isDeleted: false,
          restoredAt: Date.now(),
          restoredBy: adminSession?.username || "unknown",
        }
      );
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const handlePermanentDelete = async (accountId) => {
    if (!confirm(admT?.confirmDelete || "هل أنت متأكد من الحذف النهائي؟")) return;

    try {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "accounts", accountId));
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  const addJournalRow = () => {
    setEntryRows([...entryRows, { accountId: "", debit: "", credit: "" }]);
  };

  const removeJournalRow = (index) => {
    setEntryRows(entryRows.filter((_, i) => i !== index));
  };

  const updateJournalRow = (index, field, value) => {
    const updated = [...entryRows];
    updated[index][field] = value;
    setEntryRows(updated);
  };

  const handleCreateJournalEntry = async () => {
    if (!entryDate || !entryReference) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    const validRows = entryRows.filter(r => r.accountId && (r.debit || r.credit));
    if (validRows.length === 0) {
      alert(admT?.fillAllFields || "الرجاء ملء جميع الحقول");
      return;
    }

    const totalDebit = validRows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
    const totalCredit = validRows.reduce((sum, r) => sum + Number(r.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert(adminLang === "ar" ? "القيد غير متوازن" : "Entry is not balanced");
      return;
    }

    try {
      await addDoc(collection(db, "artifacts", appId, "public", "data", "journal"), {
        date: entryDate,
        reference: entryReference,
        rows: validRows,
        createdAt: Date.now(),
        createdBy: adminSession?.username || "unknown",
      });

      // Update account balances
      for (const row of validRows) {
        const accountRef = doc(db, "artifacts", appId, "public", "data", "accounts", row.accountId);
        const accountSnap = await accountRef.get();
        
        if (accountSnap.exists()) {
          const currentBalance = Number(accountSnap.data().balance || 0);
          const debit = Number(row.debit || 0);
          const credit = Number(row.credit || 0);
          
          await updateDoc(accountRef, {
            balance: currentBalance + debit - credit,
          });
        }
      }

      setEntryDate("");
      setEntryReference("");
      setEntryRows([{ accountId: "", debit: "", credit: "" }]);
      
      alert(admT?.success || "نجح");
    } catch (e) {
      console.error(e);
      alert(admT?.errorOccurred || "حدث خطأ");
    }
  };

  // Filter accounts
  const goldenAccounts = accounts.filter(a => a.isGolden && !a.isDeleted);
  const regularActiveAccounts = accounts.filter(a => !a.isGolden && !a.isDeleted);
  const deletedAccounts = accounts.filter(a => a.isDeleted);

  const getTypeLabel = (type) => {
    const labels = {
      ar: {
        asset: "أصول",
        liability: "خصوم",
        equity: "حقوق ملكية",
        revenue: "إيرادات",
        expense: "مصروفات",
      },
      tr: {
        asset: "Varlık",
        liability: "Yükümlülük",
        equity: "Özkaynak",
        revenue: "Gelir",
        expense: "Gider",
      },
      en: {
        asset: "Asset",
        liability: "Liability",
        equity: "Equity",
        revenue: "Revenue",
        expense: "Expense",
      }
    };
    return labels[adminLang]?.[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">
          📊 {admT?.accountingSection || "المحاسبة"}
        </h2>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold transition-all"
        >
          {showDeleted ? <EyeOff size={18} /> : <Eye size={18} />}
          {showDeleted ? (admT?.hideDeleted || "إخفاء المحذوفات") : (admT?.showDeleted || "إظهار المحذوفات")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            activeTab === "accounts"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {admT?.chartOfAccounts || "دليل الحسابات"}
        </button>
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex-1 py-2 rounded-xl font-black transition-all ${
            activeTab === "journal"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          {admT?.journalEntry || "قيد يومية"}
        </button>
      </div>

      {/* ACCOUNTS TAB */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Add Account Form */}
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="font-black text-lg">
              {editingAccountId 
                ? (admT?.editItem || "تعديل") 
                : (admT?.addNewItem || "إضافة حساب جديد")
              }
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.accountCode || "رمز الحساب"}
                </label>
                <input
                  type="text"
                  value={newAccountCode}
                  onChange={(e) => setNewAccountCode(e.target.value)}
                  placeholder="1010"
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.accountName || "اسم الحساب"}
                </label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={admT?.cashAccount || "الكاش"}
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.accountType || "نوع الحساب"}
                </label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full p-3 rounded-xl border font-bold"
                >
                  <option value="asset">{getTypeLabel("asset")}</option>
                  <option value="liability">{getTypeLabel("liability")}</option>
                  <option value="equity">{getTypeLabel("equity")}</option>
                  <option value="revenue">{getTypeLabel("revenue")}</option>
                  <option value="expense">{getTypeLabel("expense")}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="isGolden"
                  checked={isGolden}
                  onChange={(e) => setIsGolden(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isGolden" className="font-bold flex items-center gap-2">
                  <Star className="text-yellow-500" size={18} />
                  {admT?.isGolden || "حساب ذهبي"}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddAccount}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black"
              >
                {editingAccountId 
                  ? (admT?.saveChanges || "حفظ التعديلات") 
                  : (admT?.save || "حفظ")
                }
              </button>
              {editingAccountId && (
                <button
                  onClick={resetAccountForm}
                  className="px-6 py-3 rounded-xl bg-slate-100 font-black"
                >
                  {admT?.cancel || "إلغاء"}
                </button>
              )}
            </div>
          </div>

          {/* Golden Accounts */}
          {goldenAccounts.length > 0 && (
            <div>
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                {admT?.goldenAccounts || "الحسابات الذهبية"}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {goldenAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 p-4 rounded-2xl shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-500" size={18} />
                        <span className="font-black text-slate-900">
                          {account.code}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-yellow-700">
                        {getTypeLabel(account.type)}
                      </span>
                    </div>
                    
                    <h4 className="font-black text-lg mb-2">{account.name}</h4>
                    <div className="text-sm font-bold text-slate-600">
                      {admT?.balance || "الرصيد"}: {Number(account.balance || 0).toFixed(2)}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black text-sm"
                      >
                        {admT?.edit || "تعديل"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(account)}
                        className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        {admT?.delete || "حذف"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Accounts */}
          {regularActiveAccounts.length > 0 && (
            <div>
              <h3 className="font-black text-lg mb-3">
                {admT?.regularAccounts || "الحسابات العادية"}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {regularActiveAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-white border p-4 rounded-2xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-black text-slate-900">
                        {account.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold">
                        {getTypeLabel(account.type)}
                      </span>
                    </div>
                    
                    <h4 className="font-black text-lg mb-2">{account.name}</h4>
                    <div className="text-sm font-bold text-slate-600">
                      {admT?.balance || "الرصيد"}: {Number(account.balance || 0).toFixed(2)}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="flex-1 py-2 rounded-xl bg-blue-100 text-blue-700 font-black text-sm"
                      >
                        {admT?.edit || "تعديل"}
                      </button>
                      <button
                        onClick={() => openDeleteModal(account)}
                        className="flex-1 py-2 rounded-xl bg-red-100 text-red-700 font-black text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        {admT?.delete || "حذف"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Accounts */}
          {showDeleted && deletedAccounts.length > 0 && (
            <div>
              <h3 className="font-black text-lg mb-3 text-red-600 flex items-center gap-2">
                <Trash2 size={20} />
                {admT?.deletedItems || "العناصر المحذوفة"}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {deletedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl opacity-75"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-black text-red-900">
                        {account.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-red-200 text-xs font-bold text-red-700">
                        {admT?.deleted || "محذوف"}
                      </span>
                    </div>
                    
                    <h4 className="font-black text-lg mb-2 text-red-900">
                      {account.name}
                    </h4>
                    
                    {account.deleteReason && (
                      <div className="bg-white p-3 rounded-xl mb-3">
                        <div className="text-xs font-bold text-slate-600 mb-1">
                          {admT?.reasonForDeletion || "سبب الحذف"}:
                        </div>
                        <div className="text-sm font-bold text-red-700">
                          {account.deleteReason}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs font-bold text-slate-500 mb-3">
                      {admT?.deletedBy || "تم الحذف بواسطة"}: {account.deletedBy || "-"}
                      <br />
                      {admT?.deletionDate || "تاريخ الحذف"}: {account.deletedAt ? new Date(account.deletedAt).toLocaleString() : "-"}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(account.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center gap-1"
                      >
                        <RotateCcw size={14} />
                        {admT?.restore || "استعادة"}
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(account.id)}
                        className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black text-sm"
                      >
                        {admT?.delete || "حذف نهائي"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* JOURNAL TAB */}
      {activeTab === "journal" && (
        <div className="space-y-6">
          {/* Create Journal Entry Form */}
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="font-black text-lg">
              {admT?.journalEntry || "قيد يومية جديد"}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.date || "التاريخ"}
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  {admT?.reference || "المرجع"}
                </label>
                <input
                  type="text"
                  value={entryReference}
                  onChange={(e) => setEntryReference(e.target.value)}
                  placeholder="INV-001"
                  className="w-full p-3 rounded-xl border font-bold"
                />
              </div>
            </div>

            {/* Journal Rows */}
            <div className="space-y-3">
              {entryRows.map((row, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold mb-1">
                      {admT?.accountName || "الحساب"}
                    </label>
                    <select
                      value={row.accountId}
                      onChange={(e) => updateJournalRow(index, "accountId", e.target.value)}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                    >
                      <option value="">-- {admT?.select || "اختر"} --</option>
                      {accounts.filter(a => !a.isDeleted).map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {admT?.debit || "مدين"}
                    </label>
                    <input
                      type="number"
                      value={row.debit}
                      onChange={(e) => updateJournalRow(index, "debit", e.target.value)}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {admT?.credit || "دائن"}
                    </label>
                    <input
                      type="number"
                      value={row.credit}
                      onChange={(e) => updateJournalRow(index, "credit", e.target.value)}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    onClick={() => removeJournalRow(index)}
                    className="p-2 rounded-lg bg-red-100 text-red-700 font-black"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addJournalRow}
              className="w-full py-2 rounded-xl bg-blue-100 text-blue-700 font-black"
            >
              + {admT?.addItem || "إضافة سطر"}
            </button>

            <button
              onClick={handleCreateJournalEntry}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black"
            >
              {admT?.save || "حفظ القيد"}
            </button>
          </div>

          {/* Journal Entries List */}
          <div>
            <h3 className="font-black text-lg mb-3">
              {admT?.journalEntry || "القيود اليومية"}
            </h3>
            {journalEntries.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border text-center text-slate-500 font-bold">
                {admT?.noData || "لا توجد بيانات"}
              </div>
            ) : (
              <div className="space-y-3">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="bg-white border p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black">{entry.reference}</span>
                      <span className="text-sm font-bold text-slate-500">
                        {entry.date || new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(entry.rows || []).map((row, idx) => {
                        const account = accounts.find(a => a.id === row.accountId);
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-bold">
                              {account?.name || row.accountId}
                            </span>
                            <div className="flex gap-4">
                              {row.debit > 0 && (
                                <span className="text-emerald-700 font-black">
                                  {admT?.debit || "مدين"}: {Number(row.debit).toFixed(2)}
                                </span>
                              )}
                              {row.credit > 0 && (
                                <span className="text-red-700 font-black">
                                  {admT?.credit || "دائن"}: {Number(row.credit).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="font-black text-xl mb-4 text-red-700">
              {admT?.confirmDelete || "تأكيد الحذف"}
            </h3>
            
            <p className="font-bold text-slate-700 mb-4">
              {adminLang === "ar" 
                ? `هل تريد حذف الحساب "${itemToDelete?.name}"؟`
                : `Delete account "${itemToDelete?.name}"?`
              }
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 text-red-700">
                {admT?.reasonForDeletion || "سبب الحذف"} *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={admT?.enterReason || "أدخل سبب الحذف"}
                rows={3}
                className="w-full p-3 rounded-xl border border-red-300 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSoftDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black"
              >
                {admT?.delete || "حذف"}
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                  setDeleteReason("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-black"
              >
                {admT?.cancel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};