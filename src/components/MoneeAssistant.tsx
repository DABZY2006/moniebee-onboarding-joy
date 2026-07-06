import { useEffect, useRef, useState } from "react";
import { Bot, X } from "lucide-react";

/**
 * Floating premium AI assistant bubble.
 * - Fixed at bottom-right initially, draggable, snaps to nearest edge.
 * - Tap opens a small popup with Telegram + WhatsApp support options.
 */
export function MoneeAssistant() {
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 20, y: 120 };
    try {
      const raw = localStorage.getItem("moniebee_bubble_pos");
      if (raw) return JSON.parse(raw);
    } catch {}
    return { x: 20, y: 140 };
  });
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("moniebee_bubble_pos", JSON.stringify(pos));
    } catch {}
  }, [pos]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) startRef.current.moved = true;
    const size = 68;
    const nx = Math.max(8, Math.min(window.innerWidth - size - 8, startRef.current.px + dx));
    const ny = Math.max(8, Math.min(window.innerHeight - size - 8, startRef.current.py + dy));
    setPos({ x: nx, y: ny });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const moved = startRef.current.moved;
    // Snap to nearest horizontal edge
    const size = 68;
    const centerX = pos.x + size / 2;
    const snapX = centerX < window.innerWidth / 2 ? 12 : window.innerWidth - size - 12;
    setPos((p) => ({ x: snapX, y: p.y }));
    startRef.current = null;
    setDragging(false);
    if (!moved) setOpen(true);
  };

  return (
    <>
      <style>{`
        @keyframes bubbleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ringSpin { to { transform: rotate(360deg) } }
        @keyframes ringGlow { 0%,100%{opacity:.75;filter:blur(2px)} 50%{opacity:1;filter:blur(4px)} }
        @keyframes bubbleBreath { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,.55),0 12px 30px rgba(0,0,0,.55)} 50%{box-shadow:0 0 42px rgba(168,85,247,1),0 12px 34px rgba(0,0,0,.6)} }
        @keyframes sparkFloat { 0%{transform:translate(0,0);opacity:0} 20%{opacity:1} 100%{transform:translate(var(--dx),var(--dy));opacity:0} }
        @keyframes fadeInPop { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        .mb-bubble{position:fixed;z-index:9999;width:68px;height:68px;touch-action:none;user-select:none;animation:bubbleFloat 4s ease-in-out infinite}
        .mb-ring{position:absolute;inset:-6px;border-radius:50%;background:conic-gradient(from 0deg,#a855f7,#7c3aed,#c084fc,#4c1d95,#a855f7);animation:ringSpin 4s linear infinite,ringGlow 2.5s ease-in-out infinite;-webkit-mask:radial-gradient(circle,transparent 55%,#000 58%);mask:radial-gradient(circle,transparent 55%,#000 58%)}
        .mb-core{position:absolute;inset:4px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#f5f3ff 0%,#c4b5fd 35%,#7c3aed 70%,#2e1065 100%);display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.35);animation:bubbleBreath 2.8s ease-in-out infinite;overflow:hidden}
        .mb-eye{position:absolute;top:35%;width:6px;height:8px;border-radius:50%;background:#c4b5fd;box-shadow:0 0 8px #a855f7,0 0 14px #7c3aed}
        .mb-spark{position:absolute;width:3px;height:3px;border-radius:50%;background:#e9d5ff;box-shadow:0 0 6px #a855f7;animation:sparkFloat 2.6s ease-out infinite}
      `}</style>

      <div
        className="mb-bubble"
        style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="button"
        aria-label="MONEEBEE Assistant"
      >
        <span className="mb-ring" />
        <span className="mb-spark" style={{ left: -4, top: 10, ["--dx" as any]: "-14px", ["--dy" as any]: "-16px", animationDelay: "0s" }} />
        <span className="mb-spark" style={{ right: -2, top: 20, ["--dx" as any]: "18px", ["--dy" as any]: "-12px", animationDelay: ".8s" }} />
        <span className="mb-spark" style={{ left: 20, bottom: -2, ["--dx" as any]: "6px", ["--dy" as any]: "18px", animationDelay: "1.4s" }} />
        <div className="mb-core">
          <span className="mb-eye" style={{ left: "34%" }} />
          <span className="mb-eye" style={{ right: "34%" }} />
          <Bot size={30} color="#ffffff" style={{ opacity: 0.0 }} />
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)", pointerEvents: "auto", animation: "fadeInPop .25s ease-out" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-[20px] p-6 relative text-white"
            style={{
              background: "linear-gradient(180deg,rgba(20,10,40,.95),rgba(10,0,20,.98))",
              border: "1px solid rgba(168,85,247,.55)",
              boxShadow: "0 0 40px rgba(168,85,247,.6), 0 0 80px rgba(139,92,246,.4)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
              style={{ pointerEvents: "auto" }}
            >
              <X size={16} />
            </button>
            <h3 className="text-[17px] font-bold mb-1">Contact MONIEBEE Support</h3>
            <p className="text-[12px] text-white/60 mb-5">Choose your preferred support platform.</p>

            <a
              href="https://t.me/Matthewxx8230"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl mb-3"
              style={{ background: "linear-gradient(135deg,#229ED9,#1a7cbb)", pointerEvents: "auto" }}
            >
              <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M9.04 15.6 8.9 19c.35 0 .5-.15.68-.33l1.63-1.55 3.38 2.47c.62.34 1.06.16 1.23-.57l2.23-10.44c.2-.86-.31-1.2-.9-.98L4.6 11.32c-.85.33-.83.8-.14 1.01l3.28 1.02 7.62-4.8c.36-.22.68-.1.42.14z"/></svg>
              </span>
              <div className="flex-1 text-left">
                <div className="text-[14px] font-semibold">Telegram</div>
                <div className="text-[11px] text-white/75">Open Telegram</div>
              </div>
            </a>

            <a
              href="https://wa.me/message/FOGLJUPV7MXJH1"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl"
              style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", pointerEvents: "auto" }}
            >
              <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M20.5 3.5A11 11 0 0 0 3.2 17l-1.2 4.5 4.6-1.2A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3A9 9 0 1 1 12 20.5Zm4.9-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1s-.7.9-.9 1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.4.8-1.3.1-.2 0-.3 0-.5s-.6-1.4-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.2.2 2.1 3.2 5 4.4 1.8.7 2.5.8 3.4.7.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.1-.2-.2-.5-.3Z"/></svg>
              </span>
              <div className="flex-1 text-left">
                <div className="text-[14px] font-semibold">WhatsApp</div>
                <div className="text-[11px] text-white/85">Open WhatsApp</div>
              </div>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default MoneeAssistant;
