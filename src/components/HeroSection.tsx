import heroCenterImage from "@/assets/hero-team-refined.jpg";
import evolutionVideo from "@/assets/evolution.mp4";
import { Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
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
    <section className="relative overflow-hidden pt-20 md:pt-16">
      <div className="absolute top-0 md:-top-[15vh] left-0 right-0 h-[75vh] md:h-[105vh] bg-white z-0 pointer-events-none" />
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
        className="absolute top-16 md:-top-[10vh] left-1/2 -translate-x-1/2 w-[160%] h-[55vh] md:w-[130%] md:h-[75vh] object-contain object-center z-0 pointer-events-none"
      />
      <div className="absolute top-0 md:-top-[15vh] left-0 right-0 h-[75vh] md:h-[105vh] bg-black/60 z-0 pointer-events-none" />
      <div className="relative z-10">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col gap-6 md:gap-8 px-4">
            <h1 className="font-display text-5xl md:text-8xl lg:text-9xl font-normal tracking-wider text-foreground leading-none">
              PREMIUM CUTS
              <br />
              IN RHODES
            </h1>

            <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm mx-auto tracking-wide">
              Precision grooming. Timeless style.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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

            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-xs md:text-sm font-body pt-2">
              <MapPin className="w-4 h-4" />
              <span>Amerikis 40, Rhodes</span>
              <span>·</span>
              <span>Irakleidon Avenue, Ialyssos</span>
              <span className="hidden md:inline mx-2">·</span>
              <span className="w-full md:w-auto">Mon–Sat 10:00–21:00</span>
            </div>
          </div>
        }
      >
        <img
          src={heroCenterImage}
          alt="Street Barbers team"
          className="w-full h-full object-cover rounded-2xl"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
      </ContainerScroll>
      </div>
    </section>
  );
};

export default HeroSection;
