import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/loading")({
  head: () => ({
    meta: [{ title: "Loading — Moniebee" }],
  }),
  component: LoadingPage,
});

function LoadingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 2800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes mFade {
          0%, 100% { opacity: 0.15; transform: scale(0.96); filter: blur(0.5px); }
          50%      { opacity: 1;    transform: scale(1.04); filter: blur(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50%      { opacity: 0.85; transform: scale(1.1); }
        }
        .m-letter {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 140px;
          color: #fff;
          text-shadow:
            0 0 18px rgba(168, 85, 247, 0.85),
            0 0 40px rgba(139, 92, 246, 0.7),
            0 0 80px rgba(139, 92, 246, 0.45);
          animation: mFade 1.8s ease-in-out infinite;
        }
        .m-glow {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0) 70%);
          filter: blur(20px);
          animation: glowPulse 1.8s ease-in-out infinite;
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        <div className="m-glow" />
        <span className="m-letter relative">M</span>
      </div>
    </div>
  );
}
