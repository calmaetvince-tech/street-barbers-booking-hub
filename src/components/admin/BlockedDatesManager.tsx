import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Ban, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Location = { id: string; name: string };
type Barber = { id: string; name: string; location_id: string };
type BlockedDate = { id: string; blocked_date: string; location_id: string | null; barber_id: string | null; reason: string | null };
type BlockedTimeSlot = { id: string; blocked_date: string; blocked_time: string; location_id: string | null; barber_id: string | null; reason: string | null };

interface Props {
  locations: Location[];
  barbers: Barber[];
  blockedDates: BlockedDate[];
  blockedTimeSlots: BlockedTimeSlot[];
  onRefresh: () => void;
}

const BlockedDatesManager = ({ locations, barbers, blockedDates, blockedTimeSlots, onRefresh }: Props) => {
  const [dateForm, setDateForm] = useState({ blocked_date: "", location_id: "", barber_id: "", reason: "" });
  const [slotForm, setSlotForm] = useState({ blocked_date: "", blocked_time: "", location_id: "", barber_id: "", reason: "" });

  const getName = (list: { id: string; name: string }[], id: string | null) =>
    list.find((i) => i.id === id)?.name || "All";

  const addBlockedDate = async () => {
    if (!dateForm.blocked_date) { toast.error("Select a date"); return; }
    const { error } = await supabase.from("blocked_dates").insert({
      blocked_date: dateForm.blocked_date,
      location_id: dateForm.location_id || null,
      barber_id: dateForm.barber_id || null,
      reason: dateForm.reason || null,
    });
    if (error) { toast.error("Failed to block date"); return; }
    toast.success("Date blocked");
    setDateForm({ blocked_date: "", location_id: "", barber_id: "", reason: "" });
    onRefresh();
  };

  const addBlockedSlot = async () => {
    if (!slotForm.blocked_date || !slotForm.blocked_time) { toast.error("Select date and time"); return; }
    const { error } = await supabase.from("blocked_time_slots").insert({
      blocked_date: slotForm.blocked_date,
      blocked_time: slotForm.blocked_time,
      location_id: slotForm.location_id || null,
      barber_id: slotForm.barber_id || null,
      reason: slotForm.reason || null,
    });
    if (error) { toast.error("Failed to block time slot"); return; }
    toast.success("Time slot blocked");
    setSlotForm({ blocked_date: "", blocked_time: "", location_id: "", barber_id: "", reason: "" });
    onRefresh();
  };

  const removeBlockedDate = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    toast.success("Unblocked");
    onRefresh();
  };

  const removeBlockedSlot = async (id: string) => {
    await supabase.from("blocked_time_slots").delete().eq("id", id);
    toast.success("Unblocked");
    onRefresh();
  };

  const filteredBarbers = dateForm.location_id
    ? barbers.filter((b) => b.location_id === dateForm.location_id)
    : barbers;

  const slotFilteredBarbers = slotForm.location_id
    ? barbers.filter((b) => b.location_id === slotForm.location_id)
    : barbers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <Ban className="w-5 h-5" /> BLOCKED DATES & TIMES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dates">
          <TabsList className="mb-4">
            <TabsTrigger value="dates">Full Days</TabsTrigger>
            <TabsTrigger value="slots">Time Slots</TabsTrigger>
          </TabsList>

          <TabsContent value="dates" className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <Input type="date" value={dateForm.blocked_date} onChange={(e) => setDateForm({ ...dateForm, blocked_date: e.target.value })} className="w-auto" />
              <Select value={dateForm.location_id} onValueChange={(v) => setDateForm({ ...dateForm, location_id: v, barber_id: "" })}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Locations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_locations">All Locations</SelectItem>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={dateForm.barber_id} onValueChange={(v) => setDateForm({ ...dateForm, barber_id: v })}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Barbers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_barbers">All Barbers</SelectItem>
                  {filteredBarbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Reason (optional)" value={dateForm.reason} onChange={(e) => setDateForm({ ...dateForm, reason: e.target.value })} className="w-[160px]" />
              <Button size="sm" onClick={addBlockedDate}><Plus className="w-4 h-4 mr-1" /> Block</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedDates.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No blocked dates</TableCell></TableRow>
                )}
                {blockedDates.map((bd) => (
                  <TableRow key={bd.id}>
                    <TableCell>{bd.blocked_date}</TableCell>
                    <TableCell>{getName(locations, bd.location_id)}</TableCell>
                    <TableCell>{getName(barbers, bd.barber_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{bd.reason || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlockedDate(bd.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <Input type="date" value={slotForm.blocked_date} onChange={(e) => setSlotForm({ ...slotForm, blocked_date: e.target.value })} className="w-auto" />
              <Input type="time" value={slotForm.blocked_time} onChange={(e) => setSlotForm({ ...slotForm, blocked_time: e.target.value })} className="w-auto" />
              <Select value={slotForm.location_id} onValueChange={(v) => setSlotForm({ ...slotForm, location_id: v, barber_id: "" })}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Locations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_locations">All Locations</SelectItem>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={slotForm.barber_id} onValueChange={(v) => setSlotForm({ ...slotForm, barber_id: v })}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Barbers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_barbers">All Barbers</SelectItem>
                  {slotFilteredBarbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Reason (optional)" value={slotForm.reason} onChange={(e) => setSlotForm({ ...slotForm, reason: e.target.value })} className="w-[160px]" />
              <Button size="sm" onClick={addBlockedSlot}><Plus className="w-4 h-4 mr-1" /> Block</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blockedTimeSlots.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No blocked time slots</TableCell></TableRow>
                )}
                {blockedTimeSlots.map((bs) => (
                  <TableRow key={bs.id}>
                    <TableCell>{bs.blocked_date}</TableCell>
                    <TableCell>{bs.blocked_time}</TableCell>
                    <TableCell>{getName(locations, bs.location_id)}</TableCell>
                    <TableCell>{getName(barbers, bs.barber_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{bs.reason || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlockedSlot(bs.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BlockedDatesManager;
