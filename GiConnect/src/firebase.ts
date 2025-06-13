// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCA1l-x6AhsovfkRi68jH6G_BP9S9UZtXU",
  authDomain: "giconnect-36d94.firebaseapp.com",
  projectId: "giconnect-36d94",
  storageBucket: "giconnect-36d94.firebasestorage.app",
  messagingSenderId: "428486646092",
  appId: "1:428486646092:web:edaeba3e24cb0ce82657e9",
  measurementId: "G-1FX12BTWVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);