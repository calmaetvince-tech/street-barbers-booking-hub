import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";
import locationCenter from "@/assets/location-center.webp";
import locationIalyssos from "@/assets/location-ialyssos.jpg";

const locations = [
  {
    name: "Street Barbers Center",
    address: "Amerikis 40, Rhodes",
    phone: "2241 601358",
    phoneHref: "tel:+302241601358",
    image: locationCenter,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d818.5!2d28.2272!3d36.4341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14950ba509b9d6a7%3A0x5e1e0e1c7e1b1c1a!2sAmerikis%2040%2C%20Rodos%20851%2000%2C%20Greece!5e0!3m2!1sen!2sgr!4v1700000000000",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Amerikis+40,+Rodos+851+00,+Greece",
  },
  {
    name: "Street Barbers Ialyssos",
    address: "Leoforos Iraklidon, Ialyssos",
    phone: "2241 601568",
    phoneHref: "tel:+302241601568",
    image: locationIalyssos,
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d818.5!2d28.1672!3d36.4241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14950c1234567890%3A0xabcdef1234567890!2sLeoforos%20Iraklidon%2C%20Ialysos%2C%20Greece!5e0!3m2!1sen!2sgr!4v1700000000000",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Leoforos+Iraklidon,+Ialysos,+Rhodes,+Greece",
  },
];

const ContactSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border" id="contact">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">VISIT US</h2>
          <p className="font-body text-muted-foreground text-lg mt-4 max-w-md mx-auto">
            Walk in or call us to book your next cut.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card border border-border overflow-hidden"
            >
              {/* Shop photo — grayscale, high contrast */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover grayscale contrast-110 hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Google Map */}
              <div className="aspect-video">
                <iframe
                  src={loc.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(1) invert(0.92) contrast(1.1)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${loc.name}`}
                />
              </div>

              {/* Info + CTAs */}
              <div className="p-6 space-y-4">
                <h3 className="font-display text-2xl tracking-wider text-foreground">{loc.name}</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                    <MapPin className="w-4 h-4 text-foreground flex-shrink-0" />{loc.address}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                    <Phone className="w-4 h-4 text-foreground flex-shrink-0" />{loc.phone}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                    <Clock className="w-4 h-4 text-foreground flex-shrink-0" />Mon–Sat: 10:00–21:00 · Sun: Closed
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href={loc.phoneHref}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background font-body font-semibold py-3 text-xs uppercase tracking-widest"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <a
                    href={loc.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-foreground/30 text-foreground font-body font-semibold py-3 text-xs uppercase tracking-widest hover:bg-foreground/5 transition-colors"
                  >
                    <MapPin className="w-3 h-3" /> Directions
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
