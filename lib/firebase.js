const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: ,
  measurementId: ,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { firebaseDb: db };
