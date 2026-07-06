import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, History, Eye, EyeOff, TrendingUp, Zap, Star, Crown, Gem, Check, X, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { addTransaction, debitWallet, getBalance, subscribeBalance, setActiveUser, formatNaira } from "@/lib/transactions";

export const Route = createFileRoute("/invest")({
  head: () => ({ meta: [{ title: "Investment — Moniebee" }] }),
  component: InvestPage,
});

type Plan = {
  id: string;
  name: string;
  amount: number;
  daily: number;
  duration: number;
  total: number;
  icon: any;
  accent: string;
};

const PLANS: Plan[] = [
  { id: "starter", name: "Starter Plan", amount: 10000, daily: 500, duration: 30, total: 20000, icon: Zap, accent: "from-purple-600 to-purple-500" },
  { id: "silver", name: "Silver Plan", amount: 20000, daily: 1000, duration: 30, total: 40000, icon: Star, accent: "from-fuchsia-600 to-purple-500" },
  { id: "gold", name: "Gold Plan", amount: 30000, daily: 2000, duration: 30, total: 80000, icon: Crown, accent: "from-amber-500 to-purple-600" },
  { id: "diamond", name: "Diamond Plan", amount: 50000, daily: 5000, duration: 30, total: 200000, icon: Gem, accent: "from-cyan-400 to-purple-600" },
];

type ActiveInv = { planId: string; startedAt: number };

function InvestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bal, setBal] = useState<number>(() => getBalance());
  const [hide, setHide] = useState(false);
  const [active, setActive] = useState<ActiveInv | null>(null);
  const [processing, setProcessing] = useState<Plan | null>(null);
  const [success, setSuccess] = useState<Plan | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setActiveUser(user.uid);
      setBal(getBalance());
    }
  }, [user]);
  useEffect(() => subscribeBalance((v) => setBal(v)), []);

  useEffect(() => {
    try {
      const uid = user?.uid ?? "anon";
      const raw = localStorage.getItem(`moniebee_active_investment:${uid}`);
      if (raw) setActive(JSON.parse(raw));
    } catch {}
  }, [user]);

  const activePlan = active ? PLANS.find((p) => p.id === active.planId) ?? null : null;
  const daysElapsed = active ? Math.min(30, Math.floor((Date.now() - active.startedAt) / 86400000)) : 0;
  const daysRemaining = active ? Math.max(0, 30 - daysElapsed) : 0;
  const totalInvested = activePlan?.amount ?? 0;
  const dailyEarnings = activePlan?.daily ?? 0;
  const totalProfit = activePlan ? Math.min(daysElapsed, 30) * activePlan.daily : 0;

  const invest = (p: Plan) => {
    if (bal < p.amount) {
      setError(true);
      return;
    }
    setProcessing(p);
    setTimeout(() => {
      const debited = debitWallet(p.amount, "Investment Activated", `${p.name} activated for ${formatNaira(p.amount)}.`);
      if (debited === null) {
        setProcessing(null);
        setError(true);
        return;
      }
      const inv: ActiveInv = { planId: p.id, startedAt: Date.now() };
      try {
        const uid = user?.uid ?? "anon";
        localStorage.setItem(`moniebee_active_investment:${uid}`, JSON.stringify(inv));
      } catch {}
      addTransaction({
        type: "earn",
        title: "Investment Started",
        message: `${p.name} • Daily ${formatNaira(p.daily)}`,
        amount: p.amount,
        status: "successful",
      });
      setActive(inv);
      setProcessing(null);
      setSuccess(p);
      toast.success("Investment Successful");
    }, 5000);
  };

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const progress = active ? (daysElapsed / 30) * 100 : 0;

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-140px);opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.5)} 50%{box-shadow:0 0 40px rgba(168,85,247,.95)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(.9)} 100%{opacity:1;transform:scale(1)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .particle{position:absolute;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7;animation:floatUp linear infinite}
        .glow-btn{animation:glowPulse 2.5s ease-in-out infinite}
        .fade-in{animation:fadeIn .4s ease-out both}
        .pop-in{animation:popIn .35s ease-out both}
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

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold leading-tight">Investment</h1>
            <p className="text-[12px] text-white/60">Grow your money with MONEEBEE</p>
          </div>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="History">
            <History size={18} />
          </button>
        </div>

        {/* Balance card */}
        <div
          className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#2a0d5e,#4c1d95 55%,#6d28d9)",
            boxShadow: "0 0 40px rgba(124,58,237,.45)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] text-white/70 tracking-widest uppercase">Available Balance</div>
              <div className="text-[26px] font-bold mt-1">{hide ? "••••••" : fmt(bal)}</div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="text-[10px] text-white/60">Total Invested</div>
                  <div className="text-[14px] font-semibold">{hide ? "••••" : fmt(totalInvested)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60">Daily Earnings</div>
                  <div className="text-[14px] font-semibold text-emerald-300">{hide ? "••••" : fmt(dailyEarnings)}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setHide((v) => !v)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              aria-label="Toggle balance visibility"
            >
              {hide ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full"
            style={{ background: "radial-gradient(circle,#a855f7 0%,transparent 70%)", opacity: .55 }} />
        </div>

        {/* Active investment */}
        {activePlan && (
          <div className="glass rounded-2xl p-4 mb-5 fade-in" style={{ boxShadow: "0 0 25px rgba(168,85,247,.35)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-semibold">Active Investment</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Running
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3 text-[12px]">
              <div><div className="text-white/50">Current Plan</div><div className="font-semibold">{activePlan.name}</div></div>
              <div><div className="text-white/50">Amount Invested</div><div className="font-semibold">{fmt(activePlan.amount)}</div></div>
              <div><div className="text-white/50">Daily Earnings</div><div className="font-semibold text-emerald-300">{fmt(activePlan.daily)}</div></div>
              <div><div className="text-white/50">Days Remaining</div><div className="font-semibold">{daysRemaining} days</div></div>
              <div className="col-span-2"><div className="text-white/50">Total Profit Earned</div><div className="font-semibold text-emerald-300">{fmt(totalProfit)}</div></div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#8B5CF6,#a855f7)" }} />
            </div>
            <div className="text-[10px] text-white/50 mt-1.5">{daysElapsed}/30 days</div>
          </div>
        )}

        {/* Plans */}
        <h2 className="text-[14px] font-semibold mb-3">Investment Plans</h2>
        <div className="space-y-3 mb-5">
          {PLANS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center`}
                    style={{ boxShadow: "0 0 18px rgba(168,85,247,.55)" }}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold">{p.name}</div>
                    <div className="text-[11px] text-white/60">{p.duration} Days • Total {fmt(p.total)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-[12px]">
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="text-white/50 text-[10px]">Investment</div>
                    <div className="font-bold">{fmt(p.amount)}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="text-white/50 text-[10px]">Daily Earnings</div>
                    <div className="font-bold text-emerald-300">{fmt(p.daily)}</div>
                  </div>
                </div>
                <button
                  onClick={() => invest(p)}
                  className="w-full py-3 rounded-xl text-[13px] font-bold"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)", boxShadow: "0 0 16px rgba(168,85,247,.5)" }}
                >
                  Invest Now
                </button>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="text-[13px] font-semibold mb-2">Investment Benefits</div>
          <ul className="space-y-1.5 text-[12px] text-white/80">
            {["Daily Earnings", "Secure Investment", "Fast Withdrawals", "Premium Support", "High Return on Investment"].map((b) => (
              <li key={b} className="flex items-center gap-2"><Check size={14} className="text-emerald-400" />{b}</li>
            ))}
          </ul>
        </div>

        {/* Rules */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="text-[13px] font-semibold mb-2">Investment Rules</div>
          <ul className="space-y-1.5 text-[11.5px] text-white/70 list-disc pl-4">
            <li>Daily earnings are credited automatically.</li>
            <li>Investment lasts for 30 days.</li>
            <li>Earnings can be withdrawn after verification.</li>
            <li>Users must have sufficient wallet balance before investing.</li>
            <li>Investments cannot be cancelled after activation.</li>
          </ul>
        </div>

        <div className="glass rounded-xl p-3 mb-5 flex items-start gap-3">
          <ShieldCheck size={16} className="text-purple-300 mt-0.5" />
          <p className="text-[12px] text-white/70">Your investment is 100% secure and encrypted.</p>
        </div>

        <button
          onClick={() => {
            const first = document.querySelector("[data-invest-first]");
            first?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="glow-btn w-full py-4 rounded-2xl text-[15px] font-bold"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
        >
          Start Investing
          <div className="text-[11px] font-normal text-white/85 mt-0.5">Build Your Wealth Today</div>
        </button>

        <p className="text-center text-[11px] text-white/50 mt-5">
          ✨ Invest Smart • Earn Daily • Build Wealth with MONEEBEE ✨
        </p>
      </div>

      {/* Processing modal */}
      {processing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-8 text-center max-w-xs w-full pop-in" style={{ boxShadow: "0 0 60px rgba(168,85,247,.7)" }}>
            <Loader2 size={44} className="mx-auto text-purple-300 animate-spin mb-4" />
            <div className="text-[15px] font-bold">Activating {processing.name}...</div>
            <div className="text-[12px] text-white/60 mt-1">Please wait</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-7 text-center max-w-sm w-full pop-in" style={{ boxShadow: "0 0 60px rgba(16,185,129,.5)" }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 30px rgba(16,185,129,.7)" }}>
              <TrendingUp size={30} />
            </div>
            <div className="text-[16px] font-bold mb-1">🎉 Investment Successful!</div>
            <p className="text-[12.5px] text-white/70 mb-5">
              Your investment has been activated successfully. Daily earnings will begin according to your selected plan.
            </p>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="glow-btn w-full py-3 rounded-xl text-[14px] font-bold"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-7 text-center max-w-sm w-full pop-in" style={{ boxShadow: "0 0 60px rgba(239,68,68,.45)" }}>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)", boxShadow: "0 0 30px rgba(239,68,68,.6)" }}>
              <X size={30} />
            </div>
            <div className="text-[16px] font-bold mb-1">Insufficient Wallet Balance</div>
            <p className="text-[12.5px] text-white/70 mb-5">Please fund your wallet before investing.</p>
            <button
              onClick={() => setError(false)}
              className="w-full py-3 rounded-xl text-[14px] font-bold"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
