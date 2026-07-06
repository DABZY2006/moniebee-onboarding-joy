import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/generating")({
  head: () => ({ meta: [{ title: "Please wait — Moniebee" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "/payment",
    ms:
      typeof s.ms === "string"
        ? parseInt(s.ms, 10) || 5000
        : typeof s.ms === "number"
          ? s.ms
          : 5000,
  }),
  component: GeneratingPage,
});

function GeneratingPage() {
  const navigate = useNavigate();
  const { next, ms } = Route.useSearch();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: next as any }), ms);
    return () => clearTimeout(t);
  }, [navigate, next, ms]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        left: Math.random() * 100,
        top: 30 + Math.random() * 40,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        size: 2 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <style>{`
        @keyframes logoPulse {
          0%,100% { opacity:.35; transform:scale(.96); filter:drop-shadow(0 0 10px rgba(168,85,247,.5)); }
          50% { opacity:1; transform:scale(1.04); filter:drop-shadow(0 0 30px rgba(168,85,247,1)) drop-shadow(0 0 60px rgba(139,92,246,.8)); }
        }
        @keyframes haloPulse { 0%,100%{opacity:.25;transform:scale(.85)} 50%{opacity:.9;transform:scale(1.15)} }
        @keyframes floatUp { 0%{transform:translateY(20px);opacity:0} 20%{opacity:1} 100%{transform:translateY(-120px);opacity:0} }
        .logo-wrap{animation:logoPulse 3s ease-in-out infinite}
        .halo{position:absolute;inset:0;margin:auto;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.55) 0%,rgba(139,92,246,0) 70%);filter:blur(28px);animation:haloPulse 3s ease-in-out infinite}
        .particle{position:absolute;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7,0 0 16px #8b5cf6;animation:floatUp ease-in-out infinite}
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div className="halo" />
        <div
          className="logo-wrap relative flex items-center justify-center rounded-full"
          style={{
            width: 160,
            height: 160,
            border: "1.5px solid rgba(168,85,247,.8)",
            boxShadow: "0 0 30px rgba(168,85,247,.7), inset 0 0 30px rgba(168,85,247,.25)",
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 500,
              color: "#fff",
              textShadow: "0 0 18px rgba(168,85,247,1), 0 0 40px rgba(139,92,246,.9), 0 0 80px rgba(139,92,246,.6)",
            }}
          >
            M
          </span>
        </div>
      </div>

      <div className="mt-16 text-center relative z-10 px-6">
        <h2 className="text-white text-[22px] font-bold tracking-tight">Generating payment account...</h2>
        <p className="mt-2 text-[13px] text-white/60">
          Please wait while we generate your payment account...
        </p>
      </div>
    </div>
  );
}
