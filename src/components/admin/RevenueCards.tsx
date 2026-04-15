import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type Booking = {
  id: string;
  booking_date: string;
  status: string;
  price_at_booking: number | null;
  barber_id: string;
  location_id: string;
  service_id: string;
};

type Location = { id: string; name: string };
type Barber = { id: string; name: string };
type Service = { id: string; name: string };

interface RevenueCardsProps {
  bookings: Booking[];
  locations: Location[];
  barbers: Barber[];
  services: Service[];
}

const RevenueCards = ({ bookings, locations, barbers, services }: RevenueCardsProps) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const revenueBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "completed"
  );

  const calcRevenue = (list: Booking[]) =>
    list.reduce((sum, b) => sum + (b.price_at_booking || 0), 0);

  const totalRevenue = calcRevenue(revenueBookings);
  const todayRevenue = calcRevenue(revenueBookings.filter((b) => b.booking_date === today));
  const weekRevenue = calcRevenue(
    revenueBookings.filter((b) => b.booking_date >= weekStart && b.booking_date <= weekEnd)
  );
  const monthRevenue = calcRevenue(
    revenueBookings.filter((b) => b.booking_date >= monthStart && b.booking_date <= monthEnd)
  );

  const todayBookings = bookings.filter((b) => b.booking_date === today && b.status !== "cancelled").length;
  const upcomingBookings = bookings.filter((b) => b.booking_date >= today && b.status !== "cancelled").length;
  const totalBookings = bookings.filter((b) => b.status !== "cancelled").length;

  // Most booked service
  const serviceCounts: Record<string, number> = {};
  revenueBookings.forEach((b) => {
    serviceCounts[b.service_id] = (serviceCounts[b.service_id] || 0) + 1;
  });
  const topServiceId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topServiceName = services.find((s) => s.id === topServiceId)?.name || "—";

  // Revenue by location
  const revenueByLocation = locations.map((loc) => ({
    name: loc.name,
    revenue: calcRevenue(revenueBookings.filter((b) => b.location_id === loc.id)),
  }));

  // Revenue by barber
  const revenueByBarber = barbers.map((bar) => ({
    name: bar.name,
    revenue: calcRevenue(revenueBookings.filter((b) => b.barber_id === bar.id)),
  }));

  return (
    <div className="space-y-4">
      {/* Top row - revenue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={`€${totalRevenue.toFixed(0)}`} />
        <StatCard icon={DollarSign} label="Today" value={`€${todayRevenue.toFixed(0)}`} />
        <StatCard icon={TrendingUp} label="This Week" value={`€${weekRevenue.toFixed(0)}`} />
        <StatCard icon={TrendingUp} label="This Month" value={`€${monthRevenue.toFixed(0)}`} />
      </div>

      {/* Second row - bookings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Calendar} label="Today's Bookings" value={String(todayBookings)} />
        <StatCard icon={Calendar} label="Upcoming" value={String(upcomingBookings)} />
        <StatCard icon={Users} label="Total Bookings" value={String(totalBookings)} />
        <StatCard icon={Users} label="Top Service" value={topServiceName} small />
      </div>

      {/* Third row - by location & barber */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-body">Revenue by Location</p>
            {revenueByLocation.map((r) => (
              <div key={r.name} className="flex justify-between text-sm font-body py-1">
                <span className="text-foreground">{r.name}</span>
                <span className="text-foreground font-semibold">€{r.revenue.toFixed(0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-body">Revenue by Barber</p>
            {revenueByBarber.map((r) => (
              <div key={r.name} className="flex justify-between text-sm font-body py-1">
                <span className="text-foreground">{r.name}</span>
                <span className="text-foreground font-semibold">€{r.revenue.toFixed(0)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  small?: boolean;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className={`font-bold font-display ${small ? "text-lg truncate" : "text-2xl"}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default RevenueCards;
