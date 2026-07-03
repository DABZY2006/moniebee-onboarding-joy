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

const KEY = "moniebee_transactions";
const READ_KEY = "moniebee_tx_read_at";
const BAL_KEY = "moniebee_balance";
const INIT_KEY = "moniebee_wallet_initialized";

export const MONEE_CODE = "MON-22734-EE";
export const INITIAL_BALANCE = 160000;

export function getTransactions(): Tx[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Tx[];
  } catch {}
  return [];
}

function saveTransactions(list: Tx[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
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
    localStorage.setItem(READ_KEY, String(Date.now()));
  } catch {}
}

export function getReadAt(): number {
  try {
    const v = localStorage.getItem(READ_KEY);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

export function unreadCount(): number {
  const readAt = getReadAt();
  return getTransactions().filter((t) => t.date > readAt).length;
}

export function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function isWalletInitialized(): boolean {
  try {
    return localStorage.getItem(INIT_KEY) === "1";
  } catch {
    return false;
  }
}

export function getBalance(): number {
  try {
    const v = localStorage.getItem(BAL_KEY);
    if (v !== null) return parseFloat(v);
  } catch {}
  return 0;
}

export function setBalance(v: number) {
  try {
    localStorage.setItem(BAL_KEY, String(v));
    localStorage.setItem(INIT_KEY, "1");
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
    if (e.key === BAL_KEY) cb(getBalance());
  };
  window.addEventListener("moniebee:balance", onCustom as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("moniebee:balance", onCustom as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}
