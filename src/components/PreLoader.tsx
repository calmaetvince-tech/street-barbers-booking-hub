import { useEffect, useState } from "react";

const SESSION_KEY = "sb_preloader_seen";

const PreLoader = () => {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* noop */
    }
    const fadeMs = 600;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hardCap = reduced ? 800 : 3000;
    const progressMs = reduced ? 0 : 2400;
    const progressDelay = reduced ? 0 : 200;
    let unmountTimer: number | undefined;

    const beginFade = () => {
      setFading(true);
      window.clearTimeout(unmountTimer);
      unmountTimer = window.setTimeout(() => {
        console.log("[PreLoader] dismissed");
        setShow(false);
      }, fadeMs);
    };

    const hardCapTimer = window.setTimeout(beginFade, Math.max(0, hardCap - fadeMs));
    // Whichever fires first — progress completion or hard cap — wins.
    const progressTimer = window.setTimeout(beginFade, progressMs + progressDelay);

    return () => {
      window.clearTimeout(hardCapTimer);
      window.clearTimeout(progressTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 600ms ease-out",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes sb_word_in {
          0% { opacity: 0; letter-spacing: 0.6em; transform: translateY(4px); }
          100% { opacity: 1; letter-spacing: 0.4em; transform: translateY(0); }
        }
        @keyframes sb_progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes sb_shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes sb_dim {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        .sb-word {
          color: #f5f5f5;
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-weight: 500;
          font-size: clamp(28px, 4vw, 44px);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          animation: sb_word_in 900ms ease-out both;
          padding-left: 0.4em;
        }
        .sb-progress {
          position: relative;
          width: 220px;
          max-width: 70vw;
          height: 1px;
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }
        .sb-progress-bar {
          position: relative;
          height: 100%;
          width: 0%;
          background: #f5f5f5;
          overflow: hidden;
          animation: sb_progress 2400ms ease-in-out 200ms forwards;
        }
        .sb-progress-bar::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%);
          animation: sb_shimmer 1.4s linear infinite;
        }
        .sb-sub {
          margin-top: 16px;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          padding-left: 0.35em;
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-word, .sb-sub { animation: none !important; opacity: 1 !important; transform: none !important; }
          .sb-progress-bar { animation: none !important; width: 100%; }
          .sb-progress-bar::after { animation: none !important; opacity: 0; }
        }
      `}</style>

      <div className="sb-word">STREET BARBERS</div>
      <div className="sb-progress"><div className="sb-progress-bar" /></div>
      <div className="sb-sub">RHODES</div>
      <div
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Loading Street Barbers
      </div>
    </div>
  );
};

export default PreLoader;
