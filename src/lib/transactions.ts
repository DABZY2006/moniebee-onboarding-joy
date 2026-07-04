export type Tx = {
  id: string;
  type: "credit" | "withdrawal" | "earn";
  title: string;
  message: string;
  amount: number;
  status: "successful" | "pending" | "failed";
  date: number;
  read?: boolean;
};

// Legacy (pre-multi-user) storage keys — kept for migration/back-compat.
const LEGACY_TX_KEY = "moniebee_transactions";
const LEGACY_READ_KEY = "moniebee_tx_read_at";
const LEGACY_BAL_KEY = "moniebee_balance";
const LEGACY_INIT_KEY = "moniebee_wallet_initialized";

export const MONEE_CODE = "MNB-U7K9-P4X2";
export const INITIAL_BALANCE = 160000;

// ---- Active user scoping ---------------------------------------------------
// The wallet is scoped to the authenticated user's uid. New users get the
// welcome credit exactly once; existing users always load their saved balance.
let activeUid: string | null = null;

function readActiveUid(): string | null {
  if (activeUid) return activeUid;
  try {
    return localStorage.getItem("moniebee_active_uid");
  } catch {
    return null;
  }
}

export function setActiveUser(uid: string | null) {
  activeUid = uid;
  try {
    if (uid) localStorage.setItem("moniebee_active_uid", uid);
    else localStorage.removeItem("moniebee_active_uid");
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("moniebee:balance", { detail: getBalance() }));
    window.dispatchEvent(new CustomEvent("moniebee:tx"));
  } catch {}
}

function txKey() {
  const uid = readActiveUid();
  return uid ? `moniebee_transactions:${uid}` : LEGACY_TX_KEY;
}
function readKey() {
  const uid = readActiveUid();
  return uid ? `moniebee_tx_read_at:${uid}` : LEGACY_READ_KEY;
}
function balKey() {
  const uid = readActiveUid();
  return uid ? `moniebee_balance:${uid}` : LEGACY_BAL_KEY;
}
function initKey() {
  const uid = readActiveUid();
  return uid ? `moniebee_wallet_initialized:${uid}` : LEGACY_INIT_KEY;
}

// ---- Transactions ----------------------------------------------------------
export function getTransactions(): Tx[] {
  try {
    const raw = localStorage.getItem(txKey());
    if (raw) return JSON.parse(raw) as Tx[];
  } catch {}
  return [];
}

function saveTransactions(list: Tx[]) {
  try {
    localStorage.setItem(txKey(), JSON.stringify(list));
  } catch {}
}

export function addTransaction(tx: Omit<Tx, "id" | "date"> & { date?: number }): Tx {
  const list = getTransactions();
  const item: Tx = {
    ...tx,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: tx.date ?? Date.now(),
  };
  saveTransactions([item, ...list]);
  try {
    window.dispatchEvent(new CustomEvent("moniebee:tx"));
  } catch {}
  return item;
}

export function markAllRead() {
  try {
    localStorage.setItem(readKey(), String(Date.now()));
  } catch {}
}

export function getReadAt(): number {
  try {
    const v = localStorage.getItem(readKey());
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

export function unreadCount(): number {
  const readAt = getReadAt();
  return getTransactions().filter((t) => t.date > readAt).length;
}

// ---- Balance ---------------------------------------------------------------
export function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function isWalletInitialized(): boolean {
  try {
    return localStorage.getItem(initKey()) === "1";
  } catch {
    return false;
  }
}

export function getBalance(): number {
  try {
    const v = localStorage.getItem(balKey());
    if (v !== null) return parseFloat(v);
  } catch {}
  return 0;
}

export function setBalance(v: number) {
  try {
    localStorage.setItem(balKey(), String(v));
    localStorage.setItem(initKey(), "1");
    window.dispatchEvent(new CustomEvent("moniebee:balance", { detail: v }));
  } catch {}
}

/** Credit the wallet and record a transaction. Returns new balance. */
export function creditWallet(amount: number, title: string, message: string): number {
  const next = getBalance() + amount;
  setBalance(next);
  addTransaction({ type: "credit", title, message, amount, status: "successful" });
  return next;
}

/** Debit the wallet and record a transaction. Returns new balance, or null if insufficient. */
export function debitWallet(amount: number, title: string, message: string): number | null {
  const cur = getBalance();
  if (amount > cur) return null;
  const next = cur - amount;
  setBalance(next);
  addTransaction({ type: "withdrawal", title, message, amount, status: "successful" });
  return next;
}

/** Subscribe to balance changes (same tab + other tabs). */
export function subscribeBalance(cb: (v: number) => void): () => void {
  const onCustom = (e: Event) => {
    const v = (e as CustomEvent<number>).detail;
    if (typeof v === "number") cb(v);
    else cb(getBalance());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith("moniebee_balance")) cb(getBalance());
  };
  window.addEventListener("moniebee:balance", onCustom as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("moniebee:balance", onCustom as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}
