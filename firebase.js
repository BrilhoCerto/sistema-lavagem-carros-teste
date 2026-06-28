import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfiaTejThSwa_uS84xPQuFEf3aweRIs_4",
  authDomain: "brilho-certo-teste.firebaseapp.com",
  projectId: "brilho-certo-teste",
  storageBucket: "brilho-certo-teste.firebasestorage.app",
  messagingSenderId: "791610111918",
  appId: "1:791610111918:web:4e6f907017214bf6c23a3f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
