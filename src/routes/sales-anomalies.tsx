import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { wowAnomalies, wowKpis, wowCountries } from "@/lib/mock-data";
import { useRegion, REGIONS, REGION_ORDER, type RegionKey } from "@/lib/region-context";
import { cn } from "@/lib/utils";
import { classifyAnomaly, type ContextTone } from "@/lib/seasonality";
import { SeasonalityCalendarPanel } from "@/components/SeasonalityCalendarPanel";
import type { CalendarRegionFilter } from "@/lib/event-calendar";

export const Route = createFileRoute("/sales-anomalies")({
  head: () => ({ meta: [{ title: "Sales Anomalies — Supply Copilot" }] }),
  component: SalesAnomaliesPage,
});

// Reference "today" for the prototype
const TODAY = new Date("2026-05-18T00:00:00Z");

function SalesAnomaliesPage() {
  const { includesCountry, region, regionKey, setRegion } = useRegion();
  const [country, setCountry] = useState<string>("all");
  const [severity, setSeverity] = useState<"all" | "critical" | "warning" | "info">("all");
  const [hideExpected, setHideExpected] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => { setCountry("all"); }, [regionKey]);

  type Preset = {
    id: string;
    label: string;
    region: RegionKey;
    severity: "all" | "critical" | "warning" | "info";
    hideExpected: boolean;
    country?: string;
  };
  const PRESETS: Preset[] = [
    { id: "latam-critical", label: "LatAm · Críticos", region: "latam", severity: "critical", hideExpected: true },
    { id: "apac-critical",  label: "APAC · Críticos",  region: "apac",  severity: "critical", hideExpected: true },
    { id: "global-critical",label: "Global · Críticos",region: "all",   severity: "critical", hideExpected: true },
    { id: "latam-all",      label: "LatAm · Todas",    region: "latam", severity: "all",      hideExpected: false },
  ];
  const applyPreset = (p: Preset) => {
    setRegion(p.region);
    setSeverity(p.severity);
    setHideExpected(p.hideExpected);
    setCountry(p.country ?? "all");
    setActivePreset(p.id);
  };
  const resetFilters = () => {
    setRegion("latam");
    setSeverity("all");
    setHideExpected(true);
    setCountry("all");
    setActivePreset(null);
  };

  const regionAnomalies = useMemo(
    () => wowAnomalies.filter((w) => includesCountry(w.country)),
    [includesCountry],
  );

  const availableCountries = useMemo(
    () => wowCountries.filter((c) => regionKey === "all" || region.countries.includes(c)),
    [region, regionKey],
  );

  const enriched = useMemo(
    () =>
      regionAnomalies.map((w) => ({
        ...w,
        ctx: classifyAnomaly(w.country, w.dropPct, TODAY),
      })),
    [regionAnomalies],
  );

  const filtered = useMemo(() => {
    let rows = country === "all" ? enriched : enriched.filter((w) => w.country === country);
    if (severity !== "all") rows = rows.filter((w) => w.severity === severity);
    if (hideExpected) rows = rows.filter((w) => !w.ctx.isExpected);
    return rows;
  }, [country, severity, enriched, hideExpected]);

  const timelineCountries = useMemo(
    () => (country === "all" ? availableCountries : [country]),
    [country, availableCountries],
  );

  const defaultCalendarRegion: CalendarRegionFilter =
    regionKey === "latam" || regionKey === "apac" || regionKey === "europe" ? regionKey : "all";

  const expectedCount = enriched.filter((w) => w.ctx.isExpected).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sales Anomaly Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Week-over-week drops with seasonality &amp; YoY context (last 14 days)
            {regionKey !== "all" && <> — {region.flag} {region.name}</>}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="min-w-[180px]">
            <Select value={regionKey} onValueChange={(v) => setRegion(v as RegionKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                {REGION_ORDER.map((k) => (
                  <SelectItem key={k} value={k}>
                    {REGIONS[k].flag} {REGIONS[k].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <Select
              value={severity}
              onValueChange={(v) => { setSeverity(v as typeof severity); setActivePreset(null); }}
            >
              <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical only</SelectItem>
                <SelectItem value="warning">Warning only</SelectItem>
                <SelectItem value="info">Info only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <Select value={country} onValueChange={(v) => { setCountry(v); setActivePreset(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {availableCountries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
        <span className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Presets
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              activePreset === p.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-background text-foreground hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={resetFilters}
          className="ml-auto rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>

      <SeasonalityCalendarPanel
        timelineCountries={timelineCountries}
        today={TODAY}
        defaultRegion={defaultCalendarRegion}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard label="Anomalies" value={wowKpis.anomalies} />
        <SummaryCard label="Critical drops" value={wowKpis.criticalDrops} tone="danger" />
        <SummaryCard label="Bookings lost (WoW)" value={wowKpis.bookingsLost} />
        <L2bCard thisWeek={wowKpis.l2bThisWeek} lastWeek={wowKpis.l2bLastWeek} deltaPp={wowKpis.l2bDeltaPp} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-danger" />
            Week-over-week drops {country !== "all" && `— ${country}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              id="hide-expected"
              checked={hideExpected}
              onCheckedChange={setHideExpected}
            />
            <Label htmlFor="hide-expected" className="text-xs text-muted-foreground">
              {hideExpected
                ? `Hiding ${expectedCount} expected seasonal variation${expectedCount === 1 ? "" : "s"}`
                : "Showing all anomalies"}
            </Label>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">WoW</TableHead>
                  <TableHead className="text-right">YoY</TableHead>
                  <TableHead className="text-right">L2B (this/last)</TableHead>
                  <TableHead>Seasonal context</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No anomalies to display.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((w) => (
                    <TableRow
                      key={w.id}
                      className={cn(w.ctx.tone === "critical" && "bg-danger/5")}
                    >
                      <TableCell className="font-medium">{w.operator}</TableCell>
                      <TableCell className="text-muted-foreground">{w.route}</TableCell>
                      <TableCell>
                        <CountryCell country={w.country} peak={w.ctx.peak} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{w.brand}</TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold tabular-nums",
                        w.dropPct < 0 ? "text-danger" : "text-emerald-600",
                      )}>
                        {w.dropPct > 0 ? "+" : ""}{w.dropPct}%
                      </TableCell>
                      <TableCell className={cn(
                        "text-right tabular-nums",
                        w.yoyPct < 0 ? "text-danger" : "text-emerald-600",
                      )}>
                        {w.yoyPct > 0 ? "+" : ""}{w.yoyPct}%
                      </TableCell>
                      <TableCell>
                        <L2bCell thisWk={w.l2bThisWeek} lastWk={w.l2bLastWeek} deltaPp={w.l2bDeltaPp} />
                      </TableCell>
                      <TableCell>
                        <ContextBadge tone={w.ctx.tone} label={w.ctx.label} detail={w.ctx.detail} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone?: "danger" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn(
          "mt-1 text-3xl font-semibold tabular-nums",
          tone === "danger" ? "text-danger" : "text-foreground",
        )}>
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function CountryCell({ country, peak }: { country: string; peak: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{country}</span>
      {peak && (
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
          peak
        </span>
      )}
    </div>
  );
}

const TONE_STYLES: Record<ContextTone, string> = {
  critical: "bg-danger/10 text-danger border-danger/30",
  info: "bg-amber-100 text-amber-700 border-amber-200",
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  investigate: "bg-sky-100 text-sky-700 border-sky-200",
  shift: "bg-violet-100 text-violet-700 border-violet-200",
};

const TONE_GLYPH: Record<ContextTone, string> = {
  critical: "🔴",
  info: "🟡",
  positive: "🟢",
  investigate: "🔵",
  shift: "🟣",
};

function ContextBadge({ tone, label, detail }: { tone: ContextTone; label: string; detail: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            TONE_STYLES[tone],
          )}>
            <span>{TONE_GLYPH[tone]}</span>
            <span>{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs text-xs">
          {detail}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function L2bCard({ thisWeek, lastWeek, deltaPp }: { thisWeek: number; lastWeek: number; deltaPp: number }) {
  const down = deltaPp < 0;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">Look-to-Book (avg)</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{thisWeek}%</p>
        <p className={cn("mt-1 text-xs tabular-nums", down ? "text-danger" : "text-emerald-600")}>
          {deltaPp > 0 ? "+" : ""}{deltaPp} pp vs last week ({lastWeek}%)
        </p>
      </CardContent>
    </Card>
  );
}

function L2bCell({ thisWk, lastWk, deltaPp }: { thisWk: number; lastWk: number; deltaPp: number }) {
  const down = deltaPp < 0;
  return (
    <div className="flex flex-col items-end tabular-nums">
      <span className="text-sm font-medium">
        {thisWk}% <span className="text-muted-foreground">/ {lastWk}%</span>
      </span>
      <span className={cn("text-[11px]", down ? "text-danger" : "text-emerald-600")}>
        {deltaPp > 0 ? "+" : ""}{deltaPp} pp
      </span>
    </div>
  );
}

