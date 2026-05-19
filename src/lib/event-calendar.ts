// Curated seasonality events used by the expandable calendar in Sales Anomalies.
// Independent from SEASONALITY_CALENDAR (which powers per-row anomaly classification).

export type EventType = "peak" | "holiday" | "low" | "special";
export type EventRegion = "latam" | "apac" | "europe";

export interface SeasonalEvent {
  date: string; // ISO YYYY-MM-DD
  country: string;
  event: string;
  impact: string;
  type: EventType;
  region: EventRegion;
}

const latam: SeasonalEvent[] = ([
  { date: "2026-06-01", country: "Peru", event: "Inti Raymi season starts", impact: "+35% demand", type: "peak" },
  { date: "2026-06-24", country: "Peru", event: "Inti Raymi", impact: "+60% demand", type: "peak" },
  { date: "2026-06-29", country: "Brazil", event: "Festa Junina peak", impact: "+25% domestic", type: "peak" },
  { date: "2026-07-04", country: "Colombia", event: "Festival Vallenato", impact: "+20% demand", type: "special" },
  { date: "2026-07-09", country: "Argentina", event: "Independence Day", impact: "-15% bookings", type: "holiday" },
  { date: "2026-07-20", country: "Colombia", event: "Independence Day", impact: "-20% bookings", type: "holiday" },
  { date: "2026-07-28", country: "Peru", event: "Independence Day", impact: "-25% bookings", type: "holiday" },
  { date: "2026-08-06", country: "Bolivia", event: "Independence Day", impact: "-20% bookings", type: "holiday" },
  { date: "2026-08-15", country: "Paraguay", event: "Assumption of Mary", impact: "-10% bookings", type: "holiday" },
  { date: "2026-08-25", country: "Uruguay", event: "Independence Day", impact: "-15% bookings", type: "holiday" },
  { date: "2026-09-01", country: "LatAm", event: "Low season begins", impact: "-10% overall", type: "low" },
  { date: "2026-09-15", country: "Mexico/Guatemala/Honduras", event: "Independence cluster", impact: "-30% bookings", type: "holiday" },
  { date: "2026-09-18", country: "Chile", event: "Fiestas Patrias", impact: "-35% bookings", type: "holiday" },
  { date: "2026-10-12", country: "LatAm", event: "Día de la Raza", impact: "-15% bookings", type: "holiday" },
  { date: "2026-11-01", country: "Mexico", event: "Día de Muertos", impact: "+20% tourism", type: "peak" },
  { date: "2026-11-15", country: "Brazil", event: "Republic Day", impact: "-10% bookings", type: "holiday" },
  { date: "2026-12-08", country: "LatAm", event: "Immaculate Conception", impact: "-15% bookings", type: "holiday" },
  { date: "2026-12-25", country: "LatAm", event: "Christmas", impact: "+40% demand", type: "peak" },
  { date: "2027-01-01", country: "LatAm", event: "New Year", impact: "+35% demand", type: "peak" },
  { date: "2027-02-14", country: "LatAm", event: "Pre-Carnival starts", impact: "+25% demand", type: "peak" },
  { date: "2027-02-28", country: "Brazil", event: "Carnival peak", impact: "+80% demand", type: "special" },
] as const).map((e) => ({ ...e, region: "latam" as const }));

const apac: SeasonalEvent[] = ([
  { date: "2026-06-15", country: "Thailand", event: "Low season (monsoon)", impact: "-20% demand", type: "low" },
  { date: "2026-07-01", country: "Thailand", event: "Monsoon peak", impact: "-25% demand", type: "low" },
  { date: "2026-07-15", country: "Vietnam", event: "Summer holiday season", impact: "+15% domestic", type: "peak" },
  { date: "2026-08-12", country: "Thailand", event: "Queen Mother's Day", impact: "-10% bookings", type: "holiday" },
  { date: "2026-09-01", country: "Vietnam", event: "Independence Day", impact: "-20% bookings", type: "holiday" },
  { date: "2026-09-15", country: "APAC", event: "Mid-Autumn Festival", impact: "+20% demand", type: "special" },
  { date: "2026-10-01", country: "Thailand", event: "High season begins", impact: "+35% demand", type: "peak" },
  { date: "2026-10-15", country: "Indonesia", event: "Batik Day + long weekend", impact: "+15% demand", type: "special" },
  { date: "2026-11-01", country: "APAC", event: "Peak tourist season", impact: "+40% demand", type: "peak" },
  { date: "2026-12-05", country: "Thailand", event: "King's Birthday", impact: "-10% bookings", type: "holiday" },
  { date: "2026-12-25", country: "Philippines", event: "Christmas peak", impact: "+50% demand", type: "peak" },
  { date: "2027-01-25", country: "APAC", event: "Chinese New Year", impact: "+60% demand", type: "special" },
] as const).map((e) => ({ ...e, region: "apac" as const }));

const europe: SeasonalEvent[] = ([
  { date: "2026-06-21", country: "Europe", event: "Summer solstice — peak begins", impact: "+40% demand", type: "peak" },
  { date: "2026-07-01", country: "Europe", event: "Peak summer season", impact: "+60% demand", type: "peak" },
  { date: "2026-07-14", country: "France", event: "Bastille Day", impact: "+15% France routes", type: "holiday" },
  { date: "2026-08-01", country: "Europe", event: "August peak — school holidays", impact: "+70% demand", type: "peak" },
  { date: "2026-08-15", country: "Europe", event: "Assumption Day — Southern Europe", impact: "+20% demand", type: "holiday" },
  { date: "2026-09-01", country: "Europe", event: "Post-summer drop", impact: "-30% demand", type: "low" },
  { date: "2026-10-01", country: "Europe", event: "Low season begins", impact: "-40% demand", type: "low" },
  { date: "2026-10-31", country: "Europe", event: "Halloween weekend", impact: "+10% short trips", type: "special" },
  { date: "2026-12-01", country: "Europe", event: "Christmas markets start", impact: "+25% demand", type: "peak" },
  { date: "2026-12-25", country: "Europe", event: "Christmas peak", impact: "+45% demand", type: "peak" },
  { date: "2027-01-01", country: "Europe", event: "New Year", impact: "+30% demand", type: "peak" },
] as const).map((e) => ({ ...e, region: "europe" as const }));

export const EVENT_CALENDAR: SeasonalEvent[] = [...latam, ...apac, ...europe];

export type CalendarRegionFilter = "all" | EventRegion;

export function filterEvents(events: SeasonalEvent[], region: CalendarRegionFilter) {
  return region === "all" ? events : events.filter((e) => e.region === region);
}

export const EVENT_TYPE_META: Record<EventType, { label: string; dot: string; cell: string }> = {
  peak: {
    label: "Peak / high demand",
    dot: "bg-red-500",
    cell: "bg-red-100 text-red-800 ring-1 ring-red-300",
  },
  holiday: {
    label: "Holiday / partial impact",
    dot: "bg-amber-400",
    cell: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  },
  low: {
    label: "Normal / low season",
    dot: "bg-emerald-500",
    cell: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
  },
  special: {
    label: "Special event",
    dot: "bg-violet-500",
    cell: "bg-violet-100 text-violet-800 ring-1 ring-violet-300",
  },
};
