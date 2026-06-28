import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Moniebee" },
      { name: "description", content: "Create your Moniebee account to withdraw your way globally." },
      { property: "og:title", content: "Sign Up — Moniebee" },
      { property: "og:description", content: "Create your Moniebee account to withdraw your way globally." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="flex min-h-screen justify-center items-start bg-black">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .signup-frame {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(180deg, #8b5cf6 0%, #5b21b6 25%, #1e1033 60%, #000000 100%);
          width: 100%;
          max-width: 430px;
          min-height: 100dvh;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 60px 28px 40px;
        }
        .signup-frame * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="signup-frame">
        {/* Back arrow */}
        <Link
          to="/"
          aria-label="Go back"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Heading */}
        <div className="mt-10">
          <h1 className="text-[30px] font-bold text-white leading-tight tracking-tight">
            Stay in the loop;
            <br />
            share your email
          </h1>
          <p className="mt-3 text-[14px] text-white/60 leading-relaxed">
            Enter your email — we'll send a code for verification
          </p>
        </div>

        {/* Email input */}
        <div className="mt-10">
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-white/70 mb-2.5"
          >
            Email Address
          </label>
          <div
            className="rounded-2xl border border-white/10"
            style={{
              background: "rgba(46, 16, 87, 0.45)",
              backdropFilter: "blur(20px) saturate(140%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              className="w-full bg-transparent outline-none px-5 py-4 text-[15px] text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Continue button */}
        <button
          className="mt-8 w-full py-4 rounded-[30px] bg-white text-black text-[16px] font-bold shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Continue
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-[12px] font-medium text-white/50 tracking-[2px]">OR</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Google button */}
        <button
          className="w-full py-4 rounded-[30px] bg-white text-black text-[16px] font-semibold flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <GoogleIcon />
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 10-2 13.6-5.3l-6.3-5.2c-2 1.5-4.6 2.5-7.3 2.5-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 40.6 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.2C41.6 35 45 30 45 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
