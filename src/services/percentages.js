// ===============================
// percentages.js - إدارة النسب والخصومات
// Features: Discounts + Taxes on different payment methods
// ===============================

import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";

// أنواع النسب المتاحة
export const PERCENTAGE_TYPES = {
  TOTAL_DISCOUNT: "total_discount", // خصم إجمالي
  CASH_DISCOUNT: "cash_discount", // خصم على الكاش
  CARD_DISCOUNT: "card_discount", // خصم على البطاقة
  TRANSFER_DISCOUNT: "transfer_discount", // خصم على التحويل
  TAX: "tax", // ضريبة مضافة
};

// =================== إضافة نسبة جديدة ===================
export async function addPercentage({
  name,
  type, // من PERCENTAGE_TYPES
  value, // النسبة المئوية
  db,
  appId
}) {
  if (!name.trim() || !value || value <= 0) {
    alert("الرجاء إدخال البيانات بشكل صحيح");
    return false;
  }

  try {
    await addDoc(collection(db, "artifacts", appId, "public", "data", "percentages"), {
      name: name.trim(),
      type: type,
      value: Number(value),
      isActive: true,
      createdAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء إضافة النسبة");
    return false;
  }
}

// =================== تعديل نسبة ===================
export async function updatePercentage({
  percentageId,
  name,
  type,
  value,
  db,
  appId
}) {
  if (!name.trim() || !value || value <= 0) {
    alert("الرجاء إدخال البيانات بشكل صحيح");
    return false;
  }

  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "percentages", percentageId),
      {
        name: name.trim(),
        type: type,
        value: Number(value),
        updatedAt: Date.now(),
      }
    );
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء تعديل النسبة");
    return false;
  }
}

// =================== حذف نسبة ===================
export async function deletePercentage(percentageId, db, appId) {
  if (!confirm("هل أنت متأكد من حذف هذه النسبة؟")) return false;

  try {
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "percentages", percentageId));
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء حذف النسبة");
    return false;
  }
}

// =================== حساب الخصومات والضرائب للطلب ===================
export function calculateOrderTotals({
  subtotal,
  paymentMethod, // "cash", "card", "transfer"
  percentages = [] // قائمة النسب من Firebase
}) {
  let totalDiscount = 0;
  let totalTax = 0;
  const appliedDiscounts = [];
  const appliedTaxes = [];

  // تطبيق النسب النشطة فقط
  const activePercentages = percentages.filter(p => p.isActive !== false);

  for (const percentage of activePercentages) {
    const amount = (subtotal * percentage.value) / 100;

    switch (percentage.type) {
      case PERCENTAGE_TYPES.TOTAL_DISCOUNT:
        // خصم إجمالي يطبق على جميع الطلبات
        totalDiscount += amount;
        appliedDiscounts.push({
          name: percentage.name,
          value: percentage.value,
          amount: amount,
        });
        break;

      case PERCENTAGE_TYPES.CASH_DISCOUNT:
        // خصم على الكاش فقط
        if (paymentMethod === "cash") {
          totalDiscount += amount;
          appliedDiscounts.push({
            name: percentage.name,
            value: percentage.value,
            amount: amount,
          });
        }
        break;

      case PERCENTAGE_TYPES.CARD_DISCOUNT:
        // خصم على البطاقة فقط
        if (paymentMethod === "card") {
          totalDiscount += amount;
          appliedDiscounts.push({
            name: percentage.name,
            value: percentage.value,
            amount: amount,
          });
        }
        break;

      case PERCENTAGE_TYPES.TRANSFER_DISCOUNT:
        // خصم على التحويل فقط
        if (paymentMethod === "transfer") {
          totalDiscount += amount;
          appliedDiscounts.push({
            name: percentage.name,
            value: percentage.value,
            amount: amount,
          });
        }
        break;

      case PERCENTAGE_TYPES.TAX:
        // ضريبة مضافة
        totalTax += amount;
        appliedTaxes.push({
          name: percentage.name,
          value: percentage.value,
          amount: amount,
        });
        break;

      default:
        break;
    }
  }

  // حساب الإجمالي النهائي
  const totalAfterDiscount = subtotal - totalDiscount;
  const finalTotal = totalAfterDiscount + totalTax;

  return {
    subtotal: subtotal,
    totalDiscount: totalDiscount,
    totalTax: totalTax,
    finalTotal: Math.max(0, finalTotal), // لا يمكن أن يكون سالباً
    appliedDiscounts: appliedDiscounts,
    appliedTaxes: appliedTaxes,
  };
}

// =================== الحصول على تسمية النوع ===================
export function getPercentageTypeLabel(type, lang = "ar") {
  const labels = {
    ar: {
      [PERCENTAGE_TYPES.TOTAL_DISCOUNT]: "خصم إجمالي",
      [PERCENTAGE_TYPES.CASH_DISCOUNT]: "خصم على الكاش",
      [PERCENTAGE_TYPES.CARD_DISCOUNT]: "خصم على البطاقة",
      [PERCENTAGE_TYPES.TRANSFER_DISCOUNT]: "خصم على التحويل",
      [PERCENTAGE_TYPES.TAX]: "ضريبة مضافة",
    },
    en: {
      [PERCENTAGE_TYPES.TOTAL_DISCOUNT]: "Total Discount",
      [PERCENTAGE_TYPES.CASH_DISCOUNT]: "Cash Discount",
      [PERCENTAGE_TYPES.CARD_DISCOUNT]: "Card Discount",
      [PERCENTAGE_TYPES.TRANSFER_DISCOUNT]: "Transfer Discount",
      [PERCENTAGE_TYPES.TAX]: "Tax",
    },
    tr: {
      [PERCENTAGE_TYPES.TOTAL_DISCOUNT]: "Toplam İndirim",
      [PERCENTAGE_TYPES.CASH_DISCOUNT]: "Nakit İndirim",
      [PERCENTAGE_TYPES.CARD_DISCOUNT]: "Kart İndirim",
      [PERCENTAGE_TYPES.TRANSFER_DISCOUNT]: "Transfer İndirim",
      [PERCENTAGE_TYPES.TAX]: "Vergi",
    }
  };

  return labels[lang]?.[type] || type;
}

// =================== تعطيل/تفعيل نسبة ===================
export async function togglePercentageStatus(percentageId, currentStatus, db, appId) {
  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "percentages", percentageId),
      {
        isActive: !currentStatus,
        updatedAt: Date.now(),
      }
    );
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء تغيير حالة النسبة");
    return false;
  }
}