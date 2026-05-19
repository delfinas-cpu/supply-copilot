import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, ShieldCheck, Activity, Info, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/StatusBadge";
import { BookingsChart } from "@/components/BookingsChart";
import { OperatorDetailDialog } from "@/components/OperatorDetailDialog";
import { operators, avgCancellationRate, HEALTH_THRESHOLDS, type Operator } from "@/lib/mock-data";
import { useRegion } from "@/lib/region-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Supply Health Dashboard — Supply Copilot" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { includesCountry, region, regionKey } = useRegion();
  const [country, setCountry] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Operator | null>(null);
  const [declineSort, setDeclineSort] = useState<"none" | "desc" | "asc">("none");

  const regionOperators = useMemo(
    () => operators.filter((o) => includesCountry(o.country)),
    [includesCountry],
  );

  const availableCountries = useMemo(
    () => Array.from(new Set(regionOperators.map((o) => o.country))).sort(),
    [regionOperators],
  );

  const critical = regionOperators.filter((o) => o.status === "critical").length;
  const warning = regionOperators.filter((o) => o.status === "warning").length;
  const healthy = regionOperators.filter((o) => o.status === "healthy").length;
  const avgCancel = useMemo(() => {
    if (!regionOperators.length) return 0;
    return (
      Math.round(
        (regionOperators.reduce((s, o) => s + o.cancellationRate, 0) /
          regionOperators.length) *
          10,
      ) / 10
    );
  }, [regionOperators]);

  useEffect(() => { setCountry("all"); }, [regionKey]);

  const filtered = useMemo(() => {
    const base = regionOperators.filter(
      (o) =>
        (country === "all" || o.country === country) &&
        (status === "all" || o.status === status),
    );
    if (declineSort === "none") return base;
    const dir = declineSort === "desc" ? -1 : 1;
    return [...base].sort((a, b) => (a.declines.total - b.declines.total) * dir);
  }, [regionOperators, country, status, declineSort]);

  const cycleDeclineSort = () =>
    setDeclineSort((s) => (s === "none" ? "desc" : s === "desc" ? "asc" : "none"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Supply Health Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Live health of all active supply operators
          {regionKey !== "all" && <> in <span className="font-medium text-foreground">{region.flag} {region.name}</span></>}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Operators at Risk" value={critical} tone="danger" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="Active Alerts" value={warning} tone="warning" icon={<Bell className="h-5 w-5" />} />
        <KpiCard label="Healthy Operators" value={healthy} tone="success" icon={<ShieldCheck className="h-5 w-5" />} />
        <KpiCard label="Avg Cancellation Rate" value={`${avgCancel}%`} tone="neutral" icon={<Activity className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-1.5 text-base">
            Provider Health Score
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="About health score" className="text-muted-foreground hover:text-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs text-xs">
                  Health score combines: booking volume trend (WoW), margin vs target,
                  cancellation rate, decline rate, and complaint count. Operators
                  exceeding thresholds in 2+ signals are flagged RED.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {availableCountries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">At Risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Cancellation Rate</TableHead>
                  <TableHead className="text-right">Decline Rate</TableHead>
                  <TableHead className="text-right">
                    <button
                      type="button"
                      onClick={cycleDeclineSort}
                      className="ml-auto inline-flex items-center gap-1 hover:text-foreground"
                      aria-label="Sort by declines"
                    >
                      Declines (30d)
                      {declineSort === "none" && <ArrowUpDown className="h-3 w-3 opacity-50" />}
                      {declineSort === "desc" && <ArrowDown className="h-3 w-3 text-primary" />}
                      {declineSort === "asc" && <ArrowUp className="h-3 w-3 text-primary" />}
                    </button>
                  </TableHead>
                  <TableHead>Top decline reason</TableHead>
                  <TableHead className="text-right">Complaints</TableHead>
                  <TableHead>Main Issue</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell>{o.country}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setSelected(o)}
                        className="rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`View details for ${o.name}`}
                      >
                        <StatusBadge status={o.status} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-medium tabular-nums">{o.score}</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full",
                            o.score >= 80 ? "bg-success" : o.score >= 60 ? "bg-warning" : "bg-danger")}
                            style={{ width: `${o.score}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <SignalCell value={`${o.cancellationRate}%`} flag={o.cancellationRate > HEALTH_THRESHOLDS.cancellationPct} />
                    <SignalCell value={`${o.declineRate}%`} flag={o.declineRate > HEALTH_THRESHOLDS.declinePct} />
                    <TableCell className="text-right tabular-nums">{o.declines.total}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="text-foreground">{o.declines.topReason}</span>
                      {o.declines.total > 0 && <span className="ml-1">· {o.declines.topReasonPct}%</span>}
                    </TableCell>
                    <SignalCell value={o.complaints} flag={o.complaints > HEALTH_THRESHOLDS.complaints} />
                    <TableCell className="text-muted-foreground">{o.issue}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{o.lastUpdated}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="py-8 text-center text-muted-foreground">No operators match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border/60 px-4 py-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Thresholds:</span>{" "}
            Cancellation &gt; {HEALTH_THRESHOLDS.cancellationPct}% · Decline &gt; {HEALTH_THRESHOLDS.declinePct}% · Complaints &gt; {HEALTH_THRESHOLDS.complaints} ·{" "}
            <span className="text-success">GREEN</span> = all signals clear ·{" "}
            <span className="text-warning">YELLOW</span> = 1 signal above threshold ·{" "}
            <span className="text-danger">RED</span> = 2+ signals above threshold or cancellation &gt; {HEALTH_THRESHOLDS.cancellationCriticalPct}%.
          </div>
        </CardContent>
      </Card>

      <BookingsChart />

      <OperatorDetailDialog
        operator={selected}
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}

function SignalCell({ value, flag }: { value: string | number; flag: boolean }) {
  return (
    <TableCell className={cn("text-right tabular-nums", flag ? "font-semibold text-danger" : "text-foreground")}>
      {value}
      {flag && <span className="ml-1 text-[10px]">⚠</span>}
    </TableCell>
  );
}

function KpiCard({ label, value, tone, icon }: { label: string; value: number | string; tone: "danger" | "warning" | "success" | "neutral"; icon: React.ReactNode }) {
  const toneMap = {
    danger: { bg: "bg-danger/10", text: "text-danger", ring: "ring-danger/20" },
    warning: { bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
    success: { bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
    neutral: { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" },
  }[tone];
  const valueClass = tone === "neutral" ? "text-foreground" : toneMap.text;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg ring-1", toneMap.bg, toneMap.text, toneMap.ring)}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("text-3xl font-semibold tabular-nums", valueClass)}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
