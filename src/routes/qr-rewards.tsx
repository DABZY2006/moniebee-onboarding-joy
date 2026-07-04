import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, History, QrCode, Gift, Wallet, ScanLine, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/qr-rewards")({
  head: () => ({ meta: [{ title: "QR Rewards — Moniebee" }] }),
  component: QRRewardsPage,
});

function QRRewardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  const qrValue = useMemo(() => {
    const uid = user?.uid || "guest";
    return `moniebee://user/${uid}?reward=4500`;
  }, [user]);

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .qr { font-family:'Poppins',sans-serif;
          background: linear-gradient(180deg,#000 0%, #14052e 45%, #2a0d5e 100%);
          width:100%; max-width:430px; min-height:100dvh; padding:20px 18px 60px; color:#fff; }
        .qr * { font-family:'Poppins',sans-serif; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(168,85,247,0.22);
          backdrop-filter: blur(18px) saturate(140%); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 20px rgba(168,85,247,.5), 0 12px 30px rgba(124,58,237,.4); }
          50%     { box-shadow: 0 0 34px rgba(168,85,247,.9), 0 16px 40px rgba(124,58,237,.7); }
        }
        .glow { animation: pulseGlow 2.4s ease-in-out infinite; }
        @keyframes floatY { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-6px);} }
        .float { animation: floatY 3s ease-in-out infinite; }
      `}</style>

      <div className="qr">
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
            <p className="text-[17px] font-semibold leading-tight">QR Rewards</p>
            <p className="text-[11.5px] text-white/55">Scan and earn rewards</p>
          </div>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="History">
            <History size={18} className="text-purple-200" />
          </button>
        </div>

        {/* Hero card */}
        <div
          className="mt-5 rounded-3xl p-5 relative overflow-hidden glow"
          style={{ background: "linear-gradient(135deg,#2a0d5e 0%,#4c1d95 55%,#7c3aed 100%)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/70">Scan & Earn</p>
              <p
                className="text-[34px] font-extrabold mt-1 leading-none"
                style={{ textShadow: "0 0 22px rgba(216,180,254,0.9)" }}
              >
                ₦4,500
              </p>
              <p className="text-[12px] text-white/75 mt-2 leading-snug">
                Scan another user's QR code and earn instant rewards
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-[10.5px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ShieldCheck size={11} /> Secure • Fast • Trusted
              </span>
            </div>
            <div className="float w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                 style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <QrCode size={44} className="text-white" />
            </div>
          </div>
        </div>

        {/* How it works */}
        <p className="text-[13px] font-semibold mt-6 mb-2.5">How It Works</p>
        <div className="space-y-2.5">
          {[
            { i: <ScanLine size={16} />, t: "Scan another MoneeBee user's QR code", n: 1 },
            { i: <Gift size={16} />, t: "If the QR code is valid and you haven't scanned before", n: 2 },
            { i: <Wallet size={16} />, t: "You earn ₦4,500 instantly in your wallet", n: 3 },
          ].map((s) => (
            <div key={s.n} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-200"
                    style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                {s.i}
              </span>
              <p className="text-[12.5px] flex-1">{s.t}</p>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                    style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow: "0 0 12px rgba(168,85,247,0.6)" }}>
                {s.n}
              </span>
            </div>
          ))}
        </div>

        {/* Reward rules */}
        <p className="text-[13px] font-semibold mt-6 mb-2.5">Reward Rules</p>
        <div className="glass rounded-2xl p-4 space-y-2">
          {[
            "You can earn ₦4,500 for each valid QR code",
            "You can only scan a user's QR code once",
            "Invalid, expired or duplicate scans will not be rewarded",
            "Rewards are credited instantly to your wallet",
          ].map((r) => (
            <div key={r} className="flex items-start gap-2 text-[12px] text-white/80">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowQR(true)}
          className="glow w-full mt-6 py-4 rounded-2xl text-white text-[15px] font-semibold flex flex-col items-center"
          style={{ background: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 55%,#4c1d95 100%)" }}
        >
          <span>Generate QR Code</span>
          <span className="text-[11px] font-normal text-white/70 mt-0.5">Tap to generate your QR code</span>
        </button>

        {/* QR Modal */}
        {showQR && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowQR(false)}
          >
            <div
              className="relative rounded-3xl p-6 w-full max-w-[340px]"
              style={{ background: "linear-gradient(180deg,#1a0938,#0a0014)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/70"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <p className="text-center text-[15px] font-semibold">Your MoneeBee QR</p>
              <p className="text-center text-[11px] text-white/55 mt-0.5">Show this code to earn ₦4,500</p>
              <div className="mt-4 bg-white p-3 rounded-2xl flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=1&data=${encodeURIComponent(qrValue)}`}
                  alt="MoneeBee QR"
                  width={260}
                  height={260}
                />
              </div>
              <p className="mt-3 text-center text-[10.5px] text-white/50 break-all">{qrValue}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
