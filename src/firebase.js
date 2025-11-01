import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPjYrlZ_bsYVw_uDbHAn0rA7FJJEsvbOM",
  authDomain: "blog-post-storage.firebaseapp.com",
  projectId: "blog-post-storage",
  storageBucket: "blog-post-storage.firebasestorage.app",
  messagingSenderId: "462835141075",
  appId: "1:462835141075:web:48d7180d83aab1a67a4726",
  measurementId: "G-6C71BSSTB9"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
