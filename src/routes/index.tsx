import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moniebee" },
      { name: "description", content: "Withdraw your way globally. Low fees, accepted anywhere." },
      { property: "og:title", content: "Moniebee" },
      { property: "og:description", content: "Withdraw your way globally. Low fees, accepted anywhere." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="flex min-h-screen justify-center items-center bg-[#0a0418]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .moniebee-frame {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg, #1a0b3d 0%, #2d1b5e 40%, #4a2b8c 100%);
          width: 100%;
          max-width: 430px;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .moniebee-frame * { font-family: 'Poppins', sans-serif; }
      `}</style>
      <div className="moniebee-frame">
        {/* Background decorative circles */}
        <div className="absolute w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)', top: '-60px', right: '-80px' }} />
        <div className="absolute w-[250px] h-[250px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)', bottom: '200px', left: '-60px' }} />

        {/* Top indicators */}
        <div className="flex justify-center items-center gap-2 pt-[60px] pb-5 relative z-10">
          <div className="h-1 rounded-sm w-10 bg-[#7dd3fc]" />
          <div className="h-1 rounded-sm w-5 bg-[#7dd3fc]/30" />
          <div className="h-1 rounded-sm w-5 bg-[#7dd3fc]/30" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-7 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-bold text-white leading-tight mb-4 tracking-tight">
              Withdraw your way Globally
            </h1>
            <p className="text-base font-normal text-[#7dd3fc] leading-relaxed max-w-[280px] mx-auto">
              Low fees, accepted anywhere. Create your account today
            </p>
          </div>

          {/* Illustration */}
          <div className="relative w-[280px] h-[280px] flex justify-center items-center mb-5">
            <div className="absolute w-3 h-3 rounded-full bg-yellow-300/80 top-20 left-5" style={{ animation: 'mbFloat 2.5s ease-in-out infinite 0.5s' }} />
            <div className="absolute w-2 h-2 rounded-full bg-violet-400/80 bottom-[60px] right-10" style={{ animation: 'mbFloat 2s ease-in-out infinite 1s' }} />

            <div
              className="w-[200px] h-[200px] rounded-full relative"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #c084fc 60%, #e879f9 100%)',
                boxShadow: '0 0 60px rgba(168, 85, 247, 0.4), inset -20px -20px 40px rgba(0, 0, 0, 0.2), inset 20px 20px 40px rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="absolute w-[60px] h-5 rounded-full bg-white/15 top-[30px] left-10 -rotate-[20deg]" />
              <div className="absolute w-10 h-3 rounded-full bg-white/10 bottom-[50px] right-[45px] rotate-[15deg]" />
            </div>

            {/* Floating card */}
            <div
              className="absolute w-[140px] h-[88px] rounded-2xl p-3.5 flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(243,232,255,0.95) 100%)',
                top: '20px',
                right: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2)',
                animation: 'mbFloat 3s ease-in-out infinite',
              }}
            >
              <div
                className="w-6 h-[18px] rounded relative"
                style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
              >
                <div className="absolute w-4 h-3 border border-black/15 rounded-sm top-[2px] left-[3px]" />
              </div>
              <div className="text-[11px] font-semibold text-[#1e1b4b] tracking-wider">•••• 4582</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full px-7 pb-10 flex flex-col gap-3.5 relative z-10">
          <button className="w-full py-4 px-6 rounded-[30px] text-base font-semibold bg-white text-[#0f0f0f] shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
            Get Started
          </button>
          <button className="w-full py-4 px-6 rounded-[30px] text-base font-semibold bg-[#c4b5fd] text-[#1e1b4b] shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[#ddd6fe] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            Log in
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
