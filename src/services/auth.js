import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export async function adminLogin({
  adminUsername,
  adminPassword,
  ownerConfig,
  db,
  adminUsersColPath,
  normalizeDigits,
  admT
}) {
  const username = normalizeDigits(adminUsername?.trim() || "");
  const password = normalizeDigits(adminPassword?.trim() || "");

  if (!username || !password) {
    return { error: admT?.fillAllFields || "الرجاء ملء جميع الحقول" };
  }

  // Check if owner
  if (
    username === normalizeDigits(ownerConfig?.ownerUsername || "") &&
    password === normalizeDigits(ownerConfig?.ownerPassword || "")
  ) {
    return {
      session: { username, role: "owner" }
    };
  }

  // Check staff users
  try {
    const q = query(
      collection(db, ...adminUsersColPath),
      where("username", "==", username)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return { error: admT?.wrongCredentials || "اسم المستخدم أو كلمة المرور خاطئة" };
    }

    const userData = snap.docs[0].data();
    if (normalizeDigits(userData.password || "") !== password) {
      return { error: admT?.wrongCredentials || "اسم المستخدم أو كلمة المرور خاطئة" };
    }

    return {
      session: { username, role: "staff" }
    };
  } catch (e) {
    console.error(e);
    return { error: admT?.errorOccurred || "حدث خطأ" };
  }
}

export async function adminRegister({
  adminUsername,
  adminPassword,
  ownerPin,
  ownerConfig,
  db,
  adminUsersColPath,
  normalizeDigits,
  admT
}) {
  const username = normalizeDigits(adminUsername?.trim() || "");
  const password = normalizeDigits(adminPassword?.trim() || "");
  const pin = normalizeDigits(ownerPin?.trim() || "");

  if (!username || !password || !pin) {
    return { error: admT?.fillAllFields || "الرجاء ملء جميع الحقول" };
  }

  // Verify owner PIN
  if (pin !== normalizeDigits(ownerConfig?.ownerPassword || "")) {
    return { error: admT?.wrongOwnerPin || "كلمة سر المالك خاطئة" };
  }

  // Check if username exists
  try {
    const q = query(
      collection(db, ...adminUsersColPath),
      where("username", "==", username)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return { error: admT?.usernameExists || "اسم المستخدم موجود مسبقاً" };
    }

    // Create new admin user
    await addDoc(collection(db, ...adminUsersColPath), {
      username,
      password,
      createdAt: Date.now(),
    });

    return {
      session: { username, role: "staff" }
    };
  } catch (e) {
    console.error(e);
    return { error: admT?.errorOccurred || "حدث خطأ" };
  }
}

export function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wingi_admin_session");
  }
}