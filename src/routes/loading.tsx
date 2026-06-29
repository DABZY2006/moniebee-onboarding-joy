import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/loading")({
  head: () => ({
    meta: [{ title: "Processing — Moniebee" }],
  }),
  component: LoadingPage,
});

function LoadingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { font-family: 'Poppins', sans-serif; }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.96);
            filter: drop-shadow(0 0 10px rgba(168,85,247,0.5)); }
          50%      { opacity: 1;    transform: scale(1.04);
            filter: drop-shadow(0 0 30px rgba(168,85,247,1)) drop-shadow(0 0 60px rgba(139,92,246,0.8)); }
        }
        @keyframes haloPulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50%      { opacity: 0.9;  transform: scale(1.15); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(20px); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
        @keyframes smokeDrift {
          0%, 100% { transform: translateX(-10px) scale(1); opacity: 0.35; }
          50%      { transform: translateX(10px) scale(1.1); opacity: 0.55; }
        }
        .logo-wrap { animation: logoPulse 3s ease-in-out infinite; }
        .halo {
          position: absolute; inset: 0; margin: auto;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(139,92,246,0) 70%);
          filter: blur(28px);
          animation: haloPulse 3s ease-in-out infinite;
        }
        .smoke {
          position: absolute;
          bottom: -40px; left: 50%; transform: translateX(-50%);
          width: 320px; height: 140px;
          background: radial-gradient(ellipse at center, rgba(139,92,246,0.35) 0%, rgba(0,0,0,0) 70%);
          filter: blur(30px);
          animation: smokeDrift 6s ease-in-out infinite;
        }
        .particle {
          position: absolute; border-radius: 50%;
          background: #c4b5fd;
          box-shadow: 0 0 8px #a855f7, 0 0 16px #8b5cf6;
          animation-name: floatUp;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Particles */}
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

      {/* Logo */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <div className="halo" />
        <div className="smoke" />
        <div
          className="logo-wrap relative flex items-center justify-center rounded-full"
          style={{
            width: 160,
            height: 160,
            border: "1.5px solid rgba(168,85,247,0.8)",
            boxShadow:
              "0 0 30px rgba(168,85,247,0.7), inset 0 0 30px rgba(168,85,247,0.25)",
          }}
        >
          <span
            style={{
              fontSize: 88,
              fontWeight: 500,
              color: "#fff",
              textShadow:
                "0 0 18px rgba(168,85,247,1), 0 0 40px rgba(139,92,246,0.9), 0 0 80px rgba(139,92,246,0.6)",
            }}
          >
            M
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="mt-16 text-center relative z-10">
        <h2 className="text-white text-[24px] font-bold tracking-tight">Processing purchase....</h2>
        <p className="mt-2 text-[14px] text-white/50">
          Please wait while we complete your transaction
        </p>
      </div>
    </div>
  );
}
