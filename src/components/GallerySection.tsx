import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import galleryHero from "@/assets/gallery-hero.jpg";
import galleryFadeSide from "@/assets/gallery-fade-side.jpg";
import galleryOldStyle from "@/assets/gallery-old-style.jpg";
import galleryDropFade from "@/assets/gallery-drop-fade.jpg";
import galleryStorefrontNight from "@/assets/gallery-storefront-night.jpg";
import galleryBurstFade from "@/assets/gallery-burst-fade.jpg";
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

type Img = { src: string; alt: string };

const LocationGalleryBlock = ({
  label,
  title,
  instagramUrl,
  instagramHandle,
  heroImage,
  gridImages,
  startIndex,
}: {
  label: string;
  title: string;
  instagramUrl: string;
  instagramHandle: string;
  heroImage: Img;
  gridImages: Img[];
  startIndex: number;
}) => (
  <div className="pt-12 md:pt-16">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex items-end justify-between mb-4 gap-4"
    >
      <div>
        <p className="font-body text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-2">
          {label}
        </p>
        <h3 className="font-display text-2xl md:text-3xl tracking-wider text-foreground">
          {title}
        </h3>
      </div>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Follow ${title} on Instagram`}
        className="hidden sm:inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1"
      >
        <Instagram className="w-3.5 h-3.5" />
        {instagramHandle}
      </a>
    </motion.div>

    {/* Hero image — full width, consistent ratio */}
    <GalleryImage src={heroImage.src} alt={heroImage.alt} className="aspect-[16/9] w-full" index={startIndex} />

    {/* 3-image grid — same on both locations */}
    <div className="grid grid-cols-3 gap-3 mt-3">
      {gridImages.map((img, i) => (
        <GalleryImage
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="aspect-square"
          index={startIndex + 1 + i}
        />
      ))}
    </div>

    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 group flex items-center justify-center gap-3 border border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-500 py-4 font-body text-[11px] uppercase tracking-[0.3em] text-foreground"
    >
      <Instagram className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
      View more on Instagram
    </a>
  </div>
);

const GallerySection = () => {
  return (
    <section className="py-24 md:py-32 bg-background" id="gallery">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
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
          <LocationGalleryBlock
            label="Location 01"
            title="STREET BARBERS CENTER"
            instagramUrl="https://www.instagram.com/streetbarbers.store/"
            instagramHandle="@streetbarbers.store"
            heroImage={{ src: galleryStorefrontNight, alt: "Street Barbers Center storefront at night" }}
            gridImages={[
              { src: galleryFadeSide, alt: "Clean fade haircut" },
              { src: galleryOldStyle, alt: "Classic old style cut" },
              { src: galleryDropFade, alt: "Drop fade haircut" },
            ]}
            startIndex={1}
          />

          {/* ===== IALYSSOS LOCATION ===== */}
          <LocationGalleryBlock
            label="Location 02"
            title="STREET BARBERS IALYSSOS"
            instagramUrl="https://www.instagram.com/street_barbers_ialysos/"
            instagramHandle="@street_barbers_ialysos"
            heroImage={{ src: galleryTeamIalyssos, alt: "Street Barbers Ialyssos team" }}
            gridImages={[
              { src: galleryBuzzCut, alt: "Buzz cut precision" },
              { src: gallerySkinFade, alt: "Skin fade detail" },
              { src: galleryBurstFade, alt: "Burst fade by @ilias_mavroudis" },
            ]}
            startIndex={5}
          />
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
