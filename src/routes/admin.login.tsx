import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminAccount } from "@/lib/admin.functions";


export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Moniebee" },
      { name: "description", content: "Secure admin access for Moniebee." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void ensureAdminAccount().catch(() => {});
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard" });
    });
  }, [navigate]);


  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
      })),
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter your admin email and password.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message || "Invalid admin credentials.");
      return;
    }
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-black relative overflow-hidden">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatUp {
          0% { transform: translateY(20px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-160px); opacity: 0; }
        }
        @keyframes logoPulse {
          0%,100% { text-shadow: 0 0 18px rgba(168,85,247,0.85), 0 0 40px rgba(139,92,246,0.5); }
          50%     { text-shadow: 0 0 28px rgba(168,85,247,1), 0 0 70px rgba(139,92,246,0.85); }
        }
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 0 20px rgba(168,85,247,0.55), 0 10px 30px rgba(124,58,237,0.45); }
          50%     { box-shadow: 0 0 34px rgba(168,85,247,0.9), 0 14px 40px rgba(124,58,237,0.7); }
        }
        .fade-up { animation: fadeUp .6s ease-out both; }
        .logo-glow { animation: logoPulse 3s ease-in-out infinite; }
        .btn-glow { animation: btnPulse 2.4s ease-in-out infinite; }
        .particle {
          position: absolute; border-radius: 9999px; background: #c4b5fd;
          box-shadow: 0 0 8px #a855f7, 0 0 16px #8b5cf6;
          animation-name: floatUp; animation-iteration-count: infinite; animation-timing-function: ease-in-out;
        }
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(168,85,247,0.22);
          backdrop-filter: blur(18px) saturate(140%);
        }
        .field {
          background: rgba(30,10,60,0.55);
          border: 1px solid rgba(168,85,247,0.25);
          backdrop-filter: blur(10px);
          transition: border-color .2s, box-shadow .2s;
        }
        .field:focus-within {
          border-color: rgba(168,85,247,0.7);
          box-shadow: 0 0 0 4px rgba(168,85,247,0.15);
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(124,58,237,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(76,29,149,0.5) 0%, transparent 50%), linear-gradient(180deg, #0a0014 0%, #000 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[430px] px-6 pt-10 pb-10 flex flex-col">
        <button
          onClick={() => navigate({ to: "/account" })}
          className="self-start mb-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white/80 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background: "linear-gradient(135deg,#8B5CF6,#4C1D95)", boxShadow: "0 0 28px rgba(139,92,246,.6)" }}>
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="logo-glow text-[28px] font-extrabold tracking-widest text-white" style={{ letterSpacing: "0.12em" }}>
            ADMIN
          </h1>
          <h2 className="mt-4 text-white text-[22px] font-bold">Secure Access</h2>
          <p className="mt-1.5 text-white/55 text-[13px]">
            Enter your admin credentials to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass rounded-3xl p-5 mt-8 fade-up"
          style={{ animationDelay: "80ms", boxShadow: "0 20px 60px rgba(76,29,149,0.35)" }}
        >
          <label className="block text-white/70 text-[12px] mb-1.5 ml-1">Admin Email</label>
          <div className="field rounded-2xl flex items-center gap-2 px-4 py-3">
            <Mail size={16} className="text-purple-300/80" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
            />
          </div>

          <label className="block text-white/70 text-[12px] mb-1.5 ml-1 mt-4">Password</label>
          <div className="field rounded-2xl flex items-center gap-2 px-4 py-3">
            <Lock size={16} className="text-purple-300/80" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-purple-300/80 hover:text-purple-200"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-[12px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-2xl text-black font-bold text-[15px] btn-glow flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg,#ffffff,#f3f4f6)",
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {loading ? "Signing in..." : "Access Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
