import { Phone } from "lucide-react";

const StickyCallCTA = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <a
        href="tel:+302241601358"
        className="flex items-center justify-center gap-2 bg-foreground text-background font-body font-semibold py-4 text-sm uppercase tracking-widest w-full"
      >
        <Phone className="w-4 h-4" />
        Call Now
      </a>
    </div>
  );
};

export default StickyCallCTA;
