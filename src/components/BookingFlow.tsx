import { useState, useEffect, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Scissors, User, CalendarDays, Check, ChevronLeft, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfToday } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type Location = { id: string; name: string; address: string; phone: string };
type Service = { id: string; name: string; price: number; duration_minutes: number };
type Barber = { id: string; name: string; location_id: string };
type BlockedDate = { blocked_date: string; location_id: string | null; barber_id: string | null };
type BlockedTimeSlot = { blocked_date: string; blocked_time: string; location_id: string | null; barber_id: string | null };

const STEPS = [
  { label: "Location", icon: MapPin },
  { label: "Service", icon: Scissors },
  { label: "Barber", icon: User },
  { label: "Date & Time", icon: CalendarDays },
  { label: "Confirm", icon: Check },
];

const TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
];

const BookingFlow = forwardRef<HTMLDivElement>((_, ref) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Cache static data with long staleTime
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await supabase.from("locations").select("*");
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 min
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*");
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch barbers only when location is selected
  const { data: barbers = [] } = useQuery<Barber[]>({
    queryKey: ["barbers", selectedLocation?.id],
    queryFn: async () => {
      const { data } = await supabase.from("barbers").select("*").eq("location_id", selectedLocation!.id);
      return data || [];
    },
    enabled: !!selectedLocation,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch blocked dates only when location is selected (needed for date picker)
  const { data: blockedDates = [] } = useQuery<BlockedDate[]>({
    queryKey: ["blocked_dates", selectedLocation?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blocked_dates")
        .select("blocked_date,location_id,barber_id")
        .or(`location_id.is.null,location_id.eq.${selectedLocation!.id}`);
      return data || [];
    },
    enabled: !!selectedLocation,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch blocked time slots only when we need to show times (location+barber+date selected)
  const { data: blockedTimeSlots = [] } = useQuery<BlockedTimeSlot[]>({
    queryKey: ["blocked_time_slots", selectedLocation?.id, selectedBarber?.id, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("blocked_time_slots")
        .select("blocked_date,blocked_time,location_id,barber_id")
        .eq("blocked_date", selectedDate)
        .or(`location_id.is.null,location_id.eq.${selectedLocation!.id}`)
        .or(`barber_id.is.null,barber_id.eq.${selectedBarber!.id}`);
      return data || [];
    },
    enabled: !!selectedLocation && !!selectedBarber && !!selectedDate,
    staleTime: 60 * 1000, // 1 min for availability
  });

  // Fetch booked slots only when barber+date selected
  const { data: bookedSlots = [] } = useQuery<string[]>({
    queryKey: ["booked_slots", selectedBarber?.id, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("barber_id", selectedBarber!.id)
        .eq("booking_date", selectedDate)
        .neq("status", "cancelled");
      return data?.map((b) => b.booking_time) || [];
    },
    enabled: !!selectedBarber && !!selectedDate,
    staleTime: 30 * 1000, // 30s for real-time accuracy
  });

  const isDateBlocked = useCallback((dateStr: string) => {
    return blockedDates.some((bd) => {
      if (bd.blocked_date !== dateStr) return false;
      const locMatch = !bd.location_id || bd.location_id === selectedLocation?.id;
      const barberMatch = !bd.barber_id || bd.barber_id === selectedBarber?.id;
      return locMatch && barberMatch;
    });
  }, [blockedDates, selectedLocation?.id, selectedBarber?.id]);

  const isSlotBlocked = useCallback((dateStr: string, time: string) => {
    return blockedTimeSlots.some((bts) => {
      if (bts.blocked_date !== dateStr || bts.blocked_time !== time) return false;
      const locMatch = !bts.location_id || bts.location_id === selectedLocation?.id;
      const barberMatch = !bts.barber_id || bts.barber_id === selectedBarber?.id;
      return locMatch && barberMatch;
    });
  }, [blockedTimeSlots, selectedLocation?.id, selectedBarber?.id]);

  const dates = Array.from({ length: 21 }, (_, i) => addDays(startOfToday(), i))
    .filter((d) => d.getDay() !== 0)
    .filter((d) => !isDateBlocked(format(d, "yyyy-MM-dd")))
    .slice(0, 14)
    .map((d) => format(d, "yyyy-MM-dd"));

  const handleSubmit = async () => {
    if (!selectedLocation || !selectedService || !selectedBarber || !selectedDate || !selectedTime || !customerName || !customerPhone) return;
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      location_id: selectedLocation.id,
      service_id: selectedService.id,
      barber_id: selectedBarber.id,
      booking_date: selectedDate,
      booking_time: selectedTime,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      price_at_booking: selectedService.price,
      duration_at_booking: selectedService.duration_minutes,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("This time slot was just booked. Please choose another.");
      else toast.error("Booking failed. Please try again.");
      return;
    }
    toast.success("Appointment booked successfully!");
    setStep(5);
  };

  const goBack = () => { if (step > 0) setStep(step - 1); };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <section ref={ref} className="py-24 bg-background border-t border-border" id="booking">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-display text-5xl md:text-6xl tracking-wider text-foreground">BOOK NOW</h2>
        </motion.div>

        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mb-12 max-w-lg mx-auto">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body transition-colors ${i <= step ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                {i < STEPS.length - 1 && <div className={`w-6 h-px transition-colors ${i < step ? "bg-foreground" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {step > 0 && step < 5 && (
            <button onClick={goBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="loc" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="grid sm:grid-cols-2 gap-4">
                {locations.map((loc) => (
                  <button key={loc.id} onClick={() => { setSelectedLocation(loc); setStep(1); }} className="bg-card border border-border p-6 text-left hover:border-foreground/30 transition-all group">
                    <MapPin className="w-5 h-5 text-foreground mb-3" />
                    <h3 className="font-display text-xl tracking-wider text-foreground">{loc.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1 font-body">{loc.address}</p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-2 font-body"><Phone className="w-3 h-3" />{loc.phone}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="svc" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="grid sm:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <button key={svc.id} onClick={() => { setSelectedService(svc); setStep(2); }} className="bg-card border border-border p-6 text-center hover:border-foreground/30 transition-all">
                    <h3 className="font-display text-xl tracking-wider text-foreground">{svc.name}</h3>
                    <p className="font-body text-2xl font-light text-foreground mt-3">€{svc.price}</p>
                    <p className="text-muted-foreground text-xs mt-1 font-body">{svc.duration_minutes} min</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="barber" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="grid sm:grid-cols-3 gap-4">
                {barbers.map((b) => (
                  <button key={b.id} onClick={() => { setSelectedBarber(b); setStep(3); }} className="bg-card border border-border p-8 text-center hover:border-foreground/30 transition-all">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl tracking-wider text-foreground">{b.name}</h3>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="datetime" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <p className="font-body text-sm text-muted-foreground mb-3">Select a date</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((d) => {
                      const dateObj = new Date(d + "T00:00:00");
                      return (
                        <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime(""); }} className={`flex-shrink-0 w-16 py-3 text-center font-body text-sm transition-all border ${selectedDate === d ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground hover:border-foreground/30"}`}>
                          <span className="block text-xs opacity-70">{format(dateObj, "EEE")}</span>
                          <span className="block font-semibold">{format(dateObj, "d")}</span>
                          <span className="block text-xs opacity-70">{format(dateObj, "MMM")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-3">Select a time</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {TIME_SLOTS.map((t) => {
                        const isBooked = bookedSlots.includes(t);
                        const isBlocked = isSlotBlocked(selectedDate, t);
                        const unavailable = isBooked || isBlocked;
                        return (
                          <button key={t} disabled={unavailable} onClick={() => { setSelectedTime(t); setStep(4); }} className={`py-2 font-body text-sm transition-all border ${unavailable ? "bg-secondary/50 text-muted-foreground border-border cursor-not-allowed line-through" : selectedTime === t ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground hover:border-foreground/30"}`}>
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="confirm" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6">
                <div className="bg-card border border-border p-6 space-y-3">
                  <p className="text-sm text-muted-foreground font-body">Booking Summary</p>
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="text-foreground">{selectedLocation?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-foreground">{selectedService?.name} — €{selectedService?.price}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Barber</span><span className="text-foreground">{selectedBarber?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{selectedDate && format(new Date(selectedDate + "T00:00:00"), "EEEE, d MMMM yyyy")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground font-semibold">{selectedTime}</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground font-body mb-1">Your Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" className="w-full bg-card border border-border px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground font-body mb-1">Phone Number</label>
                    <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+30 694 123 4567" className="w-full bg-card border border-border px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors" />
                  </div>
                </div>

                <motion.button onClick={handleSubmit} disabled={!customerName.trim() || !customerPhone.trim() || submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-foreground text-background font-body font-semibold py-4 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : "Confirm Booking"}
                </motion.button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="success" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="text-center py-12">
                <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-background" />
                </div>
                <h3 className="font-display text-4xl tracking-wider text-foreground mb-3">YOU'RE ALL SET</h3>
                <p className="text-muted-foreground font-body mb-8">
                  Your appointment with <span className="text-foreground">{selectedBarber?.name}</span> at <span className="text-foreground">{selectedLocation?.name}</span> is confirmed for{" "}
                  <span className="text-foreground">{selectedDate && format(new Date(selectedDate + "T00:00:00"), "d MMMM")} at {selectedTime}</span>.
                </p>
                <button onClick={() => { setStep(0); setSelectedLocation(null); setSelectedService(null); setSelectedBarber(null); setSelectedDate(""); setSelectedTime(""); setCustomerName(""); setCustomerPhone(""); }} className="font-body text-sm text-foreground underline hover:no-underline">
                  Book another appointment
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

BookingFlow.displayName = "BookingFlow";

export default BookingFlow;
