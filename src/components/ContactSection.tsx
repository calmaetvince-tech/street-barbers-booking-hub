import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const ContactSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border" id="contact">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">VISIT US</h2>

          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Walk in or call us to book your next cut.
          </p>

          <div className="space-y-3 font-body text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-foreground" />
              Amarantou 24, Rhodes
            </p>
            <p className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-foreground" />
              2241 601358
            </p>
            <p className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-foreground" />
              Mon–Sat: 10:00–21:00 · Sunday: Closed
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="tel:+302241601358"
              className="inline-flex items-center gap-2 bg-foreground text-background font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
            <a
              href="https://maps.google.com/?q=Amarantou+24+Rhodes+Greece"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/30 text-foreground font-body font-semibold px-8 py-4 text-sm uppercase tracking-widest hover:bg-foreground/5 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
