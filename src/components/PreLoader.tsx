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

    return () => {
      window.clearTimeout(hardCapTimer);
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
        @keyframes sb_line_grow {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
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
        .sb-line {
          width: clamp(80px, 12vw, 140px);
          height: 1px;
          background: #f5f5f5;
          margin-top: 24px;
          transform-origin: center;
          animation: sb_line_grow 1200ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
        }
        .sb-sub {
          margin-top: 18px;
          color: #f5f5f5;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          animation: sb_dim 1.6s ease-in-out infinite;
          padding-left: 0.35em;
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-word, .sb-line, .sb-sub { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div className="sb-word">STREET BARBERS</div>
      <div className="sb-line" />
      <div className="sb-sub">Loading</div>
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
