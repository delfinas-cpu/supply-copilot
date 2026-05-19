import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dailyBookings } from "@/lib/mock-data";

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BookingsChart() {
  const anomalies = dailyBookings.filter((d) => d.anomaly);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Daily Bookings — Last 30 Days</CardTitle>
          <p className="text-xs text-muted-foreground">
            Red dots mark days more than 20% below the 7-day average.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-primary" /> Bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-muted-foreground/60" style={{ borderTop: "1px dashed currentColor" }} /> 7-day avg
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Anomaly
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyBookings} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                minTickGap={24}
              />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                }}
                labelFormatter={(l) => formatDate(l as string)}
                formatter={(value: number, name) => [value, name === "bookings" ? "Bookings" : "7-day avg"]}
              />
              <Line
                type="monotone"
                dataKey="avg7"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="var(--color-primary, #072F2F)"
                strokeWidth={2}
                dot={{ r: 2.5 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              {anomalies.map((a) => (
                <ReferenceDot
                  key={a.date}
                  x={a.date}
                  y={a.bookings}
                  r={6}
                  fill="var(--color-danger, #dc2626)"
                  stroke="white"
                  strokeWidth={2}
                  isFront
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
