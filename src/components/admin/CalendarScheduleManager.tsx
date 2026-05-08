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
  const [selectedDates, setSelectedDates] = useState<Date[]>([startOfToday()]);
  const [weekly, setWeekly] = useState<Record<number, WeeklyHour>>({});
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state applied to ALL selected days
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

  // when selection changes, hydrate the form from the FIRST selected day
  useEffect(() => {
    const first = selectedDates[0];
    if (!first) return;
    const key = fmt(first);
    const ov = overrides[key];
    const dow = first.getDay();
    const def = weekly[dow];
    const defWorking = def ? def.is_working : dow !== 0;
    const defStart = def?.start_time || "10:00";
    const defEnd = def?.end_time || "20:00";
    setIsWorking(ov ? ov.is_working : defWorking);
    setStartTime(ov ? ov.start_time : defStart);
    setEndTime(ov ? ov.end_time : defEnd);
    setDirty(false);
  }, [selectedDates, overrides, weekly]);

  const overrideDates = useMemo(
    () => Object.values(overrides).map((o) => new Date(o.override_date + "T00:00:00")),
    [overrides]
  );
  const offDates = useMemo(
    () =>
      Object.values(overrides)
        .filter((o) => !o.is_working)
        .map((o) => new Date(o.override_date + "T00:00:00")),
    [overrides]
  );

  const sortedSelected = useMemo(
    () => [...selectedDates].sort((a, b) => a.getTime() - b.getTime()),
    [selectedDates]
  );

  const anySelectedHasOverride = sortedSelected.some((d) => overrides[fmt(d)]);

  const save = async () => {
    if (!selectedBarber || sortedSelected.length === 0) return;
    if (isWorking && startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }
    setSaving(true);
    const rows = sortedSelected.map((d) => ({
      barber_id: selectedBarber,
      override_date: fmt(d),
      is_working: isWorking,
      start_time: startTime,
      end_time: endTime,
    }));
    const { error } = await supabase
      .from("barber_schedule_overrides")
      .upsert(rows, { onConflict: "barber_id,override_date" });
    setSaving(false);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    toast.success(
      sortedSelected.length === 1
        ? `Saved ${format(sortedSelected[0], "EEE d MMM")}`
        : `Saved ${sortedSelected.length} days`
    );
    load();
  };

  const reset = async () => {
    if (!selectedBarber || sortedSelected.length === 0) return;
    const ids = sortedSelected
      .map((d) => overrides[fmt(d)]?.id)
      .filter(Boolean) as string[];
    if (ids.length === 0) {
      setDirty(false);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("barber_schedule_overrides")
      .delete()
      .in("id", ids);
    setSaving(false);
    if (error) {
      toast.error("Failed to reset");
      return;
    }
    toast.success(
      ids.length === 1 ? "Reverted to weekly default" : `Reverted ${ids.length} days`
    );
    load();
  };

  const selectWeekOf = (anchor: Date) => {
    // Select Monday → Sunday around the anchor
    const day = anchor.getDay(); // 0=Sun..6=Sat
    const diffToMon = (day + 6) % 7;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - diffToMon);
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    setSelectedDates(week);
  };

  const clearSelection = () => setSelectedDates([]);

  const getLocationName = (locId: string) =>
    locations.find((l) => l.id === locId)?.name || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <CalendarRange className="w-5 h-5" /> SCHEDULE CALENDAR
        </CardTitle>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Pick a barber, then click any dates to select them (click again to deselect). Set the
          hours once and apply to all selected days at once.
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
              mode="multiple"
              selected={selectedDates}
              onSelect={(d) => setSelectedDates(d || [])}
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-body text-sm font-medium text-foreground">
                {sortedSelected.length === 0
                  ? "No date selected"
                  : sortedSelected.length === 1
                  ? format(sortedSelected[0], "EEEE, d MMMM yyyy")
                  : `${sortedSelected.length} days selected`}
              </p>
              {anySelectedHasOverride && (
                <span className="text-[11px] text-primary font-medium">• overridden</span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectWeekOf(sortedSelected[0] || startOfToday())}
                  title="Select the whole week (Mon–Sun) of the first selected day"
                >
                  Select week
                </Button>
                {sortedSelected.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {sortedSelected.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {sortedSelected.map((d) => (
                  <span
                    key={fmt(d)}
                    className="text-[11px] px-2 py-0.5 rounded border border-border bg-muted/40 font-body"
                  >
                    {format(d, "EEE d MMM")}
                  </span>
                ))}
              </div>
            )}

            <div
              className={`flex flex-wrap items-center gap-3 p-3 border rounded-md ${
                anySelectedHasOverride
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2">
                <Switch
                  checked={isWorking}
                  onCheckedChange={(v) => {
                    setIsWorking(v);
                    setDirty(true);
                  }}
                  disabled={sortedSelected.length === 0}
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
                disabled={!isWorking || sortedSelected.length === 0}
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
                disabled={!isWorking || sortedSelected.length === 0}
                className="w-[120px]"
              />

              <div className="flex items-center gap-1 ml-auto">
                {anySelectedHasOverride && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={reset}
                    disabled={saving}
                    title="Revert selected day(s) to weekly default"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={save}
                  disabled={saving || sortedSelected.length === 0 || !dirty}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {saving
                    ? "Saving..."
                    : sortedSelected.length > 1
                    ? `Apply to ${sortedSelected.length} days`
                    : "Save"}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-body">
              Tip: Click multiple dates to apply the same hours to all of them. Use “Select week”
              to quickly pick Mon–Sun.
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
