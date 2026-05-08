import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { CalendarRange, RotateCcw, Save } from "lucide-react";
import { addMonths, endOfMonth, format, startOfMonth, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";

type Barber = { id: string; name: string; location_id: string };
type Location = { id: string; name: string };
type WeeklyHour = { day_of_week: number; start_time: string; end_time: string; is_working: boolean };
type Override = {
  id?: string;
  override_date: string;
  is_working: boolean;
  start_time: string;
  end_time: string;
};

interface Props {
  barbers: Barber[];
  locations: Location[];
}

const trimTime = (t: string) => (t?.length >= 5 ? t.substring(0, 5) : t);
const fmt = (d: Date) => format(d, "yyyy-MM-dd");

const CalendarScheduleManager = ({ barbers, locations }: Props) => {
  const [selectedBarber, setSelectedBarber] = useState<string>(barbers[0]?.id || "");
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [weekly, setWeekly] = useState<Record<number, WeeklyHour>>({});
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state for selected day
  const [isWorking, setIsWorking] = useState(true);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("20:00");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!selectedBarber && barbers[0]) setSelectedBarber(barbers[0].id);
  }, [barbers, selectedBarber]);

  useEffect(() => {
    if (!selectedBarber) return;
    load();
  }, [selectedBarber, month]);

  const load = async () => {
    setLoading(true);
    const from = fmt(startOfMonth(month));
    const to = fmt(endOfMonth(addMonths(month, 0)));
    const [whRes, ovRes] = await Promise.all([
      supabase.from("barber_working_hours").select("*").eq("barber_id", selectedBarber),
      supabase
        .from("barber_schedule_overrides")
        .select("*")
        .eq("barber_id", selectedBarber)
        .gte("override_date", from)
        .lte("override_date", to),
    ]);
    const w: Record<number, WeeklyHour> = {};
    (whRes.data || []).forEach((r: any) => {
      w[r.day_of_week] = {
        day_of_week: r.day_of_week,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
        is_working: r.is_working,
      };
    });
    setWeekly(w);
    const o: Record<string, Override> = {};
    (ovRes.data || []).forEach((r: any) => {
      o[r.override_date] = {
        id: r.id,
        override_date: r.override_date,
        is_working: r.is_working,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
      };
    });
    setOverrides(o);
    setLoading(false);
  };

  // hydrate form when selection or data changes
  useEffect(() => {
    const key = fmt(selectedDate);
    const ov = overrides[key];
    const dow = selectedDate.getDay();
    const def = weekly[dow];
    const defWorking = def ? def.is_working : dow !== 0;
    const defStart = def?.start_time || "10:00";
    const defEnd = def?.end_time || "20:00";
    setIsWorking(ov ? ov.is_working : defWorking);
    setStartTime(ov ? ov.start_time : defStart);
    setEndTime(ov ? ov.end_time : defEnd);
    setDirty(false);
  }, [selectedDate, overrides, weekly]);

  const overrideDates = useMemo(
    () =>
      Object.values(overrides).map((o) => new Date(o.override_date + "T00:00:00")),
    [overrides]
  );
  const offDates = useMemo(
    () =>
      Object.values(overrides)
        .filter((o) => !o.is_working)
        .map((o) => new Date(o.override_date + "T00:00:00")),
    [overrides]
  );

  const selectedKey = fmt(selectedDate);
  const currentOverride = overrides[selectedKey];
  const dow = selectedDate.getDay();
  const def = weekly[dow];
  const defaultLabel = def
    ? def.is_working
      ? `${def.start_time}–${def.end_time}`
      : "Day off"
    : dow === 0
    ? "Day off"
    : "10:00–20:00";

  const save = async () => {
    if (isWorking && startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("barber_schedule_overrides")
      .upsert(
        {
          barber_id: selectedBarber,
          override_date: selectedKey,
          is_working: isWorking,
          start_time: startTime,
          end_time: endTime,
        },
        { onConflict: "barber_id,override_date" }
      );
    setSaving(false);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    toast.success(`Saved ${format(selectedDate, "EEE d MMM")}`);
    load();
  };

  const reset = async () => {
    if (!currentOverride?.id) {
      setDirty(false);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("barber_schedule_overrides")
      .delete()
      .eq("id", currentOverride.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to reset");
      return;
    }
    toast.success("Reverted to weekly default");
    load();
  };

  const getLocationName = (locId: string) =>
    locations.find((l) => l.id === locId)?.name || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <CalendarRange className="w-5 h-5" /> SCHEDULE CALENDAR
        </CardTitle>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Pick a barber, navigate the calendar, and click any date to edit that day. Overrides take
          priority over the weekly pattern.
        </p>
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
        </div>

        <div className="grid gap-6 md:grid-cols-[auto,1fr] items-start">
          <div className="rounded-md border p-2 bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ overridden: overrideDates, off: offDates }}
              modifiersClassNames={{
                overridden: "ring-1 ring-primary/60",
                off: "line-through text-muted-foreground",
              }}
              className={cn("p-3 pointer-events-auto")}
            />
            <div className="flex items-center gap-3 px-2 pb-2 pt-1 text-[11px] text-muted-foreground font-body">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm ring-1 ring-primary/60" />
                Override
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="line-through">Off</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-body text-sm font-medium text-foreground">
                {format(selectedDate, "EEEE, d MMMM yyyy")}
              </p>
              <p className="text-[11px] text-muted-foreground font-body">
                Weekly default: {defaultLabel}
                {currentOverride && (
                  <span className="ml-1 text-primary font-medium">• overridden</span>
                )}
              </p>
            </div>

            <div
              className={`flex flex-wrap items-center gap-3 p-3 border rounded-md ${
                currentOverride ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2">
                <Switch
                  checked={isWorking}
                  onCheckedChange={(v) => {
                    setIsWorking(v);
                    setDirty(true);
                  }}
                />
                <span className="text-xs text-muted-foreground font-body w-10">
                  {isWorking ? "Open" : "Off"}
                </span>
              </div>

              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setDirty(true);
                }}
                disabled={!isWorking}
                className="w-[120px]"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setDirty(true);
                }}
                disabled={!isWorking}
                className="w-[120px]"
              />

              <div className="flex items-center gap-1 ml-auto">
                {(currentOverride || dirty) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    disabled={saving}
                    title="Revert to weekly default"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                  </Button>
                )}
                <Button size="sm" onClick={save} disabled={saving || !dirty}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-body">
              Tip: To block specific time slots within a working day (e.g. a lunch break), use the
              "Blocked" tab.
            </p>

            {loading && (
              <p className="text-muted-foreground text-xs font-body">Loading…</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarScheduleManager;