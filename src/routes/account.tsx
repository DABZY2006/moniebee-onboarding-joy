import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bell, Camera, ShieldCheck, User as UserIcon, Lock, Ticket, BadgeCheck, Building2,
  Receipt, Users, BellRing, Headphones, LogOut, ChevronRight, Copy, Check,
  Home as HomeIcon, PieChart, LineChart as LineIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { auth, signOut } from "@/lib/firebase";
import { getBalance, subscribeBalance, setActiveUser, formatNaira } from "@/lib/transactions";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Moniebee" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bal, setBal] = useState<number>(() => getBalance());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [copiedMbee, setCopiedMbee] = useState(false);

  const mbee = (() => {
    try {
      return localStorage.getItem("moniebee_mbee_code") ?? "MNB-XXX-XXX";
    } catch { return "MNB-XXX-XXX"; }
  })();

  const stats = (() => {
    try {
      const uid = user?.uid ?? "anon";
      const invRaw = localStorage.getItem(`moniebee_active_investment:${uid}`);
      const inv = invRaw ? JSON.parse(invRaw) : null;
      const invested = inv ? 10000 : 0; // placeholder, actual read via PLAN map elsewhere
      return { invested };
    } catch { return { invested: 0 }; }
  })();

  useEffect(() => {
    if (user?.uid) {
      setActiveUser(user.uid);
      setBal(getBalance());
    }
    try {
      const a = localStorage.getItem(`moniebee_avatar:${user?.uid ?? "anon"}`);
      if (a) setAvatar(a);
    } catch {}
  }, [user]);
  useEffect(() => subscribeBalance((v) => setBal(v)), []);

  const handleAvatar = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setAvatar(url);
      try { localStorage.setItem(`moniebee_avatar:${user?.uid ?? "anon"}`, url); } catch {}
    };
    reader.readAsDataURL(f);
  };

  const copyMbee = async () => {
    try {
      await navigator.clipboard.writeText(mbee);
      setCopiedMbee(true);
      toast.success("MBEE Code copied");
      setTimeout(() => setCopiedMbee(false), 1500);
    } catch {}
  };

  const doLogout = async () => {
    try { await signOut(auth); } catch {}
    setLogoutOpen(false);
    navigate({ to: "/login" });
  };

  const displayName = user?.displayName ?? "MONEEBEE User";
  const email = user?.email ?? "—";
  const username = user?.email ? user.email.split("@")[0] : "user";

  const menu: { icon: any; label: string; sub?: string; onClick?: () => void; badge?: string }[] = [
    { icon: UserIcon, label: "Personal Information", sub: "View and update profile details" },
    { icon: Lock, label: "Security", sub: "Password, PIN & security settings" },
    { icon: Ticket, label: "MBEE CODE", sub: mbee, onClick: copyMbee },
    { icon: BadgeCheck, label: "KYC Verification", sub: "Complete identity verification", badge: "Pending" },
    { icon: Building2, label: "Bank Accounts", sub: "Manage payout accounts" },
    { icon: Receipt, label: "Transaction History", sub: "All wallet & investment activity", onClick: () => navigate({ to: "/notifications" }) },
    { icon: Users, label: "Referral & Earnings", sub: "Invite friends & earn", onClick: () => navigate({ to: "/spin" }) },
    { icon: BellRing, label: "Notification Settings", sub: "Enable or disable notifications" },
    { icon: Headphones, label: "Help & Support", sub: "Reach the MONEEBEE team" },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-140px);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.55)} 50%{box-shadow:0 0 40px rgba(168,85,247,.95)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .particle{position:absolute;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7;animation:floatUp linear infinite}
        .glow-btn{animation:glowPulse 2.5s ease-in-out infinite}
        .fade-in{animation:fadeIn .4s ease-out both}
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${40 + Math.random() * 60}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-10" />
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] font-black"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#4C1D95)", boxShadow: "0 0 16px rgba(168,85,247,.6)" }}
            >M</span>
            <span className="text-[16px] font-bold tracking-wide">MONEEBEE</span>
          </div>
          <button
            onClick={() => navigate({ to: "/notifications" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-purple-200" />
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center fade-in">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#8B5CF6,#4C1D95)",
                boxShadow: "0 0 34px rgba(168,85,247,.75), inset 0 0 24px rgba(168,85,247,.3)",
                border: "2px solid rgba(196,181,253,.7)",
              }}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[36px] font-black">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#4C1D95)", boxShadow: "0 0 14px rgba(168,85,247,.7)" }}
              aria-label="Change photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && e.target.files[0] && handleAvatar(e.target.files[0])}
            />
          </div>
          <div className="text-[17px] font-bold mt-3">{displayName}</div>
          <div className="text-[12px] text-white/60">@{username}</div>
          <div className="text-[12px] text-white/70 mt-0.5">{email}</div>
          <span
            className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: "rgba(168,85,247,.18)",
              border: "1px solid rgba(168,85,247,.5)",
              boxShadow: "0 0 12px rgba(168,85,247,.4)",
            }}
          >
            <ShieldCheck size={12} className="text-purple-200" /> Verified Account
          </span>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { label: "💰 Wallet Balance", value: formatNaira(bal) },
            { label: "📈 Total Invested", value: formatNaira(stats.invested) },
            { label: "💵 Total Earnings", value: formatNaira(0) },
            { label: "🏦 Total Withdrawn", value: formatNaira(0) },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-3">
              <div className="text-[11px] text-white/60">{s.label}</div>
              <div className="text-[15px] font-bold text-purple-200 mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="mt-6 space-y-2.5">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={m.onClick}
                className="w-full glass rounded-2xl p-3 flex items-center gap-3 text-left"
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 14px rgba(168,85,247,.5)" }}
                >
                  <Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold flex items-center gap-2">
                    {m.label}
                    {m.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {m.badge}
                      </span>
                    )}
                    {m.label === "MBEE CODE" && copiedMbee && (
                      <span className="text-[9px] text-emerald-300 flex items-center gap-1"><Check size={10} />Copied</span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/55 truncate">{m.sub}</div>
                </div>
                {m.label === "MBEE CODE" ? <Copy size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
              </button>
            );
          })}

          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full rounded-2xl p-3 flex items-center gap-3 text-left"
            style={{
              background: "linear-gradient(180deg,rgba(239,68,68,.12),rgba(239,68,68,.04))",
              border: "1px solid rgba(239,68,68,.4)",
            }}
          >
            <span className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 0 14px rgba(239,68,68,.5)" }}>
              <LogOut size={16} />
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-red-200">Logout</div>
              <div className="text-[11px] text-white/55">Sign out of your account</div>
            </div>
            <ChevronRight size={16} className="text-white/40" />
          </button>
        </div>

        {/* Bottom nav */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-4 pt-2"
          style={{ background: "linear-gradient(180deg, rgba(10,0,20,0) 0%, #0a0014 50%)" }}
        >
          <div className="glass rounded-2xl flex items-center justify-around py-3">
            {[
              { i: <HomeIcon size={20} />, l: "Home", onClick: () => navigate({ to: "/dashboard" }) },
              { i: <PieChart size={20} />, l: "Portfolio" },
              { i: <LineIcon size={20} />, l: "Invest", onClick: () => navigate({ to: "/invest" }) },
              { i: <UserIcon size={20} />, l: "Account", active: true },
            ].map((t: any) => (
              <button
                key={t.l}
                onClick={t.onClick}
                className={`flex flex-col items-center gap-0.5 ${t.active ? "text-purple-300" : "text-white/50"}`}
                style={t.active ? { filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))" } : {}}
              >
                {t.i}
                <span className="text-[10px]">{t.l}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Logout dialog */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-6 max-w-xs w-full text-center" style={{ boxShadow: "0 0 40px rgba(168,85,247,.5)" }}>
            <div className="text-[16px] font-bold mb-1">Log out?</div>
            <p className="text-[12px] text-white/60 mb-5">Are you sure you want to log out?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLogoutOpen(false)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                className="flex-1 py-3 rounded-xl text-[13px] font-bold"
                style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
