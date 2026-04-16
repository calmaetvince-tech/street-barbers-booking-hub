import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import galleryHero from "@/assets/gallery-hero.jpg";
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
  bw = false,
}: {
  src: string;
  alt: string;
  className?: string;
  index?: number;
  bw?: boolean;
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
      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out ${bw ? "grayscale contrast-[1.25] brightness-[0.85]" : ""}`}
    />
    {bw && (
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.4)",
      }} />
    )}
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

        <div className="max-w-6xl mx-auto space-y-3">
          {/* Hero — single dominant B&W image */}
          <GalleryImage
            src={galleryHero}
            alt="Street Barbers team — the crew"
            className="aspect-[21/9] w-full"
            index={0}
            bw
          />

          {/* ===== CENTER LOCATION ===== */}
          <div className="pt-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-4 gap-4"
            >
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
                  Location 01
                </p>
                <h3 className="font-display text-2xl md:text-3xl tracking-wider text-foreground">
                  STREET BARBERS CENTER
                </h3>
              </div>
              <a
                href="https://www.instagram.com/streetbarbers.store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Street Barbers Center on Instagram"
                className="hidden sm:inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                @streetbarbers.store
              </a>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <GalleryImage src={galleryFadeSide} alt="Clean fade haircut" className="aspect-square" index={1} />
              <GalleryImage src={galleryOldStyle} alt="Classic old style cut" className="aspect-square" index={2} />
              <GalleryImage src={galleryDropFade} alt="Drop fade haircut" className="aspect-square" index={3} />
              <GalleryImage src={galleryStorefrontNight} alt="Street Barbers storefront at night" className="aspect-square" index={4} />
            </div>

            <a
              href="https://www.instagram.com/streetbarbers.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 group flex items-center justify-center gap-3 border border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-500 py-4 font-body text-[11px] uppercase tracking-[0.3em] text-foreground"
            >
              <Instagram className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
              View more on Instagram
            </a>
          </div>

          {/* ===== IALYSSOS LOCATION ===== */}
          <div className="pt-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-4 gap-4"
            >
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
                  Location 02
                </p>
                <h3 className="font-display text-2xl md:text-3xl tracking-wider text-foreground">
                  STREET BARBERS IALYSSOS
                </h3>
              </div>
              <a
                href="https://www.instagram.com/street_barbers_ialysos/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Street Barbers Ialyssos on Instagram"
                className="hidden sm:inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                @street_barbers_ialysos
              </a>
            </motion.div>

            <GalleryImage src={galleryTeamIalyssos} alt="Street Barbers Ialyssos team" className="aspect-[16/9] w-full" index={5} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <GalleryImage src={galleryBuzzCut} alt="Buzz cut precision" className="aspect-square" index={6} />
              <GalleryImage src={gallerySkinFade} alt="Skin fade detail" className="aspect-square" index={7} />
            </div>

            <a
              href="https://www.instagram.com/street_barbers_ialysos/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 group flex items-center justify-center gap-3 border border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-500 py-4 font-body text-[11px] uppercase tracking-[0.3em] text-foreground"
            >
              <Instagram className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
              View more on Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
