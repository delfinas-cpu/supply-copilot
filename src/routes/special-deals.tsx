import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { specialDeals, type SpecialDeal, type DealStatus } from "@/lib/mock-data";
import { useRegion } from "@/lib/region-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/special-deals")({
  head: () => ({ meta: [{ title: "Special Deals — Supply Copilot" }] }),
  component: SpecialDealsPage,
});

const fmtUsd = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number | null | undefined) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`);

const statusStyles: Record<DealStatus, string> = {
  green: "bg-success/10 text-success ring-success/20",
  yellow: "bg-warning/10 text-warning ring-warning/20",
  red: "bg-danger/10 text-danger ring-danger/20",
  pending: "bg-muted text-muted-foreground ring-border",
};
const statusLabel: Record<DealStatus, string> = { green: "On Track", yellow: "Watch", red: "Action", pending: "Pending" };

function StatusPill({ s }: { s: DealStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", statusStyles[s])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s === "green" && "bg-success", s === "yellow" && "bg-warning", s === "red" && "bg-danger", s === "pending" && "bg-muted-foreground")} />
      {statusLabel[s]}
    </span>
  );
}

function Kpi({ label, value, tone, Icon }: { label: string; value: number | string; tone: "danger" | "warning" | "success" | "muted"; Icon: React.ComponentType<{ className?: string }> }) {
  const toneCls = { danger: "text-danger", warning: "text-warning", success: "text-success", muted: "text-muted-foreground" }[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-3xl font-semibold tabular-nums", toneCls)}>{value}</p>
        </div>
        <Icon className={cn("h-7 w-7 opacity-70", toneCls)} />
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number | string; tone?: "warning" | "danger" }) {
  const toneCls = tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", toneCls)}>{value}</p>
    </div>
  );
}

function SpecialDealsPage() {
  const [selected, setSelected] = useState<SpecialDeal | null>(null);

  const counts = useMemo(() => ({
    red: specialDeals.filter((d) => d.status === "red").length,
    yellow: specialDeals.filter((d) => d.status === "yellow").length,
    green: specialDeals.filter((d) => d.status === "green").length,
    pending: specialDeals.filter((d) => d.status === "pending").length,
  }), []);

  const summary = useMemo(() => {
    const today = new Date("2026-05-18").getTime();
    const in30 = today + 30 * 86400000;
    const margins = specialDeals.map((d) => d.actual_margin_avg).filter((m): m is number => m != null);
    const avgMargin = margins.length ? margins.reduce((s, m) => s + m, 0) / margins.length : 0;
    const expiringSoon = specialDeals.filter((d) =>
      d.scheduled_payments.some((p) => {
        const t = new Date(p.date).getTime();
        return t >= today && t <= in30;
      }),
    ).length;
    const lowBalance = specialDeals.filter((d) => {
      const consumed = d.monthly_performance.reduce((s, m) => s + m.revenue, 0);
      const balancePct = d.total_deal_value > 0 ? 1 - consumed / d.total_deal_value : 1;
      return balancePct < 0.15;
    }).length;
    return { avgMargin, expiringSoon, lowBalance };
  }, []);

  const sorted = useMemo(() => {
    const order: Record<DealStatus, number> = { red: 0, yellow: 1, pending: 2, green: 3 };
    return [...specialDeals].sort((a, b) => order[a.status] - order[b.status]);
  }, []);

  const { isLatAm, region } = useRegion();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Special Deals Monitor</h2>
        <p className="text-sm text-muted-foreground">
          Margin performance vs. committed targets &amp; contract balance health across your LatAm negotiated supplier deals.
        </p>
      </div>

      {!isLatAm && (
        <Card className="border-brand-light/40 bg-brand-light/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Special Deals data shown for <span className="font-medium text-foreground">LatAm</span>.
            Other regions coming soon. <span className="text-xs">(Active region: {region.flag} {region.name})</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Action Required" value={counts.red} tone="danger" Icon={AlertTriangle} />
        <Kpi label="Watch" value={counts.yellow} tone="warning" Icon={TrendingDown} />
        <Kpi label="On Track" value={counts.green} tone="success" Icon={CheckCircle2} />
        <Kpi label="Pending" value={counts.pending} tone="muted" Icon={Clock} />
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat label="Total committed value" value="$812,000" />
          <SummaryStat label="Avg portfolio margin" value={fmtPct(summary.avgMargin)} />
          <SummaryStat label="Expiring in 30 days" value={summary.expiringSoon} tone="warning" />
          <SummaryStat label="Balance < 15%" value={summary.lowBalance} tone="danger" />
        </CardContent>
      </Card>


      <Card>
        <CardHeader><CardTitle className="text-base">Deal performance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Target Margin</TableHead>
                  <TableHead className="text-right">Actual Margin</TableHead>
                  <TableHead className="text-right">Deal Value</TableHead>
                  <TableHead>Alert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((d) => {
                  const deviation =
                    d.actual_margin_avg != null ? d.actual_margin_avg - d.target_margin : null;
                  return (
                    <TableRow
                      key={d.id}
                      className={cn("cursor-pointer", d.status === "red" && "bg-danger/5 hover:bg-danger/10")}
                      onClick={() => setSelected(d)}
                    >
                      <TableCell><StatusPill s={d.status} /></TableCell>
                      <TableCell className="font-medium">{d.operator}</TableCell>
                      <TableCell className="text-muted-foreground">{d.country}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtPct(d.target_margin)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums font-medium", deviation == null ? "text-muted-foreground" : deviation < -0.02 ? "text-danger" : deviation < 0 ? "text-warning" : "text-success")}>
                        {fmtPct(d.actual_margin_avg)}
                        {deviation != null && (
                          <span className="ml-1 text-xs opacity-70">({deviation > 0 ? "+" : ""}{(deviation * 100).toFixed(1)}pp)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmtUsd(d.total_deal_value)}</TableCell>
                      <TableCell className="max-w-[280px] text-xs text-muted-foreground">
                        {d.alert ?? <span className="text-success/70">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DealDetailDialog deal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DealDetailDialog({ deal, onClose }: { deal: SpecialDeal | null; onClose: () => void }) {
  return (
    <Dialog open={!!deal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {deal && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>{deal.operator}</span>
                <StatusPill s={deal.status} />
              </DialogTitle>
              <p className="text-xs text-muted-foreground">{deal.country} · {deal.deal_type}</p>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Target Margin</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{fmtPct(deal.target_margin)}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Actual Margin</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{fmtPct(deal.actual_margin_avg)}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Deal Value</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{fmtUsd(deal.total_deal_value)}</p>
              </div>
            </div>

            {deal.alert && (
              <div className={cn("rounded-md border p-3 text-sm",
                deal.status === "red" ? "border-danger/30 bg-danger/5 text-danger" :
                deal.status === "yellow" ? "border-warning/30 bg-warning/5 text-warning" :
                "border-border bg-muted/30 text-muted-foreground")}>
                {deal.alert}
              </div>
            )}

            {deal.monthly_performance.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly margin vs target</p>
                <div className="h-44 w-full">
                  <ResponsiveContainer>
                    <LineChart data={deal.monthly_performance.map((m) => ({ ...m, marginPct: m.margin * 100 }))} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${v}%`} domain={["auto", "auto"]} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ fontSize: 12 }} />
                      <ReferenceLine y={deal.target_margin * 100} stroke="var(--brand-light)" strokeDasharray="4 3" label={{ value: "Target", fontSize: 10, fill: "var(--brand-dark)", position: "right" }} />
                      <Line type="monotone" dataKey="marginPct" stroke="var(--brand-dark)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent volume</p>
                {deal.monthly_performance.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No bookings recorded yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {deal.monthly_performance.slice(-3).reverse().map((m) => (
                      <li key={m.month} className="flex justify-between border-b border-dashed py-1 last:border-0">
                        <span className="text-muted-foreground">{m.month}</span>
                        <span className="tabular-nums">{m.tickets} tickets · {fmtUsd(m.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Scheduled payments</p>
                {deal.scheduled_payments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No upcoming top-ups scheduled.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {deal.scheduled_payments.map((p, i) => (
                      <li key={i} className="flex justify-between border-b border-dashed py-1 last:border-0">
                        <span className="text-muted-foreground">{p.date}</span>
                        <span className="tabular-nums font-medium">{fmtUsd(p.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Initial deposit: <span className="tabular-nums">{fmtUsd(deal.initial_deposit)}</span></p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
