import { motion } from "framer-motion";
import shopCenter from "@/assets/shop-center.jpg";
import shopIalyssos from "@/assets/shop-ialyssos.jpg";
import teamIalyssos from "@/assets/team-ialyssos.jpg";
import locationCenter from "@/assets/location-center.webp";
import locationIalyssos from "@/assets/location-ialyssos.jpg";
import heroImage from "@/assets/hero-barbershop.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const GalleryImage = ({
  src,
  alt,
  className = "",
  index = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  index?: number;
}) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={fadeUp}
    className={`overflow-hidden group relative cursor-pointer ${className}`}
  >
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-700 z-10" />
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover grayscale contrast-[1.2] brightness-[0.85] group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
    />
  </motion.div>
);

const GallerySection = () => {
  return (
    <section className="py-32 bg-background" id="gallery">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-body text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
            The Craft
          </p>
          <h2 className="font-display text-6xl md:text-8xl tracking-wider text-foreground">
            GALLERY
          </h2>
          <div className="w-12 h-px bg-foreground/30 mx-auto mt-8" />
        </motion.div>

        {/* Editorial Layout */}
        <div className="max-w-6xl mx-auto space-y-2">
          {/* Row 1 — Full-width hero */}
          <GalleryImage
            src={heroImage}
            alt="Street Barbers team at work"
            className="aspect-[21/9] w-full"
            index={0}
          />

          {/* Row 2 — Portrait + Detail */}
          <div className="grid grid-cols-5 gap-2">
            <GalleryImage
              src={shopCenter}
              alt="Street Barbers Center interior"
              className="col-span-3 aspect-[4/5]"
              index={1}
            />
            <GalleryImage
              src={locationCenter}
              alt="Street Barbers Center storefront"
              className="col-span-2 aspect-[4/5]"
              index={2}
            />
          </div>

          {/* Row 3 — Three equal */}
          <div className="grid grid-cols-3 gap-2">
            <GalleryImage
              src={teamIalyssos}
              alt="Street Barbers Ialyssos team"
              className="aspect-square"
              index={3}
            />
            <GalleryImage
              src={shopIalyssos}
              alt="Street Barbers Ialyssos interior"
              className="aspect-square"
              index={4}
            />
            <GalleryImage
              src={locationIalyssos}
              alt="Street Barbers Ialyssos storefront"
              className="aspect-square"
              index={5}
            />
          </div>

          {/* Row 4 — Strong closing visual */}
          <GalleryImage
            src={locationCenter}
            alt="Street Barbers — premium grooming"
            className="aspect-[21/9] w-full"
            index={6}
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
