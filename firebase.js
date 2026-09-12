import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB_3DamXl3LOiQPszm_08dgk0TePaG5QDw",
  authDomain: "north-wasit-team.firebaseapp.com",
  projectId: "north-wasit-team",
  storageBucket: "north-wasit-team.firebasestorage.app",
  messagingSenderId: "505194105440",
  appId: "1:505194105440:web:2dfb521a2f1ee4dbddd105",
  measurementId: "G-SND8QFLKYZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
    app,
    auth,
    db,

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,

    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    deleteDoc
};