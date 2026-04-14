import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BookingFlow from "@/components/BookingFlow";
import ContactSection from "@/components/ContactSection";
import { Scissors } from "lucide-react";

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
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">Street Barbers</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body text-sm text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#booking" className="hover:text-primary transition-colors">Book</a>
            <a href="#contact" className="hover:text-primary transition-colors">Locations</a>
          </div>
          <button onClick={scrollToBooking} className="bg-gold-gradient text-primary-foreground font-body font-semibold px-5 py-2 rounded-sm text-xs uppercase tracking-widest">
            Book Now
          </button>
        </div>
      </nav>

      <HeroSection onBookNow={scrollToBooking} />
      <ServicesSection />
      <BookingFlow ref={bookingRef} />
      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm font-body">© 2026 Street Barbers. All rights reserved. Rhodes, Greece.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
