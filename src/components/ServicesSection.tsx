import { motion } from "framer-motion";
import { Scissors, SprayCan } from "lucide-react";

const services = [
  { name: "Haircut", price: "€20", duration: "30 min", icon: Scissors, desc: "Precision cut tailored to your style" },
  { name: "Beard", price: "€15", duration: "20 min", icon: SprayCan, desc: "Expert beard shaping & grooming" },
  { name: "Haircut & Beard", price: "€30", duration: "45 min", icon: Scissors, desc: "The complete grooming experience" },
];

const ServicesSection = () => {
  return (
    <section className="py-24 bg-background" id="services">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body text-sm uppercase tracking-widest mb-3">What We Offer</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Our Services</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card-gradient border border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors"
            >
              <service.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{service.desc}</p>
              <p className="text-primary font-display text-2xl font-bold">{service.price}</p>
              <p className="text-muted-foreground text-xs mt-1">{service.duration}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
