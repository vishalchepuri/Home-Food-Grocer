import fs from "node:fs";
import path from "node:path";
import {
  applicationDefault,
  initializeApp,
  cert,
  getApps,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), "..", "..", ".env.local"));
loadEnvFile(path.resolve(process.cwd(), "..", "homebites", ".env.local"));

process.env.FIREBASE_PROJECT_ID ??= process.env.VITE_FIREBASE_PROJECT_ID;
process.env.FIREBASE_STORAGE_BUCKET ??= process.env.VITE_FIREBASE_STORAGE_BUCKET;
process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??= path.resolve(
  process.cwd(),
  "..",
  "..",
  ".local",
  "firebase-service-account.json",
);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function loadServiceAccount(): ServiceAccount {
  const filePath = requireEnv("FIREBASE_SERVICE_ACCOUNT_PATH");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Firebase service account JSON not found at ${filePath}. Download it from Firebase Console > Project settings > Service accounts > Generate new private key, then save it to that path or set FIREBASE_SERVICE_ACCOUNT_PATH.`,
    );
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as ServiceAccount;
}

export function ensureFirebaseAdmin() {
  if (getApps().length > 0) return getApps()[0]!;

  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const serviceAccountPath = process.env["FIREBASE_SERVICE_ACCOUNT_PATH"];
  const credential =
    serviceAccountPath && fs.existsSync(serviceAccountPath)
      ? cert(loadServiceAccount())
      : applicationDefault();

  return initializeApp({
    credential,
    projectId,
    storageBucket: process.env["FIREBASE_STORAGE_BUCKET"],
  });
}

export const firebaseApp = ensureFirebaseAdmin();
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
