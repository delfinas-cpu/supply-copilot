import { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildTimeline, type ImpactLevel } from "@/lib/seasonality";
import {
  EVENT_CALENDAR,
  EVENT_TYPE_META,
  filterEvents,
  type CalendarRegionFilter,
  type SeasonalEvent,
} from "@/lib/event-calendar";

interface Props {
  timelineCountries: string[];
  today: Date;
  defaultRegion: CalendarRegionFilter;
}

const REGION_PILLS: { key: CalendarRegionFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "latam", label: "LatAm" },
  { key: "apac", label: "APAC" },
  { key: "europe", label: "Europe" },
];

const IMPACT_DOT: Record<ImpactLevel, string> = {
  "VERY HIGH": "bg-red-500",
  HIGH: "bg-amber-400",
  MEDIUM: "bg-sky-500",
  LOW: "bg-slate-400",
  NEGATIVE: "bg-slate-300",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SeasonalityCalendarPanel({ timelineCountries, today, defaultRegion }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [regionFilter, setRegionFilter] = useState<CalendarRegionFilter>(defaultRegion);

  // Reflect external region changes while user hasn't manually overridden
  useEffect(() => { setRegionFilter(defaultRegion); }, [defaultRegion]);

  const timeline = useMemo(() => buildTimeline(timelineCountries, today, 8), [timelineCountries, today]);

  const events = useMemo(() => filterEvents(EVENT_CALENDAR, regionFilter), [regionFilter]);

  // Group events by ISO date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, SeasonalEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  // 6 months starting from current month
  const months = useMemo(() => {
    const list: { year: number; month: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + i, 1));
      list.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
    }
    return list;
  }, [today]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="h-4 w-4 text-brand-dark" />
          Seasonality timeline — next 8 weeks
          <span className="ml-auto flex items-center gap-3 text-[10px] font-normal text-muted-foreground">
            <LegendDot color="bg-red-500" label="Very high" />
            <LegendDot color="bg-amber-400" label="High" />
            <LegendDot color="bg-sky-500" label="Medium" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-8 gap-2">
            {timeline.map((w, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md border p-2 text-center",
                  i === 0 ? "border-brand-light bg-brand-light/10" : "border-border bg-muted/30",
                )}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {w.label}
                </p>
                <div className="mt-2 flex min-h-[20px] flex-wrap items-center justify-center gap-1">
                  {w.dots.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground/60">—</span>
                  ) : (
                    w.dots.slice(0, 6).map((d, j) => (
                      <Tooltip key={j}>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "h-2.5 w-2.5 cursor-help rounded-full ring-1 ring-white",
                              IMPACT_DOT[d.impact],
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{d.holiday.name}</p>
                          <p className="text-muted-foreground">
                            {d.country} · {d.impact}
                            {d.impact === "NEGATIVE" ? " — expected drop" : " — expected uplift"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Info className="h-3 w-3" />
            Hover a dot to see the holiday and its expected impact.
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
            className="h-8 text-xs"
          >
            {expanded ? (
              <>Hide calendar <ChevronUp className="ml-1 h-3.5 w-3.5" /></>
            ) : (
              <>View full calendar <ChevronDown className="ml-1 h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Region pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Region:</span>
              {REGION_PILLS.map((p) => {
                const active = p.key === regionFilter;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setRegionFilter(p.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      active
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-border bg-background text-muted-foreground hover:border-brand-light hover:text-brand-dark",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
              <span className="ml-auto flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                {Object.entries(EVENT_TYPE_META).map(([key, m]) => (
                  <LegendDot key={key} color={m.dot} label={m.label} />
                ))}
              </span>
            </div>

            {/* 6-month grid */}
            <TooltipProvider delayDuration={100}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {months.map((m) => (
                  <MonthGrid
                    key={`${m.year}-${m.month}`}
                    year={m.year}
                    month={m.month}
                    today={today}
                    eventsByDate={eventsByDate}
                  />
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonthGrid({
  year,
  month,
  today,
  eventsByDate,
}: {
  year: number;
  month: number;
  today: Date;
  eventsByDate: Map<string, SeasonalEvent[]>;
}) {
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0=Sun
  const leading = (firstDow + 6) % 7; // Convert to Mon=0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayIso = today.toISOString().slice(0, 10);

  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="mb-2 text-sm font-semibold text-foreground">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="h-8" />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDate.get(iso);
          const meta = dayEvents?.[0] ? EVENT_TYPE_META[dayEvents[0].type] : null;
          const isToday = iso === todayIso;

          const cell = (
            <div
              className={cn(
                "flex h-8 cursor-default items-center justify-center rounded-md text-xs tabular-nums transition",
                meta ? meta.cell : "text-muted-foreground hover:bg-muted",
                isToday && "ring-2 ring-brand-dark ring-offset-1",
              )}
            >
              {day}
            </div>
          );

          if (!dayEvents) return <div key={i}>{cell}</div>;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>{cell}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {dayEvents.map((e, j) => (
                  <div key={j} className={cn(j > 0 && "mt-2 border-t border-white/20 pt-2")}>
                    <p className="font-medium">{e.event}</p>
                    <p className="text-muted-foreground">{e.country}</p>
                    <p className="text-muted-foreground">Impact: {e.impact}</p>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  );
}
