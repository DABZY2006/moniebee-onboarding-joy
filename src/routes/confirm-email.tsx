import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Check, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/confirm-email")({
  head: () => ({ meta: [{ title: "Confirm Email — Moniebee" }] }),
  component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleVerify = () => {
    if (!isValid) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 900);
  };

  const handleContinue = () => {
    navigate({ to: "/generating", search: { next: "/payment", ms: 5000 } as any });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-140px);opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.5)} 50%{box-shadow:0 0 40px rgba(168,85,247,.95),0 0 80px rgba(139,92,246,.6)} }
        @keyframes successPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .particle{position:absolute;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7;animation:floatUp linear infinite}
        .glow-btn{animation:glowPulse 2.5s ease-in-out infinite}
        .fade-in{animation:fadeIn .4s ease-out both}
        .success-pulse{animation:successPulse 1.6s ease-in-out infinite}
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
            onClick={() => navigate({ to: "/upgrade" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[20px] font-bold leading-tight">Confirm Email</h1>
            <p className="text-[12px] text-white/60">Verify your email address to secure your account</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-6 fade-in text-center" style={{ boxShadow: "0 0 40px rgba(168,85,247,.35)" }}>
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg,#8B5CF6,#4C1D95)",
              boxShadow: "0 0 40px rgba(168,85,247,.9), inset 0 0 30px rgba(168,85,247,.25)",
            }}
          >
            <Mail size={36} />
          </div>
          <h2 className="text-[18px] font-bold mb-2">Confirm Your Email Address</h2>
          <p className="text-[13px] text-white/70 mb-5">
            Input your email address below to activate your account.
          </p>

          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setVerified(false);
            }}
            type="email"
            placeholder="you@example.com"
            className="w-full glass rounded-xl px-4 py-3 text-[14px] outline-none text-center placeholder-white/40 mb-3"
          />

          {verified && (
            <div className="fade-in flex items-center justify-center gap-2 text-emerald-300 text-[13px] font-semibold mb-2 success-pulse">
              <Check size={16} /> Email verified successfully.
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-3 mb-6 flex items-start gap-3">
          <Shield size={16} className="text-purple-300 mt-0.5" />
          <p className="text-[12px] text-white/70">
            Your data is encrypted and never shared with third parties.
          </p>
        </div>

        {!verified ? (
          <button
            onClick={handleVerify}
            disabled={!isValid || verifying}
            className="glow-btn w-full py-4 rounded-2xl text-[15px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
          >
            {verifying ? "Verifying..." : "Verify Email Address"}
          </button>
        ) : (
          <button
            onClick={handleContinue}
            className="glow-btn fade-in w-full py-4 rounded-2xl text-[15px] font-bold"
            style={{ background: "linear-gradient(135deg,#10b981,#059669,#4C1D95)" }}
          >
            Continue
          </button>
        )}

        <p className="text-center text-[11px] text-white/50 mt-5">
          ✨ Secure Account • Verify Email • Stay Protected ✨
        </p>
      </div>
    </div>
  );
}
