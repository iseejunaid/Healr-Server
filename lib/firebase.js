const { initializeApp, getApps } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyBaBAXkBb-rsPNdYHXgE-Mq-sAxK24UaYA",
  authDomain: "healr-fyp-8b8c3.firebaseapp.com",
  projectId: "healr-fyp-8b8c3",
  storageBucket: "healr-fyp-8b8c3.appspot.com",
  messagingSenderId: "101731941665",
  appId: "1:101731941665:web:ce3d3f93a10fb78fac5260",
  measurementId: "G-8T5GYCW604",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { firebaseDb: db, firebaseStorage: storage };
