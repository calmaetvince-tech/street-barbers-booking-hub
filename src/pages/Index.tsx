import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import BookingFlow from "@/components/BookingFlow";
import ContactSection from "@/components/ContactSection";
import StickyCallCTA from "@/components/StickyCallCTA";
import { Phone } from "lucide-react";

const Index = () => {
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-xl tracking-widest text-foreground">STREET BARBERS</span>
          <div className="hidden md:flex items-center gap-8 font-body text-xs uppercase tracking-widest text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#gallery" className="hover:text-foreground transition-colors">Gallery</a>
            <a href="#booking" className="hover:text-foreground transition-colors">Book</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <a href="tel:+302241601358" className="inline-flex items-center gap-2 bg-foreground text-background font-body font-semibold px-5 py-2 text-xs uppercase tracking-widest">
            <Phone className="w-3 h-3" />
            Call
          </a>
        </div>
      </nav>

      <HeroSection onBookNow={scrollToBooking} />
      <ServicesSection />
      <BookingFlow ref={bookingRef} />
      <ContactSection />
      <GallerySection />
      <StickyCallCTA />

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
