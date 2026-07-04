import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, History, Eye, EyeOff, Wallet, Copy, Share2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  getBalance,
  subscribeBalance,
  creditWallet,
  formatNaira,
} from "@/lib/transactions";

export const Route = createFileRoute("/spin")({
  head: () => ({ meta: [{ title: "Spin & Earn — Moniebee" }] }),
  component: SpinPage,
});

const REWARDS = [1000, 2500, 5000, 10000, 25000, 50000, "JACKPOT", "JACKPOT"] as const;
const SEG_ANGLE = 360 / REWARDS.length;
const SPIN_KEY = "moniebee_last_spin_at";

function SpinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(() => getBalance());
  const [hidden, setHidden] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<null | { label: string; jackpot: boolean; amount: number }>(null);
  const [extraSpin, setExtraSpin] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeBalance((v) => setBalance(v)), []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const referralCode = useMemo(() => {
    const uid = user?.uid || "guest";
    const slice = uid.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "MONEEB";
    return `MONEE-${slice}`;
  }, [user]);

  const lastSpinAt = useMemo(() => {
    try {
      const v = localStorage.getItem(SPIN_KEY);
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  }, [spinning]);

  const nextSpinIn = Math.max(0, 24 * 3600 * 1000 - (now - lastSpinAt));
  const canSpin = extraSpin || nextSpinIn === 0;

  function fmtCountdown(ms: number) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  }

  function spin() {
    if (spinning || !canSpin) return;
    setResult(null);
    setSpinning(true);
    const idx = Math.floor(Math.random() * REWARDS.length);
    const target = REWARDS[idx];
    const turns = 6;
    const finalDeg = turns * 360 + (360 - (idx * SEG_ANGLE + SEG_ANGLE / 2));
    setRotation((r) => r + finalDeg);
    setTimeout(() => {
      setSpinning(false);
      if (target === "JACKPOT") {
        setResult({ label: "JACKPOT", jackpot: true, amount: 0 });
        setExtraSpin(true);
      } else {
        const amt = target as number;
        creditWallet(amt, "Spin Reward", `You won ₦${amt.toLocaleString("en-NG")} from Spin & Earn.`);
        setResult({ label: `₦${amt.toLocaleString("en-NG")}`, jackpot: false, amount: amt });
      }
      if (!extraSpin) {
        try { localStorage.setItem(SPIN_KEY, String(Date.now())); } catch {}
      } else {
        setExtraSpin(false);
      }
    }, 4200);
  }

  function copyCode() {
    try {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  function shareCode() {
    const text = `Join me on MoneeBee — use my code ${referralCode} and we both earn rewards!`;
    if (navigator.share) {
      navigator.share({ title: "MoneeBee", text }).catch(() => {});
    } else {
      copyCode();
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .sp { font-family:'Poppins',sans-serif;
          background: linear-gradient(180deg,#000 0%, #14052e 45%, #2a0d5e 100%);
          width:100%; max-width:430px; min-height:100dvh; padding:20px 18px 60px; color:#fff; }
        .sp * { font-family:'Poppins',sans-serif; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(168,85,247,0.22);
          backdrop-filter: blur(18px) saturate(140%); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        @keyframes wheelGlow {
          0%,100% { box-shadow: 0 0 30px rgba(168,85,247,.55), 0 0 60px rgba(124,58,237,.4); }
          50%     { box-shadow: 0 0 46px rgba(168,85,247,.95), 0 0 90px rgba(124,58,237,.7); }
        }
        .wheel-glow { animation: wheelGlow 2.4s ease-in-out infinite; }
        .wheel-inner { transition: transform 4s cubic-bezier(0.15, 0.9, 0.2, 1); }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(360px) rotate(720deg); opacity: 0; }
        }
        .confetti { position:absolute; width:8px; height:12px; top:0;
          animation: confettiFall 1.6s ease-in forwards; }
      `}</style>

      <div className="sp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-purple-200" />
          </button>
          <div className="text-center">
            <p className="text-[17px] font-semibold leading-tight">Spin & Earn</p>
            <p className="text-[11.5px] text-white/55">Spin the wheel and win rewards</p>
          </div>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="History">
            <History size={18} className="text-purple-200" />
          </button>
        </div>

        {/* Balance */}
        <div
          className="mt-5 rounded-3xl p-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#2a0d5e,#4c1d95 55%,#7c3aed)", boxShadow: "0 12px 30px rgba(124,58,237,0.45)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-widest text-white/70">Wallet Balance</p>
              <button onClick={() => setHidden((h) => !h)} className="text-white/70">
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[22px] font-bold mt-1">
              {hidden ? "₦••••••" : formatNaira(balance)}
            </p>
            <p className="text-[10px] text-white/60 mt-1 tracking-widest">MONEEBEE</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow: "0 0 20px rgba(168,85,247,0.6)" }}>
            <Wallet size={26} className="text-white" />
          </div>
        </div>

        {/* Wheel */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative wheel-glow rounded-full" style={{ width: 300, height: 300 }}>
            {/* pointer */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20"
              style={{ top: -10, width: 0, height: 0,
                borderLeft: "14px solid transparent", borderRight: "14px solid transparent",
                borderTop: "22px solid #fde68a", filter: "drop-shadow(0 0 6px #fde68a)" }}
            />
            <div
              className="wheel-inner absolute inset-0 rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${REWARDS.map((r, i) => {
                  const colors = ["#7c3aed", "#a855f7", "#5b21b6", "#c084fc", "#4c1d95", "#8b5cf6", "#facc15", "#facc15"];
                  const from = i * SEG_ANGLE;
                  const to = (i + 1) * SEG_ANGLE;
                  return `${colors[i]} ${from}deg ${to}deg`;
                }).join(", ")})`,
                border: "4px solid rgba(255,255,255,0.15)",
              }}
            >
              {REWARDS.map((r, i) => {
                const rot = i * SEG_ANGLE + SEG_ANGLE / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `translate(-50%, -50%) rotate(${rot}deg) translateY(-105px) rotate(90deg)` }}
                  >
                    <span className="text-[11px] font-bold text-white whitespace-nowrap"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                      {typeof r === "number" ? `₦${r.toLocaleString()}` : r}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* center spin button */}
            <button
              onClick={spin}
              disabled={spinning || !canSpin}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full font-bold text-white z-10 disabled:opacity-60"
              style={{
                background: "radial-gradient(circle,#a855f7 0%,#7c3aed 60%,#4c1d95 100%)",
                boxShadow: "0 0 26px rgba(168,85,247,0.9), inset 0 0 12px rgba(255,255,255,0.25)",
                border: "3px solid rgba(255,255,255,0.35)",
              }}
            >
              <span className="block text-[16px]">{spinning ? "..." : "SPIN"}</span>
              <span className="block text-[9px] font-normal text-white/80 mt-0.5">Tap To Spin</span>
            </button>
          </div>
        </div>

        {/* Rules */}
        <div className="glass rounded-2xl p-4 mt-6">
          <p className="text-[12.5px] font-semibold">Spin Rules</p>
          <ul className="mt-2 text-[11.5px] text-white/70 space-y-1">
            <li>• Spin once every 24 hours</li>
            <li>• Come back daily and win more rewards</li>
          </ul>
          <div className="mt-3 flex items-center justify-between text-[11.5px]">
            <span className="text-white/60">Next free spin in</span>
            <span className="font-bold text-purple-200 tabular-nums">
              {canSpin ? "Available now" : fmtCountdown(nextSpinIn)}
            </span>
          </div>
        </div>

        {/* Referral */}
        <div className="glass rounded-2xl p-4 mt-4">
          <p className="text-[13px] font-semibold">Your Referral Code</p>
          <p className="text-[11px] text-white/55">Share your code and earn rewards</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 rounded-xl px-3 py-2.5 font-mono text-[14px] tracking-wider"
                 style={{ background: "rgba(30,10,60,0.6)", border: "1px solid rgba(168,85,247,0.35)" }}>
              {referralCode}
            </div>
            <button onClick={copyCode}
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)" }}>
              <Copy size={16} className={copied ? "text-emerald-300" : "text-purple-200"} />
            </button>
          </div>
          <p className="mt-3 text-[11.5px] text-emerald-300">Earn ₦10,000 for each successful referral</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={shareCode}
                    className="rounded-xl py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow: "0 0 14px rgba(168,85,247,0.5)" }}>
              <Share2 size={14} /> Share Code
            </button>
            <button onClick={shareCode}
                    className="glass rounded-xl py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 text-purple-200">
              <UserPlus size={14} /> Invite Friends
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/50 mt-5">
          ✨ More Spins • More Rewards • More Wins ✨
        </p>

        {/* Result popup */}
        {result && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={() => setResult(null)}
          >
            {result.jackpot && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span
                    key={i}
                    className="confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      background: ["#a855f7", "#facc15", "#10b981", "#f472b6"][i % 4],
                      animationDelay: `${Math.random() * 0.6}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              className="relative rounded-3xl p-6 w-full max-w-[320px] text-center"
              style={{ background: "linear-gradient(180deg,#1a0938,#0a0014)", border: "1px solid rgba(168,85,247,0.5)", boxShadow: "0 0 40px rgba(168,85,247,0.6)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {result.jackpot ? (
                <>
                  <p className="text-[26px]">🎉</p>
                  <p className="text-[18px] font-extrabold mt-1">JACKPOT WON!</p>
                  <p className="text-[12.5px] text-white/70 mt-1">You have unlocked: EXTRA SPIN</p>
                  <p className="text-[11.5px] text-white/60 mt-1">You have received 1 additional free spin.</p>
                  <button
                    onClick={() => setResult(null)}
                    className="mt-4 w-full py-3 rounded-2xl font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow: "0 0 20px rgba(168,85,247,0.6)" }}
                  >
                    Claim Extra Spin
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[22px]">🎊</p>
                  <p className="text-[16px] font-semibold mt-1">You Won</p>
                  <p className="text-[30px] font-extrabold mt-1"
                     style={{ textShadow: "0 0 20px rgba(216,180,254,0.9)" }}>
                    {result.label}
                  </p>
                  <p className="text-[11.5px] text-emerald-300 mt-2">Credited to your wallet</p>
                  <button
                    onClick={() => setResult(null)}
                    className="mt-4 w-full py-3 rounded-2xl font-semibold text-white"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow: "0 0 20px rgba(168,85,247,0.6)" }}
                  >
                    Awesome
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
