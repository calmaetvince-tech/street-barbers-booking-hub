import { motion } from "framer-motion";
import heroImage from "@/assets/hero-barbershop.jpg";
import shopCenter from "@/assets/shop-center.jpg";
import shopIalyssos from "@/assets/shop-ialyssos.jpg";
import barberAction from "@/assets/gallery-barber-action.jpg";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Street Barbers"
          className="hidden md:block w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />

        <div className="md:hidden absolute inset-0 flex flex-col">
          <img
            src={shopCenter}
            alt="Street Barbers Center storefront"
            className="w-full flex-1 object-cover"
            fetchPriority="high"
          />
          <img
            src={barberAction}
            alt="Barber at work"
            className="w-full flex-1 object-cover"
          />
          <img
            src={shopIalyssos}
            alt="Street Barbers Ialyssos storefront"
            className="w-full flex-1 object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-normal tracking-wider text-foreground leading-none">
            PREMIUM CUTS
            <br />
            IN RHODES
          </h1>

          <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm mx-auto tracking-wide">
            Precision grooming. Timeless style.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground text-sm font-body">
            <MapPin className="w-4 h-4" />
            <span>Amerikis 40, Rhodes</span>
            <span>·</span>
            <span>Irakleidon Avenue, Ialyssos</span>
            <span className="mx-2">·</span>
            <span>Mon–Sat 10:00–21:00</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
