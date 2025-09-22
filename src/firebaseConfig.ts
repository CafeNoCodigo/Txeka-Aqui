import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZHN8-MBzYaYolRz-Z-pk5V_EM5IsNXMs",
  authDomain: "txeka-aqui-ae4f5.firebaseapp.com",
  projectId: "txeka-aqui-ae4f5",
  storageBucket: "txeka-aqui-ae4f5.firebasestorage.app",
  messagingSenderId: "544388961785",
  appId: "1:544388961785:web:e10b5a4b729ac4f831d928",
  measurementId: "G-K4QR6C98L1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };