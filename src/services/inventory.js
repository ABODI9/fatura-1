import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";

export async function handleAddInventory({
  name,
  quantity,
  unit,
  baselineQuantity,
  lowPercent,
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
      createdAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء الإضافة");
    return false;
  }
}

export async function deleteInventory(id, db, appId) {
  if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;

  try {
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "inventory", id));
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء الحذف");
  }
}

export function openEditInventory(item, setters) {
  setters.setEditingInvId(item.id);
  setters.setEditInvName(item.name || "");
  setters.setEditInvQuantity(item.quantity || 0);
  setters.setEditInvUnit(item.unit || "kg");
  setters.setEditInvBaseline(item.baselineQuantity || 0);
  setters.setEditInvLowPercent(item.lowPercent ?? 0.2);
}

export async function saveEditInventory({
  editingInvId,
  editInvName,
  editInvQuantity,
  editInvUnit,
  editInvBaseline,
  editInvLowPercent,
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
        updatedAt: Date.now(),
      }
    );
    resetEdit();
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء التعديل");
  }
}