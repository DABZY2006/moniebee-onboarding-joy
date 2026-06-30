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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
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
