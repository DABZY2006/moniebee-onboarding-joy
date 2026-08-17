import { auth } from "@/lib/firebase";
import { getPublicSettings } from "@/lib/public.functions";

export type BankSettings = {
  bank_name: string;
  account_name: string;
  account_number: string;
  amount?: number;
};
export type LinkSettings = { telegram?: string; whatsapp?: string; telegram_group?: string; whatsapp_group?: string };

/** Best-effort identity for the current app user (Firebase + local profile). */
export function currentIdentity() {
  const u = auth.currentUser;
  let name = "";
  let uid = u?.uid ?? "";
  let phone = "";
  let referral = "";
  try {
    name = u?.displayName || localStorage.getItem("moniebee_username") || "";
    uid = uid || localStorage.getItem("moniebee_active_uid") || "";
    phone = localStorage.getItem("moniebee_phone") || "";
    referral = localStorage.getItem("moniebee_referral") || "";
  } catch {}
  if (!uid) {
    try {
      uid = localStorage.getItem("moniebee_guest_uid") || "";
      if (!uid) {
        uid = `guest-${crypto.randomUUID()}`;
        localStorage.setItem("moniebee_guest_uid", uid);
      }
    } catch {}
  }
  const email = u?.email ?? (localStorage.getItem("moniebee_email") || undefined);
  return { uid, name: name || "Unnamed", email: email || undefined, phone, referral };
}

/** Loads public settings (bank, support, community) from the backend. */
export async function loadSettings() {
  const out: { bank?: BankSettings; support?: LinkSettings; community?: LinkSettings } = {};
  try {
    const { settings } = await getPublicSettings();
    for (const row of settings) {
      const value = JSON.parse(row.value || "{}");
      if (row.key === "bank") out.bank = value as BankSettings;
      if (row.key === "support") out.support = value as LinkSettings;
      if (row.key === "community") out.community = value as LinkSettings;
    }
  } catch {}
  return out;
}
