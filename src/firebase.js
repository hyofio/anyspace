// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB0JtmCj3Jx47vOl6mRuXC6r7sq65H3z4A",
    authDomain: "any-space-w.firebaseapp.com",
    projectId: "any-space-w",
    storageBucket: "any-space-w.firebasestorage.app",
    messagingSenderId: "476689955071",
    appId: "1:476689955071:web:ee16d247c9d1e328f774ca",
    measurementId: "G-1VYTP4C0LS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);