// ===============================
// inventory.js - محسّن مع جميع ميزات المخزون المطلوبة
// Features: Product Linking + Waste Management + Cost Price + Auto Deduction
// ===============================

import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDocs,
  query,
  where 
} from "firebase/firestore";

// =================== إضافة عنصر للمخزون ===================
export async function handleAddInventory({
  name,
  quantity,
  unit,
  baselineQuantity,
  lowPercent,
  costPrice, // إضافة سعر التكلفة
  db,
  appId
}) {
  if (!name.trim()) {
    alert("الرجاء إدخال اسم المادة");
    return false;
  }

  try {
    await addDoc(collection(db, "artifacts", appId, "public", "data", "inventory"), {
      name: name.trim(),
      quantity: Number(quantity) || 0,
      unit: unit || "kg",
      baselineQuantity: Number(baselineQuantity) || 0,
      lowPercent: Number(lowPercent) || 0.2,
      costPrice: Number(costPrice) || 0, // حفظ سعر التكلفة
      linkedProducts: [], // المنتجات المربوطة
      isWaste: false, // ليس هدر
      createdAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء الإضافة");
    return false;
  }
}

// =================== حذف عنصر من المخزون ===================
export async function deleteInventory(id, db, appId) {
  if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;

  try {
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "inventory", id));
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء الحذف");
  }
}

// =================== فتح نافذة التعديل ===================
export function openEditInventory(item, setters) {
  setters.setEditingInvId(item.id);
  setters.setEditInvName(item.name || "");
  setters.setEditInvQuantity(item.quantity || 0);
  setters.setEditInvUnit(item.unit || "kg");
  setters.setEditInvBaseline(item.baselineQuantity || 0);
  setters.setEditInvLowPercent(item.lowPercent ?? 0.2);
  setters.setEditInvCostPrice(item.costPrice || 0); // إضافة سعر التكلفة
}

// =================== حفظ التعديل ===================
export async function saveEditInventory({
  editingInvId,
  editInvName,
  editInvQuantity,
  editInvUnit,
  editInvBaseline,
  editInvLowPercent,
  editInvCostPrice, // إضافة سعر التكلفة
  db,
  appId,
  resetEdit
}) {
  if (!editInvName.trim()) {
    alert("الرجاء إدخال اسم المادة");
    return;
  }

  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", editingInvId),
      {
        name: editInvName.trim(),
        quantity: Number(editInvQuantity) || 0,
        unit: editInvUnit,
        baselineQuantity: Number(editInvBaseline) || 0,
        lowPercent: Number(editInvLowPercent) || 0.2,
        costPrice: Number(editInvCostPrice) || 0, // حفظ سعر التكلفة
        updatedAt: Date.now(),
      }
    );
    resetEdit();
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء التعديل");
  }
}

// =================== نقل عنصر إلى الهدر ===================
export async function moveToWaste(itemId, db, appId, adminUsername) {
  if (!confirm("هل تريد نقل هذا العنصر إلى هدر المخزون؟")) return;

  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", itemId),
      {
        isWaste: true, // تحديد أنه هدر
        wastedAt: Date.now(),
        wastedBy: adminUsername || "unknown",
        updatedAt: Date.now(),
      }
    );
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء نقل العنصر إلى الهدر");
  }
}

// =================== استعادة عنصر من الهدر ===================
export async function restoreFromWaste(itemId, db, appId, adminUsername) {
  if (!confirm("هل تريد استعادة هذا العنصر من الهدر؟")) return;

  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", itemId),
      {
        isWaste: false,
        restoredAt: Date.now(),
        restoredBy: adminUsername || "unknown",
        updatedAt: Date.now(),
      }
    );
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء الاستعادة");
  }
}

// =================== ربط المنتجات بعنصر المخزون ===================
export async function linkProductsToInventory({
  inventoryId,
  linkedProducts, // مصفوفة من الكائنات: [{ productId, productName, usageAmount }]
  db,
  appId
}) {
  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", inventoryId),
      {
        linkedProducts: linkedProducts,
        updatedAt: Date.now(),
      }
    );
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء ربط المنتجات");
    return false;
  }
}

// =================== تقليل المخزون تلقائياً عند تحضير الطلب ===================
export async function deductInventoryOnOrderPrepared({
  orderItems, // العناصر في الطلب
  db,
  appId
}) {
  try {
    // الحصول على جميع عناصر المخزون
    const inventorySnapshot = await getDocs(
      query(
        collection(db, "artifacts", appId, "public", "data", "inventory"),
        where("isWaste", "!=", true) // استبعاد الهدر
      )
    );

    const inventoryItems = [];
    inventorySnapshot.forEach((doc) => {
      inventoryItems.push({ id: doc.id, ...doc.data() });
    });

    // تحديث كل عنصر مخزون بناءً على الطلبات
    for (const invItem of inventoryItems) {
      if (!invItem.linkedProducts || invItem.linkedProducts.length === 0) {
        continue; // لا توجد منتجات مربوطة
      }

      let totalDeduction = 0;

      // حساب الكمية المطلوب تقليلها
      for (const orderItem of orderItems) {
        const linkedProduct = invItem.linkedProducts.find(
          (lp) => lp.productId === orderItem.id || lp.productId === orderItem.menuItemId
        );

        if (linkedProduct) {
          totalDeduction += linkedProduct.usageAmount * orderItem.quantity;
        }
      }

      // تحديث الكمية في المخزون
      if (totalDeduction > 0) {
        const newQuantity = Math.max(0, invItem.quantity - totalDeduction);
        
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "inventory", invItem.id),
          {
            quantity: newQuantity,
            lastDeductedAt: Date.now(),
          }
        );
      }
    }

    return true;
  } catch (e) {
    console.error("Error deducting inventory:", e);
    // لا نعرض رسالة خطأ للمستخدم لأن هذا يحدث في الخلفية
    return false;
  }
}

// =================== الحصول على عناصر المخزون النشطة ===================
export function getActiveInventory(inventoryList) {
  return inventoryList.filter(item => !item.isWaste);
}

// =================== الحصول على هدر المخزون ===================
export function getWasteInventory(inventoryList) {
  return inventoryList.filter(item => item.isWaste);
}

// =================== التحقق من نقص المخزون ===================
export function checkLowStock(inventoryItem) {
  if (!inventoryItem.baselineQuantity || inventoryItem.baselineQuantity === 0) {
    return false;
  }

  const threshold = inventoryItem.baselineQuantity * (inventoryItem.lowPercent || 0.2);
  return inventoryItem.quantity <= threshold;
}

// =================== حساب قيمة المخزون الإجمالية ===================
export function calculateTotalInventoryValue(inventoryList) {
  return inventoryList.reduce((total, item) => {
    if (!item.isWaste) {
      return total + (item.quantity * item.costPrice || 0);
    }
    return total;
  }, 0);
}