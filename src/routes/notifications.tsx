import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Sparkles, CheckCheck } from "lucide-react";
import { getTransactions, markAllRead, getReadAt, type Tx } from "@/lib/transactions";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — Moniebee" }],
  }),
  component: NotificationsPage,
});

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = new Date(ts);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationsPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [readAt, setReadAt] = useState(0);

  useEffect(() => {
    setTxs(getTransactions());
    setReadAt(getReadAt());
    // mark as read on entering the page
    markAllRead();
  }, []);

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .n { font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg,#0a0014 0%, #1a0938 40%, #0a0014 100%);
          width: 100%; max-width: 430px; min-height: 100dvh; padding: 20px 18px 40px; color:#fff; }
        .n * { font-family: 'Poppins', sans-serif; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(168,85,247,0.2);
          backdrop-filter: blur(18px) saturate(140%); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .unread::before { content:''; position:absolute; left:-4px; top:50%; transform:translateY(-50%);
          width:6px; height:6px; border-radius:9999px; background:#a855f7;
          box-shadow:0 0 10px rgba(168,85,247,0.9); }
      `}</style>

      <div className="n">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowLeft size={18} className="text-purple-200" />
          </Link>
          <div className="text-center">
            <p className="text-[16px] font-semibold">Notifications</p>
            <p className="text-[11px] text-white/50">Recent account activity</p>
          </div>
          <button
            onClick={() => { markAllRead(); setReadAt(Date.now()); }}
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            aria-label="Mark all read"
          >
            <CheckCheck size={16} className="text-purple-200" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {txs.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-white/60 text-[13px]">
              No notifications yet.
            </div>
          )}
          {txs.map((t) => {
            const isUnread = t.date > readAt;
            const isCredit = t.type !== "withdrawal";
            return (
              <div
                key={t.id}
                className={`relative glass rounded-2xl p-4 flex items-start gap-3 ${isUnread ? "unread" : ""}`}
                style={isUnread ? { background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.35)" } : {}}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isCredit
                      ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.08))"
                      : "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))",
                    border: `1px solid ${isCredit ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)"}`,
                    boxShadow: isCredit ? "0 0 12px rgba(16,185,129,0.35)" : "0 0 12px rgba(239,68,68,0.35)",
                  }}
                >
                  {t.type === "credit" ? (
                    <ArrowDownLeft size={18} className="text-emerald-300" />
                  ) : t.type === "withdrawal" ? (
                    <ArrowUpRight size={18} className="text-red-300" />
                  ) : (
                    <Sparkles size={18} className="text-emerald-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13.5px] font-semibold truncate">{t.title}</p>
                    <span className="text-[10px] text-white/50 flex-shrink-0">{timeAgo(t.date)}</span>
                  </div>
                  <p className="text-[12px] text-white/70 mt-0.5 leading-snug">{t.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                      style={{
                        background:
                          t.status === "successful"
                            ? "rgba(16,185,129,0.15)"
                            : t.status === "pending"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color:
                          t.status === "successful"
                            ? "#6ee7b7"
                            : t.status === "pending"
                            ? "#fcd34d"
                            : "#fca5a5",
                      }}
                    >
                      {t.status}
                    </span>
                    <span className={`text-[13px] font-bold ${isCredit ? "text-emerald-300" : "text-red-300"}`}>
                      {isCredit ? "+" : "-"}₦{t.amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
