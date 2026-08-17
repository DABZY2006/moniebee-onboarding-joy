import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Search,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminStats,
  listAppUsers,
  setUserBan,
  listPayments,
  reviewPayment,
  getProofUrl,
  listWithdrawals,
  reviewWithdrawal,
  getAdminSettings,
  saveAdminSetting,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Moniebee" },
      { name: "description", content: "Moniebee admin control panel: users, payments, withdrawals and settings." },
      { property: "og:title", content: "Admin Dashboard — Moniebee" },
      { property: "og:description", content: "Moniebee admin control panel." },
    ],
  }),
  component: AdminDashboardPage,
});

type Tab = "Dashboard" | "Users" | "Payments" | "Withdrawals" | "Bank" | "Support" | "Community";
const TABS: Tab[] = ["Dashboard", "Users", "Payments", "Withdrawals", "Bank", "Support", "Community"];

const naira = (n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const when = (s?: string | null) => (s ? new Date(s).toLocaleString("en-NG") : "—");

type Stats = Awaited<ReturnType<typeof getAdminStats>>;
type AppUser = Awaited<ReturnType<typeof listAppUsers>>["users"][number];
type Payment = Awaited<ReturnType<typeof listPayments>>["payments"][number];
type Withdrawal = Awaited<ReturnType<typeof listWithdrawals>>["withdrawals"][number];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [busy, setBusy] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState<"all" | "active" | "banned">("all");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paySearch, setPaySearch] = useState("");
  const [payStatus, setPayStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [proof, setProof] = useState<string | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [wdStatus, setWdStatus] = useState<"all" | "pending" | "approved" | "rejected" | "completed">("all");

  const [bank, setBank] = useState({ bank_name: "", account_name: "", account_number: "", amount: "" });
  const [support, setSupport] = useState({ telegram: "", whatsapp: "" });
  const [community, setCommunity] = useState({ telegram_group: "", whatsapp_group: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
    });
  }, [navigate]);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const [s, u, p, w, cfg] = await Promise.all([
        getAdminStats(),
        listAppUsers({ data: { status: userStatus, search: userSearch || undefined } }),
        listPayments({ data: { status: payStatus } }),
        listWithdrawals({ data: { status: wdStatus } }),
        getAdminSettings(),
      ]);
      setStats(s);
      setUsers(u.users);
      setPayments(p.payments);
      setWithdrawals(w.withdrawals);
      for (const row of cfg.settings) {
        const v = JSON.parse(row.value || "{}") as Record<string, string>;
        if (row.key === "bank") setBank({ bank_name: v.bank_name ?? "", account_name: v.account_name ?? "", account_number: v.account_number ?? "", amount: String(v.amount ?? "") });
        if (row.key === "support") setSupport({ telegram: v.telegram ?? "", whatsapp: v.whatsapp ?? "" });
        if (row.key === "community") setCommunity({ telegram_group: v.telegram_group ?? "", whatsapp_group: v.whatsapp_group ?? "" });
      }
    } catch (e) {
      toast.error((e as Error).message || "Failed to load admin data");
    } finally {
      setBusy(false);
    }
  }, [userStatus, userSearch, payStatus, wdStatus]);

  useEffect(() => {
    if (email) void refresh();
  }, [email, refresh]);

  const doLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const filteredPayments = useMemo(() => {
    const q = paySearch.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        (p.user_name ?? "").toLowerCase().includes(q) ||
        (p.user_email ?? "").toLowerCase().includes(q) ||
        String(p.amount).includes(q),
    );
  }, [payments, paySearch]);

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: String(stats.totalUsers) },
        { label: "Active 24h", value: String(stats.activeUsers) },
        { label: "Pending Payments", value: String(stats.paymentsPending) },
        { label: "Revenue Approved", value: naira(stats.revenueApproved) },
        { label: "Approved Payments", value: String(stats.paymentsApproved) },
        { label: "Rejected Payments", value: String(stats.paymentsRejected) },
        { label: "Banned Users", value: String(stats.bannedUsers) },
        { label: "Upgraded Users", value: String(stats.upgradedUsers) },
        { label: "Pending Withdrawals", value: String(stats.withdrawalsPending) },
        { label: "Withdrawals Paid", value: naira(stats.withdrawalsPaidAmount) },
      ]
    : [];

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-in{animation:fadeIn .4s ease-out both}
        .noscroll::-webkit-scrollbar{display:none}
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(124,58,237,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(76,29,149,0.5) 0%, transparent 50%), linear-gradient(180deg, #0a0014 0%, #000 100%)",
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-12">
        <div className="flex items-center justify-between mb-5 fade-in">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-white"
              style={{ boxShadow: "0 0 20px rgba(139,92,246,.55)" }}
            >
              <ShieldCheck size={22} className="text-purple-700" />
            </div>
            <div>
              <div className="text-[16px] font-bold">Admin Panel</div>
              <div className="text-[11px] text-white/55">{email ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void refresh()}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-purple-200"
              aria-label="Refresh"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
            </button>
            <button
              onClick={doLogout}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-red-300"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto noscroll pb-3 mb-4" style={{ scrollbarWidth: "none" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors"
              style={
                tab === t
                  ? { background: "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 0 18px rgba(239,68,68,.45)" }
                  : { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && (
          <div className="grid grid-cols-2 gap-3 fade-in">
            {statCards.map((c) => (
              <div key={c.label} className="glass rounded-2xl p-4">
                <div className="text-[11px] text-white/55">{c.label}</div>
                <div className="text-[17px] font-bold mt-1 break-words">{c.value}</div>
              </div>
            ))}
            {!stats && <div className="text-[12px] text-white/50">Loading stats…</div>}
          </div>
        )}

        {tab === "Users" && (
          <div className="fade-in">
            <div className="glass rounded-xl flex items-center gap-2 px-3 py-2 mb-3">
              <Search size={15} className="text-white/50" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name or email"
                className="bg-transparent outline-none text-[13px] flex-1"
              />
            </div>
            <div className="flex gap-2 mb-3">
              {(["all", "active", "banned"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setUserStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-[11px] ${userStatus === s ? "bg-purple-500/30 border border-purple-400/50" : "bg-white/5 border border-white/10 text-white/60"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {users.length === 0 && <div className="text-[12px] text-white/50">No users found.</div>}
            {users.map((u) => (
              <div key={u.id} className="glass rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{u.full_name ?? "Unnamed"}</div>
                    <div className="text-[11px] text-white/55 truncate">{u.email ?? "—"}</div>
                    <div className="text-[11px] text-white/45 mt-1">{u.phone ?? "no phone"} · ref {u.referral_code ?? "—"}</div>
                    <div className="text-[10px] text-white/40 mt-1">Joined {when(u.created_at)}</div>
                    {u.ban_reason && <div className="text-[11px] text-red-300 mt-1">Reason: {u.ban_reason}</div>}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-1 rounded-full ${u.status === "banned" ? "bg-red-500/20 text-red-300 border border-red-400/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"}`}
                  >
                    {u.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {u.status === "banned" ? (
                    <button
                      onClick={() => act(() => setUserBan({ data: { id: u.id, banned: false } }), "User unbanned")}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const reason = window.prompt("Ban reason", "Violation of terms");
                        if (reason === null) return;
                        void act(() => setUserBan({ data: { id: u.id, banned: true, reason } }), "User banned");
                      }}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-red-500/20 border border-red-400/40 flex items-center justify-center gap-1.5"
                    >
                      <Ban size={14} /> Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Payments" && (
          <div className="fade-in">
            <div className="glass rounded-xl flex items-center gap-2 px-3 py-2 mb-3">
              <Search size={15} className="text-white/50" />
              <input
                value={paySearch}
                onChange={(e) => setPaySearch(e.target.value)}
                placeholder="Search name, email or amount"
                className="bg-transparent outline-none text-[13px] flex-1"
              />
            </div>
            <div className="flex gap-2 mb-3 overflow-x-auto noscroll">
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPayStatus(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] ${payStatus === s ? "bg-purple-500/30 border border-purple-400/50" : "bg-white/5 border border-white/10 text-white/60"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {filteredPayments.length === 0 && <div className="text-[12px] text-white/50">No payments yet.</div>}
            {filteredPayments.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{p.user_name ?? "Unnamed"}</div>
                    <div className="text-[11px] text-white/55 truncate">{p.user_email ?? "—"}</div>
                    <div className="text-[16px] font-bold mt-1">{naira(Number(p.amount))}</div>
                    <div className="text-[10px] text-white/40 mt-1">{when(p.created_at)}</div>
                  </div>
                  <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/15">{p.status}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {p.proof_path && (
                    <button
                      onClick={async () => {
                        try {
                          const { url } = await getProofUrl({ data: { path: p.proof_path as string } });
                          setProof(url);
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-white/8 border border-white/15 flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} /> Proof
                    </button>
                  )}
                  <button
                    onClick={() => act(() => reviewPayment({ data: { id: p.id, status: "approved" } }), "Payment approved")}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-emerald-500/20 border border-emerald-400/40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const note = window.prompt("Rejection note", "Payment not received");
                      if (note === null) return;
                      void act(() => reviewPayment({ data: { id: p.id, status: "rejected", note } }), "Payment rejected");
                    }}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-red-500/20 border border-red-400/40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Withdrawals" && (
          <div className="fade-in">
            <div className="flex gap-2 mb-3 overflow-x-auto noscroll">
              {(["all", "pending", "approved", "completed", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setWdStatus(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] ${wdStatus === s ? "bg-purple-500/30 border border-purple-400/50" : "bg-white/5 border border-white/10 text-white/60"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {withdrawals.length === 0 && <div className="text-[12px] text-white/50">No withdrawal requests.</div>}
            {withdrawals.map((w) => (
              <div key={w.id} className="glass rounded-2xl p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate">{w.user_name ?? "Unnamed"}</div>
                    <div className="text-[11px] text-white/55 truncate">{w.user_email ?? "—"}</div>
                    <div className="text-[16px] font-bold mt-1">{naira(Number(w.amount))}</div>
                    <div className="text-[11px] text-white/50 mt-1">
                      {w.method} · {w.destination ?? "—"} · {w.account_name ?? "—"}
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">{when(w.created_at)}</div>
                  </div>
                  <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/15">{w.status}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (!window.confirm(`Approve ${naira(Number(w.amount))} withdrawal?`)) return;
                      void act(() => reviewWithdrawal({ data: { id: w.id, status: "approved" } }), "Withdrawal approved");
                    }}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-emerald-500/20 border border-emerald-400/40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm("Mark this withdrawal as paid/completed?")) return;
                      void act(() => reviewWithdrawal({ data: { id: w.id, status: "completed" } }), "Marked completed");
                    }}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-purple-500/25 border border-purple-400/40"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => {
                      const note = window.prompt("Rejection note", "Insufficient balance");
                      if (note === null) return;
                      void act(() => reviewWithdrawal({ data: { id: w.id, status: "rejected", note } }), "Withdrawal rejected");
                    }}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-red-500/20 border border-red-400/40 flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Bank" && (
          <SettingsCard
            title="Bank & Payment Settings"
            subtitle="Shown to users on the payment page."
            fields={[
              { label: "Bank Name", value: bank.bank_name, set: (v) => setBank({ ...bank, bank_name: v }) },
              { label: "Account Name", value: bank.account_name, set: (v) => setBank({ ...bank, account_name: v }) },
              { label: "Account Number", value: bank.account_number, set: (v) => setBank({ ...bank, account_number: v }) },
              { label: "Payment Amount (₦)", value: bank.amount, set: (v) => setBank({ ...bank, amount: v }) },
            ]}
            onSave={() =>
              act(
                () =>
                  saveAdminSetting({
                    data: {
                      key: "bank",
                      value: JSON.stringify({ ...bank, amount: Number(bank.amount || 0) }),
                    },
                  }),
                "Bank settings saved",
              )
            }
            busy={busy}
          />
        )}

        {tab === "Support" && (
          <SettingsCard
            title="Support Links"
            subtitle="Used by the floating support assistant."
            fields={[
              { label: "Telegram Support URL", value: support.telegram, set: (v) => setSupport({ ...support, telegram: v }) },
              { label: "WhatsApp Support URL", value: support.whatsapp, set: (v) => setSupport({ ...support, whatsapp: v }) },
            ]}
            onSave={() => act(() => saveAdminSetting({ data: { key: "support", value: JSON.stringify(support) } }), "Support links saved")}
            busy={busy}
          />
        )}

        {tab === "Community" && (
          <SettingsCard
            title="Community Links"
            subtitle="Group invites shared with users."
            fields={[
              { label: "Telegram Group URL", value: community.telegram_group, set: (v) => setCommunity({ ...community, telegram_group: v }) },
              { label: "WhatsApp Group URL", value: community.whatsapp_group, set: (v) => setCommunity({ ...community, whatsapp_group: v }) },
            ]}
            onSave={() => act(() => saveAdminSetting({ data: { key: "community", value: JSON.stringify(community) } }), "Community links saved")}
            busy={busy}
          />
        )}
      </div>

      {proof && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,.85)" }}
          onClick={() => setProof(null)}
        >
          <img src={proof} alt="Payment proof screenshot" className="max-h-[80vh] w-auto rounded-2xl border border-purple-400/40" />
        </div>
      )}
    </div>
  );
}

function SettingsCard({
  title,
  subtitle,
  fields,
  onSave,
  busy,
}: {
  title: string;
  subtitle: string;
  fields: { label: string; value: string; set: (v: string) => void }[];
  onSave: () => void;
  busy: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5 fade-in">
      <div className="text-[15px] font-bold">{title}</div>
      <div className="text-[11px] text-white/55 mb-4">{subtitle}</div>
      {fields.map((f) => (
        <label key={f.label} className="block mb-3">
          <span className="text-[11px] text-white/60">{f.label}</span>
          <input
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            className="mt-1 w-full rounded-xl px-3 py-3 text-[14px] bg-white/5 border border-purple-400/30 outline-none focus:border-purple-400/70"
          />
        </label>
      ))}
      <button
        onClick={onSave}
        disabled={busy}
        className="w-full py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
      </button>
    </div>
  );
}
