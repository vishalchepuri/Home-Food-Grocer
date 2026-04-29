import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "@/lib/firebase";

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const storageRef = ref(firebaseStorage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
