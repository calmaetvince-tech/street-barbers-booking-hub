import { motion } from "framer-motion";
import shopCenter from "@/assets/shop-center.jpg";
import shopIalyssos from "@/assets/shop-ialyssos.jpg";
import teamIalyssos from "@/assets/team-ialyssos.jpg";
import locationCenter from "@/assets/location-center.webp";
import locationIalyssos from "@/assets/location-ialyssos.jpg";

const images = [
  { src: shopCenter, alt: "Street Barbers Center" },
  { src: teamIalyssos, alt: "Street Barbers Team" },
  { src: shopIalyssos, alt: "Street Barbers Ialyssos" },
  { src: locationCenter, alt: "Center Location" },
  { src: locationIalyssos, alt: "Ialyssos Location" },
];

const GallerySection = () => {
  return (
    <section className="py-24 bg-background" id="gallery">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">GALLERY</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-w-5xl mx-auto">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="aspect-square overflow-hidden group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
