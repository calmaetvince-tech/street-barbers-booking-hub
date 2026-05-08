import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import RevenueCards from "@/components/admin/RevenueCards";
import BlockedDatesManager from "@/components/admin/BlockedDatesManager";
import ServiceManager from "@/components/admin/ServiceManager";
import CalendarView from "@/components/admin/CalendarView";
import CalendarScheduleManager from "@/components/admin/CalendarScheduleManager";
import TodayView from "@/components/admin/TodayView";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, KeyRound } from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
  location_id: string;
  barber_id: string;
  service_id: string;
  price_at_booking: number | null;
  duration_at_booking: number | null;
};

type Location = { id: string; name: string };
type Barber = { id: string; name: string; location_id: string };
type Service = { id: string; name: string; price: number; duration_minutes: number };
type BlockedDate = { id: string; blocked_date: string; location_id: string | null; barber_id: string | null; reason: string | null };
type BlockedTimeSlot = { id: string; blocked_date: string; blocked_time: string; location_id: string | null; barber_id: string | null; reason: string | null };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  confirmed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  completed: "bg-green-600/20 text-green-400 border-green-600/30",
  cancelled: "bg-red-600/20 text-red-400 border-red-600/30",
};

const AdminDashboard = () => {
  const { loading: authLoading, isAdmin, signOut } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<BlockedTimeSlot[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterBarber, setFilterBarber] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    booking_date: "",
    booking_time: "",
    location_id: "",
    barber_id: "",
    service_id: "",
    status: "confirmed",
  });

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [b, l, br, s, bd, bts] = await Promise.all([
      supabase.from("bookings").select("*").order("booking_date", { ascending: false }).order("booking_time", { ascending: true }),
      supabase.from("locations").select("*"),
      supabase.from("barbers").select("*"),
      supabase.from("services").select("*"),
      supabase.from("blocked_dates").select("*").order("blocked_date", { ascending: false }),
      supabase.from("blocked_time_slots").select("*").order("blocked_date", { ascending: false }),
    ]);
    if (b.data) setBookings(b.data);
    if (l.data) setLocations(l.data);
    if (br.data) setBarbers(br.data);
    if (s.data) setServices(s.data);
    if (bd.data) setBlockedDates(bd.data);
    if (bts.data) setBlockedTimeSlots(bts.data);
  };

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterDate && b.booking_date !== filterDate) return false;
      if (filterLocation !== "all" && b.location_id !== filterLocation) return false;
      if (filterBarber !== "all" && b.barber_id !== filterBarber) return false;
      return true;
    });
  }, [bookings, filterDate, filterLocation, filterBarber]);

  const getName = (list: { id: string; name: string }[], id: string) =>
    list.find((i) => i.id === id)?.name || "—";

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update status"); return; }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Status changed to ${status}`);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success("Booking deleted");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} booking${ids.length > 1 ? "s" : ""}?`)) return;
    const { error } = await supabase.from("bookings").delete().in("id", ids);
    if (error) { toast.error("Failed to delete"); return; }
    setBookings((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    clearSelection();
    toast.success(`${ids.length} booking${ids.length > 1 ? "s" : ""} deleted`);
  };

  const bulkUpdateStatus = async (status: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const { error } = await supabase.from("bookings").update({ status }).in("id", ids);
    if (error) { toast.error("Failed to update status"); return; }
    setBookings((prev) => prev.map((b) => (selectedIds.has(b.id) ? { ...b, status } : b)));
    clearSelection();
    toast.success(`${ids.length} booking${ids.length > 1 ? "s" : ""} updated`);
  };

  const openEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setForm({
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      location_id: booking.location_id,
      barber_id: booking.barber_id,
      service_id: booking.service_id,
      status: booking.status,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingBooking(null);
    setForm({
      customer_name: "",
      customer_phone: "",
      booking_date: today,
      booking_time: "",
      location_id: locations[0]?.id || "",
      barber_id: "",
      service_id: "",
      status: "confirmed",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.booking_date || !form.booking_time || !form.location_id || !form.barber_id || !form.service_id) {
      toast.error("Fill all fields");
      return;
    }

    const selectedService = services.find((s) => s.id === form.service_id);

    if (editingBooking) {
      const { error } = await supabase.from("bookings").update(form).eq("id", editingBooking.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Booking updated");
    } else {
      const { error } = await supabase.from("bookings").insert({
        ...form,
        price_at_booking: selectedService?.price || null,
        duration_at_booking: selectedService?.duration_minutes || null,
      });
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Booking created");
    }
    setDialogOpen(false);
    fetchAll();
  };

  const filteredBarbers = form.location_id
    ? barbers.filter((b) => b.location_id === form.location_id)
    : barbers;

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider">STREET BARBERS</h1>
          <p className="text-muted-foreground text-xs font-body">Control Panel</p>
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
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
          </div>

          {/* Today Tab */}
          <TabsContent value="today">
            <TodayView bookings={bookings} barbers={barbers} services={services} locations={locations} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <RevenueCards bookings={bookings} locations={locations} barbers={barbers} services={services} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="col-span-2 sm:col-span-1 sm:w-auto"
              />
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="sm:w-[180px]"><SelectValue placeholder="All Locations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterBarber} onValueChange={setFilterBarber}>
                <SelectTrigger className="sm:w-[180px]"><SelectValue placeholder="All Barbers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barbers</SelectItem>
                  {barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 sm:ml-auto">
                {filterDate && (
                  <Button variant="ghost" size="sm" onClick={() => setFilterDate("")} className="flex-1 sm:flex-none">
                    Clear date
                  </Button>
                )}
                <Button onClick={openNew} size="sm" className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-1" /> New
                </Button>
              </div>
            </div>

            {/* Bulk actions toolbar */}
            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-2 sm:p-3 rounded-md border border-border bg-card/40">
                <label className="flex items-center gap-2 text-xs font-body cursor-pointer pl-1">
                  <Checkbox
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-muted-foreground">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <Select value="" onValueChange={(v) => bulkUpdateStatus(v)}>
                      <SelectTrigger className="h-8 w-[150px] text-xs">
                        <SelectValue placeholder="Set status…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" className="h-8" onClick={bulkDelete}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground text-sm">
                    No bookings found
                  </CardContent>
                </Card>
              )}
              {filtered.map((b) => (
                <Card key={b.id} className={selectedIds.has(b.id) ? "ring-1 ring-primary" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <Checkbox
                          checked={selectedIds.has(b.id)}
                          onCheckedChange={() => toggleSelect(b.id)}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <p className="font-display text-lg tracking-wide truncate">{b.customer_name}</p>
                          <a
                            href={`tel:${b.customer_phone}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {b.customer_phone}
                          </a>
                        </div>
                      </div>
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
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
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="text-foreground font-medium">{b.booking_date}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time</p>
                        <p className="text-foreground font-medium font-mono">{b.booking_time.slice(0, 5)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Service</p>
                        <p className="text-foreground truncate">{getName(services, b.service_id)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="text-foreground font-medium">{b.price_at_booking != null ? `€${b.price_at_booking}` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Barber</p>
                        <p className="text-foreground truncate">{getName(barbers, b.barber_id)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="text-foreground truncate">{getName(locations, b.location_id)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => openEdit(b)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => deleteBooking(b.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
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
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === filtered.length && filtered.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Barber</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-muted-foreground py-8">No bookings found</TableCell>
                      </TableRow>
                    )}
                    {filtered.map((b) => (
                      <TableRow key={b.id} data-state={selectedIds.has(b.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(b.id)}
                            onCheckedChange={() => toggleSelect(b.id)}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{b.booking_date}</TableCell>
                        <TableCell>{b.booking_time}</TableCell>
                        <TableCell className="font-medium">{b.customer_name}</TableCell>
                        <TableCell>{b.customer_phone}</TableCell>
                        <TableCell>{getName(services, b.service_id)}</TableCell>
                        <TableCell>{b.price_at_booking != null ? `€${b.price_at_booking}` : "—"}</TableCell>
                        <TableCell>{getName(barbers, b.barber_id)}</TableCell>
                        <TableCell>{getName(locations, b.location_id)}</TableCell>
                        <TableCell>
                          <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                            <SelectTrigger className="h-7 w-[120px] text-xs border-0 p-0">
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBooking(b.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarView bookings={bookings} blockedDates={blockedDates} locations={locations} barbers={barbers} />
          </TabsContent>

          {/* Blocked Dates Tab */}
          <TabsContent value="blocked">
            <BlockedDatesManager
              locations={locations}
              barbers={barbers}
              blockedDates={blockedDates}
              blockedTimeSlots={blockedTimeSlots}
              onRefresh={fetchAll}
            />
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules">
            <TwoWeekScheduleManager barbers={barbers} locations={locations} />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServiceManager services={services} onRefresh={fetchAll} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">
              {editingBooking ? "EDIT BOOKING" : "NEW BOOKING"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
            <Input placeholder="Phone Number" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} required />
              <Input type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} required />
            </div>
            <Select value={form.location_id} onValueChange={(v) => setForm({ ...form, location_id: v, barber_id: "" })}>
              <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.barber_id} onValueChange={(v) => setForm({ ...form, barber_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select Barber" /></SelectTrigger>
              <SelectContent>
                {filteredBarbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — €{s.price}</SelectItem>)}
              </SelectContent>
            </Select>
            {editingBooking && (
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button type="submit" className="w-full">
              {editingBooking ? "Update Booking" : "Create Booking"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
};

export default AdminDashboard;
