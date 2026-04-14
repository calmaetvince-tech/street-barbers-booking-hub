import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const locations = [
  {
    name: "Street Barbers Center",
    address: "Amerikis 40, Rhodes",
    phone: "2241 601358",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3231.5!2d28.2272!3d36.4341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDI2JzAzLjAiTiAyOMKwMTMnMzcuOCJF!5e0!3m2!1sen!2sgr!4v1",
  },
  {
    name: "Street Barbers Ialyssos",
    address: "Leoforos Iraklidon, Ialyssos",
    phone: "2241 601568",
    mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3231.5!2d28.1672!3d36.4241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDI1JzI3LjAiTiAyOMKwMTAnMDIuMCJF!5e0!3m2!1sen!2sgr!4v1",
  },
];

const ContactSection = () => {
  return (
    <section className="py-24 bg-background" id="contact">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary font-body text-sm uppercase tracking-widest mb-3">Find Us</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Our Locations</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card-gradient border border-border rounded-lg overflow-hidden"
            >
              <div className="aspect-video">
                <iframe
                  src={loc.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${loc.name}`}
                />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-xl font-semibold text-foreground">{loc.name}</h3>
                <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />{loc.address}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />{loc.phone}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground text-sm font-body">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />Mon–Sat: 09:00–20:00
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
