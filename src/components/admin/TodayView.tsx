import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Phone, Clock, User, Scissors } from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  location_id: string;
  barber_id: string;
  service_id: string;
  price_at_booking: number | null;
};

type Barber = { id: string; name: string; location_id: string };
type Service = { id: string; name: string };
type Location = { id: string; name: string };

type Filter = "today" | "tomorrow" | "all";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  confirmed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  completed: "bg-green-600/20 text-green-400 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

interface Props {
  bookings: Booking[];
  barbers: Barber[];
  services: Service[];
  locations: Location[];
}

const TodayView = ({ bookings, barbers, services, locations }: Props) => {
  const [filter, setFilter] = useState<Filter>("today");

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => b.status !== "cancelled")
      .filter((b) => {
        if (filter === "today") return b.booking_date === today;
        if (filter === "tomorrow") return b.booking_date === tomorrow;
        return true;
      })
      .sort((a, b) => {
        if (a.booking_date !== b.booking_date) return a.booking_date.localeCompare(b.booking_date);
        return a.booking_time.localeCompare(b.booking_time);
      });
  }, [bookings, filter, today, tomorrow]);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    barbers.forEach((b) => map.set(b.id, []));
    filtered.forEach((b) => {
      if (!map.has(b.barber_id)) map.set(b.barber_id, []);
      map.get(b.barber_id)!.push(b);
    });
    return Array.from(map.entries())
      .filter(([, list]) => list.length > 0)
      .map(([barberId, list]) => ({
        barber: barbers.find((b) => b.id === barberId),
        bookings: list,
      }));
  }, [filtered, barbers]);

  const getName = <T extends { id: string; name: string }>(list: T[], id: string) =>
    list.find((i) => i.id === id)?.name || "—";

  const filterLabel =
    filter === "today" ? format(new Date(), "EEEE, MMM d") :
    filter === "tomorrow" ? format(addDays(new Date(), 1), "EEEE, MMM d") :
    "All upcoming";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-wider">TODAY'S SCHEDULE</h2>
          <p className="text-muted-foreground text-xs">{filterLabel} · {filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
          {(["today", "tomorrow", "all"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className="h-7 px-3 text-xs capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No bookings for {filter === "all" ? "any date" : filter}.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map(({ barber, bookings: list }) => (
            <Card key={barber?.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-display text-lg tracking-wide">{barber?.name || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">{getName(locations, barber?.location_id || "")}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{list.length} booking{list.length !== 1 ? "s" : ""}</Badge>
                </div>

                <div className="space-y-2">
                  {list.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-md border border-border/50 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 font-mono text-base font-semibold">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {b.booking_time.slice(0, 5)}
                          {filter === "all" && (
                            <span className="text-xs text-muted-foreground font-body font-normal ml-1">
                              · {b.booking_date}
                            </span>
                          )}
                        </div>
                        <Badge className={`${statusColors[b.status] || ""} text-xs`}>{b.status}</Badge>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{b.customer_name}</span>
                        </div>
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{b.customer_phone}</span>
                        </a>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Scissors className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{getName(services, b.service_id)}</span>
                          {b.price_at_booking != null && (
                            <span className="ml-auto text-foreground font-medium">€{b.price_at_booking}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayView;
