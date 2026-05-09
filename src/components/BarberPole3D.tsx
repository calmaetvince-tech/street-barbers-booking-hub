import { useEffect, useState } from "react";

const BarberPole3D = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqM = window.matchMedia("(max-width: 767px)");
    setIsMobile(mqM.matches);
    const h1 = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqM.addEventListener("change", h1);

    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mqR.matches);
    const h2 = (e: MediaQueryListEvent) => setReduced(e.matches);
    mqR.addEventListener("change", h2);

    return () => {
      mqM.removeEventListener("change", h1);
      mqR.removeEventListener("change", h2);
    };
  }, []);

  // Casing dims
  const caseW = isMobile ? 28 : 44;
  const caseH = isMobile ? 96 : 144;
  // Pole dims (inset inside casing)
  const poleW = caseW - 8;
  const poleH = caseH - 16;

  // Stripe pattern: red, white, blue, white, red, white — 38deg helix.
  // Use a tall repeating linear-gradient that we translateY to animate.
  const RED = "#C8161E";
  const WHITE = "#F8F8FF";
  const BLUE = "#2540F0";
  const band = 14; // px per stripe band
  const stripes = `repeating-linear-gradient(
    -38deg,
    ${RED} 0px,
    ${RED} ${band}px,
    ${WHITE} ${band}px,
    ${WHITE} ${band * 2}px,
    ${BLUE} ${band * 2}px,
    ${BLUE} ${band * 3}px,
    ${WHITE} ${band * 3}px,
    ${WHITE} ${band * 4}px,
    ${RED} ${band * 4}px,
    ${RED} ${band * 5}px,
    ${WHITE} ${band * 5}px,
    ${WHITE} ${band * 6}px
  )`;

  const cycleH = band * 6; // one full stripe pattern repeat (px)
  const animation = reduced ? "none" : `sb-pole-scroll 10s linear infinite`;

  return (
    <>
      <style>{`
        @keyframes sb-pole-scroll {
          from { background-position: 0 0; }
          to   { background-position: 0 ${cycleH}px; }
        }
        .sb-pole-stripes {
          background-image: ${stripes};
          background-size: 200% ${cycleH}px;
          background-repeat: repeat;
          filter: blur(0.6px);
          animation: ${animation};
          will-change: background-position;
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          width: caseW,
          height: caseH,
          background: "#0F0F1E",
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "inset 0 0 12px rgba(60, 90, 220, 0.18), inset 0 0 2px rgba(80,120,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pole wrapper for outer bloom */}
        <div
          style={{
            width: poleW,
            height: poleH,
            borderRadius: poleW / 2,
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 0 30px rgba(80, 130, 255, 0.22), 0 0 12px rgba(255,255,255,0.08)",
            background: "#0a0a14",
          }}
        >
          {/* Animated stripes */}
          <div
            className="sb-pole-stripes"
            style={{
              position: "absolute",
              inset: 0,
            }}
          />
          {/* Specular highlight (left-of-center) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 15%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0) 55%)",
              pointerEvents: "none",
            }}
          />
          {/* Right-edge curvature shadow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Top + bottom vignette for end-cap feel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.45) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </>
  );
};

export default BarberPole3D;
