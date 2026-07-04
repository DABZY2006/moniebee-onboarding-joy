import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Wallet,
  Landmark,
  Bitcoin,
  Smartphone,
  CreditCard,
  KeyRound,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import {
  getBalance,
  subscribeBalance,
  debitWallet,
  formatNaira,
  MONEE_CODE,
} from "@/lib/transactions";

export const Route = createFileRoute("/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — Moniebee" }] }),
  component: WithdrawPage,
});

const METHODS = [
  { id: "bank", label: "Bank Transfer", icon: <Landmark size={18} /> },
  { id: "usdt", label: "USDT (TRC20)", icon: <Bitcoin size={18} /> },
  { id: "opay", label: "Opay", icon: <Smartphone size={18} /> },
  { id: "moniepoint", label: "Moniepoint", icon: <CreditCard size={18} /> },
  { id: "other", label: "Other Wallet", icon: <Wallet size={18} /> },
];

const BANKS = [
  "Access Bank",
  "Access Bank (Diamond)",
  "ALAT by Wema",
  "Bowen Microfinance Bank",
  "Carbon",
  "CEMCS Microfinance Bank",
  "Citibank Nigeria",
  "Coronation Merchant Bank",
  "Ecobank Nigeria",
  "Ekondo Microfinance Bank",
  "Fidelity Bank",
  "FCMB (First City Monument Bank)",
  "First Bank of Nigeria",
  "FBNQuest Merchant Bank",
  "FSDH Merchant Bank",
  "Globus Bank",
  "GoMoney",
  "GTBank (Guaranty Trust Bank)",
  "Hackman Microfinance Bank",
  "Hasal Microfinance Bank",
  "Heritage Bank",
  "Jaiz Bank",
  "Kayvee Microfinance Bank",
  "Keystone Bank",
  "Kuda Microfinance Bank",
  "Lagos Building Investment Company",
  "Mint MFB",
  "Moniepoint MFB",
  "MTN MoMo PSB",
  "9mobile 9Payment SB",
  "NPF Microfinance Bank",
  "OneFinance (Onebank)",
  "Opay",
  "Palmpay",
  "Parallex Bank",
  "Paycom (Opay)",
  "Petra Microfinance Bank",
  "Polaris Bank",
  "Providus Bank",
  "Rand Merchant Bank",
  "Rubies MFB",
  "Sparkle Microfinance Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Suntrust Bank",
  "TAJ Bank",
  "TCF MFB",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "VFD Microfinance Bank",
  "Wema Bank",
  "Zenith Bank",
  "Eyowo",
];

const QUICK = [1000, 5000, 10000, 20000];

