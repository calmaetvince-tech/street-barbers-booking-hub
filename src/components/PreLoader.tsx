import { useEffect, useState } from "react";

const SESSION_KEY = "sb_preloader_seen";

const figures = [
  // 1: ape, hunched
  <g key="f1">
    <circle cx="10" cy="10" r="5" />
    <path d="M10 15 Q6 22 8 32 L12 32 Q14 22 10 15 Z" />
    <path d="M6 20 L2 30 M14 20 L18 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M8 32 L5 44 M12 32 L15 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>,
  // 2: knuckle walker
  <g key="f2">
    <circle cx="10" cy="9" r="5" />
    <path d="M10 14 Q7 22 9 30 L13 30 Q15 22 10 14 Z" />
    <path d="M7 19 L3 27 M13 19 L17 25" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M9 30 L6 44 M13 30 L16 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>,
  // 3: hominid, more upright
  <g key="f3">
    <circle cx="10" cy="7" r="4.5" />
    <path d="M10 12 Q8 22 9 30 L13 30 Q14 22 10 12 Z" />
    <path d="M8 17 L4 24 M13 17 L17 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M9 30 L7 44 M13 30 L15 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>,
  // 4: modern man walking
  <g key="f4">
    <circle cx="10" cy="6" r="4" />
    <path d="M10 10 Q9 22 9 30 L13 30 Q14 22 10 10 Z" />
    <path d="M9 16 L5 22 M13 16 L17 22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M9 30 L6 44 M13 30 L16 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>,
  // 5: man seated in barber chair
  <g key="f5">
    {/* chair base */}
    <rect x="3" y="42" width="14" height="2" />
    <rect x="9" y="34" width="2" height="8" />
    {/* chair back */}
    <rect x="14" y="14" width="3" height="22" />
    {/* seat */}
    <rect x="5" y="32" width="12" height="3" />
    {/* person */}
    <circle cx="10" cy="10" r="4" />
    <path d="M10 14 L10 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M10 20 L4 26 M10 20 L14 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M10 30 L6 38 M10 30 L14 38" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>,
];

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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sitMs = reduced ? 800 : 2000;
    const fadeMs = 600;
    const hardCap = 3000;

    const startFade = setTimeout(() => setFading(true), Math.min(sitMs, hardCap - fadeMs));
    const unmount = setTimeout(() => setShow(false), hardCap);
    return () => {
      clearTimeout(startFade);
      clearTimeout(unmount);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      aria-hidden
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
        @keyframes sb_fig_in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes sb_pole_scroll {
          0% { background-position: 0 0; }
          100% { background-position: 28px 0; }
        }
        .sb-fig { opacity: 0; animation: sb_fig_in 300ms ease-out forwards; color: #ffffff; fill: currentColor; }
        .sb-fig:nth-child(1) { animation-delay: 0ms; }
        .sb-fig:nth-child(2) { animation-delay: 400ms; }
        .sb-fig:nth-child(3) { animation-delay: 800ms; }
        .sb-fig:nth-child(4) { animation-delay: 1200ms; }
        .sb-fig:nth-child(5) { animation-delay: 1600ms; }
        @media (prefers-reduced-motion: reduce) {
          .sb-fig { opacity: 1; animation: none; }
          .sb-pole { animation: none !important; }
        }
      `}</style>

      <svg
        width="320"
        height="60"
        viewBox="0 0 120 50"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {figures.map((fig, i) => (
          <g key={i} className="sb-fig" transform={`translate(${i * 22}, 2)`}>
            {fig}
          </g>
        ))}
      </svg>

      <div
        className="sb-pole"
        style={{
          marginTop: 32,
          width: 200,
          height: 4,
          backgroundImage:
            "repeating-linear-gradient(115deg, #e11d2a 0 8px, #ffffff 8px 16px, #1d4ed8 16px 24px, #ffffff 24px 28px)",
          backgroundSize: "28px 100%",
          animation: "sb_pole_scroll 700ms linear infinite",
          borderRadius: 1,
        }}
      />

      <div
        style={{
          marginTop: 16,
          color: "#ffffff",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
          letterSpacing: "0.2em",
          fontSize: 14,
        }}
      >
        STREET BARBERS
      </div>
    </div>
  );
};

export default PreLoader;