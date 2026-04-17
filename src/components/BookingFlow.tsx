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
type WorkingHour = { day_of_week: number; start_time: string; end_time: string; is_working: boolean };

const STEPS = [
  { label: "Location", icon: MapPin },
  { label: "Service", icon: Scissors },
  { label: "Barber", icon: User },
  { label: "Date & Time", icon: CalendarDays },
  { label: "Confirm", icon: Check },
];

const trimTime = (t: string) => (t?.length >= 5 ? t.substring(0, 5) : t);

// Generate 30-min time slots between start (inclusive) and end (exclusive of end)
const generateSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur < endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    cur += 30;
  }
  return slots;
};

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

  // Fetch barber's weekly schedule when a barber is selected
  const { data: workingHours = [] } = useQuery<WorkingHour[]>({
    queryKey: ["working_hours", selectedBarber?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("barber_working_hours")
        .select("day_of_week,start_time,end_time,is_working")
        .eq("barber_id", selectedBarber!.id);
      return (data || []).map((r: any) => ({
        day_of_week: r.day_of_week,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
        is_working: r.is_working,
      }));
    },
    enabled: !!selectedBarber,
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
  const { data: bookedSlots = [] } = useQuery<{ booking_time: string; duration_at_booking: number | null }[]>({
    queryKey: ["booked_slots", selectedBarber?.id, selectedDate],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("booking_time,duration_at_booking")
        .eq("barber_id", selectedBarber!.id)
        .eq("booking_date", selectedDate)
        .neq("status", "cancelled");
      return (data || []).map((b: any) => ({
        booking_time: trimTime(b.booking_time),
        duration_at_booking: b.duration_at_booking,
      }));
    },
    enabled: !!selectedBarber && !!selectedDate,
    staleTime: 30 * 1000, // 30s for real-time accuracy
  });

  // Build a Set of every 30-min slot that is occupied (accounting for service duration)
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  const occupiedSlots = new Set<string>();
  bookedSlots.forEach((b) => {
    const start = toMin(b.booking_time);
    const dur = b.duration_at_booking || 30;
    for (let m = start; m < start + dur; m += 30) {
      occupiedSlots.add(fromMin(m));
    }
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

  // A date is available if the barber has a working schedule for that weekday and it isn't blocked
  const workingDays = new Set(workingHours.filter((w) => w.is_working).map((w) => w.day_of_week));

  const dates = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i))
    .filter((d) => workingDays.size === 0 ? d.getDay() !== 0 : workingDays.has(d.getDay()))
    .filter((d) => !isDateBlocked(format(d, "yyyy-MM-dd")))
    .slice(0, 14)
    .map((d) => format(d, "yyyy-MM-dd"));

  // Available time slots for the selected date based on the barber's schedule for that weekday
  const availableSlots: string[] = (() => {
    if (!selectedDate) return [];
    const dow = new Date(selectedDate + "T00:00:00").getDay();
    const wh = workingHours.find((w) => w.day_of_week === dow);
    if (!wh || !wh.is_working) return [];
    const slots = generateSlots(wh.start_time, wh.end_time);

    // Same-day filter: hide past slots and apply a 30-minute buffer.
    // Use the business's local timezone (Europe/Athens) for "now".
    const TZ = "Europe/Athens";
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date()).reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
    const todayStr = `${parts.year}-${parts.month}-${parts.day}`;
    if (selectedDate !== todayStr) return slots;

    const BUFFER_MIN = 30;
    const nowMin = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    const cutoff = nowMin + BUFFER_MIN;
    return slots.filter((t) => toMin(t) >= cutoff);
  })();

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
                      {availableSlots.length === 0 && (
                        <p className="col-span-full text-muted-foreground text-sm font-body">No available slots for this day.</p>
                      )}
                      {availableSlots.map((t) => {
                        // Check if this slot OR any slot the chosen service would occupy is taken
                        const dur = selectedService?.duration_minutes || 30;
                        const start = toMin(t);
                        let unavailable = false;
                        for (let m = start; m < start + dur; m += 30) {
                          const s = fromMin(m);
                          if (occupiedSlots.has(s) || isSlotBlocked(selectedDate, s)) {
                            unavailable = true;
                            break;
                          }
                        }
                        // Also block slots whose service-duration would exceed working hours
                        const dow = new Date(selectedDate + "T00:00:00").getDay();
                        const wh = workingHours.find((w) => w.day_of_week === dow);
                        if (wh && start + dur > toMin(wh.end_time)) unavailable = true;

                        return (
                          <button
                            key={t}
                            disabled={unavailable}
                            aria-disabled={unavailable}
                            onClick={() => { if (!unavailable) { setSelectedTime(t); setStep(4); } }}
                            className={`relative py-2 font-body text-sm border overflow-hidden ${
                              unavailable
                                ? "bg-secondary/30 text-muted-foreground/60 border-border/50 cursor-not-allowed line-through opacity-50 pointer-events-none"
                                : selectedTime === t
                                ? "bg-foreground text-background border-foreground transition-all"
                                : "bg-card border-border text-foreground hover:border-foreground/30 hover:bg-secondary/40 transition-all cursor-pointer"
                            }`}
                          >
                            {unavailable && (
                              <span
                                aria-hidden
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  backgroundImage:
                                    "repeating-linear-gradient(135deg, transparent 0 6px, hsl(var(--muted-foreground) / 0.18) 6px 7px)",
                                }}
                              />
                            )}
                            <span className="relative">{t}</span>
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
