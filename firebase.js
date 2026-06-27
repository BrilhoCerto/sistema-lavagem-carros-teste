import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTcZr1ZLw0bZJpU9RNEuB2Kh4jPjD-L_E",
  authDomain: "brilho-certo.firebaseapp.com",
  projectId: "brilho-certo",
  storageBucket: "brilho-certo.firebasestorage.app",
  messagingSenderId: "129494576426",
  appId: "1:29494576426:web:ee67d9d2ab568efc5b1cd3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
