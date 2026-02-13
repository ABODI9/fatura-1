// src/config/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

import { firebaseConfig } from "./constants";

// . Initialize once (prevents duplicate-app error in dev/hmr)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// . Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// . Analytics (safe)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) analytics = getAnalytics(app);
    })
    .catch(() => {
      // ignore analytics errors
    });
}

export default app;
