import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, LogOut, Users, CreditCard, Landmark, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Moniebee" },
      { name: "description", content: "Moniebee admin control panel." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
    });
  }, [navigate]);

  const doLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const cards = [
    { icon: Users, label: "Users", sub: "Manage app users", to: "/admin/users" },
    { icon: CreditCard, label: "Payments", sub: "Review upgrade payments", to: "/admin/payments" },
    { icon: Landmark, label: "Withdrawals", sub: "Approve withdrawals", to: "/admin/withdrawals" },
    { icon: Settings, label: "Settings", sub: "Bank & support links", to: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .glass{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(168,85,247,.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .fade-in{animation:fadeIn .4s ease-out both}
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(124,58,237,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(76,29,149,0.5) 0%, transparent 50%), linear-gradient(180deg, #0a0014 0%, #000 100%)",
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-10">
        <div className="flex items-center justify-between mb-6 fade-in">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#4C1D95)", boxShadow: "0 0 20px rgba(139,92,246,.55)" }}
            >
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold">Admin Panel</div>
              <div className="text-[11px] text-white/55">{email ?? "—"}</div>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-red-300"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 fade-in" style={{ animationDelay: "80ms" }}>
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                onClick={() => navigate({ to: c.to })}
                className="glass rounded-2xl p-4 text-left hover:bg-white/5 transition-colors"
              >
                <Icon size={22} className="text-purple-300 mb-3" />
                <div className="text-[14px] font-semibold">{c.label}</div>
                <div className="text-[11px] text-white/55 mt-0.5">{c.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
