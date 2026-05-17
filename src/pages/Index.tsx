import { useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import BookingFlow from "@/components/BookingFlow";
import ContactSection from "@/components/ContactSection";
import { Calendar } from "lucide-react";
import heroCenterImage from "@/assets/hero-team-refined.jpg";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const BarberPole3D = lazy(() => import("@/components/BarberPole3D"));

const Index = () => {
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Suspense fallback={<div style={{ width: 32, height: 56, marginRight: 10 }} />}>
              <div style={{ marginRight: 10 }}>
                <BarberPole3D />
              </div>
            </Suspense>
            <span className="text-[17px] sm:text-xl tracking-[0.18em] sm:tracking-widest text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>STREET BARBERS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body text-xs uppercase tracking-widest text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#gallery" className="hover:text-foreground transition-colors">Gallery</a>
            <a href="#booking" className="hover:text-foreground transition-colors">Book</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <button
            onClick={scrollToBooking}
            className="inline-flex items-center gap-2 bg-foreground text-background font-body font-semibold px-3 sm:px-5 py-2 text-xs uppercase tracking-widest"
          >
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">Book Now</span>
          </button>
        </div>
      </nav>

      <HeroSection onBookNow={scrollToBooking} />
      <BookingFlow ref={bookingRef} />
      <ServicesSection onBookService={scrollToBooking} />

      <section className="py-24 md:py-32 bg-background" id="team">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-body text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
            The People
          </p>
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">
            OUR TEAM
          </h2>
          <div className="w-12 h-px bg-foreground/30 mx-auto mt-8" />
        </motion.div>

        <ContainerScroll titleComponent={null}>
          <img
            src={heroCenterImage}
            alt="Street Barbers team"
            className="w-full h-full object-cover rounded-2xl"
            width={1920}
            height={1080}
          />
        </ContainerScroll>
      </section>
      <ContactSection />
      <GallerySection />
      

      {/* Footer */}
      <footer className="border-t border-border py-8 pb-20 md:pb-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground text-xs font-body tracking-wide">© 2026 Street Barbers. Rhodes, Greece.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
