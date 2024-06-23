import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDHGTNVbJZlm3XADrOrVc2Yyuo1mve39XU",
  authDomain: "orbital-mechhub.firebaseapp.com",
  projectId: "orbital-mechhub",
  storageBucket: "orbital-mechhub.appspot.com",
  messagingSenderId: "474236612145",
  appId: "1:474236612145:web:1081c9ed758f1e32a8ef10",
  measurementId: "G-ZNS909ZKGD"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };