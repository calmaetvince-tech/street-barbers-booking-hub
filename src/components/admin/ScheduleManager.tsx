import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CalendarClock, Save } from "lucide-react";

type Barber = { id: string; name: string; location_id: string };
type Location = { id: string; name: string };
type WorkingHour = {
  id?: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
};

const DAYS = [
  { idx: 1, label: "Monday" },
  { idx: 2, label: "Tuesday" },
  { idx: 3, label: "Wednesday" },
  { idx: 4, label: "Thursday" },
  { idx: 5, label: "Friday" },
  { idx: 6, label: "Saturday" },
  { idx: 0, label: "Sunday" },
];

interface Props {
  barbers: Barber[];
  locations: Location[];
}

const trimTime = (t: string) => (t?.length >= 5 ? t.substring(0, 5) : t);

const ScheduleManager = ({ barbers, locations }: Props) => {
  const [selectedBarber, setSelectedBarber] = useState<string>(barbers[0]?.id || "");
  const [hours, setHours] = useState<Record<number, WorkingHour>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedBarber && barbers[0]) setSelectedBarber(barbers[0].id);
  }, [barbers, selectedBarber]);

  useEffect(() => {
    if (!selectedBarber) return;
    loadSchedule(selectedBarber);
  }, [selectedBarber]);

  const loadSchedule = async (barberId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("barber_working_hours")
      .select("*")
      .eq("barber_id", barberId);

    const map: Record<number, WorkingHour> = {};
    DAYS.forEach((d) => {
      map[d.idx] = {
        barber_id: barberId,
        day_of_week: d.idx,
        start_time: "10:00",
        end_time: "20:00",
        is_working: d.idx !== 0,
      };
    });
    (data || []).forEach((row: any) => {
      map[row.day_of_week] = {
        id: row.id,
        barber_id: row.barber_id,
        day_of_week: row.day_of_week,
        start_time: trimTime(row.start_time),
        end_time: trimTime(row.end_time),
        is_working: row.is_working,
      };
    });
    setHours(map);
    setLoading(false);
  };

  const updateDay = (day: number, patch: Partial<WorkingHour>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  };

  const save = async () => {
    if (!selectedBarber) return;
    setSaving(true);
    const rows = DAYS.map((d) => {
      const h = hours[d.idx];
      return {
        barber_id: selectedBarber,
        day_of_week: d.idx,
        start_time: h.start_time,
        end_time: h.end_time,
        is_working: h.is_working,
      };
    });
    // Validate
    for (const r of rows) {
      if (r.is_working && r.start_time >= r.end_time) {
        toast.error("Start time must be before end time");
        setSaving(false);
        return;
      }
    }
    const { error } = await supabase
      .from("barber_working_hours")
      .upsert(rows, { onConflict: "barber_id,day_of_week" });
    setSaving(false);
    if (error) {
      toast.error("Failed to save schedule");
      return;
    }
    toast.success("Schedule saved");
    loadSchedule(selectedBarber);
  };

  const getLocationName = (locId: string) =>
    locations.find((l) => l.id === locId)?.name || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <CalendarClock className="w-5 h-5" /> WEEKLY SCHEDULES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-body">Barber</label>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select barber" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} — {getLocationName(b.location_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={saving || loading || !selectedBarber} size="sm">
            <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Schedule"}
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <div className="space-y-2">
            {DAYS.map((d) => {
              const h = hours[d.idx];
              if (!h) return null;
              return (
                <div
                  key={d.idx}
                  className="flex flex-wrap items-center gap-3 p-3 border border-border rounded-md bg-card"
                >
                  <div className="w-28 font-body text-sm text-foreground">{d.label}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={h.is_working}
                      onCheckedChange={(v) => updateDay(d.idx, { is_working: v })}
                    />
                    <span className="text-xs text-muted-foreground font-body w-12">
                      {h.is_working ? "Open" : "Off"}
                    </span>
                  </div>
                  <Input
                    type="time"
                    value={h.start_time}
                    onChange={(e) => updateDay(d.idx, { start_time: e.target.value })}
                    disabled={!h.is_working}
                    className="w-[130px]"
                  />
                  <span className="text-muted-foreground text-sm">→</span>
                  <Input
                    type="time"
                    value={h.end_time}
                    onChange={(e) => updateDay(d.idx, { end_time: e.target.value })}
                    disabled={!h.is_working}
                    className="w-[130px]"
                  />
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground font-body">
          Time slots are generated in 30-minute increments inside the working window. Time off and
          blocked dates are managed in the "Blocked Dates" tab.
        </p>
      </CardContent>
    </Card>
  );
};

export default ScheduleManager;
