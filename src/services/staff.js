// ===============================
// staff.js - إدارة الموظفين
// Features: Add Staff + Edit + Delete
// ===============================

import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";

// =================== إضافة موظف جديد ===================
export async function addStaff({
  username,
  password,
  role = "staff", // staff, admin
  db,
  appId
}) {
  if (!username.trim() || !password.trim()) {
    alert("الرجاء إدخال اسم المستخدم وكلمة المرور");
    return false;
  }

  try {
    await addDoc(collection(db, "artifacts", appId, "public", "data", "staff"), {
      username: username.trim(),
      password: password.trim(), // في الإنتاج يجب تشفير كلمة المرور
      role: role,
      isActive: true,
      createdAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء إضافة الموظف");
    return false;
  }
}

// =================== تعديل بيانات موظف ===================
export async function updateStaff({
  staffId,
  username,
  password, // اختياري - إذا كان فارغاً لا يتم تحديثه
  role,
  db,
  appId
}) {
  if (!username.trim()) {
    alert("الرجاء إدخال اسم المستخدم");
    return false;
  }

  try {
    const updates = {
      username: username.trim(),
      role: role,
      updatedAt: Date.now(),
    };

    // تحديث كلمة المرور فقط إذا تم إدخالها
    if (password && password.trim()) {
      updates.password = password.trim();
    }

    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "staff", staffId),
      updates
    );
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء تعديل بيانات الموظف");
    return false;
  }
}

// =================== حذف موظف ===================
export async function deleteStaff(staffId, db, appId) {
  if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return false;

  try {
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "staff", staffId));
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء حذف الموظف");
    return false;
  }
}

// =================== تعطيل/تفعيل موظف ===================
export async function toggleStaffStatus(staffId, currentStatus, db, appId) {
  try {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "staff", staffId),
      {
        isActive: !currentStatus,
        updatedAt: Date.now(),
      }
    );
    return true;
  } catch (e) {
    console.error(e);
    alert("حدث خطأ أثناء تغيير حالة الموظف");
    return false;
  }
}