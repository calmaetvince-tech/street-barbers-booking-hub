import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CalendarRange, RotateCcw, Save } from "lucide-react";
import { addDays, format, startOfToday } from "date-fns";

type Barber = { id: string; name: string; location_id: string };
type Location = { id: string; name: string };
type WeeklyHour = { day_of_week: number; start_time: string; end_time: string; is_working: boolean };
type Override = {
  id?: string;
  barber_id: string;
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
const DAYS_AHEAD = 14;

type DayState = {
  date: string;
  hasOverride: boolean;
  is_working: boolean;
  start_time: string;
  end_time: string;
  // For default display
  defaultIsWorking: boolean;
  defaultStart: string;
  defaultEnd: string;
  // tracking
  dirty: boolean;
  overrideId?: string;
};

const TwoWeekScheduleManager = ({ barbers, locations }: Props) => {
  const [selectedBarber, setSelectedBarber] = useState<string>(barbers[0]?.id || "");
  const [days, setDays] = useState<DayState[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBarber && barbers[0]) setSelectedBarber(barbers[0].id);
  }, [barbers, selectedBarber]);

  useEffect(() => {
    if (!selectedBarber) return;
    load(selectedBarber);
  }, [selectedBarber]);

  const load = async (barberId: string) => {
    setLoading(true);
    const today = startOfToday();
    const dates = Array.from({ length: DAYS_AHEAD }, (_, i) =>
      format(addDays(today, i), "yyyy-MM-dd")
    );

    const [whRes, ovRes] = await Promise.all([
      supabase.from("barber_working_hours").select("*").eq("barber_id", barberId),
      supabase
        .from("barber_schedule_overrides")
        .select("*")
        .eq("barber_id", barberId)
        .gte("override_date", dates[0])
        .lte("override_date", dates[dates.length - 1]),
    ]);

    const weekly: Record<number, WeeklyHour> = {};
    (whRes.data || []).forEach((r: any) => {
      weekly[r.day_of_week] = {
        day_of_week: r.day_of_week,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
        is_working: r.is_working,
      };
    });

    const overrideByDate: Record<string, Override> = {};
    (ovRes.data || []).forEach((r: any) => {
      overrideByDate[r.override_date] = {
        id: r.id,
        barber_id: r.barber_id,
        override_date: r.override_date,
        is_working: r.is_working,
        start_time: trimTime(r.start_time),
        end_time: trimTime(r.end_time),
      };
    });

    const next: DayState[] = dates.map((d) => {
      const dow = new Date(d + "T00:00:00").getDay();
      const def = weekly[dow];
      const defaultIsWorking = def ? def.is_working : dow !== 0;
      const defaultStart = def?.start_time || "10:00";
      const defaultEnd = def?.end_time || "20:00";
      const ov = overrideByDate[d];
      return {
        date: d,
        hasOverride: !!ov,
        is_working: ov ? ov.is_working : defaultIsWorking,
        start_time: ov ? ov.start_time : defaultStart,
        end_time: ov ? ov.end_time : defaultEnd,
        defaultIsWorking,
        defaultStart,
        defaultEnd,
        dirty: false,
        overrideId: ov?.id,
      };
    });

    setDays(next);
    setLoading(false);
  };

  const updateDay = (date: string, patch: Partial<DayState>) => {
    setDays((prev) =>
      prev.map((d) => (d.date === date ? { ...d, ...patch, hasOverride: true, dirty: true } : d))
    );
  };

  const saveDay = async (date: string) => {
    const d = days.find((x) => x.date === date);
    if (!d || !selectedBarber) return;
    if (d.is_working && d.start_time >= d.end_time) {
      toast.error("Start time must be before end time");
      return;
    }
    setSavingDate(date);
    const { error } = await supabase
      .from("barber_schedule_overrides")
      .upsert(
        {
          barber_id: selectedBarber,
          override_date: d.date,
          is_working: d.is_working,
          start_time: d.start_time,
          end_time: d.end_time,
        },
        { onConflict: "barber_id,override_date" }
      );
    setSavingDate(null);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    toast.success(`Saved ${format(new Date(d.date + "T00:00:00"), "EEE d MMM")}`);
    load(selectedBarber);
  };

  const resetDay = async (date: string) => {
    const d = days.find((x) => x.date === date);
    if (!d || !selectedBarber) return;
    if (!d.overrideId && !d.dirty) return;
    if (d.overrideId) {
      setSavingDate(date);
      const { error } = await supabase
        .from("barber_schedule_overrides")
        .delete()
        .eq("id", d.overrideId);
      setSavingDate(null);
      if (error) {
        toast.error("Failed to reset");
        return;
      }
      toast.success("Reverted to default schedule");
    }
    load(selectedBarber);
  };

  const getLocationName = (locId: string) => locations.find((l) => l.id === locId)?.name || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <CalendarRange className="w-5 h-5" /> NEXT 14 DAYS
        </CardTitle>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Override the default weekly schedule for any specific date. Date overrides take priority
          over the weekly pattern in customer bookings.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : (
          <div className="space-y-2">
            {days.map((d) => {
              const dateObj = new Date(d.date + "T00:00:00");
              const defaultLabel = d.defaultIsWorking
                ? `${d.defaultStart}–${d.defaultEnd}`
                : "Day off";
              return (
                <div
                  key={d.date}
                  className={`flex flex-wrap items-center gap-3 p-3 border rounded-md transition-colors ${
                    d.hasOverride
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="w-32 sm:w-40">
                    <p className="font-body text-sm font-medium text-foreground">
                      {format(dateObj, "EEE d MMM")}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body">
                      Default: {defaultLabel}
                      {d.hasOverride && (
                        <span className="ml-1 text-primary font-medium">• overridden</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={d.is_working}
                      onCheckedChange={(v) => updateDay(d.date, { is_working: v })}
                    />
                    <span className="text-xs text-muted-foreground font-body w-10">
                      {d.is_working ? "Open" : "Off"}
                    </span>
                  </div>

                  <Input
                    type="time"
                    value={d.start_time}
                    onChange={(e) => updateDay(d.date, { start_time: e.target.value })}
                    disabled={!d.is_working}
                    className="w-[120px]"
                  />
                  <span className="text-muted-foreground text-sm">→</span>
                  <Input
                    type="time"
                    value={d.end_time}
                    onChange={(e) => updateDay(d.date, { end_time: e.target.value })}
                    disabled={!d.is_working}
                    className="w-[120px]"
                  />

                  <div className="flex items-center gap-1 ml-auto">
                    {(d.hasOverride || d.dirty) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resetDay(d.date)}
                        disabled={savingDate === d.date}
                        title="Revert to weekly default"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => saveDay(d.date)}
                      disabled={savingDate === d.date || !d.dirty}
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {savingDate === d.date ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground font-body">
          Tip: To block specific time slots within a working day (e.g. a lunch break), use the
          "Blocked" tab.
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoWeekScheduleManager;
