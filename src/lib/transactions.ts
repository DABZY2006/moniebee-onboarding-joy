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

export function getTransactions(): Tx[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Tx[];
  } catch {}
  // Seed the credit event from the dashboard so it shows up on the notifications page.
  const seed: Tx[] = [
    {
      id: "seed-credit",
      type: "credit",
      title: "Payment Received",
      message: "₦160,000.00 has been credited to your account.",
      amount: 160000,
      status: "successful",
      date: Date.now(),
    },
  ];
  try {
    localStorage.setItem(KEY, JSON.stringify(seed));
  } catch {}
  return seed;
}

export function addTransaction(tx: Omit<Tx, "id" | "date"> & { date?: number }): Tx {
  const list = getTransactions();
  const item: Tx = {
    ...tx,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: tx.date ?? Date.now(),
  };
  const next = [item, ...list];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
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

export function getBalance(): number {
  try {
    const v = localStorage.getItem("moniebee_balance");
    if (v) return parseFloat(v);
  } catch {}
  return 160000;
}

export function setBalance(v: number) {
  try {
    localStorage.setItem("moniebee_balance", String(v));
  } catch {}
}
