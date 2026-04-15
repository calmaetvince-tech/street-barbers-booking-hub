import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from "date-fns";

type Booking = { id: string; booking_date: string; booking_time: string; status: string; customer_name: string; barber_id: string; location_id: string };
type BlockedDate = { id: string; blocked_date: string; location_id: string | null; barber_id: string | null };
type Location = { id: string; name: string };
type Barber = { id: string; name: string; location_id: string };

interface Props {
  bookings: Booking[];
  blockedDates: BlockedDate[];
  locations: Location[];
  barbers: Barber[];
}

const CalendarView = ({ bookings, blockedDates, locations, barbers }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterBarber, setFilterBarber] = useState("all");

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = getDay(startOfMonth(currentMonth));
  const adjustedPadding = startPadding === 0 ? 6 : startPadding - 1; // Monday start

  const getDateBookings = (date: string) => {
    return bookings.filter((b) => {
      if (b.booking_date !== date) return false;
      if (b.status === "cancelled") return false;
      if (filterLocation !== "all" && b.location_id !== filterLocation) return false;
      if (filterBarber !== "all" && b.barber_id !== filterBarber) return false;
      return true;
    });
  };

  const isBlocked = (date: string) => {
    return blockedDates.some((bd) => {
      if (bd.blocked_date !== date) return false;
      if (filterLocation !== "all" && bd.location_id && bd.location_id !== filterLocation) return false;
      if (filterBarber !== "all" && bd.barber_id && bd.barber_id !== filterBarber) return false;
      return true;
    });
  };

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
            <CalIcon className="w-5 h-5" /> CALENDAR
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="All Locations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBarber} onValueChange={setFilterBarber}>
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="All Barbers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Barbers</SelectItem>
                {barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-display text-lg tracking-wider">{format(currentMonth, "MMMM yyyy").toUpperCase()}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-accent rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-body py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: adjustedPadding }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayBookings = getDateBookings(dateStr);
            const blocked = isBlocked(dateStr);
            const isToday = dateStr === today;

            return (
              <div
                key={dateStr}
                className={`min-h-[60px] md:min-h-[80px] border rounded p-1 text-xs font-body ${
                  blocked
                    ? "bg-destructive/10 border-destructive/30"
                    : isToday
                    ? "border-foreground/40 bg-accent/30"
                    : "border-border"
                }`}
              >
                <div className={`font-semibold mb-0.5 ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </div>
                {blocked && <span className="text-destructive text-[10px]">CLOSED</span>}
                {dayBookings.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {dayBookings.length} appt{dayBookings.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
