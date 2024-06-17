const { initializeApp, getApps } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: ,
  measurementId: ,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { firebaseDb: db, firebaseStorage: storage };
