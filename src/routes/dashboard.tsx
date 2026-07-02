import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  addTransaction,
  getTransactions,
  markAllRead,
  getReadAt,
  setBalance as persistBalance,
  type Tx,
} from "@/lib/transactions";


import {
  Bell,
  ScanLine,
  Phone,
  ArrowDownToLine,
  Wifi,
  History,
  TrendingUp,
  Ticket,
  Users,
  GraduationCap,
  Home as HomeIcon,
  PieChart,
  LineChart as LineIcon,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Moniebee" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const TARGET = 160000;
  const RATE = 1560; // NGN per USD
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("there");
  const [bal, setBal] = useState(100);
  const [showToast, setShowToast] = useState(false);
  const [toastExit, setToastExit] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [unread, setUnread] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      const list = getTransactions();
      setTxs(list);
      const readAt = getReadAt();
      setUnread(list.filter((t) => t.date > readAt).length);
    };
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    if (bellOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [bellOpen]);

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName.split(" ")[0]);
      return;
    }
    try {
      const n = localStorage.getItem("moniebee_username");
      if (n) setName(n);
    } catch {}
  }, [user]);


  useEffect(() => {
    const duration = 2000;
    const start = performance.now();

    const from = 100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setBal(from + (TARGET - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setBal(TARGET);
        persistBalance(TARGET);
        // seed the transactions list (idempotent — getTransactions seeds on first read)
        getTransactions();
        setTxs(getTransactions());
        setUnread((u) => (u === 0 ? 1 : u));
        setShowToast(true);
        setTimeout(() => setToastExit(true), 3600);
        setTimeout(() => { setShowToast(false); setToastExit(false); }, 4000);
      }

    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ngn = bal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const usd = (bal / RATE).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (

    <div className="flex min-h-screen justify-center items-start bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .dash {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg, #0a0014 0%, #1a0938 35%, #0a0014 100%);
          width: 100%; max-width: 430px; min-height: 100dvh;
          padding: 56px 18px 110px; color: #fff; position: relative;
        }
        .dash * { font-family: 'Poppins', sans-serif; }
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(168,85,247,0.18);
          backdrop-filter: blur(18px) saturate(140%);
          box-shadow: 0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .neon { box-shadow: 0 0 24px rgba(168,85,247,0.45), 0 10px 40px rgba(88,28,135,0.35); }
        .chip-btn { transition: transform .15s ease, background .2s ease; }
        .chip-btn:hover { background: rgba(168,85,247,0.18); transform: translateY(-1px); }
        @keyframes toastDown { from { transform: translate(-50%, -120%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes toastUp { from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, -120%); opacity: 0; } }
        .toast-in { animation: toastDown .45s cubic-bezier(.2,.9,.3,1.2) forwards; }
        .toast-out { animation: toastUp .4s ease-in forwards; }
      `}</style>

      {/* Payment toast */}
      {showToast && (
        <div
          className={`fixed top-4 left-1/2 z-50 w-[92%] max-w-[400px] ${toastExit ? "toast-out" : "toast-in"}`}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="rounded-2xl p-3.5 flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 55%, #4C1D95 100%)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 10px 40px rgba(139,92,246,0.55), 0 0 30px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", boxShadow: "0 0 14px rgba(52,211,153,0.5)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#10b981" />
                <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[14px] font-semibold leading-tight">Payment Received</p>
              <p className="text-white/85 text-[12px] mt-0.5 leading-snug">₦160,000 has been credited to your account.</p>
            </div>
          </div>
        </div>
      )}

      <div className="dash">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[18px] font-semibold leading-tight">Hello, {name}</p>
            <p className="text-[12px] text-white/50">Welcome back</p>

          </div>
          <div className="flex items-center gap-2 relative" ref={bellRef}>
            <button
              onClick={() => {
                setBellOpen((v) => !v);
                if (!bellOpen) { markAllRead(); setUnread(0); }
              }}
              className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-purple-200" />
              {unread > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1"
                  style={{ background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
                >
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
              aria-label="Scan QR"
            >
              <ScanLine size={18} className="text-purple-200" />
            </button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={() => { /* QR image captured — hook up decoding later */ }}
            />

            {/* Notifications dropdown */}
            {bellOpen && (
              <div
                className="absolute right-0 top-12 w-[300px] max-h-[380px] overflow-y-auto z-40 rounded-2xl glass p-2"
                style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-[13px] font-semibold">Notifications</p>
                  <Link
                    to="/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-[11px] text-purple-300"
                  >
                    View all
                  </Link>
                </div>
                {txs.length === 0 ? (
                  <p className="px-2 py-6 text-center text-[12px] text-white/50">No activity yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {txs.slice(0, 6).map((t) => {
                      const isCredit = t.type !== "withdrawal";
                      return (
                        <li
                          key={t.id}
                          className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5"
                        >
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isCredit
                                ? "rgba(16,185,129,0.15)"
                                : "rgba(239,68,68,0.15)",
                              border: `1px solid ${isCredit ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                            }}
                          >
                            {t.type === "credit" ? (
                              <ArrowDownLeft size={14} className="text-emerald-300" />
                            ) : t.type === "withdrawal" ? (
                              <ArrowUpRight size={14} className="text-red-300" />
                            ) : (
                              <Sparkles size={14} className="text-emerald-300" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold truncate">{t.title}</p>
                            <p className="text-[10.5px] text-white/60 truncate">{t.message}</p>
                          </div>
                          <span className={`text-[11px] font-bold ${isCredit ? "text-emerald-300" : "text-red-300"}`}>
                            {isCredit ? "+" : "-"}₦{t.amount.toLocaleString("en-NG")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Portfolio card */}
        <div
          className="mt-5 rounded-3xl p-5 neon relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #2a0d5e 0%, #4c1d95 50%, #6d28d9 100%)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-[11px] uppercase tracking-widest">
                Total Portfolio Value
              </p>
              <p className="text-[26px] font-bold mt-1 leading-none">₦{ngn}</p>
              <p className="text-white/60 text-[12px] mt-1">≈ ${usd}</p>

              <p className="text-emerald-300 text-[12px] mt-3 font-medium">
                +₦156,450.00 (6.48%) Today
              </p>
            </div>
            {/* mini chart */}
            <svg width="110" height="70" viewBox="0 0 110 70" className="-mt-1">
              <defs>
                <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,55 L15,48 L30,52 L45,38 L60,42 L75,28 L90,22 L110,8"
                fill="none"
                stroke="#e9d5ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(216,180,254,0.9))" }}
              />
              <path
                d="M0,55 L15,48 L30,52 L45,38 L60,42 L75,28 L90,22 L110,8 L110,70 L0,70 Z"
                fill="url(#pg)"
              />
            </svg>
          </div>
        </div>

        {/* Quick chips */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { i: <Phone size={18} />, l: "Airtime" },
            { i: <ArrowDownToLine size={18} />, l: "Withdraw" },
            { i: <Wifi size={18} />, l: "Data" },
            { i: <History size={18} />, l: "History" },
          ].map((b) => (
            <button
              key={b.l}
              className="chip-btn glass rounded-2xl py-3 flex flex-col items-center gap-1.5"
            >
              <span className="text-purple-200">{b.i}</span>
              <span className="text-[11px] text-white/80">{b.l}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-[14px] font-semibold mt-6 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { i: <TrendingUp size={18} />, l: "Invest Now" },
            { i: <Ticket size={18} />, l: "Buy Code" },
            { i: <Users size={18} />, l: "Refer & Earn" },
            { i: <GraduationCap size={18} />, l: "Learn" },
          ].map((b) => (
            <button
              key={b.l}
              className="glass rounded-2xl py-4 px-4 flex items-center gap-3 text-left"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  boxShadow: "0 0 14px rgba(168,85,247,0.55)",
                }}
              >
                {b.i}
              </span>
              <span className="text-[13px] font-medium">{b.l}</span>
            </button>
          ))}
        </div>

        {/* Allocation + Top Gainers */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="glass rounded-2xl p-4">
            <p className="text-[12px] text-white/60 mb-2">Portfolio Allocation</p>
            <div className="flex items-center justify-center my-2">
              <Donut />
            </div>
            <p className="text-center text-[12px] font-semibold">₦2.56M Total</p>
            <ul className="mt-3 space-y-1 text-[11px]">
              {[
                ["Stocks", "45%", "#a855f7"],
                ["Crypto", "30%", "#c084fc"],
                ["Bonds", "15%", "#7c3aed"],
                ["Others", "10%", "#ddd6fe"],
              ].map(([l, v, c]) => (
                <li key={l} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: c as string }}
                    />
                    {l}
                  </span>
                  <span className="text-white/90">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-[12px] text-white/60 mb-3">Top Gainers</p>
            <ul className="space-y-3">
              {[
                { n: "Apple", t: "AAPL", p: "₦285,420", c: "+2.4%" },
                { n: "Bitcoin", t: "BTC", p: "₦42.8M", c: "+5.1%" },
                { n: "Tesla", t: "TSLA", p: "₦198,300", c: "+3.7%" },
              ].map((g) => (
                <li key={g.n} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{g.n}</p>
                    <p className="text-[10px] text-white/40">{g.t}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold">{g.p}</p>
                    <p className="text-[10px] text-emerald-400">{g.c}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Market Overview */}
        <div className="glass rounded-2xl p-4 mt-4">
          <p className="text-[11px] text-white/50">Nigerian Stock Exchange All Share Index</p>
          <div className="flex items-end justify-between mt-1">
            <div>
              <p className="text-[22px] font-bold">98,765.12</p>
              <p className="text-[12px] text-emerald-400 font-medium">+1,234.56 (1.27%)</p>
            </div>
            <svg width="130" height="50" viewBox="0 0 130 50">
              <path
                d="M0,40 L18,35 L36,38 L54,28 L72,30 L90,18 L108,14 L130,4"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.9))" }}
              />
            </svg>
          </div>
        </div>

        {/* Banner */}
        <div
          className="rounded-3xl p-5 mt-5 relative overflow-hidden flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #a855f7 100%)",
            boxShadow: "0 20px 50px rgba(124,58,237,0.45)",
          }}
        >
          <div className="max-w-[55%]">
            <p className="text-[18px] font-bold leading-tight">Grow your wealth</p>
            <p className="text-[12px] text-white/75 mt-1">Invest in a better tomorrow</p>
            <button className="mt-3 px-4 py-2 rounded-full bg-white text-black text-[12px] font-bold">
              Invest Now
            </button>
          </div>
          {/* Vault illustration */}
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <radialGradient id="vg" cx="0.5" cy="0.4" r="0.7">
                <stop offset="0%" stopColor="#ede9fe" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
            </defs>
            <rect x="10" y="18" width="70" height="60" rx="10" fill="#1e1033" stroke="#c4b5fd" strokeWidth="1.5" />
            <circle cx="45" cy="48" r="18" fill="url(#vg)" stroke="#e9d5ff" strokeWidth="1.5" />
            <circle cx="45" cy="48" r="4" fill="#4c1d95" />
            <line x1="45" y1="30" x2="45" y2="26" stroke="#e9d5ff" strokeWidth="2" />
            <line x1="45" y1="66" x2="45" y2="70" stroke="#e9d5ff" strokeWidth="2" />
            <line x1="27" y1="48" x2="23" y2="48" stroke="#e9d5ff" strokeWidth="2" />
            <line x1="63" y1="48" x2="67" y2="48" stroke="#e9d5ff" strokeWidth="2" />
            {/* coins */}
            <circle cx="22" cy="80" r="6" fill="#fbbf24" stroke="#b45309" />
            <circle cx="32" cy="82" r="6" fill="#fde68a" stroke="#b45309" />
            <circle cx="14" cy="82" r="5" fill="#f59e0b" stroke="#b45309" />
          </svg>
        </div>

        {/* Bottom nav */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-4 pt-2"
          style={{ background: "linear-gradient(180deg, rgba(10,0,20,0) 0%, #0a0014 50%)" }}
        >
          <div className="glass rounded-2xl flex items-center justify-around py-3">
            {[
              { i: <HomeIcon size={20} />, l: "Home", a: true },
              { i: <PieChart size={20} />, l: "Portfolio" },
              { i: <LineIcon size={20} />, l: "Investments" },
              { i: <User size={20} />, l: "Account" },
            ].map((t) => (
              <button
                key={t.l}
                className={`flex flex-col items-center gap-0.5 ${
                  t.a ? "text-purple-300" : "text-white/50"
                }`}
                style={t.a ? { filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))" } : {}}
              >
                {t.i}
                <span className="text-[10px]">{t.l}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Donut() {
  // segments: 45,30,15,10
  const C = 2 * Math.PI * 28;
  const segs = [
    { v: 45, c: "#a855f7" },
    { v: 30, c: "#c084fc" },
    { v: 15, c: "#7c3aed" },
    { v: 10, c: "#ddd6fe" },
  ];
  let offset = 0;
  return (
    <svg width="110" height="110" viewBox="0 0 80 80" style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.5))" }}>
      <circle cx="40" cy="40" r="28" fill="none" stroke="#1f1144" strokeWidth="10" />
      {segs.map((s, i) => {
        const len = (s.v / 100) * C;
        const dash = `${len} ${C - len}`;
        const el = (
          <circle
            key={i}
            cx="40"
            cy="40"
            r="28"
            fill="none"
            stroke={s.c}
            strokeWidth="10"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform="rotate(-90 40 40)"
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}
