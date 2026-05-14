import { motion } from "framer-motion";

interface ServicesSectionProps {
  onBookService?: (serviceName: string) => void;
}

const services = [
  { name: "Haircut", duration: "30 MIN", price: "€18" },
  { name: "Beard Trim", duration: "20 MIN", price: "€12" },
  { name: "Haircut + Beard", duration: "50 MIN", price: "€25" },
];

const ServicesSection = ({ onBookService }: ServicesSectionProps) => {
  return (
    <section className="py-20 bg-background" id="services">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">SERVICES</h2>
        </motion.div>

        <div className="max-w-2xl mx-auto border border-border divide-y divide-border">
          {services.map((service, i) => (
            <motion.button
              key={service.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onBookService?.(service.name)}
              className="group w-full flex items-stretch text-left hover:bg-white/[0.03] transition-colors duration-200"
            >
              {/* Left: name + duration */}
              <div className="flex-1 px-6 py-5 flex flex-col justify-center gap-2">
                <span
                  className="text-foreground leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "22px" }}
                >
                  {service.name}
                </span>
                <span className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {service.duration}
                </span>
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-border" />

              {/* Right: price */}
              <div className="w-24 sm:w-28 flex items-center justify-center px-4">
                <span className="font-body font-bold text-foreground text-2xl sm:text-3xl">
                  {service.price}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
