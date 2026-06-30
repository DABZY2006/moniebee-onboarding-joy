import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Firebase web config. These values are publishable and safe to expose in
// client code. Provide them via Vite env vars (recommended) or paste them
// directly into the object below.
//
// To get these values:
//   Firebase Console → Project Settings → Your apps → Web app → SDK setup
//
// To enable Google Sign-In:
//   Firebase Console → Authentication → Sign-in method → Google → Enable
//
// To enable Firestore:
//   Firebase Console → Firestore Database → Create database
//
// Authorized domains (Auth → Settings → Authorized domains) must include
// the domain you are serving the app from, otherwise the popup is blocked.

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDxI6iWPQMXSYHrVdxXZh8yXoQHasaPKio",
  authDomain: "moneebee-d7290.firebaseapp.com",
  projectId: "moneebee-d7290",
  storageBucket: "moneebee-d7290.firebasestorage.app",
  messagingSenderId: "794169568793",
  appId: "1:794169568793:web:48febb0c3941de5635c488",
  measurementId: "G-382NLRJH2N",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const { uid, displayName, email, photoURL } = result.user;
  // Persist (or merge) the user's profile in Firestore at users/{uid}.
  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      displayName,
      email,
      photoURL,
      lastSignInAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  return result.user;
}

export { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup };
export type { User };
