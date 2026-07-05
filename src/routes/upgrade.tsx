import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Crown, Shield, Sparkles, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/upgrade")({
  head: () => ({ meta: [{ title: "Upgrade Account — Moniebee" }] }),
  component: UpgradePage,
});

type Plan = { id: string; name: string; price: number; icon: any; benefits: string[]; accent: string };

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter Plan",
    price: 10000,
    icon: Zap,
    accent: "from-purple-600 to-purple-500",
    benefits: ["Daily Earnings Access", "Withdrawals Enabled", "Airtime Purchase"],
  },
  {
    id: "silver",
    name: "Silver Plan",
    price: 20000,
    icon: Star,
    accent: "from-fuchsia-600 to-purple-500",
    benefits: [
      "Higher Daily Earnings",
      "Faster Withdrawals",
      "Premium Support",
      "Referral Rewards Boost",
    ],
  },
  {
    id: "gold",
    name: "Gold Plan",
    price: 30000,
    icon: Crown,
    accent: "from-amber-500 to-purple-600",
    benefits: [
      "VIP Earnings Access",
      "Instant Withdrawals",
      "Priority Support",
      "Maximum Referral Rewards",
    ],
  },
];

function UpgradePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Plan>(PLANS[0]);
  const [fullName, setFullName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  const handleUpgrade = () => {
    try {
      localStorage.setItem(
        "moniebee_upgrade",
        JSON.stringify({ plan: selected.id, name: selected.name, price: selected.price, fullName, email, phone }),
      );
    } catch {}
    navigate({ to: "/confirm-email" });
  };

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-140px);opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.5),0 0 40px rgba(139,92,246,.3)} 50%{box-shadow:0 0 35px rgba(168,85,247,.9),0 0 70px rgba(139,92,246,.6)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .particle{position:absolute;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7;animation:floatUp linear infinite}
        .glow-btn{animation:glowPulse 2.5s ease-in-out infinite}
      `}</style>

      {/* particles */}
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

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[20px] font-bold leading-tight">Upgrade Account</h1>
            <p className="text-[12px] text-white/60">Unlock higher earning opportunities</p>
          </div>
        </div>

        {/* Current account card */}
        <div className="glass rounded-2xl p-4 mb-6" style={{ boxShadow: "0 0 30px rgba(139,92,246,.25)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-white/60">Current Plan</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="text-[18px] font-semibold mb-3">Free Member</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[11px] text-white/60">Daily Earnings</div>
              <div className="text-[15px] font-bold text-purple-300">₦0</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[11px] text-white/60">Referral Bonus</div>
              <div className="text-[15px] font-bold text-purple-300">₦10,000</div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-[14px] font-semibold mb-3">Choose Your Plan</h2>
        <div className="space-y-3 mb-6">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const active = selected.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left glass rounded-2xl p-4 transition-all ${active ? "ring-2 ring-purple-400" : ""}`}
                style={active ? { boxShadow: "0 0 30px rgba(168,85,247,.5)" } : undefined}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center`}
                    style={{ boxShadow: "0 0 18px rgba(168,85,247,.6)" }}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold">{p.name}</div>
                    <div className="text-[13px] text-purple-300 font-semibold">{fmt(p.price)}</div>
                  </div>
                  {active && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/30 border border-purple-400/40">
                      Selected
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-[12px] text-white/80">
                      <Check size={14} className="text-emerald-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Selected plan summary */}
        <div className="glass rounded-2xl p-4 mb-6" style={{ boxShadow: "0 0 25px rgba(168,85,247,.35)" }}>
          <div className="text-[12px] text-white/60 mb-2">Selected Package</div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[15px] font-semibold">{selected.name}</span>
            <span className="text-[15px] font-bold text-purple-300">{fmt(selected.price)}</span>
          </div>
          <div className="text-[11px] text-white/60">
            Account Status After Upgrade:{" "}
            <span className="text-emerald-300 font-semibold">Premium Active</span>
          </div>
        </div>

        {/* Payment form */}
        <h2 className="text-[14px] font-semibold mb-3">Complete Upgrade Payment</h2>
        <div className="space-y-3 mb-4">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full glass rounded-xl px-4 py-3 text-[14px] outline-none placeholder-white/40"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
            className="w-full glass rounded-xl px-4 py-3 text-[14px] outline-none placeholder-white/40"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="Phone Number"
            className="w-full glass rounded-xl px-4 py-3 text-[14px] outline-none placeholder-white/40"
          />
        </div>

        <div className="text-[12px] text-white/60 mb-2">Payment Method</div>
        <div className="glass rounded-xl p-3 mb-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
            <Sparkles size={16} />
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Bank Transfer</div>
            <div className="text-[11px] text-white/60">Fast & secure activation</div>
          </div>
          <Check size={16} className="text-emerald-400" />
        </div>

        <div className="glass rounded-xl p-3 mb-6 flex items-start gap-3 border-purple-400/30">
          <Shield size={16} className="text-purple-300 mt-0.5" />
          <p className="text-[12px] text-white/70">
            🔒 Your payment is protected with secure encryption.
          </p>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={!fullName || !email || !phone}
          className="glow-btn w-full py-4 rounded-2xl text-[15px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)",
          }}
        >
          Upgrade My Account
        </button>

        <p className="text-center text-[11px] text-white/50 mt-5">
          ✨ Upgrade • Earn More • Withdraw Faster ✨
        </p>
      </div>
    </div>
  );
}
