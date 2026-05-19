import type { HealthStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const config: Record<HealthStatus, { label: string; dot: string; bg: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-success", bg: "bg-success/10", text: "text-success" },
  warning: { label: "At Risk", dot: "bg-warning", bg: "bg-warning/10", text: "text-warning" },
  critical: { label: "Critical", dot: "bg-danger", bg: "bg-danger/15", text: "text-danger" },
};

export function StatusBadge({ status }: { status: HealthStatus }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.bg, c.text)}>
      <span className={cn("h-2 w-2 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
