import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/payment-success")({
  head: () => ({ meta: [{ title: "Payment Successful — Moniebee" }] }),
  component: PaymentSuccessPage,
});

function generateMbeeCode(): string {
  const rand = (n: number) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `MNB-${rand(3)}-${rand(3)}`;
}

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const code = useMemo(() => {
    try {
      const cached = localStorage.getItem("moniebee_mbee_code");
      if (cached) return cached;
      const c = generateMbeeCode();
      localStorage.setItem("moniebee_mbee_code", c);
      return c;
    } catch {
      return generateMbeeCode();
    }
  }, []);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("MBEE Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 3 + Math.random() * 2.5,
        color: ["#a855f7", "#c084fc", "#f5d0fe", "#ede9fe", "#7c3aed"][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 30px rgba(168,85,247,.7),0 0 70px rgba(139,92,246,.5)} 50%{box-shadow:0 0 60px rgba(168,85,247,1),0 0 120px rgba(139,92,246,.9)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes confetti { 0%{transform:translateY(-20px) rotate(0);opacity:0} 15%{opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes sparkle { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.55)} 50%{box-shadow:0 0 40px rgba(168,85,247,.95)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-up{animation:fadeUp .5s ease-out both}
        .ring-pulse{animation:ringPulse 2.5s ease-in-out infinite}
        .confetti{position:absolute;top:-20px;border-radius:2px;animation:confetti linear infinite}
        .sparkle{position:absolute;color:#e9d5ff;animation:sparkle 2s ease-in-out infinite}
        .glow-btn{animation:glowPulse 2.5s ease-in-out infinite}
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.6}px`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
        <Sparkles className="sparkle" style={{ left: "12%", top: "18%" }} size={18} />
        <Sparkles className="sparkle" style={{ right: "10%", top: "26%", animationDelay: ".7s" }} size={14} />
        <Sparkles className="sparkle" style={{ left: "20%", bottom: "22%", animationDelay: "1.2s" }} size={16} />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-12 pb-24">
        {/* Success ring */}
        <div className="flex justify-center mb-6 fade-up">
          <div
            className="ring-pulse w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 30% 30%, #a855f7, #4c1d95 70%)",
              border: "2px solid rgba(196,181,253,.85)",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.9))" }} />
            </svg>
          </div>
        </div>

        <div className="text-center fade-up" style={{ animationDelay: ".1s" }}>
          <p className="text-[14px] text-white/70">Your Payment Was</p>
          <h1
            className="text-[26px] font-extrabold leading-tight mt-1"
            style={{
              backgroundImage: "linear-gradient(135deg,#e9d5ff,#a855f7,#7c3aed)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 20px rgba(168,85,247,.5)",
            }}
          >
            SUCCESSFULLY RECEIVED!
          </h1>
          <p className="text-[13px] text-white/60 mt-2">
            Thank you! Your payment has been processed successfully.
          </p>
        </div>

        {/* MBEE Code card */}
        <div
          className="glass rounded-2xl p-4 mt-7 fade-up"
          style={{ boxShadow: "0 0 40px rgba(168,85,247,.45)", animationDelay: ".2s" }}
        >
          <div className="text-[11px] font-bold text-purple-300 tracking-widest mb-3 text-center">
            YOUR MBEE CODE IS
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#8B5CF6,#4C1D95)",
                boxShadow: "0 0 18px rgba(168,85,247,.7)",
              }}
            >
              <span className="text-white text-[20px] font-black">M</span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-black tracking-widest truncate">{code}</div>
              <div className="text-[10px] text-white/50">Keep this code safe</div>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg bg-purple-500/25 border border-purple-400/40 hover:bg-purple-500/40"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Activated card */}
        <div
          className="glass rounded-2xl p-4 mt-4 flex items-start gap-3 fade-up"
          style={{ animationDelay: ".3s", borderColor: "rgba(16,185,129,.4)" }}
        >
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              boxShadow: "0 0 16px rgba(16,185,129,.6)",
            }}
          >
            <ShieldCheck size={18} />
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-bold">Your MONEEBEE is now active</div>
            <p className="text-[11.5px] text-white/70 mt-0.5 leading-snug">
              You can now start exploring, investing, purchasing airtime, purchasing data, and withdrawing funds.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="glow-btn w-full py-4 rounded-2xl text-[15px] font-bold mt-7"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
        >
          Go to Dashboard
        </button>

        <p className="text-center text-[11px] text-white/50 mt-5">
          ✨ Welcome to MONEEBEE • Earn • Invest • Withdraw ✨
        </p>
      </div>
    </div>
  );
}
