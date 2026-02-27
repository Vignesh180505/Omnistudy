// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcz2ObmhrXMLXdINv-fA_xud3JCDnBy8Y",
  authDomain: "omnistudy-37774.firebaseapp.com",
  projectId: "omnistudy-37774",
  storageBucket: "omnistudy-37774.firebasestorage.app",
  messagingSenderId: "1025162413858",
  appId: "1:1025162413858:web:d37e904843f6ea966e477b",
  measurementId: "G-CSDR3NZDC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };