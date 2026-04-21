import { motion } from "framer-motion";

const services = [
  { name: "Haircut", price: "€20" },
  { name: "Beard", price: "€15" },
  { name: "Haircut & Beard", price: "€30" },
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
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">SERVICES</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px max-w-3xl mx-auto bg-border">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background p-10 text-center premium-lift"
            >
              <h3 className="font-display text-2xl tracking-wider text-foreground mb-4">{service.name}</h3>
              <p className="font-body text-3xl font-light text-foreground">{service.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
