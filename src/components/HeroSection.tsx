import { motion } from "framer-motion";
import heroImage from "@/assets/hero-barbershop.jpg";
import heroMobileImage from "@/assets/hero-center-team.jpg";
import heroCenterImage from "@/assets/hero-team-group.jpg";
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
      <div className="absolute inset-0">
        {/* Desktop: full composition with new center image overlay */}
        <img
          src={heroImage}
          alt="Street Barbers"
          className="hidden md:block w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
        <img
          src={heroCenterImage}
          alt="Street Barbers team"
          className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%] w-auto object-contain z-[1]"
        />

        {/* Mobile: single strong image, full-bleed */}
        <img
          src={heroMobileImage}
          alt="Street Barbers team"
          className="md:hidden absolute inset-0 w-full h-full object-cover object-[50%_35%]"
          width={1080}
          height={1920}
          fetchPriority="high"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background z-[2]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 md:flex md:flex-col md:space-y-0 md:gap-8"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-normal tracking-wider text-foreground leading-none">
            PREMIUM CUTS
            <br />
            IN RHODES
          </h1>

          <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm mx-auto tracking-wide md:order-3">
            Precision grooming. Timeless style.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-sm font-body md:order-4">
            <MapPin className="w-4 h-4" />
            <span>Amerikis 40, Rhodes</span>
            <span>·</span>
            <span>Irakleidon Avenue, Ialyssos</span>
            <span className="mx-2">·</span>
            <span>Mon–Sat 10:00–21:00</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-40 md:pt-48 md:order-2">
            <motion.a
              href="tel:+302241601358"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-foreground text-background font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </motion.a>

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
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
