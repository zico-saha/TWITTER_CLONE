// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWXiCB8g4xCS-aCRBinOqy2BL4wgqMZYo",
  authDomain: "twitter-clone-6af9f.firebaseapp.com",
  projectId: "twitter-clone-6af9f",
  storageBucket: "twitter-clone-6af9f.appspot.com",
  messagingSenderId: "155381516749",
  appId: "1:155381516749:web:46e2c61f80a4f542605c84",
  measurementId: "G-RW8GNKZWWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
export default auth;