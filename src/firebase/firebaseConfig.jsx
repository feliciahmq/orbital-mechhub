// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHGTNVbJZlm3XADrOrVc2Yyuo1mve39XU",
  authDomain: "orbital-mechhub.firebaseapp.com",
  projectId: "orbital-mechhub",
  storageBucket: "orbital-mechhub.appspot.com",
  messagingSenderId: "474236612145",
  appId: "1:474236612145:web:1081c9ed758f1e32a8ef10",
  measurementId: "G-ZNS909ZKGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };