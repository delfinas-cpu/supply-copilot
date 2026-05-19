import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { getOperatorDetail, HEALTH_THRESHOLDS, type Operator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const severityColor = {
  critical: "text-danger",
  warning: "text-warning",
  info: "text-muted-foreground",
} as const;

function SignalTile({ label, value, flag, threshold }: { label: string; value: string | number; flag: boolean; threshold: string }) {
  return (
    <div className={cn(
      "rounded-md border p-2.5",
      flag ? "border-danger/40 bg-danger/5" : "border-border/60",
    )}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", flag ? "text-danger" : "text-foreground")}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">flag {threshold}</p>
    </div>
  );
}


export function OperatorDetailDialog({
  operator,
  open,
  onOpenChange,
}: {
  operator: Operator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!operator) return null;
  const detail = getOperatorDetail(operator);
  const max = Math.max(...detail.bookingsLast7, 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {operator.name}
            <StatusBadge status={operator.status} />
          </DialogTitle>
          <DialogDescription>
            {operator.country} · Health score {operator.score}/100
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Route</h4>
            <p className="mt-1 text-sm">{detail.route}</p>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bookings — last 7 days
              </h4>
              <span className="text-xs text-muted-foreground">
                Total {detail.bookingsLast7.reduce((s, n) => s + n, 0)}
              </span>
            </div>
            <div className="mt-2 flex h-20 items-end gap-1.5">
              {detail.bookingsLast7.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{ height: `${(v / max) * 100}%` }}
                    title={`${v} bookings`}
                  />
                  <span className="text-[10px] text-muted-foreground">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Margin</h4>
            <p
              className={cn(
                "mt-1 text-2xl font-semibold tabular-nums",
                detail.marginPct < 12 ? "text-danger" : detail.marginPct < 16 ? "text-warning" : "text-success",
              )}
            >
              {detail.marginPct}%
            </p>
          </section>

          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Health signals (last 30 days)</h4>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <SignalTile
                label="Cancellation"
                value={`${operator.cancellationRate}%`}
                flag={operator.cancellationRate > HEALTH_THRESHOLDS.cancellationPct}
                threshold={`> ${HEALTH_THRESHOLDS.cancellationPct}%`}
              />
              <SignalTile
                label="Decline"
                value={`${operator.declineRate}%`}
                flag={operator.declineRate > HEALTH_THRESHOLDS.declinePct}
                threshold={`> ${HEALTH_THRESHOLDS.declinePct}%`}
              />
              <SignalTile
                label="Complaints"
                value={operator.complaints}
                flag={operator.complaints > HEALTH_THRESHOLDS.complaints}
                threshold={`> ${HEALTH_THRESHOLDS.complaints}`}
              />
            </div>
          </section>

          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent alerts</h4>
            {detail.recentAlerts.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No alerts in the last 30 days.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {detail.recentAlerts.map((a, i) => (
                  <li key={i} className="rounded-md border border-border/60 p-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium uppercase", severityColor[a.severity])}>
                        {a.severity}
                      </span>
                      <span className="text-muted-foreground">{a.date}</span>
                    </div>
                    <p className="mt-1 text-sm">{a.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

