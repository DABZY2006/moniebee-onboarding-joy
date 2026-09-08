import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
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

// ---------------------------------------------------------------------------
// Email + password authentication (real Firebase Auth, no simulation)
// ---------------------------------------------------------------------------
async function upsertUserDoc(user: User) {
  const { uid, displayName, email, photoURL } = user;
  await setDoc(
    doc(db, "users", uid),
    { uid, displayName, email, photoURL, lastSignInAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try { await updateProfile(cred.user, { displayName }); } catch {}
  }
  await upsertUserDoc(cred.user);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserDoc(cred.user);
  return cred.user;
}

/** Real logout: ends the Firebase session and clears cached app/user state. */
export async function signOutAndClear() {
  try { await signOut(auth); } catch {}
  try {
    const keep = /^moniebee_(balance|transactions|wallet_initialized|tx_read_at|avatar):/;
    const drop: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("moniebee_") && !keep.test(k)) drop.push(k);
    }
    drop.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {}
}

export { updateProfile };
