import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/personalize")({
  head: () => ({
    meta: [
      { title: "Personalize — Moniebee" },
      { name: "description", content: "Set your username and referral code on Moniebee." },
    ],
  }),
  component: PersonalizePage,
});

function PersonalizePage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen justify-center items-start bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .frame {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg, #8b5cf6 0%, #5b21b6 25%, #1e1033 60%, #000000 100%);
          width: 100%;
          max-width: 430px;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          padding: 60px 28px 40px;
        }
        .frame * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="frame">
        <Link
          to="/signup"
          aria-label="Go back"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="mt-10">
          <h1 className="text-[28px] font-bold text-white leading-tight tracking-tight">
            Almost There — Let's Personalize Things
          </h1>
          <p className="mt-3 text-[14px] text-white/60 leading-relaxed">
            Set your username and add a referral code if you've got one
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {["Create user name", "Phone number", "Do you have Referral code?"].map((ph) => (
            <div
              key={ph}
              className="rounded-2xl border border-white/10"
              style={{
                background: "rgba(46, 16, 87, 0.45)",
                backdropFilter: "blur(20px) saturate(140%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              <input
                type="text"
                placeholder={ph}
                className="w-full bg-transparent outline-none px-5 py-4 text-[15px] text-white placeholder:text-white/40"
              />
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-[80px]" />

        <button
          onClick={() => navigate({ to: "/loading" })}
          className="w-full py-4 rounded-[30px] bg-white text-black text-[16px] font-bold shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
