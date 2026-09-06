import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Hourglass, ArrowLeft, FileCheck2, RefreshCw, Check } from "lucide-react";
import { currentIdentity } from "@/lib/app-sync";
import { getPaymentStatus } from "@/lib/public.functions";

export const Route = createFileRoute("/payment-review")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Under Review — Moneebee" },
      {
        name: "description",
        content: "Track your Moneebee payment while our team reviews your uploaded receipt.",
      },
      { property: "og:title", content: "Payment Under Review — Moneebee" },
      {
        property: "og:description",
        content: "Your Moneebee payment is pending review. Follow its status live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentReviewPage,
});

type Status = Awaited<ReturnType<typeof getPaymentStatus>>;

const money = (n: number, c = "NGN") =>
  `${c === "NGN" ? "₦" : ""}${n.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

function PaymentReviewPage() {
  const navigate = useNavigate();
  const { ref } = Route.useSearch();
  const [state, setState] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);

  const reference = (() => {
    if (ref) return ref;
    try {
      return localStorage.getItem("moniebee_payment_ref") ?? "";
    } catch {
      return "";
    }
  })();

  const load = async () => {
    if (!reference) return;
    setChecking(true);
    try {
      const me = currentIdentity();
      const res = await getPaymentStatus({ data: { external_uid: me.uid, reference } });
      setState(res);
      if (res.found && res.status === "rejected") {
        navigate({ to: "/payment-rejected", search: { ref: reference } });
      }
    } catch {
      /* keep last known state */
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 6000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const approved = state?.found === true && state.status === "approved";

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 24px rgba(168,85,247,.55)} 50%{box-shadow:0 0 48px rgba(168,85,247,.95)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.28);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-up{animation:fadeUp .5s ease-out both}
        .ring-spin{animation:spinSlow 9s linear infinite}
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
          <h1 className="text-[19px] font-bold">Payment Status</h1>
        </div>

        <div className="text-center fade-up">
          <div className="relative mx-auto w-28 h-28 mb-5">
            <div
              className="ring-spin absolute inset-0 rounded-full"
              style={{
                border: "2px dashed rgba(196,181,253,.6)",
              }}
            />
            <div
              className="glow absolute inset-3 rounded-full flex items-center justify-center"
              style={{
                background: approved
                  ? "radial-gradient(circle at 30% 30%, #34d399, #065f46 70%)"
                  : "radial-gradient(circle at 30% 30%, #a855f7, #4c1d95 70%)",
              }}
            >
              {approved ? <Check size={40} /> : <Hourglass size={34} />}
            </div>
          </div>

          {approved ? (
            <>
              <h2 className="text-[22px] font-extrabold text-emerald-300">✓ Payment Approved</h2>
              <p className="text-[13px] text-white/65 mt-2">
                Your payment has been reviewed and approved.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[22px] font-extrabold">⏳ Payment Under Review</h2>
              <p className="text-[13px] text-white/65 mt-2 px-2">
                Your payment has been submitted and is currently being reviewed. Please wait for
                confirmation.
              </p>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-4 mt-7 fade-up" style={{ animationDelay: ".1s" }}>
          <Row label="Transaction reference" value={reference || "—"} mono />
          <Row
            label="Amount"
            value={state?.found ? money(state.amount, state.currency) : "—"}
          />
          <Row
            label="Submitted"
            value={
              state?.found ? new Date(state.created_at).toLocaleString("en-NG") : "—"
            }
          />
          <Row
            label="Receipt"
            value={state?.found && state.receipt_attached ? "Attached ✓" : "Not attached"}
          />
          <Row
            label="Current status"
            value={
              !state
                ? "Loading…"
                : !state.found
                  ? "Not found"
                  : state.status === "pending"
                    ? "Pending Review"
                    : state.status === "approved"
                      ? "Approved"
                      : "Rejected"
            }
            last
          />
        </div>

        {approved ? (
          <button
            onClick={() => navigate({ to: "/moneebee-code", search: { ref: reference } })}
            className="glow w-full py-4 rounded-2xl text-[15px] font-bold mt-6"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
          >
            View MONEEBEE Code
          </button>
        ) : (
          <>
            <button
              onClick={() => void load()}
              disabled={checking}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold mt-6 bg-white/8 border border-white/15 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
              {checking ? "Checking status…" : "Refresh status"}
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-white/45 mt-4">
              <FileCheck2 size={13} className="text-purple-300" />
              This page updates automatically once an admin reviews your payment.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-2.5 ${last ? "" : "border-b border-white/8"}`}
    >
      <span className="text-[12px] text-white/55 shrink-0">{label}</span>
      <span
        className={`text-[12.5px] font-semibold text-right break-all ${mono ? "tracking-wider" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
