import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Moniebee" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen justify-center items-start bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .dash {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg, #1e1033 0%, #000000 100%);
          width: 100%; max-width: 430px; min-height: 100dvh;
          padding: 60px 24px 40px; color: #fff;
        }
        .dash * { font-family: 'Poppins', sans-serif; }
      `}</style>
      <div className="dash">
        <p className="text-white/60 text-sm">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1">Moniebee Dashboard</h1>

        <div
          className="mt-8 rounded-3xl p-6"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)",
            boxShadow: "0 20px 50px rgba(139,92,246,0.35)",
          }}
        >
          <p className="text-white/70 text-xs uppercase tracking-widest">Total balance</p>
          <p className="text-4xl font-bold mt-2">$0.00</p>
          <p className="text-white/70 text-xs mt-4">•••• 4582</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {["Send", "Receive", "Top up"].map((a) => (
            <button
              key={a}
              className="py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {a}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-white/70 mt-8 mb-3">Recent activity</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10">
          {[
            { t: "Welcome bonus", s: "Today", v: "+$0.00" },
            { t: "Account created", s: "Just now", v: "" },
          ].map((r) => (
            <div key={r.t} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-medium">{r.t}</p>
                <p className="text-xs text-white/50">{r.s}</p>
              </div>
              <p className="text-sm font-semibold">{r.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
