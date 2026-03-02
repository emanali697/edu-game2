import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA5616qc5nbuLiXXRaF9sZ7lsLi0gzMIpg",
  authDomain: "edu-game-7e323.firebaseapp.com",
  databaseURL: "https://edu-game-7e323-default-rtdb.firebaseio.com",
  projectId: "edu-game-7e323",
  storageBucket: "edu-game-7e323.firebasestorage.app",
  messagingSenderId: "1092241811020",
  appId: "1:1092241811020:web:ca5abf80fc8f88c9aeb6e9",
  measurementId: "G-FYSR42E3Y8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;