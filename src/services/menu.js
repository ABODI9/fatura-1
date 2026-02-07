import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { colRefPath } from "../config/paths";

export async function addMenuItem(db, item) {
  // item مثال: { nameAr, price, categoryAr, imageUrl }
  return addDoc(collection(db, ...colRefPath("menu")), {
    ...item,
    createdAt: Date.now(),
    createdAtServer: serverTimestamp(),
  });
}
