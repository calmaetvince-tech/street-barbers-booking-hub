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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-border bg-border max-w-3xl mx-auto">
          {services.map((service, i) => (
            <motion.button
              key={service.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onBookService?.(service.name)}
              className="group flex flex-col justify-between bg-[#111] p-5 sm:p-6 text-left transition-colors duration-200 hover:bg-[#161616]"
            >
              <span
                className="text-foreground leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "20px" }}
              >
                {service.name}
              </span>
              <div className="mt-6 flex items-end justify-between">
                <span className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {service.duration}
                </span>
                <span className="font-body font-bold text-foreground text-2xl">
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
