import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check, ShieldCheck, Loader2 } from "lucide-react";
import { currentIdentity } from "@/lib/app-sync";
import { getPaymentStatus } from "@/lib/public.functions";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/moneebee-code")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "MONEEBEE Code — Withdrawal Activation" },
      {
        name: "description",
        content: "Your one-time MONEEBEE code for withdrawal activation after payment approval.",
      },
      { property: "og:title", content: "MONEEBEE Code — Withdrawal Activation" },
      {
        property: "og:description",
        content: "Copy your approved MONEEBEE activation code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MoneebeeCodePage />
    </RequireAuth>
  ),
});

function MoneebeeCodePage() {
  const navigate = useNavigate();
  const { ref } = Route.useSearch();
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "pending" | "missing">("loading");
  const [copied, setCopied] = useState(false);

  const reference = (() => {
    if (ref) return ref;
    try {
      return localStorage.getItem("moniebee_payment_ref") ?? "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!reference) {
        setState("missing");
        return;
      }
      try {
        const me = currentIdentity();
        const res = await getPaymentStatus({ data: { external_uid: me.uid, reference } });
        if (!alive) return;
        if (!res.found) setState("missing");
        else if (res.status === "approved" && res.moneebee_code) {
          setCode(res.moneebee_code);
          setState("ready");
          try {
            localStorage.setItem("moniebee_moneebee_code", res.moneebee_code);
          } catch {}
        } else setState("pending");
      } catch {
        if (alive) setState("pending");
      }
    })();
    return () => {
      alive = false;
    };
  }, [reference]);

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("MONEEBEE code copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 24px rgba(168,85,247,.55)} 50%{box-shadow:0 0 52px rgba(168,85,247,.95)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.3);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-up{animation:fadeUp .5s ease-out both}
        .glow{animation:glowPulse 2.6s ease-in-out infinite}
      `}</style>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[19px] font-bold">Activation</h1>
        </div>

        <div className="text-center fade-up">
          <h2
            className="text-[26px] font-extrabold tracking-wide"
            style={{
              backgroundImage: "linear-gradient(135deg,#e9d5ff,#a855f7,#7c3aed)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            MONEEBEE CODE
          </h2>
        </div>

        <div
          className="glass glow rounded-2xl p-6 mt-7 text-center fade-up"
          style={{ animationDelay: ".1s" }}
        >
          {state === "loading" && (
            <div className="py-4">
              <Loader2 size={30} className="mx-auto animate-spin text-purple-300" />
              <p className="text-[12px] text-white/55 mt-3">Loading your code…</p>
            </div>
          )}

          {state === "ready" && code && (
            <>
              <div className="text-[26px] font-extrabold tracking-[.18em] break-all">{code}</div>
              <p className="text-[12px] text-white/60 mt-3 px-2">
                This is your one-time MONEEBEE code for withdrawal activation.
              </p>
              <button
                onClick={copy}
                className="w-full mt-5 py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </>
          )}

          {state === "pending" && (
            <>
              <div className="text-[15px] font-bold">Not available yet</div>
              <p className="text-[12px] text-white/60 mt-2">
                Your code appears here once an admin approves your payment.
              </p>
              <button
                onClick={() =>
                  navigate({ to: "/payment-review", search: reference ? { ref: reference } : {} })
                }
                className="w-full mt-5 py-3 rounded-xl text-[13px] font-semibold bg-white/8 border border-white/15"
              >
                View payment status
              </button>
            </>
          )}

          {state === "missing" && (
            <>
              <div className="text-[15px] font-bold">No approved transaction found</div>
              <p className="text-[12px] text-white/60 mt-2">
                Submit your upgrade payment to receive a MONEEBEE code.
              </p>
              <button
                onClick={() => navigate({ to: "/upgrade" })}
                className="w-full mt-5 py-3 rounded-xl text-[13px] font-semibold bg-white/8 border border-white/15"
              >
                Go to Upgrade
              </button>
            </>
          )}
        </div>

        {reference ? (
          <div className="text-[11px] text-white/40 text-center mt-4">
            Transaction reference: <span className="tracking-wider">{reference}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-2 text-[11px] text-white/45 mt-6">
          <ShieldCheck size={13} className="text-purple-300" />
          Your code is unique to your account and never shared.
        </div>
      </div>
    </div>
  );
}
