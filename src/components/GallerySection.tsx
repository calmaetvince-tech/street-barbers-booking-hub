import { motion } from "framer-motion";
import shopCenter from "@/assets/shop-center.jpg";
import shopIalyssos from "@/assets/shop-ialyssos.jpg";
import teamIalyssos from "@/assets/team-ialyssos.jpg";
import locationCenter from "@/assets/location-center.webp";
import locationIalyssos from "@/assets/location-ialyssos.jpg";
import heroImage from "@/assets/hero-barbershop.jpg";

const centerImages = [
  { src: locationCenter, alt: "Street Barbers Center storefront" },
  { src: shopCenter, alt: "Street Barbers Center interior" },
  { src: heroImage, alt: "Street Barbers team at work" },
];

const ialyssosImages = [
  { src: locationIalyssos, alt: "Street Barbers Ialyssos storefront" },
  { src: shopIalyssos, alt: "Street Barbers Ialyssos interior" },
  { src: teamIalyssos, alt: "Street Barbers Ialyssos team" },
];

const GalleryGroup = ({
  title,
  images,
  delayOffset = 0,
}: {
  title: string;
  images: { src: string; alt: string }[];
  delayOffset?: number;
}) => (
  <div className="space-y-6">
    <h3 className="font-display text-2xl md:text-3xl tracking-wider text-muted-foreground text-center">
      {title}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
      {images.map((img, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: (delayOffset + i) * 0.08, duration: 0.5 }}
          className="aspect-square overflow-hidden group cursor-pointer"
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="w-full h-full object-cover grayscale contrast-[1.15] brightness-95 group-hover:scale-110 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700 ease-out"
          />
        </motion.div>
      ))}
    </div>
  </div>
);

const GallerySection = () => {
  return (
    <section className="py-24 bg-background border-t border-border" id="gallery">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">
            GALLERY
          </h2>
          <p className="font-body text-muted-foreground text-sm mt-4 tracking-wide">
            Real work. Real style.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-16">
          <GalleryGroup title="CENTER" images={centerImages} />
          <GalleryGroup title="IALYSSOS" images={ialyssosImages} delayOffset={3} />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
