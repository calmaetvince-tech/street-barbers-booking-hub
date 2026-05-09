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
        @keyframes sb_pole_spin {
          0% { background-position: 0 0; }
          100% { background-position: 0 -80px; }
        }
        @keyframes sb_line_pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .sb-pole-wrap {
          position: relative;
          width: clamp(64px, 8vw, 80px);
          height: clamp(220px, 38vw, 280px);
          display: flex;
          flex-direction: column;
        }
        .sb-cap {
          height: 12px;
          border-radius: 6px 6px 2px 2px;
          background: linear-gradient(180deg, #e8e8e8 0%, #888 60%, #444 100%);
          box-shadow: inset 0 -2px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6);
        }
        .sb-cap.bottom {
          border-radius: 2px 2px 6px 6px;
          background: linear-gradient(0deg, #e8e8e8 0%, #888 60%, #444 100%);
        }
        .sb-cylinder {
          position: relative;
          flex: 1;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 0 40px rgba(255,255,255,0.08);
        }
        .sb-stripes {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            #d62828 0 18px,
            #ffffff 18px 36px,
            #1e3a8a 36px 54px,
            #ffffff 54px 72px
          );
          background-size: 100% 80px;
          animation: sb_pole_spin 1.6s linear infinite;
        }
        .sb-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.35) 100%);
          pointer-events: none;
        }
        .sb-underline {
          width: 60px;
          height: 1px;
          background: #ffffff;
          margin-top: 10px;
          animation: sb_line_pulse 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-stripes, .sb-underline { animation: none !important; }
        }
      `}</style>

      <div className="sb-pole-wrap">
        <div className="sb-cap" />
        <div className="sb-cylinder">
          <div className="sb-stripes" />
          <div className="sb-shade" />
        </div>
        <div className="sb-cap bottom" />
      </div>

      <div
        style={{
          marginTop: 32,
          color: "#ffffff",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          fontSize: "clamp(14px, 2vw, 16px)",
        }}
      >
        STREET BARBERS
      </div>
      <div className="sb-underline" />
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
