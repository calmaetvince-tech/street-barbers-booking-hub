import { motion } from "framer-motion";
import heroImage from "@/assets/hero-barbershop.jpg";
import { Scissors } from "lucide-react";

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Street Barbers interior"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary" />
            <Scissors className="w-5 h-5 text-primary" />
            <div className="h-px w-12 bg-primary" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="text-gold-gradient">STREET</span>
            <br />
            <span className="text-foreground">BARBERS</span>
          </h1>

          <p className="font-body text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
            Premium grooming experience in Rhodes, Greece.
            Two locations. One standard.
          </p>

          <motion.button
            onClick={onBookNow}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground font-body font-semibold px-8 py-4 rounded-sm text-sm uppercase tracking-widest shadow-gold transition-all"
          >
            Book Appointment
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