function WithdrawPage() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(() => getBalance());
  const [hidden, setHidden] = useState(false);
  const [method, setMethod] = useState("bank");
  const [bank, setBank] = useState("");
  const [acct, setAcct] = useState("");
  const [acctName, setAcctName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeBalance((v) => setBalance(v)), []);

  const amt = useMemo(() => parseInt(amount || "0", 10) || 0, [amount]);

  function verifyCode() {
    setCodeStatus(code.trim().toUpperCase() === MONEE_CODE ? "ok" : "bad");
  }

  async function withdraw() {
    setError(null);
    if (method === "bank" && (!bank || !acct || !acctName.trim())) {
      setError("Select bank and enter account number & name.");
      return;
    }
    if (amt < 100) {
      setError("Minimum withdrawal is ₦100.");
      return;
    }
    if (codeStatus !== "ok") {
      setError("Verify a valid MONEE CODE to continue.");
      return;
    }
    if (amt > balance) {
      setError("Insufficient balance.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    const dest =
      method === "bank"
        ? `${bank} • ${acct}`
        : METHODS.find((m) => m.id === method)?.label ?? "";
    const res = debitWallet(
      amt,
      `Withdrawal — ${METHODS.find((m) => m.id === method)?.label}`,
      `₦${amt.toLocaleString("en-NG")} withdrawn to ${dest}.`,
    );
    setLoading(false);
    if (res === null) {
      setError("Insufficient balance.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1400);
  }

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .w { font-family:'Poppins',sans-serif;
          background: linear-gradient(180deg,#000 0%, #14052e 45%, #2a0d5e 100%);
          width:100%; max-width:430px; min-height:100dvh; padding:20px 18px 40px; color:#fff; }
        .w * { font-family:'Poppins',sans-serif; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(168,85,247,0.22);
          backdrop-filter: blur(18px) saturate(140%); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .field { background: rgba(30,10,60,0.5); border:1px solid rgba(168,85,247,0.25);
          border-radius: 14px; padding: 12px 14px; display:flex; align-items:center; gap:10px; }
        .field:focus-within { border-color: rgba(168,85,247,0.7); box-shadow: 0 0 0 4px rgba(168,85,247,0.15); }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(168,85,247,.55); } 50% { box-shadow: 0 0 34px rgba(168,85,247,.9); } }
        .glow { animation: glow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="w">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-purple-200" />
          </button>
          <div>
            <p className="text-[18px] font-semibold leading-tight">Withdraw</p>
            <p className="text-[12px] text-white/55">Withdraw your earnings securely</p>
          </div>
        </div>

        {/* Balance card */}
        <div
          className="mt-5 rounded-3xl p-5 flex items-center justify-between relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#2a0d5e 0%,#4c1d95 55%,#7c3aed 100%)",
            boxShadow: "0 14px 40px rgba(124,58,237,0.45)",
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-widest text-white/70">Available Balance</p>
              <button onClick={() => setHidden((h) => !h)} className="text-white/70">
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[22px] font-bold mt-1">
              {hidden ? "₦••••••" : formatNaira(balance)}
            </p>
            <p className="text-[11px] text-white/60 mt-2">Withdrawable Balance</p>
            <p className="text-[14px] font-semibold text-emerald-300">
              {hidden ? "₦••••••" : formatNaira(balance)}
            </p>
          </div>
          <div className="glow w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
            <Wallet size={30} className="text-white" />
          </div>
        </div>

        {/* Method */}
        <p className="text-[13px] font-semibold mt-6 mb-2">Select Withdrawal Method</p>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="glass rounded-2xl px-3 py-3 flex items-center gap-2 text-left"
                style={active ? { borderColor: "rgba(168,85,247,0.9)", boxShadow: "0 0 16px rgba(168,85,247,0.45)" } : {}}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-200"
                      style={{ background: "rgba(168,85,247,0.15)" }}>
                  {m.icon}
                </span>
                <span className="text-[12.5px] font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bank form */}
        {method === "bank" && (
          <>
            <p className="text-[12px] text-white/60 mt-5 mb-1.5 ml-1">Bank</p>
            <div className="field">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="bg-transparent outline-none text-white text-[14px] flex-1"
              >
                <option value="" style={{ color: "#111" }}>Select Bank</option>
                {BANKS.map((b) => (
                  <option key={b} value={b} style={{ color: "#111" }}>{b}</option>
                ))}
              </select>
            </div>

            <p className="text-[12px] text-white/60 mt-4 mb-1.5 ml-1">Account Number</p>
            <div className="field">
              <input
                value={acct}
                onChange={(e) => setAcct(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter account number"
                inputMode="numeric"
                className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
              />
            </div>

            <p className="text-[12px] text-white/60 mt-4 mb-1.5 ml-1">Account Name</p>
            <div className="field">
              <input
                value={acctName}
                onChange={(e) => setAcctName(e.target.value.slice(0, 60))}
                placeholder="Enter account name"
                className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
              />
            </div>
          </>
        )}

        {/* Amount */}
        <p className="text-[12px] text-white/60 mt-4 mb-1.5 ml-1">Amount</p>
        <div className="field">
          <span className="text-purple-300/80 text-[14px]">₦</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="Enter amount"
            inputMode="numeric"
            className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="glass rounded-xl py-2 text-[11.5px] font-medium text-white/85"
              style={amt === q ? { borderColor: "rgba(168,85,247,0.8)", boxShadow: "0 0 12px rgba(168,85,247,0.4)" } : {}}
            >
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>

        {/* MONEE CODE */}
        <p className="text-[13px] font-semibold mt-6 mb-2">MONEE CODE</p>
        <div className="field" style={
          codeStatus === "ok" ? { borderColor: "rgba(16,185,129,0.7)" } :
          codeStatus === "bad" ? { borderColor: "rgba(239,68,68,0.7)" } : {}
        }>
          <KeyRound size={16} className="text-purple-300/80" />
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().slice(0, 14)); setCodeStatus("idle"); }}
            placeholder="Enter MONEE CODE"
            className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35 tracking-wider"
          />
          {codeStatus === "ok" && <CheckCircle2 size={16} className="text-emerald-400" />}
          {codeStatus === "bad" && <XCircle size={16} className="text-red-400" />}
        </div>
        <button
          onClick={verifyCode}
          className="w-full mt-2 py-2.5 rounded-xl glass text-[12.5px] font-semibold text-purple-200"
        >
          Verify MONEE CODE
        </button>
        {codeStatus === "bad" && (
          <p className="mt-1.5 ml-1 text-[11px] text-red-300">Invalid MONEE CODE.</p>
        )}

        {/* Security */}
        <div className="glass rounded-2xl p-3.5 mt-5 flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)" }}>
            <ShieldCheck size={18} className="text-emerald-300" />
          </span>
          <div>
            <p className="text-[13px] font-semibold">Secure Withdrawal</p>
            <p className="text-[11.5px] text-white/60 leading-snug mt-0.5">
              Your withdrawal is 100% secure and will be processed within minutes.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-[12px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={withdraw}
          disabled={loading || done}
          className="glow w-full mt-5 py-3.5 rounded-2xl text-white text-[15px] font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 55%,#4c1d95 100%)" }}
        >
          {loading ? "Processing..." : done ? (
            <><CheckCircle2 size={18} className="text-emerald-300" /> Withdrawal Successful</>
          ) : "Withdraw Now"}
        </button>
      </div>
    </div>
  );
}
