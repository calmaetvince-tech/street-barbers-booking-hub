import evolutionVideo from "@/assets/hero-animation.mp4";
import evolutionImage from "@/assets/evolution.png";
import { Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("loadedmetadata", tryPlay);
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);
    const userInteract = () => tryPlay();
    window.addEventListener("touchstart", userInteract, { passive: true });
    window.addEventListener("click", userInteract);
    window.addEventListener("scroll", userInteract, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", userInteract);
      window.removeEventListener("click", userInteract);
      window.removeEventListener("scroll", userInteract);
      v.removeEventListener("loadedmetadata", tryPlay);
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 md:pt-16 min-h-screen bg-[#1a1a1a]">
      <img
        src={evolutionImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-contain object-bottom z-0 pointer-events-none"
        style={{ backgroundColor: "#1a1a1a" }}
      />
      <video
        ref={videoRef}
        src={evolutionVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        // @ts-ignore - iOS Safari attribute
        webkit-playsinline="true"
        x5-playsinline="true"
        className="absolute top-0 md:-top-[10vh] left-1/2 -translate-x-1/2 w-full h-[65vh] md:h-[90vh] object-contain object-center z-0 pointer-events-none"
      />
      <div className="absolute top-0 md:-top-[10vh] left-0 right-0 h-[65vh] md:h-[90vh] bg-black/20 z-0 pointer-events-none" />
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto text-center pb-20 md:pb-40">
          <div className="flex flex-col gap-6 md:gap-8 px-4 mt-80 md:mt-80">
            <h1 className="font-display text-3xl md:text-6xl lg:text-7xl font-semibold md:font-normal tracking-[0.2em] md:tracking-wider text-white leading-none -mt-72 md:-mt-72 mix-blend-difference drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              PREMIUM CUTS
              <br />
              IN RHODES
            </h1>

            <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm mx-auto tracking-wide -mt-4 md:mt-64">
              Precision grooming. Timeless style.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-56 md:pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-foreground text-background font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="font-body">
                  <DropdownMenuItem asChild>
                    <a href="tel:+302241601358" className="cursor-pointer flex flex-col items-start gap-0.5 py-2">
                      <span className="text-xs uppercase tracking-widest">Street Barbers Center</span>
                      <span className="text-muted-foreground text-xs">2241 601358</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="tel:+302241601568" className="cursor-pointer flex flex-col items-start gap-0.5 py-2">
                      <span className="text-xs uppercase tracking-widest">Street Barbers Ialyssos</span>
                      <span className="text-muted-foreground text-xs">2241 601568</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 border border-foreground/30 text-foreground font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors">
                    <MapPin className="w-4 h-4" />
                    Get Directions
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="font-body">
                  <DropdownMenuItem asChild>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Amerikis+40,+Rodos+851+00,+Greece"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      Street Barbers Center
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Leoforos+Iraklidon,+Ialysos,+Rhodes,+Greece"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      Street Barbers Ialyssos
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-xs md:text-sm font-body mt-2 md:mt-0">
              <MapPin className="w-4 h-4" />
              <span>Amerikis 40, Rhodes</span>
              <span>·</span>
              <span>Irakleidon Avenue, Ialyssos</span>
              <span className="hidden md:inline mx-2">·</span>
              <span className="w-full md:w-auto">Mon–Sat 10:00–21:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
