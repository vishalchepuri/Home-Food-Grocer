import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requireEnv("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: requireEnv(
    "VITE_FIREBASE_AUTH_DOMAIN",
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: requireEnv(
    "VITE_FIREBASE_PROJECT_ID",
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  ),
  storageBucket: requireEnv(
    "VITE_FIREBASE_STORAGE_BUCKET",
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  ),
  appId: requireEnv("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID),
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
