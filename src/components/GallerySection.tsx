import { motion } from "framer-motion";
import galleryBarberAction from "@/assets/gallery-barber-action.jpg";
import galleryFadeSide from "@/assets/gallery-fade-side.jpg";
import galleryOldStyle from "@/assets/gallery-old-style.jpg";
import galleryDropFade from "@/assets/gallery-drop-fade.jpg";
import galleryPompadour from "@/assets/gallery-pompadour.jpg";
import galleryTeamRack from "@/assets/gallery-team-rack.jpg";
import galleryStorefrontNight from "@/assets/gallery-storefront-night.jpg";
import galleryTeamIalyssos from "@/assets/gallery-team-ialyssos.jpg";
import galleryBuzzCut from "@/assets/gallery-buzz-cut.jpg";
import gallerySkinFade from "@/assets/gallery-skin-fade.jpg";

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
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Row 1 — Full-width hero */}
          <GalleryImage
            src={galleryBarberAction}
            alt="Barber at work — Street Barbers"
            className="aspect-[21/9] w-full"
            index={0}
          />

          {/* Row 2 — Portrait + Detail */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <GalleryImage
              src={galleryTeamIalyssos}
              alt="Street Barbers Ialyssos team"
              className="md:col-span-3 aspect-[4/5]"
              index={1}
            />
            <GalleryImage
              src={galleryStorefrontNight}
              alt="Street Barbers storefront at night"
              className="md:col-span-2 aspect-[4/5]"
              index={2}
            />
          </div>

          {/* Row 3 — Three equal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GalleryImage
              src={galleryFadeSide}
              alt="Clean fade haircut"
              className="aspect-square"
              index={3}
            />
            <GalleryImage
              src={galleryOldStyle}
              alt="Classic old style cut"
              className="aspect-square"
              index={4}
            />
            <GalleryImage
              src={galleryDropFade}
              alt="Drop fade haircut"
              className="aspect-square"
              index={5}
            />
          </div>

          {/* Row 4 — Two-up cinematic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <GalleryImage
              src={galleryPompadour}
              alt="Pompadour style haircut"
              className="aspect-[3/4]"
              index={6}
            />
            <GalleryImage
              src={galleryTeamRack}
              alt="Street Barbers team"
              className="aspect-[3/4]"
              index={7}
            />
          </div>

          {/* Row 5 — Three detail shots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GalleryImage
              src={galleryBuzzCut}
              alt="Buzz cut precision"
              className="aspect-square"
              index={8}
            />
            <GalleryImage
              src={gallerySkinFade}
              alt="Skin fade detail"
              className="aspect-square"
              index={9}
            />
            <GalleryImage
              src={galleryBarberAction}
              alt="Barber finishing touches"
              className="aspect-square"
              index={10}
            />
          </div>

          {/* Row 6 — Strong closing visual */}
          <GalleryImage
            src={galleryStorefrontNight}
            alt="Street Barbers — premium grooming"
            className="aspect-[21/9] w-full"
            index={11}
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
