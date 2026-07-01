import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Moniebee" },
      { name: "description", content: "Sign in to your Moniebee account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("moniebee_session");
      if (saved) navigate({ to: "/dashboard" });
    } catch {}
  }, [navigate]);

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
      })),
    [],
  );

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    // demo credential check — any valid email + 6+ char password succeeds
    try {
      if (remember) {
        localStorage.setItem(
          "moniebee_session",
          JSON.stringify({ email, at: Date.now() }),
        );
      }
    } catch {}
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 900);
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-black relative overflow-hidden">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { font-family: 'Poppins', sans-serif; }
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

      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(124,58,237,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(76,29,149,0.5) 0%, transparent 50%), linear-gradient(180deg, #0a0014 0%, #000 100%)",
        }}
      />
      {/* Particles */}
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

      <div className="relative z-10 w-full max-w-[430px] px-6 pt-14 pb-10 flex flex-col">
        {/* Header */}
        <div className="text-center fade-up">
          <h1
            className="logo-glow text-[36px] font-extrabold tracking-widest text-white"
            style={{ letterSpacing: "0.15em" }}
          >
            MONEEBEE
          </h1>
          <h2 className="mt-6 text-white text-[26px] font-bold">Welcome Back</h2>
          <p className="mt-1.5 text-white/55 text-[13px]">
            Sign in to continue to your account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="glass rounded-3xl p-5 mt-8 fade-up"
          style={{ animationDelay: "80ms", boxShadow: "0 20px 60px rgba(76,29,149,0.35)" }}
        >
          {/* Email */}
          <label className="block text-white/70 text-[12px] mb-1.5 ml-1">Email Address</label>
          <div className="field rounded-2xl flex items-center gap-2 px-4 py-3">
            <Mail size={16} className="text-purple-300/80" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="bg-transparent outline-none text-white text-[14px] flex-1 placeholder:text-white/35"
            />
          </div>

          {/* Password */}
          <label className="block text-white/70 text-[12px] mb-1.5 ml-1 mt-4">Password</label>
          <div className="field rounded-2xl flex items-center gap-2 px-4 py-3">
            <Lock size={16} className="text-purple-300/80" />
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

          {/* Row */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <label className="flex items-center gap-2 text-[12px] text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded"
              />
              Remember Me
            </label>
            <button type="button" className="text-[12px] text-purple-300 hover:text-purple-200">
              Forgot Password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 text-[12px] text-red-200"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)" }}>
              <XCircle size={14} /> ❌ {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 text-[12px] text-emerald-200"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)" }}>
              <CheckCircle2 size={14} /> ✅ Login Successful
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="btn-glow w-full py-3.5 rounded-2xl text-white text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 55%,#4c1d95 100%)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Bottom */}
        <div className="mt-8 text-center fade-up" style={{ animationDelay: "160ms" }}>
          <p className="text-white/55 text-[13px]">Don't have an account?</p>
          <Link
            to="/signup"
            className="inline-block mt-3 px-6 py-2.5 rounded-full text-[13px] font-semibold text-white"
            style={{
              background: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.5)",
              boxShadow: "0 0 18px rgba(168,85,247,0.35)",
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
