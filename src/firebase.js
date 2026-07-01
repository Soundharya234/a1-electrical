import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3OpMES3aywNkYF1Swax5e6pdmGADAmpc",
  authDomain: "a1-electrical.firebaseapp.com",
  projectId: "a1-electrical",
  storageBucket: "a1-electrical.firebasestorage.app",
  messagingSenderId: "310260415924",
  appId: "1:310260415924:web:99175ab0e40955240c46e1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
