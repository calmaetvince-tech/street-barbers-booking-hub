import { motion } from "framer-motion";
import heroCenterImage from "@/assets/hero-team-refined.jpg";
import { Phone, MapPin } from "lucide-react";
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
  return (
    <section className="relative min-h-[100svh] md:min-h-screen flex items-start md:items-start justify-center overflow-hidden pt-24 md:pt-24">
      {/* Desktop background image layer */}
      <div className="hidden md:block absolute inset-0">
        {/* Desktop: only the center hero image, centered on background */}
        <img
          src={heroCenterImage}
          alt="Street Barbers team"
          className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%] w-auto object-contain z-[3]"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background z-[2]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center pt-20 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-normal tracking-wider text-foreground leading-none md:relative md:z-20 md:mix-blend-screen md:text-white/90 md:drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            PREMIUM CUTS
            <br />
            IN RHODES
          </h1>

          <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm mx-auto tracking-wide order-3">
            Precision grooming. Timeless style.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-sm font-body order-4">
            <MapPin className="w-4 h-4" />
            <span>Amerikis 40, Rhodes</span>
            <span>·</span>
            <span>Irakleidon Avenue, Ialyssos</span>
            <span className="mx-2">·</span>
            <span>Mon–Sat 10:00–21:00</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-48 order-2">
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

          {/* Mobile: image displayed below the content stack */}
          <img
            src={heroCenterImage}
            alt="Street Barbers team"
            className="md:hidden w-full h-auto object-contain order-5 mt-4"
            width={1080}
            height={1920}
            fetchPriority="high"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
