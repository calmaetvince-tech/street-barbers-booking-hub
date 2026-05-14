import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarberAuth } from "@/hooks/useBarberAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { LogOut, Clock, Phone, User, Scissors, Plus, Trash2, Settings, KeyRound } from "lucide-react";
import CalendarView from "@/components/admin/CalendarView";
import CalendarScheduleManager from "@/components/admin/CalendarScheduleManager";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  service_id: string;
  location_id: string;
  barber_id: string;
  price_at_booking: number | null;
  duration_at_booking: number | null;
};
type Service = { id: string; name: string; price: number; duration_minutes: number };
type Location = { id: string; name: string };
type BlockedDate = { id: string; blocked_date: string; location_id: string | null; barber_id: string | null };
type BlockedTimeSlot = { id: string; blocked_date: string; blocked_time: string; location_id: string | null; barber_id: string | null };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  confirmed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  completed: "bg-green-600/20 text-green-400 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

// ─── Today Tab ────────────────────────────────────────────
const TodayTab = ({
  bookings,
  services,
}: {
  bookings: Booking[];
  services: Service[];
}) => {
  const [filter, setFilter] = useState<"today" | "tomorrow" | "all">("today");
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

  const getName = (list: { id: string; name: string }[], id: string) =>
    list.find((i) => i.id === id)?.name || "—";

  const filterLabel =
    filter === "today" ? format(new Date(), "EEEE, MMM d") :
    filter === "tomorrow" ? format(addDays(new Date(), 1), "EEEE, MMM d") :
    "All upcoming";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-wider">MY SCHEDULE</h2>
          <p className="text-muted-foreground text-xs">{filterLabel} · {filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-md">
          {(["today", "tomorrow", "all"] as const).map((f) => (
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

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No bookings for {filter === "all" ? "any upcoming date" : filter}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 font-mono text-lg font-semibold">
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
                    <span className="font-medium">{b.customer_name}</span>
                  </div>
                  <a
                    href={`tel:${b.customer_phone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {b.customer_phone}
                  </a>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Scissors className="w-3.5 h-3.5 shrink-0" />
                    <span>{getName(services, b.service_id)}</span>
                    {b.price_at_booking != null && (
                      <span className="ml-auto text-foreground font-medium">€{b.price_at_booking}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Bookings Tab ─────────────────────────────────────────
const BookingsTab = ({
  bookings,
  services,
  onStatusChange,
}: {
  bookings: Booking[];
  services: Service[];
  onStatusChange: (id: string, status: string) => void;
}) => {
  const [filterDate, setFilterDate] = useState("");

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => !filterDate || b.booking_date === filterDate)
      .sort((a, b) => {
        if (a.booking_date !== b.booking_date) return b.booking_date.localeCompare(a.booking_date);
        return a.booking_time.localeCompare(b.booking_time);
      });
  }, [bookings, filterDate]);

  const getName = (list: { id: string; name: string }[], id: string) =>
    list.find((i) => i.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-auto"
        />
        {filterDate && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>
            Clear date
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">No bookings found</CardContent>
          </Card>
        )}
        {filtered.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg tracking-wide">{b.customer_name}</p>
                  <a href={`tel:${b.customer_phone}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {b.customer_phone}
                  </a>
                </div>
                <Select value={b.status} onValueChange={(v) => onStatusChange(b.id, v)}>
                  <SelectTrigger className="h-7 w-auto text-xs border-0 p-0 gap-1">
                    <Badge className={`${statusColors[b.status] || ""} text-[10px]`}>{b.status}</Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-body">
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{b.booking_date}</p></div>
                <div><p className="text-muted-foreground">Time</p><p className="font-medium font-mono">{b.booking_time.slice(0, 5)}</p></div>
                <div><p className="text-muted-foreground">Service</p><p className="truncate">{getName(services, b.service_id)}</p></div>
                <div><p className="text-muted-foreground">Price</p><p className="font-medium">{b.price_at_booking != null ? `€${b.price_at_booking}` : "—"}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings found</TableCell>
                </TableRow>
              )}
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="whitespace-nowrap">{b.booking_date}</TableCell>
                  <TableCell className="font-mono">{b.booking_time.slice(0, 5)}</TableCell>
                  <TableCell className="font-medium">{b.customer_name}</TableCell>
                  <TableCell>
                    <a href={`tel:${b.customer_phone}`} className="hover:text-foreground text-muted-foreground transition-colors">
                      {b.customer_phone}
                    </a>
                  </TableCell>
                  <TableCell>{getName(services, b.service_id)}</TableCell>
                  <TableCell>{b.price_at_booking != null ? `€${b.price_at_booking}` : "—"}</TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => onStatusChange(b.id, v)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs border-0 p-0">
                        <Badge className={`${statusColors[b.status] || ""} text-xs`}>{b.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Blocked Tab ──────────────────────────────────────────
const BlockedTab = ({
  barberId,
  blockedDates,
  blockedTimeSlots,
  onRefresh,
}: {
  barberId: string;
  blockedDates: BlockedDate[];
  blockedTimeSlots: BlockedTimeSlot[];
  onRefresh: () => void;
}) => {
  const [dateForm, setDateForm] = useState({ blocked_date: "", reason: "" });
  const [slotForm, setSlotForm] = useState({ blocked_date: "", blocked_time: "", reason: "" });

  const myBlockedDates = blockedDates.filter((d) => d.barber_id === barberId);
  const myBlockedSlots = blockedTimeSlots.filter((s) => s.barber_id === barberId);

  const addDate = async () => {
    if (!dateForm.blocked_date) { toast.error("Select a date"); return; }
    const { error } = await supabase.from("blocked_dates").insert({
      blocked_date: dateForm.blocked_date,
      barber_id: barberId,
      reason: dateForm.reason || null,
    });
    if (error) { toast.error("Failed to block date"); return; }
    toast.success("Date blocked");
    setDateForm({ blocked_date: "", reason: "" });
    onRefresh();
  };

  const removeDate = async (id: string) => {
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) { toast.error("Failed to remove"); return; }
    toast.success("Date unblocked");
    onRefresh();
  };

  const addSlot = async () => {
    if (!slotForm.blocked_date || !slotForm.blocked_time) { toast.error("Select date and time"); return; }
    const { error } = await supabase.from("blocked_time_slots").insert({
      blocked_date: slotForm.blocked_date,
      blocked_time: slotForm.blocked_time,
      barber_id: barberId,
      reason: slotForm.reason || null,
    });
    if (error) { toast.error("Failed to block slot"); return; }
    toast.success("Time slot blocked");
    setSlotForm({ blocked_date: "", blocked_time: "", reason: "" });
    onRefresh();
  };

  const removeSlot = async (id: string) => {
    const { error } = await supabase.from("blocked_time_slots").delete().eq("id", id);
    if (error) { toast.error("Failed to remove"); return; }
    toast.success("Slot unblocked");
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Block a full day */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg tracking-wider">BLOCK A DAY OFF</CardTitle>
          <p className="text-xs text-muted-foreground font-body">No bookings will be accepted for you on this date.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input type="date" value={dateForm.blocked_date} onChange={(e) => setDateForm({ ...dateForm, blocked_date: e.target.value })} className="w-auto" />
            <Input placeholder="Reason (optional)" value={dateForm.reason} onChange={(e) => setDateForm({ ...dateForm, reason: e.target.value })} className="flex-1 min-w-[180px]" />
            <Button onClick={addDate}><Plus className="w-4 h-4 mr-1" /> Block Day</Button>
          </div>

          {myBlockedDates.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBlockedDates.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono">{d.blocked_date}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">—</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeDate(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Block a time slot */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg tracking-wider">BLOCK A TIME SLOT</CardTitle>
          <p className="text-xs text-muted-foreground font-body">Block a specific 30-minute slot on a given day.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input type="date" value={slotForm.blocked_date} onChange={(e) => setSlotForm({ ...slotForm, blocked_date: e.target.value })} className="w-auto" />
            <Input type="time" value={slotForm.blocked_time} onChange={(e) => setSlotForm({ ...slotForm, blocked_time: e.target.value })} className="w-auto" />
            <Input placeholder="Reason (optional)" value={slotForm.reason} onChange={(e) => setSlotForm({ ...slotForm, reason: e.target.value })} className="flex-1 min-w-[180px]" />
            <Button onClick={addSlot}><Plus className="w-4 h-4 mr-1" /> Block Slot</Button>
          </div>

          {myBlockedSlots.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBlockedSlots.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.blocked_date}</TableCell>
                    <TableCell className="font-mono">{s.blocked_time.slice(0, 5)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSlot(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────
const BarberDashboard = () => {
  const { loading: authLoading, barber, signOut } = useBarberAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<BlockedTimeSlot[]>([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    if (barber) fetchAll();
  }, [barber]);

  const fetchAll = async () => {
    if (!barber) return;
    const [b, s, l, bd, bts] = await Promise.all([
      supabase.from("bookings").select("*").eq("barber_id", barber.id).order("booking_date", { ascending: false }).order("booking_time", { ascending: true }),
      supabase.from("services").select("*"),
      supabase.from("locations").select("*"),
      supabase.from("blocked_dates").select("*").eq("barber_id", barber.id).order("blocked_date", { ascending: false }),
      supabase.from("blocked_time_slots").select("*").eq("barber_id", barber.id).order("blocked_date", { ascending: false }),
    ]);
    if (b.data) setBookings(b.data);
    if (s.data) setServices(s.data);
    if (l.data) setLocations(l.data);
    if (bd.data) setBlockedDates(bd.data);
    if (bts.data) setBlockedTimeSlots(bts.data);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Status → ${status}`);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  if (!barber) return null;

  // Pass only this barber so CalendarScheduleManager has no barber switcher in practice
  const barberList = [barber];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider">STREET BARBERS</h1>
          <p className="text-muted-foreground text-xs font-body">{barber.name} · My Panel</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" /> Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => setPasswordDialogOpen(true)}>
              <KeyRound className="w-4 h-4 mr-2" /> Change password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue="today" className="space-y-6">
          <div className="-mx-3 sm:mx-0 overflow-x-auto pb-1">
            <TabsList className="flex w-max sm:w-auto sm:flex-wrap px-3 sm:px-0">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today">
            <TodayTab bookings={bookings} services={services} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab bookings={bookings} services={services} onStatusChange={updateStatus} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView
              bookings={bookings}
              blockedDates={blockedDates}
              locations={locations}
              barbers={barberList}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <CalendarScheduleManager barbers={barberList} locations={locations} />
          </TabsContent>

          <TabsContent value="blocked">
            <BlockedTab
              barberId={barber.id}
              blockedDates={blockedDates}
              blockedTimeSlots={blockedTimeSlots}
              onRefresh={fetchAll}
            />
          </TabsContent>
        </Tabs>
      </main>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
};

export default BarberDashboard;
