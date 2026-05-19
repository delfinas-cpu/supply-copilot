import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingDown,
  Plus,
  Download,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegion } from "@/lib/region-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contracts")({
  head: () => ({ meta: [{ title: "Contract Balance Tracker — Supply Copilot" }] }),
  component: ContractsPage,
});

type ContractStatus = "HEALTHY" | "WATCH" | "CRITICAL" | "EXPIRED";

interface ContractRow {
  operator: string;
  country: string;
  deal_type: string;
  total: number;
  consumed: number;
  remaining: number;
  balance_pct: number;
  burn_rate: string;
  burn_monthly: number;
  next_payment: { date: string; amount: number };
  expires: string;
  status: ContractStatus;
  alert: string | null;
  trend: number[];
}

const CONTRACTS: ContractRow[] = [
  { operator: "Transporzuma", country: "Mexico", deal_type: "General Deposits", total: 210000, consumed: 80000, remaining: 130000, balance_pct: 61.9, burn_rate: "~$18K/month", burn_monthly: 18000, next_payment: { date: "2026-06-01", amount: 40000 }, expires: "2026-12-31", status: "HEALTHY", alert: "Burn rate accelerated — June payment must arrive on time", trend: [14, 15, 17, 18, 18, 19] },
  { operator: "Kahk Bahlam", country: "Mexico", deal_type: "Revolving Fixed Amount", total: 153388, consumed: 153388, remaining: 0, balance_pct: 0, burn_rate: "~$14K/month", burn_monthly: 14000, next_payment: { date: "OVERDUE", amount: 30677 }, expires: "2026-10-01", status: "CRITICAL", alert: "Balance EXHAUSTED — urgent top-up required", trend: [9, 12, 14, 15, 16, 17] },
  { operator: "Travel Site", country: "Costa Rica", deal_type: "Prepayment Plan", total: 32846, consumed: 32846, remaining: 0, balance_pct: 0, burn_rate: "~$2K/month", burn_monthly: 2000, next_payment: { date: "EXPIRED", amount: 0 }, expires: "2026-05-01", status: "EXPIRED", alert: "DEAL EXPIRED — active sales with no contract", trend: [3, 3, 2, 2, 2, 2] },
  { operator: "Central Line", country: "Costa Rica", deal_type: "General Deposits", total: 12000, consumed: 12000, remaining: 0, balance_pct: 0, burn_rate: "~$1.5K/month", burn_monthly: 1500, next_payment: { date: "OVERDUE", amount: 5000 }, expires: "2026-08-01", status: "CRITICAL", alert: "Balance exhausted — volume 2-3x projection", trend: [1, 1.2, 1.4, 1.6, 1.8, 2] },
  { operator: "Volcano Travel", country: "Costa Rica", deal_type: "General Deposits", total: 155000, consumed: 20000, remaining: 135000, balance_pct: 87.1, burn_rate: "~$11.5K/month", burn_monthly: 11500, next_payment: { date: "2026-06-01", amount: 20000 }, expires: "2027-04-01", status: "HEALTHY", alert: "Burn rate accelerated — June payment is critical", trend: [5, 7, 9, 10, 11, 12] },
  { operator: "Nica Expreso", country: "Nicaragua", deal_type: "General Deposits", total: 50000, consumed: 25000, remaining: 25000, balance_pct: 50, burn_rate: "~$2.8K/month", burn_monthly: 2800, next_payment: { date: "2026-07-01", amount: 10000 }, expires: "2026-12-31", status: "HEALTHY", alert: null, trend: [2.5, 2.6, 2.7, 2.8, 2.8, 2.9] },
  { operator: "Santa Teresa Adventure", country: "Costa Rica", deal_type: "General Deposits", total: 50000, consumed: 35000, remaining: 15000, balance_pct: 30, burn_rate: "~$7K/month", burn_monthly: 7000, next_payment: { date: "2026-07-01", amount: 20000 }, expires: "2026-12-31", status: "WATCH", alert: "Low balance — next payment in July", trend: [4, 5, 6, 6.5, 7, 7.2] },
  { operator: "Marsol Transportes", country: "Colombia", deal_type: "Revolving Fixed Amount", total: 55017, consumed: 43000, remaining: 12017, balance_pct: 21.8, burn_rate: "~$5K/month", burn_monthly: 5000, next_payment: { date: "AUTO-REPLENISH", amount: 2593 }, expires: "2026-09-01", status: "WATCH", alert: "Auto-replenish active — monitor 20% threshold", trend: [4, 4.5, 4.8, 5, 5.2, 5.1] },
  { operator: "Galaxy Wave", country: "Honduras", deal_type: "Revolving Fixed Amount", total: 12000, consumed: 8000, remaining: 4000, balance_pct: 33.3, burn_rate: "~$800/month", burn_monthly: 800, next_payment: { date: "AUTO-REPLENISH", amount: 600 }, expires: "2026-12-31", status: "WATCH", alert: "Structurally small balance for the volume", trend: [0.6, 0.7, 0.75, 0.8, 0.8, 0.85] },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const statusOrder: Record<ContractStatus, number> = { EXPIRED: 0, CRITICAL: 1, WATCH: 2, HEALTHY: 3 };

const statusStyles: Record<ContractStatus, string> = {
  HEALTHY: "bg-success/10 text-success ring-success/20",
  WATCH: "bg-warning/10 text-warning ring-warning/20",
  CRITICAL: "bg-danger/10 text-danger ring-danger/20",
  EXPIRED: "bg-danger/20 text-danger ring-danger/40",
};

function StatusPill({ s }: { s: ContractStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", statusStyles[s])}>
      {s}
    </span>
  );
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-10 w-full", className)}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ContractsPage() {
  const { isLatAm, region } = useRegion();
  const [country, setCountry] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [dealType, setDealType] = useState("all");
  const [sort, setSort] = useState<"status" | "remaining" | "next" | "expires">("status");
  const [selected, setSelected] = useState<ContractRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const countries = useMemo(() => Array.from(new Set(CONTRACTS.map((c) => c.country))).sort(), []);
  const dealTypes = useMemo(() => Array.from(new Set(CONTRACTS.map((c) => c.deal_type))).sort(), []);

  const filtered = useMemo(() => {
    const base = CONTRACTS.filter(
      (c) =>
        (country === "all" || c.country === country) &&
        (statusF === "all" || c.status === statusF) &&
        (dealType === "all" || c.deal_type === dealType),
    );
    const sorted = [...base].sort((a, b) => {
      if (sort === "status") return statusOrder[a.status] - statusOrder[b.status];
      if (sort === "remaining") return a.balance_pct - b.balance_pct;
      if (sort === "next") {
        const av = parseDate(a.next_payment.date) ?? Infinity;
        const bv = parseDate(b.next_payment.date) ?? Infinity;
        return av - bv;
      }
      return new Date(a.expires).getTime() - new Date(b.expires).getTime();
    });
    return sorted;
  }, [country, statusF, dealType, sort]);

  const totalRemaining = 812000;
  const expiringSoon = 1;
  const lowBalance = 3;
  const requireAction = CONTRACTS.filter((c) => c.status === "EXPIRED" || c.status === "CRITICAL").length;

  const urgentAlerts = [
    "⚠️ Travel Site (Costa Rica) — Deal EXPIRED May 2026. Active sales with no contract. Renew immediately.",
    "⚠️ Kahk Bahlam (Mexico) — Balance likely exhausted. Volume 4-5x projection. Top-up required.",
  ];

  function exportCsv() {
    const headers = ["Operator", "Country", "Deal Type", "Total", "Consumed", "Remaining", "Balance %", "Burn Rate", "Next Payment", "Expires", "Status"];
    const rows = filtered.map((c) => [
      c.operator, c.country, c.deal_type, c.total, c.consumed, c.remaining, c.balance_pct, c.burn_rate,
      `${c.next_payment.date} (${c.next_payment.amount})`, c.expires, c.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contracts.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Contract Balance Tracker</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Remaining contract value, burn rate, and upcoming payment schedule per operator.
            Alerts when balance is low or deal is nearing expiration.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setShowAdd(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New Contract
          </Button>
        </div>
      </div>

      {!isLatAm && (
        <Card className="border-brand-light/40 bg-brand-light/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Contract data shown for <span className="font-medium text-foreground">LatAm</span>.
            Other regions coming soon. <span className="text-xs">(Active region: {region.flag} {region.name})</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Remaining Value" value={fmt(totalRemaining)} tone="success" Icon={DollarSign} />
        <KpiCard label="Expiring < 30 days" value={expiringSoon} tone="danger" Icon={Clock} />
        <KpiCard label="Low Balance (< 15%)" value={lowBalance} tone="warning" Icon={TrendingDown} />
        <KpiCard label="Deals Requiring Action" value={requireAction} tone="danger" Icon={AlertTriangle} />
      </div>

      {!dismissed && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-danger">Urgent action required</p>
              <ul className="space-y-1 text-sm text-foreground/90">
                {urgentAlerts.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="HEALTHY">Healthy</SelectItem>
              <SelectItem value="WATCH">Watch</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Deal type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deal types</SelectItem>
              {dealTypes.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by</span>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="remaining">Remaining %</SelectItem>
                <SelectItem value="next">Next Payment Date</SelectItem>
                <SelectItem value="expires">Expires</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Deal Type</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Balance %</TableHead>
                  <TableHead>Burn Rate</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={c.operator}
                    className={cn("cursor-pointer",
                      c.status === "EXPIRED" && "bg-danger/10 hover:bg-danger/15",
                      c.status === "CRITICAL" && "bg-danger/5 hover:bg-danger/10",
                    )}
                    onClick={() => setSelected(c)}
                  >
                    <TableCell className="font-medium">{c.operator}</TableCell>
                    <TableCell className="text-muted-foreground">{c.country}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.deal_type}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(c.total)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(c.consumed)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{fmt(c.remaining)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full",
                              c.balance_pct < 15 ? "bg-danger" : c.balance_pct < 30 ? "bg-warning" : "bg-success",
                            )}
                            style={{ width: `${c.balance_pct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{c.balance_pct.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">{c.burn_rate}</TableCell>
                    <TableCell className="text-xs">
                      <span className={cn(
                        c.next_payment.date === "OVERDUE" && "text-danger font-semibold",
                        c.next_payment.date === "EXPIRED" && "text-danger font-semibold",
                        c.next_payment.date === "AUTO-REPLENISH" && "text-brand-dark",
                      )}>
                        {c.next_payment.date}
                      </span>
                      {c.next_payment.amount > 0 && (
                        <span className="ml-1 text-muted-foreground">· {fmt(c.next_payment.amount)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.expires}</TableCell>
                    <TableCell><StatusPill s={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border/60 px-4 py-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Status logic:</span>{" "}
            <span className="text-success">HEALTHY</span> balance &gt; 30% &amp; not expiring 30d ·{" "}
            <span className="text-warning">WATCH</span> 15–30% or expiring 31–60d ·{" "}
            <span className="text-danger">CRITICAL</span> &lt; 15% or expiring &lt; 30d ·{" "}
            <span className="text-danger font-semibold">EXPIRED</span> end date passed.
          </div>
        </CardContent>
      </Card>

      <ContractDetailSheet contract={selected} onClose={() => setSelected(null)} />
      <AddContractDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function KpiCard({ label, value, tone, Icon }: { label: string; value: number | string; tone: "danger" | "warning" | "success" | "muted"; Icon: React.ComponentType<{ className?: string }> }) {
  const toneCls = { danger: "text-danger", warning: "text-warning", success: "text-success", muted: "text-muted-foreground" }[tone];
  const bg = { danger: "bg-danger/10", warning: "bg-warning/10", success: "bg-success/10", muted: "bg-muted" }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", bg, toneCls)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function parseDate(s: string): number | null {
  if (s === "OVERDUE") return -1;
  if (s === "EXPIRED") return -2;
  if (s === "AUTO-REPLENISH") return Infinity;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : t;
}

function ContractDetailSheet({ contract, onClose }: { contract: ContractRow | null; onClose: () => void }) {
  const c = contract;
  const projection = useMemo(() => {
    if (!c || c.burn_monthly <= 0 || c.remaining <= 0) return null;
    const months = c.remaining / c.burn_monthly;
    const d = new Date("2026-05-18");
    d.setMonth(d.getMonth() + Math.floor(months));
    d.setDate(d.getDate() + Math.round((months % 1) * 30));
    return d.toISOString().slice(0, 10);
  }, [c]);

  return (
    <Sheet open={!!c} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        {c && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {c.operator}
                <StatusPill s={c.status} />
              </SheetTitle>
              <p className="text-xs text-muted-foreground">{c.country} · {c.deal_type}</p>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              {c.alert && (
                <div className={cn("rounded-md border p-3 text-sm",
                  c.status === "EXPIRED" || c.status === "CRITICAL"
                    ? "border-danger/30 bg-danger/5 text-danger"
                    : "border-warning/30 bg-warning/5 text-warning")}>
                  {c.alert}
                </div>
              )}

              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{(100 - c.balance_pct).toFixed(1)}% consumed of total deal value</span>
                  <span className="tabular-nums">{fmt(c.consumed)} / {fmt(c.total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full",
                      c.balance_pct < 15 ? "bg-danger" : c.balance_pct < 30 ? "bg-warning" : "bg-success")}
                    style={{ width: `${100 - c.balance_pct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-[11px] uppercase text-muted-foreground">Remaining</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{fmt(c.remaining)}</p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-[11px] uppercase text-muted-foreground">Burn rate</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{c.burn_rate}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly consumption trend</p>
                <div className="text-brand-dark">
                  <Sparkline data={c.trend} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Upcoming payments</p>
                <div className="rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className={cn("font-medium",
                      c.next_payment.date === "OVERDUE" || c.next_payment.date === "EXPIRED" ? "text-danger" : "text-foreground")}>
                      {c.next_payment.date}
                    </span>
                    <span className="tabular-nums">{c.next_payment.amount > 0 ? fmt(c.next_payment.amount) : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-brand-light/40 bg-brand-light/5 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-brand-dark">
                  <Sparkles className="h-3.5 w-3.5" /> Projected exhaustion
                </p>
                <p className="mt-1 tabular-nums">
                  {projection ? projection : c.remaining === 0 ? "Already exhausted" : "—"}
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddContractDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new contract</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Field label="Operator name" placeholder="e.g. Mountain Express" />
          <Field label="Country" placeholder="e.g. Peru" />
          <Field label="Deal type" placeholder="General Deposits / Revolving / Prepayment" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total value (USD)" type="number" placeholder="50000" />
            <Field label="Initial deposit" type="number" placeholder="20000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" type="date" />
            <Field label="End date" type="date" />
          </div>
          <Field label="Next scheduled payment" type="date" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={onClose}>Save contract</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input {...props} />
    </div>
  );
}
