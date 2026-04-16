import { motion } from "framer-motion";
import heroImage from "@/assets/hero-barbershop.jpg";
import { Phone, MapPin } from "lucide-react";

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
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
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
            <span>Iraklidon Avenue, Ialyssos</span>
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

            <motion.a
              href="https://maps.google.com/?q=Amarantou+24+Rhodes+Greece"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 border border-foreground/30 text-foreground font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
