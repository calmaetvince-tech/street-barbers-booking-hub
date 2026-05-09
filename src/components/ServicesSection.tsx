import { motion } from "framer-motion";
import { Scissors, Wind, Sparkles, Layers, Baby, Droplets, ChevronRight } from "lucide-react";

interface ServicesSectionProps {
  onBookService?: (serviceName: string) => void;
}

const services = [
  { name: "Haircut", duration: "30 MIN", price: "€18", description: "Classic or modern. Wash, cut, finish.", Icon: Scissors },
  { name: "Beard Trim", duration: "20 MIN", price: "€12", description: "Shape, line up, hot towel. Sharp and clean.", Icon: Wind },
  { name: "Haircut + Beard", duration: "50 MIN", price: "€25", description: "The full reset. Save €5 vs booking separately.", Icon: Sparkles },
];

const ServicesSection = ({ onBookService }: ServicesSectionProps) => {
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
          <p className="mt-4 font-body text-sm md:text-base text-muted-foreground">
            Book any service online. Walk-ins welcome when slots are open.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => {
            const { Icon } = service;
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group relative flex flex-col bg-[#111] border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40"
              >
                <Icon className="w-8 h-8 text-foreground mb-4" strokeWidth={1.5} />
                <h3
                  className="text-foreground"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "22px" }}
                >
                  {service.name}
                </h3>
                <span className="mt-2 inline-block self-start px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[11px] uppercase tracking-[0.15em]">
                  {service.duration}
                </span>
                <p className="mt-3 font-body text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <span className="font-body font-bold text-foreground" style={{ fontSize: "28px" }}>
                    {service.price}
                  </span>
                  <button
                    onClick={() => onBookService?.(service.name)}
                    className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-widest text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Book this
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
