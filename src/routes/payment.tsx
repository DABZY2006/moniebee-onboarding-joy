import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Wallet, Copy, Check, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Payment — Moniebee" }] }),
  component: PaymentPage,
});

const ACCOUNT = {
  bank: "OPAY",
  number: "8166227350",
  name: "USMAN-NURUDEEN-USMAN",
};

function PaymentPage() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<"num" | "name" | null>(null);

  let upgrade: { name?: string; price?: number } = {};
  try {
    upgrade = JSON.parse(localStorage.getItem("moniebee_upgrade") ?? "{}");
  } catch {}

  const copy = async (v: string, k: "num" | "name") => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(k);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  const handlePaid = () => {
    navigate({ to: "/generating", search: { next: "/payment-success", ms: 10000 } as any });
  };

  const handleContinue = () => {
    toast.success("Welcome to MONEEBEE 🎉", {
      description: "Your account has been activated successfully.",
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-140px);opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.5)} 50%{box-shadow:0 0 40px rgba(168,85,247,.95),0 0 80px rgba(139,92,246,.6)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(.85)} 100%{opacity:1;transform:scale(1)} }
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
            onClick={() => navigate({ to: "/confirm-email" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold leading-tight">Payment</h1>
            <p className="text-[12px] text-white/60">Complete your payment to continue</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            100% Secure
          </span>
        </div>

        {/* Wallet icon card */}
        <div className="glass rounded-2xl p-5 mb-5 text-center fade-in" style={{ boxShadow: "0 0 30px rgba(168,85,247,.35)" }}>
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg,#8B5CF6,#4C1D95)",
              boxShadow: "0 0 40px rgba(168,85,247,.9), inset 0 0 30px rgba(168,85,247,.25)",
            }}
          >
            <Wallet size={36} />
          </div>
          <h2 className="text-[18px] font-bold mb-1">Make Payment</h2>
          <p className="text-[12px] text-white/70">
            Transfer the exact amount to the account details below to activate your account.
          </p>
          {upgrade?.price ? (
            <div className="mt-3 inline-block px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[13px] font-semibold text-purple-200">
              {upgrade.name}: ₦{upgrade.price.toLocaleString("en-NG")}
            </div>
          ) : null}
        </div>

        <div className="glass rounded-xl p-3 mb-4">
          <p className="text-[12px] text-white/70">
            Send the exact amount to the account below using Opay transfer.
          </p>
        </div>

        {/* Account details */}
        <div
          className="glass rounded-2xl p-4 mb-6"
          style={{ boxShadow: "0 0 30px rgba(168,85,247,.4)", borderColor: "rgba(168,85,247,.5)" }}
        >
          <div className="text-[11px] font-semibold text-purple-300 tracking-wider mb-3">
            PAYMENT ACCOUNT DETAILS
          </div>

          <div className="mb-3">
            <div className="text-[11px] text-white/60">Bank Name</div>
            <div className="text-[15px] font-bold">{ACCOUNT.bank}</div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-white/60">Account Number</div>
              <div className="text-[17px] font-bold tracking-wider">{ACCOUNT.number}</div>
            </div>
            <button
              onClick={() => copy(ACCOUNT.number, "num")}
              className="shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-400/40 hover:bg-purple-500/30"
            >
              {copied === "num" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "num" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-white/60">Account Name</div>
              <div className="text-[14px] font-bold truncate">{ACCOUNT.name}</div>
            </div>
            <button
              onClick={() => copy(ACCOUNT.name, "name")}
              className="shrink-0 flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-400/40 hover:bg-purple-500/30"
            >
              {copied === "name" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "name" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <button
          onClick={handlePaid}
          disabled={verifying}
          className="glow-btn w-full py-4 rounded-2xl text-[15px] font-bold disabled:opacity-70"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
        >
          I Have Made The Payment
          <div className="text-[11px] font-normal text-white/80 mt-1">Verify Payment Now</div>
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/50">
          <ShieldCheck size={13} className="text-purple-300" />
          Your payment is protected with 256-bit SSL encryption.
        </div>
      </div>

      {/* Verifying modal */}
      {verifying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-8 text-center max-w-xs w-full pop-in" style={{ boxShadow: "0 0 60px rgba(168,85,247,.7)" }}>
            <Loader2 size={44} className="mx-auto text-purple-300 animate-spin mb-4" />
            <div className="text-[16px] font-bold">Verifying Payment...</div>
            <div className="text-[12px] text-white/60 mt-1">Please wait a moment</div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="glass rounded-2xl p-7 text-center max-w-sm w-full pop-in" style={{ boxShadow: "0 0 60px rgba(16,185,129,.5)" }}>
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg,#10b981,#059669)",
                boxShadow: "0 0 30px rgba(16,185,129,.7)",
              }}
            >
              <Check size={30} />
            </div>
            <div className="text-[11px] font-bold text-emerald-300 tracking-wider mb-2">
              ✅ PAYMENT RECEIVED
            </div>
            <div className="text-[14px] text-white/80 mb-1">
              Your payment has been successfully verified.
            </div>
            <div className="text-[13px] font-semibold text-purple-200 mb-5">
              Account Activated Successfully.
            </div>
            <button
              onClick={handleContinue}
              className="glow-btn w-full py-3 rounded-xl text-[14px] font-bold"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
