import { useState, useEffect, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Scissors, User, CalendarDays, Check, ChevronLeft, Phone, Loader2, Sparkles } from "lucide-react";
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
type ScheduleOverride = { override_date: string; start_time: string; end_time: string; is_working: boolean };

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
  const [customerEmail, setCustomerEmail] = useState("");
  const [isAnyBarber, setIsAnyBarber] = useState(false);
  const [assignedBarber, setAssignedBarber] = useState<Barber | null>(null);

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

  // Fetch date-specific overrides for this barber (next 14 days)
  const { data: scheduleOverrides = [] } = useQuery<ScheduleOverride[]>({
    queryKey: ["schedule_overrides", selectedBarber?.id],
    queryFn: async () => {
      const today = format(startOfToday(), "yyyy-MM-dd");
      const end = format(addDays(startOfToday(), 30), "yyyy-MM-dd");
      const { data } = await supabase
        .from("barber_schedule_overrides")
        .select("override_date,start_time,end_time,is_working")
        .eq("barber_id", selectedBarber!.id)
        .gte("override_date", today)
        .lte("override_date", end);
      return (data || []).map((r: any) => ({
        override_date: r.override_date,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
        is_working: r.is_working,
      }));
    },
    enabled: !!selectedBarber,
    staleTime: 60 * 1000,
  });
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

  // All barbers' booked slots for "any barber" mode
  const { data: allBarbersSlots = [] } = useQuery<{ id: string; booked: { time: string; dur: number }[] }[]>({
    queryKey: ["all_barbers_slots", selectedDate, isAnyBarber, barbers.map(b => b.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        barbers.map(b => supabase.rpc("get_booked_slots", { _barber_id: b.id, _date: selectedDate }))
      );
      return barbers.map((b, i) => ({
        id: b.id,
        booked: (results[i].data || []).map((s: any) => ({
          time: trimTime(s.booking_time),
          dur: s.duration_at_booking || 30,
        })),
      }));
    },
    enabled: isAnyBarber && !!selectedDate && barbers.length > 0,
    staleTime: 30 * 1000,
  });

  // Fetch booked slots only when barber+date selected
  const { data: bookedSlots = [] } = useQuery<{ booking_time: string; duration_at_booking: number | null }[]>({
    queryKey: ["booked_slots", selectedBarber?.id, selectedDate],
    queryFn: async () => {
      // Public RPC that returns only time + duration (no PII)
      const { data } = await supabase.rpc("get_booked_slots", {
        _barber_id: selectedBarber!.id,
        _date: selectedDate,
      });
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

  // Resolve effective working hours for a given date: override beats weekly pattern.
  const overrideByDate = new Map(scheduleOverrides.map((o) => [o.override_date, o]));
  const getEffectiveHours = useCallback(
    (dateStr: string): { is_working: boolean; start_time: string; end_time: string } | null => {
      const ov = overrideByDate.get(dateStr);
      if (ov) return { is_working: ov.is_working, start_time: ov.start_time, end_time: ov.end_time };
      const dow = new Date(dateStr + "T00:00:00").getDay();
      const wh = workingHours.find((w) => w.day_of_week === dow);
      if (!wh) return null;
      return { is_working: wh.is_working, start_time: wh.start_time, end_time: wh.end_time };
    },
    [overrideByDate, workingHours]
  );

  // A date is available if effective hours mark it as working and it isn't blocked
  const dates = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i))
    .filter((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      const eff = getEffectiveHours(dateStr);
      if (workingHours.length === 0 && !overrideByDate.has(dateStr)) {
        // No schedule loaded yet — fall back to "not Sunday"
        return d.getDay() !== 0;
      }
      return eff?.is_working === true;
    })
    .filter((d) => !isDateBlocked(format(d, "yyyy-MM-dd")))
    .slice(0, 14)
    .map((d) => format(d, "yyyy-MM-dd"));

  // Available time slots for the selected date based on effective schedule
  const availableSlots: string[] = (() => {
    if (!selectedDate) return [];
    const eff = getEffectiveHours(selectedDate);
    if (!eff || !eff.is_working) return [];
    const slots = generateSlots(eff.start_time, eff.end_time);

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
    if (!selectedLocation || !selectedService || !selectedBarber || !selectedDate || !selectedTime || !customerName || !customerPhone || !customerEmail) return;
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim().toLowerCase();
    if (name.length < 2 || name.length > 50) {
      toast.error("Name must be between 2 and 50 characters");
      return;
    }
    if (!/^(69\d{8}|2\d{9})$/.test(phone)) {
      toast.error("Enter a valid Greek phone (10 digits, starting with 69 or 2)");
      return;
    }
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    // In "any barber" mode, pick the first barber with no conflict at this slot
    let barberForBooking = selectedBarber;
    if (isAnyBarber && allBarbersSlots.length > 0) {
      const dur = selectedService.duration_minutes;
      const start = toMin(selectedTime);
      const freeEntry = allBarbersSlots.find(({ booked }) => {
        const occ = new Set<string>();
        booked.forEach(b => { for (let m = toMin(b.time); m < toMin(b.time) + b.dur; m += 30) occ.add(fromMin(m)); });
        for (let m = start; m < start + dur; m += 30) { if (occ.has(fromMin(m))) return false; }
        return true;
      });
      if (freeEntry) barberForBooking = barbers.find(b => b.id === freeEntry.id) ?? selectedBarber;
    }
    setAssignedBarber(barberForBooking);

    setSubmitting(true);

    const { error } = await supabase.rpc("create_booking", {
      p_location_id:    selectedLocation.id,
      p_service_id:     selectedService.id,
      p_barber_id:      barberForBooking!.id,
      p_booking_date:   selectedDate,
      p_booking_time:   selectedTime,
      p_customer_name:  name,
      p_customer_phone: phone,
      p_customer_email: email,
    });

    setSubmitting(false);
    if (error) {
      console.error("Booking error:", error);
      if (error.code === "23505") toast.error("This time slot was just booked. Please choose another.");
      else toast.error(error.message || "Booking failed. Please try again.");
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
              <motion.div key="barber" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* "Any barber" — first available */}
                {barbers.length > 0 && (
                  <button
                    key="any-barber"
                    onClick={() => { setIsAnyBarber(true); setSelectedBarber(barbers[0]); setStep(3); }}
                    className="group text-left overflow-hidden rounded-2xl transition-all duration-[250ms] ease-out hover:-translate-y-1"
                    style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <div
                      className="relative w-full aspect-square flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #050505 100%)" }}
                    >
                      <Sparkles className="text-white/80" style={{ width: "clamp(40px, 7vw, 64px)", height: "clamp(40px, 7vw, 64px)" }} strokeWidth={1.25} />
                    </div>
                    <div className="py-4 px-4 text-center">
                      <h3 className="text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "18px", lineHeight: 1.2 }}>
                        Any barber
                      </h3>
                      <p className="mt-1 text-muted-foreground font-body" style={{ fontSize: "11px" }}>
                        first available
                      </p>
                    </div>
                  </button>
                )}
                {barbers.map((b) => {
                  const isSelected = selectedBarber?.id === b.id;
                  const initial = (b.name || "?").trim().charAt(0).toUpperCase();
                  return (
                    <button
                      key={b.id}
                      onClick={() => { setIsAnyBarber(false); setAssignedBarber(null); setSelectedBarber(b); setStep(3); }}
                      className={`group text-left overflow-hidden rounded-2xl transition-all duration-[250ms] ease-out hover:-translate-y-1 ${isSelected ? "ring-2 ring-foreground shadow-[inset_0_0_24px_rgba(255,255,255,0.08)]" : ""}`}
                      style={{
                        background: "#111",
                        border: isSelected ? "2px solid hsl(var(--ring))" : "1px solid rgba(255,255,255,0.08)",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >
                      <div
                        className="relative w-full aspect-square flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #050505 100%)" }}
                      >
                        <span
                          className="text-white select-none"
                          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(56px, 9vw, 96px)", lineHeight: 1 }}
                        >
                          {initial}
                        </span>
                      </div>
                      <div className="py-4 px-4 text-center">
                        <h3 className="text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "18px", lineHeight: 1.2 }}>
                          {b.name}
                        </h3>
                      </div>
                    </button>
                  );
                })}
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
                        const dur = selectedService?.duration_minutes || 30;
                        const start = toMin(t);
                        const eff = getEffectiveHours(selectedDate);
                        let unavailable = false;

                        if (isAnyBarber && allBarbersSlots.length > 0) {
                          // Unavailable only if NO barber is free for this slot
                          const anyFree = allBarbersSlots.some(({ booked }) => {
                            const occ = new Set<string>();
                            booked.forEach(b => { for (let m = toMin(b.time); m < toMin(b.time) + b.dur; m += 30) occ.add(fromMin(m)); });
                            for (let m = start; m < start + dur; m += 30) {
                              if (occ.has(fromMin(m)) || isSlotBlocked(selectedDate, fromMin(m))) return false;
                            }
                            return true;
                          });
                          unavailable = !anyFree;
                        } else {
                          for (let m = start; m < start + dur; m += 30) {
                            const s = fromMin(m);
                            if (occupiedSlots.has(s) || isSlotBlocked(selectedDate, s)) { unavailable = true; break; }
                          }
                        }
                        // Block slots whose service-duration would exceed working hours
                        if (eff && eff.is_working && start + dur > toMin(eff.end_time)) unavailable = true;

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
                    <div className="flex justify-between"><span className="text-muted-foreground">Barber</span><span className="text-foreground">{isAnyBarber ? "First available" : selectedBarber?.name}</span></div>
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
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="6941234567"
                      className="w-full bg-card border border-border px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1 font-body">10 digits, starting with 69 or 2</p>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground font-body mb-1">
                      Email Address <span className="text-muted-foreground/50">(confirmation &amp; reminder will be sent here)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-card border border-border px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                    />
                  </div>
                </div>

                <motion.button onClick={handleSubmit} disabled={!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-foreground text-background font-body font-semibold py-4 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                  Your appointment with <span className="text-foreground">{(assignedBarber ?? selectedBarber)?.name}</span> at <span className="text-foreground">{selectedLocation?.name}</span> is confirmed for{" "}
                  <span className="text-foreground">{selectedDate && format(new Date(selectedDate + "T00:00:00"), "d MMMM")} at {selectedTime}</span>.
                </p>
                <button onClick={() => { setStep(0); setSelectedLocation(null); setSelectedService(null); setSelectedBarber(null); setSelectedDate(""); setSelectedTime(""); setCustomerName(""); setCustomerPhone(""); setCustomerEmail(""); setIsAnyBarber(false); setAssignedBarber(null); }} className="font-body text-sm text-foreground underline hover:no-underline">
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
