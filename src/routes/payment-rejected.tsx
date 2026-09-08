import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, X, LifeBuoy } from "lucide-react";
import { currentIdentity, loadSettings } from "@/lib/app-sync";
import { getPaymentStatus } from "@/lib/public.functions";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/payment-rejected")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Rejected — Moneebee" },
      {
        name: "description",
        content: "Your Moneebee payment could not be approved. Review the details or contact support.",
      },
      { property: "og:title", content: "Payment Rejected — Moneebee" },
      { property: "og:description", content: "Payment could not be approved. Contact Moneebee support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PaymentRejectedPage />
    </RequireAuth>
  ),
});

function PaymentRejectedPage() {
  const navigate = useNavigate();
  const { ref } = Route.useSearch();
  const [note, setNote] = useState<string | null>(null);
  const [support, setSupport] = useState<string>("https://wa.me/2348000000000");

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
      try {
        const { support: links } = await loadSettings();
        const url = links?.whatsapp || links?.telegram;
        if (alive && url) setSupport(url);
      } catch {}
      if (!reference) return;
      try {
        const me = currentIdentity();
        const res = await getPaymentStatus({ data: { external_uid: me.uid, reference } });
        if (alive && res.found) setNote(res.review_note ?? null);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [reference]);

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(248,113,113,.28);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-up{animation:fadeUp .5s ease-out both}
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
          <div
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-5"
            style={{ background: "radial-gradient(circle at 30% 30%, #f87171, #7f1d1d 70%)" }}
          >
            <X size={40} />
          </div>
          <h2 className="text-[22px] font-extrabold text-red-300">✕ Payment Rejected</h2>
          <p className="text-[13px] text-white/65 mt-2 px-2">
            Your payment could not be approved. Please review the payment details or contact support.
          </p>
        </div>

        <div className="glass rounded-2xl p-4 mt-7 fade-up" style={{ animationDelay: ".1s" }}>
          <div className="flex items-start justify-between gap-3 py-2.5 border-b border-white/8">
            <span className="text-[12px] text-white/55 shrink-0">Transaction reference</span>
            <span className="text-[12.5px] font-semibold text-right break-all tracking-wider">
              {reference || "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3 py-2.5">
            <span className="text-[12px] text-white/55 shrink-0">Reason</span>
            <span className="text-[12.5px] font-semibold text-right break-words">
              {note ?? "Not provided"}
            </span>
          </div>
        </div>

        <a
          href={support}
          target="_blank"
          rel="noreferrer"
          className="w-full mt-6 py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED,#4C1D95)" }}
        >
          <LifeBuoy size={17} /> Contact Support
        </a>

        <button
          onClick={() => navigate({ to: "/payment" })}
          className="w-full mt-3 py-3.5 rounded-2xl text-[14px] font-semibold bg-white/8 border border-white/15"
        >
          Resubmit payment
        </button>
      </div>
    </div>
  );
}
