import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Phone, CheckCircle2, KeyRound } from "lucide-react";
import {
  getBalance,
  debitWallet,
  subscribeBalance,
  getTransactions,
  formatNaira,
  MONEE_CODE,
  type Tx,
} from "@/lib/transactions";


export const Route = createFileRoute("/airtime")({
  head: () => ({
    meta: [{ title: "Buy Airtime — Moniebee" }],
  }),
  component: AirtimePage,
});

const NETWORKS = [
  { id: "mtn", name: "MTN", color: "#FFCC00", text: "#111" },
  { id: "airtel", name: "Airtel", color: "#E60000", text: "#fff" },
  { id: "glo", name: "Glo", color: "#00A651", text: "#fff" },
  { id: "9mobile", name: "9mobile", color: "#0F9D58", text: "#fff" },
];

const QUICK = [100, 200, 500, 1000, 2000, 5000];

function AirtimePage() {
  const navigate = useNavigate();
  const [net, setNet] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [balance, setBal] = useState(160000);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Tx[]>([]);

  useEffect(() => {
    setBal(getBalance());
    setRecent(getTransactions().filter((t) => t.title.startsWith("Airtime")).slice(0, 5));
  }, []);

  const amt = useMemo(() => parseInt(amount || "0", 10) || 0, [amount]);

  async function buy() {
    setError(null);
    if (!/^\d{10,11}$/.test(phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    if (amt < 50) {
      setError("Minimum amount is ₦50.");
      return;
    }
    if (amt > balance) {
      setError("Insufficient balance.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    const newBal = balance - amt;
    setBalance(newBal);
    setBal(newBal);
    const netName = NETWORKS.find((n) => n.id === net)?.name ?? "";
    addTransaction({
      type: "withdrawal",
      title: `Airtime — ${netName}`,
      message: `₦${amt.toLocaleString("en-NG")} airtime to ${phone} successful.`,
      amount: amt,
      status: "successful",
    });
    setRecent(getTransactions().filter((t) => t.title.startsWith("Airtime")).slice(0, 5));
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .a { font-family:'Poppins',sans-serif;
          background: linear-gradient(180deg,#0a0014 0%, #1a0938 40%, #2a0d5e 100%);
          width:100%; max-width:430px; min-height:100dvh; padding:20px 18px 40px; color:#fff; }
        .a * { font-family:'Poppins',sans-serif; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(168,85,247,0.2);
          backdrop-filter: blur(18px) saturate(140%); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .field { background: rgba(30,10,60,0.5); border:1px solid rgba(168,85,247,0.25);
          border-radius: 14px; padding: 12px 14px; display:flex; align-items:center; gap:10px; }
        .field:focus-within { border-color: rgba(168,85,247,0.7); box-shadow: 0 0 0 4px rgba(168,85,247,0.15); }
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 0 20px rgba(168,85,247,.55), 0 10px 30px rgba(124,58,237,.45); }
          50%     { box-shadow: 0 0 34px rgba(168,85,247,.9), 0 14px 40px rgba(124,58,237,.7); }
        }
        .btn-glow { animation: btnPulse 2.4s ease-in-out infinite; }
      `}</style>

      <div className="a">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-purple-200" />
          </button>
          <div>
            <p className="text-[18px] font-semibold leading-tight">Buy Airtime</p>
            <p className="text-[12px] text-white/55">Recharge any network instantly</p>
          </div>
        </div>

        {/* Balance card */}
        <div
          className="mt-5 rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#a855f7 100%)",
            boxShadow: "0 12px 30px rgba(124,58,237,0.45)",
          }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/70">Available Balance</p>
            <p className="text-[22px] font-bold mt-1">{formatNaira(balance)}</p>
          </div>
          <Phone size={28} className="text-white/80" />
        </div>

        {/* Networks */}
        <p className="text-[12px] text-white/60 mt-5 mb-2 ml-1">Select Network</p>
        <div className="grid grid-cols-4 gap-2">
          {NETWORKS.map((n) => {
            const active = net === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setNet(n.id)}
                className="glass rounded-2xl py-3 flex flex-col items-center gap-1.5"
                style={active ? { borderColor: "rgba(168,85,247,0.9)", boxShadow: "0 0 18px rgba(168,85,247,0.5)" } : {}}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: n.color, color: n.text }}
                >
                  {n.name.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-[10.5px] text-white/80">{n.name}</span>
              </button>
            );
          })}
        </div>

        {/* Phone */}
        <p className="text-[12px] text-white/60 mt-5 mb-1.5 ml-1">Phone Number</p>
        <div className="field">
          <Phone size={16} className="text-purple-300/80" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="Enter phone number"
            inputMode="numeric"
            className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
          />
        </div>

        {/* Amount */}
        <p className="text-[12px] text-white/60 mt-4 mb-1.5 ml-1">Amount</p>
        <div className="field">
          <span className="text-purple-300/80 text-[14px]">₦</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
            placeholder="Enter amount"
            inputMode="numeric"
            className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="glass rounded-xl py-2 text-[12.5px] font-medium text-white/85"
              style={amt === q ? { borderColor: "rgba(168,85,247,0.8)", boxShadow: "0 0 14px rgba(168,85,247,0.45)" } : {}}
            >
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-[12px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={buy}
          disabled={loading || done}
          className="btn-glow w-full mt-5 py-3.5 rounded-2xl text-white text-[15px] font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 55%,#4c1d95 100%)" }}
        >
          {loading ? "Processing..." : done ? (
            <>
              <CheckCircle2 size={18} className="text-emerald-300" /> Purchase Successful
            </>
          ) : "Buy Airtime"}
        </button>

        {/* Recent */}
        {recent.length > 0 && (
          <>
            <p className="text-[13px] font-semibold mt-7 mb-2">Recent Transactions</p>
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{r.title}</p>
                    <p className="text-[11px] text-white/55">{r.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-red-300">-₦{r.amount.toLocaleString("en-NG")}</p>
                    <p className="text-[10px] uppercase text-emerald-300 font-semibold tracking-wider">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="text-[12px] text-purple-300">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
