import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDlvDKhK2i8IE2OwiNjnWqjopLkCqC8ao",
  authDomain: "gallery-app-6c718.firebaseapp.com",
  databaseURL: "https://gallery-app-6c718-default-rtdb.firebaseio.com",
  projectId: "gallery-app-6c718",
  storageBucket: "gallery-app-6c718.appspot.com",
  messagingSenderId: "472865940822",
  appId: "1:472865940822:web:60190181f313340092e2f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
export {
  database,
  auth,
}
