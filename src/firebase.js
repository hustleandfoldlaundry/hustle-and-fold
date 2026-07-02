import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "@firebase/firestore/lite";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwmPpE1vV53lnR8JjTmpjX2b4gohbN51Q",
  authDomain: "hustleandfold-4908a.firebaseapp.com",
  projectId: "hustleandfold-4908a",
  storageBucket: "hustleandfold-4908a.firebasestorage.app",
  messagingSenderId: "79934265572",
  appId: "1:79934265572:web:dc07ea9629ebd7e70eb4f1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
export { collection, addDoc };