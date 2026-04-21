import { cn } from "@/lib/utils";

interface BarberPoleProps {
  className?: string;
}

/**
 * Subtle barber-pole accent — animated diagonal stripes inside a slim
 * vertical capsule. Black/white aesthetic, decorative only.
 */
const BarberPole = ({ className }: BarberPoleProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-2 h-24 rounded-full overflow-hidden border border-foreground/20 shadow-[0_0_20px_-8px_hsl(var(--foreground)/0.4)]",
        className,
      )}
    >
      <div className="absolute inset-0 barber-pole-stripes animate-barber-pole" />
      {/* Glass highlight for subtle 3D feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 via-transparent to-background/40 pointer-events-none" />
    </div>
  );
};

export default BarberPole;