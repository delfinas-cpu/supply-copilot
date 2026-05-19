export type HealthStatus = "healthy" | "warning" | "critical";

export type DeclineReason =
  | "No availability"
  | "Price mismatch"
  | "No response"
  | "Blackout date"
  | "Capacity full"
  | "Operator inactive";

export interface DeclineBreakdown {
  total: number; // total declines last 30 days
  topReason: DeclineReason;
  topReasonPct: number; // % of declines attributed to topReason
  byReason: Partial<Record<DeclineReason, number>>;
}

export interface Operator {
  id: string;
  name: string;
  country: string;
  status: HealthStatus;
  score: number;
  issue: string;
  lastUpdated: string;
  cancellationRate: number; // % bookings cancelled (flag > 5%)
  declineRate: number;      // % bookings declined by operator (flag > 5%)
  complaints: number;       // complaint count last 30 days (flag > 3)
  declines: DeclineBreakdown;
}

// Health-signal thresholds (used for badges + status derivation)
export const HEALTH_THRESHOLDS = {
  cancellationPct: 5,
  cancellationCriticalPct: 15,
  declinePct: 5,
  complaints: 3,
  complaintsGreen: 1,
} as const;

export function deriveHealthStatus(
  cancel: number,
  decline: number,
  complaints: number,
): HealthStatus {
  const t = HEALTH_THRESHOLDS;
  const flags =
    (cancel > t.cancellationPct ? 1 : 0) +
    (decline > t.declinePct ? 1 : 0) +
    (complaints > t.complaints ? 1 : 0);
  if (cancel > t.cancellationCriticalPct || flags >= 2) return "critical";
  if (flags === 1) return "warning";
  if (cancel < t.cancellationPct && decline < t.declinePct && complaints <= t.complaintsGreen) return "healthy";
  return "warning";
}

const operatorSeed: Array<Omit<Operator, "status" | "declines"> & { status?: HealthStatus }> = [
  { id: "1", name: "Aegean Sun Tours", country: "Greece", score: 92, issue: "—", lastUpdated: "2h ago", cancellationRate: 2.1, declineRate: 1.5, complaints: 0 },
  { id: "2", name: "Bali Wave Adventures", country: "Indonesia", score: 38, issue: "Sales dropped 42% WoW", lastUpdated: "12m ago", cancellationRate: 12.4, declineRate: 7.2, complaints: 4 },
  { id: "3", name: "Patagonia Trails Co.", country: "Argentina", score: 67, issue: "Margin below target", lastUpdated: "45m ago", cancellationRate: 8.2, declineRate: 3.1, complaints: 2 },
  { id: "4", name: "Kyoto Heritage Walks", country: "Japan", score: 88, issue: "—", lastUpdated: "1h ago", cancellationRate: 1.8, declineRate: 2.2, complaints: 1 },
  { id: "5", name: "Sahara Desert Expeditions", country: "Morocco", score: 29, issue: "Contract expiring in 7 days", lastUpdated: "5m ago", cancellationRate: 16.5, declineRate: 8.1, complaints: 6 },
  { id: "6", name: "Reykjavik Northern Lights", country: "Iceland", score: 95, issue: "—", lastUpdated: "3h ago", cancellationRate: 1.2, declineRate: 1.0, complaints: 0 },
  { id: "7", name: "Costa Rica Jungle Tours", country: "Costa Rica", score: 71, issue: "Decline + complaints elevated", lastUpdated: "30m ago", cancellationRate: 2.1, declineRate: 6.7, complaints: 5 },
  { id: "8", name: "Lisbon City Experiences", country: "Portugal", score: 84, issue: "—", lastUpdated: "1h ago", cancellationRate: 2.3, declineRate: 1.9, complaints: 1 },
  { id: "9", name: "Marrakech Souks Guides", country: "Morocco", score: 64, issue: "Cancellation rate up", lastUpdated: "20m ago", cancellationRate: 6.8, declineRate: 3.4, complaints: 2 },
  { id: "10", name: "Hanoi Street Food Tours", country: "Vietnam", score: 90, issue: "—", lastUpdated: "4h ago", cancellationRate: 1.5, declineRate: 1.2, complaints: 0 },
  { id: "11", name: "Cairo Pyramid Pass", country: "Egypt", score: 41, issue: "Refund spike detected", lastUpdated: "8m ago", cancellationRate: 14.2, declineRate: 6.3, complaints: 4 },
  { id: "12", name: "Dolomites Hiking Co.", country: "Italy", score: 86, issue: "—", lastUpdated: "2h ago", cancellationRate: 2.0, declineRate: 1.4, complaints: 1 },
  // ── LatAm coverage ──
  { id: "13", name: "Rio Samba Boat Tours",       country: "Brazil",             score: 82, issue: "—",                              lastUpdated: "1h ago",  cancellationRate: 2.4, declineRate: 2.1, complaints: 1 },
  { id: "14", name: "Cancún Reef Snorkel",        country: "Mexico",             score: 58, issue: "Cancellation spikes weekends",  lastUpdated: "18m ago", cancellationRate: 9.6, declineRate: 4.2, complaints: 3 },
  { id: "15", name: "Cartagena Old City Walks",   country: "Colombia",           score: 87, issue: "—",                              lastUpdated: "3h ago",  cancellationRate: 1.9, declineRate: 1.6, complaints: 0 },
  { id: "16", name: "Cusco Inca Trail Outfitters",country: "Peru",               score: 44, issue: "High decline rate",              lastUpdated: "25m ago", cancellationRate: 4.8, declineRate: 9.4, complaints: 5 },
  { id: "17", name: "Atacama Stargazing",         country: "Chile",              score: 91, issue: "—",                              lastUpdated: "2h ago",  cancellationRate: 1.3, declineRate: 1.1, complaints: 0 },
  { id: "18", name: "Salar de Uyuni Expeditions", country: "Bolivia",            score: 62, issue: "Complaints rising",              lastUpdated: "1h ago",  cancellationRate: 3.7, declineRate: 4.1, complaints: 4 },
  { id: "19", name: "Asunción River Cruises",     country: "Paraguay",           score: 78, issue: "—",                              lastUpdated: "5h ago",  cancellationRate: 2.6, declineRate: 2.4, complaints: 1 },
  { id: "20", name: "Punta del Este Beach Co.",   country: "Uruguay",            score: 85, issue: "—",                              lastUpdated: "2h ago",  cancellationRate: 2.1, declineRate: 1.8, complaints: 0 },
  { id: "21", name: "Galápagos Wildlife Cruises", country: "Ecuador",            score: 73, issue: "Margin below target",            lastUpdated: "40m ago", cancellationRate: 3.2, declineRate: 3.0, complaints: 2 },
  { id: "22", name: "Bocas del Toro Island Hops", country: "Panama",             score: 68, issue: "Decline rate up",                lastUpdated: "55m ago", cancellationRate: 3.8, declineRate: 5.6, complaints: 3 },
  { id: "23", name: "Antigua Volcano Treks",      country: "Guatemala",          score: 80, issue: "—",                              lastUpdated: "1h ago",  cancellationRate: 2.5, declineRate: 2.3, complaints: 1 },
  { id: "24", name: "Roatán Reef Divers",         country: "Honduras",           score: 55, issue: "Cancellation rate up",           lastUpdated: "15m ago", cancellationRate: 7.4, declineRate: 4.8, complaints: 4 },
  { id: "25", name: "Ometepe Volcano Tours",      country: "Nicaragua",          score: 74, issue: "—",                              lastUpdated: "3h ago",  cancellationRate: 2.9, declineRate: 2.7, complaints: 1 },
  { id: "26", name: "Belize Cave Tubing Co.",     country: "Belize",             score: 81, issue: "—",                              lastUpdated: "2h ago",  cancellationRate: 2.2, declineRate: 2.0, complaints: 1 },
  { id: "27", name: "Ruta de las Flores Tours",   country: "El Salvador",        score: 77, issue: "—",                              lastUpdated: "4h ago",  cancellationRate: 2.8, declineRate: 2.5, complaints: 0 },
  { id: "28", name: "Angel Falls Expeditions",    country: "Venezuela",          score: 36, issue: "Operator inactive lately",       lastUpdated: "10m ago", cancellationRate: 11.8, declineRate: 9.9, complaints: 7 },
  { id: "29", name: "Havana Classic Car Tours",   country: "Cuba",               score: 70, issue: "—",                              lastUpdated: "2h ago",  cancellationRate: 3.4, declineRate: 3.2, complaints: 2 },
  { id: "30", name: "Punta Cana Catamaran Co.",   country: "Dominican Republic", score: 83, issue: "—",                              lastUpdated: "1h ago",  cancellationRate: 2.0, declineRate: 1.9, complaints: 1 },
  { id: "31", name: "Citadelle Heritage Tours",   country: "Haiti",              score: 48, issue: "Refund spike + decline",         lastUpdated: "22m ago", cancellationRate: 10.2, declineRate: 7.6, complaints: 5 },
  { id: "32", name: "Blue Mountain Coffee Trail", country: "Jamaica",            score: 79, issue: "—",                              lastUpdated: "3h ago",  cancellationRate: 2.7, declineRate: 2.6, complaints: 1 },
  { id: "33", name: "Maracas Bay Beach Tours",    country: "Trinidad and Tobago",score: 75, issue: "—",                              lastUpdated: "2h ago",  cancellationRate: 3.0, declineRate: 2.8, complaints: 1 },
];

const declineSeed: Record<string, { total: number; byReason: Partial<Record<DeclineReason, number>> }> = {
  "1":  { total: 6,   byReason: { "No availability": 4, "Blackout date": 2 } },
  "2":  { total: 142, byReason: { "No availability": 78, "No response": 38, "Capacity full": 18, "Price mismatch": 8 } },
  "3":  { total: 31,  byReason: { "Price mismatch": 18, "No availability": 9, "Blackout date": 4 } },
  "4":  { total: 14,  byReason: { "No availability": 9, "Blackout date": 5 } },
  "5":  { total: 188, byReason: { "No response": 96, "No availability": 52, "Operator inactive": 24, "Capacity full": 16 } },
  "6":  { total: 4,   byReason: { "No availability": 3, "Blackout date": 1 } },
  "7":  { total: 96,  byReason: { "No availability": 41, "Capacity full": 33, "No response": 14, "Price mismatch": 8 } },
  "8":  { total: 11,  byReason: { "No availability": 7, "Price mismatch": 4 } },
  "9":  { total: 38,  byReason: { "Price mismatch": 17, "No availability": 14, "Blackout date": 7 } },
  "10": { total: 7,   byReason: { "No availability": 5, "Capacity full": 2 } },
  "11": { total: 124, byReason: { "No response": 58, "No availability": 41, "Price mismatch": 15, "Operator inactive": 10 } },
  "12": { total: 9,   byReason: { "No availability": 6, "Blackout date": 3 } },
};

function buildDeclineBreakdown(id: string, declineRate = 0): DeclineBreakdown {
  const seed = declineSeed[id];
  if (seed) {
    const entries = Object.entries(seed.byReason) as Array<[DeclineReason, number]>;
    const top = entries.sort((a, b) => b[1] - a[1])[0];
    const topReason = (top?.[0] ?? "No availability") as DeclineReason;
    const topReasonPct = seed.total > 0 && top ? Math.round((top[1] / seed.total) * 100) : 0;
    return { total: seed.total, topReason, topReasonPct, byReason: seed.byReason };
  }
  // Deterministic fallback derived from id + declineRate
  const n = Number(id) || 1;
  const total = Math.max(2, Math.round(declineRate * 18 + (n % 5) * 3));
  const reasonPool: DeclineReason[] = [
    "No availability", "Price mismatch", "No response", "Blackout date", "Capacity full", "Operator inactive",
  ];
  const topReason = reasonPool[n % reasonPool.length];
  const second = reasonPool[(n + 2) % reasonPool.length];
  const third = reasonPool[(n + 4) % reasonPool.length];
  const topShare = declineRate > 6 ? 0.55 : 0.45;
  const topCount = Math.max(1, Math.round(total * topShare));
  const secondCount = Math.max(1, Math.round(total * 0.3));
  const thirdCount = Math.max(0, total - topCount - secondCount);
  const byReason: Partial<Record<DeclineReason, number>> = { [topReason]: topCount, [second]: secondCount };
  if (thirdCount > 0) byReason[third] = thirdCount;
  return { total, topReason, topReasonPct: Math.round((topCount / total) * 100), byReason };
}

export const operators: Operator[] = operatorSeed.map((o) => ({
  ...o,
  status: deriveHealthStatus(o.cancellationRate, o.declineRate, o.complaints),
  declines: buildDeclineBreakdown(o.id, o.declineRate),
}));

export const avgCancellationRate =
  Math.round(
    (operators.reduce((s, o) => s + o.cancellationRate, 0) / operators.length) * 10,
  ) / 10;

export type Severity = "critical" | "warning" | "info";
export type AlertType = "Sales Anomaly" | "Margin Deviation" | "Contract Alert";

export interface Alert {
  id: string;
  type: AlertType;
  operator: string;
  description: string;
  severity: Severity;
  date: string;
}

export const alerts: Alert[] = [
  { id: "a1", type: "Sales Anomaly", operator: "Bali Wave Adventures", description: "Bookings dropped 42% compared to last week's average.", severity: "critical", date: "2026-05-18 09:14" },
  { id: "a2", type: "Contract Alert", operator: "Sahara Desert Expeditions", description: "Supplier contract expires in 7 days. Renewal pending.", severity: "critical", date: "2026-05-18 08:02" },
  { id: "a3", type: "Margin Deviation", operator: "Patagonia Trails Co.", description: "Actual margin 11.2% vs expected 18%. Deviation 6.8pp.", severity: "warning", date: "2026-05-17 18:33" },
  { id: "a4", type: "Sales Anomaly", operator: "Cairo Pyramid Pass", description: "Refund rate climbed to 14% over the last 48 hours.", severity: "critical", date: "2026-05-17 16:21" },
  { id: "a5", type: "Margin Deviation", operator: "Marrakech Souks Guides", description: "Margin variance of 4.2pp detected on tier-2 tours.", severity: "warning", date: "2026-05-17 11:05" },
  { id: "a6", type: "Contract Alert", operator: "Hanoi Street Food Tours", description: "New addendum signed and synced to ops.", severity: "info", date: "2026-05-16 14:40" },
  { id: "a7", type: "Sales Anomaly", operator: "Costa Rica Jungle Tours", description: "Booking velocity 22% above forecast — check capacity.", severity: "info", date: "2026-05-16 10:11" },
];

export type DealStatus = "green" | "yellow" | "red" | "pending";

export interface DealMonth {
  month: string;
  tickets: number;
  revenue: number;
  margin: number;
}

export interface ScheduledPayment {
  date: string;
  amount: number;
}

export interface SpecialDeal {
  id: string;
  operator: string;
  country: string;
  status: DealStatus;
  target_margin: number;
  actual_margin_avg: number | null;
  monthly_performance: DealMonth[];
  deal_type: string;
  initial_deposit: number;
  scheduled_payments: ScheduledPayment[];
  total_deal_value: number;
  alert: string | null;
}

export const specialDeals: SpecialDeal[] = [
  { id: "sd_001", operator: "Transporzuma", country: "Mexico", status: "yellow", target_margin: 0.5, actual_margin_avg: 0.505, monthly_performance: [{ month: "2026-01", tickets: 1243, revenue: 18420, margin: 0.4465 }, { month: "2026-02", tickets: 1456, revenue: 22180, margin: 0.5012 }, { month: "2026-03", tickets: 1389, revenue: 21340, margin: 0.5134 }, { month: "2026-04", tickets: 1502, revenue: 23100, margin: 0.4987 }, { month: "2026-05", tickets: 1298, revenue: 19870, margin: 0.5021 }], deal_type: "General Deposits", initial_deposit: 80000, scheduled_payments: [{ date: "2026-06-01", amount: 40000 }, { date: "2026-10-01", amount: 50000 }, { date: "2026-12-01", amount: 40000 }], total_deal_value: 210000, alert: "Burn rate accelerated — risk of exhausting balance before June top-up" },
  { id: "sd_002", operator: "Marlin Espadas", country: "Mexico", status: "green", target_margin: 0.38, actual_margin_avg: 0.41, monthly_performance: [{ month: "2026-01", tickets: 820, revenue: 12300, margin: 0.39 }, { month: "2026-02", tickets: 910, revenue: 13700, margin: 0.41 }, { month: "2026-03", tickets: 875, revenue: 13100, margin: 0.42 }, { month: "2026-04", tickets: 930, revenue: 14200, margin: 0.41 }, { month: "2026-05", tickets: 890, revenue: 13500, margin: 0.40 }], deal_type: "General Deposits", initial_deposit: 50000, scheduled_payments: [], total_deal_value: 50000, alert: null },
  { id: "sd_003", operator: "Santa Teresa Adventure", country: "Costa Rica", status: "yellow", target_margin: 0.5, actual_margin_avg: 0.46, monthly_performance: [{ month: "2026-01", tickets: 312, revenue: 4850, margin: 0.38 }, { month: "2026-02", tickets: 389, revenue: 6020, margin: 0.41 }, { month: "2026-03", tickets: 445, revenue: 7100, margin: 0.47 }, { month: "2026-04", tickets: 502, revenue: 8300, margin: 0.50 }, { month: "2026-05", tickets: 478, revenue: 7900, margin: 0.51 }], deal_type: "General Deposits", initial_deposit: 30000, scheduled_payments: [{ date: "2026-07-01", amount: 20000 }], total_deal_value: 50000, alert: "Margin in Jan-Feb below target — improving since March" },
  { id: "sd_004", operator: "Pleasure Ride", country: "Mexico", status: "yellow", target_margin: 0.35, actual_margin_avg: 0.36, monthly_performance: [{ month: "2026-01", tickets: 180, revenue: 2700, margin: 0.35 }, { month: "2026-02", tickets: 210, revenue: 3150, margin: 0.36 }, { month: "2026-03", tickets: 195, revenue: 2950, margin: 0.37 }, { month: "2026-04", tickets: 220, revenue: 3300, margin: 0.36 }, { month: "2026-05", tickets: 190, revenue: 2850, margin: 0.35 }], deal_type: "General Deposits", initial_deposit: 20000, scheduled_payments: [], total_deal_value: 20000, alert: "Volume 60% below projected plan" },
  { id: "sd_005", operator: "The Panama Travel Tour", country: "Panama", status: "red", target_margin: 0.43, actual_margin_avg: 0.37, monthly_performance: [{ month: "2026-01", tickets: 560, revenue: 8400, margin: 0.33 }, { month: "2026-02", tickets: 620, revenue: 9300, margin: 0.35 }, { month: "2026-03", tickets: 590, revenue: 8900, margin: 0.38 }, { month: "2026-04", tickets: 640, revenue: 9800, margin: 0.41 }, { month: "2026-05", tickets: 610, revenue: 9200, margin: 0.39 }], deal_type: "General Deposits", initial_deposit: 40000, scheduled_payments: [{ date: "2026-08-01", amount: 30000 }], total_deal_value: 70000, alert: "Margin consistently below 43% target — action required" },
  { id: "sd_006", operator: "Aventuras el Lago", country: "Guatemala", status: "yellow", target_margin: 0.47, actual_margin_avg: 0.44, monthly_performance: [{ month: "2026-01", tickets: 290, revenue: 4350, margin: 0.40 }, { month: "2026-02", tickets: 340, revenue: 5100, margin: 0.43 }, { month: "2026-03", tickets: 380, revenue: 5700, margin: 0.45 }, { month: "2026-04", tickets: 420, revenue: 6300, margin: 0.46 }, { month: "2026-05", tickets: 450, revenue: 6750, margin: 0.47 }], deal_type: "General Deposits", initial_deposit: 25000, scheduled_payments: [{ date: "2026-09-01", amount: 20000 }], total_deal_value: 45000, alert: "Burn rate accelerated — balance may run out before September top-up" },
  { id: "sd_007", operator: "Islander Ferries", country: "Belize", status: "pending", target_margin: 0.3, actual_margin_avg: null, monthly_performance: [], deal_type: "General Deposits", initial_deposit: 15000, scheduled_payments: [], total_deal_value: 15000, alert: "No SD records in BQ — verify is_sd_booking tag" },
  { id: "sd_008", operator: "Kahk Bahlam", country: "Mexico", status: "red", target_margin: 0.25, actual_margin_avg: 0.30, monthly_performance: [{ month: "2026-01", tickets: 1850, revenue: 27750, margin: 0.29 }, { month: "2026-02", tickets: 2100, revenue: 31500, margin: 0.30 }, { month: "2026-03", tickets: 2300, revenue: 34500, margin: 0.31 }, { month: "2026-04", tickets: 2450, revenue: 36750, margin: 0.30 }, { month: "2026-05", tickets: 2200, revenue: 33000, margin: 0.30 }], deal_type: "General Deposits", initial_deposit: 30000, scheduled_payments: [], total_deal_value: 30000, alert: "Volume 4-5x plan — balance EXHAUSTED, urgent top-up required" },
  { id: "sd_009", operator: "My Pink Bus", country: "Mexico", status: "green", target_margin: 0.29, actual_margin_avg: 0.31, monthly_performance: [{ month: "2026-01", tickets: 95, revenue: 1425, margin: 0.30 }, { month: "2026-02", tickets: 110, revenue: 1650, margin: 0.31 }, { month: "2026-03", tickets: 105, revenue: 1575, margin: 0.32 }, { month: "2026-04", tickets: 120, revenue: 1800, margin: 0.31 }, { month: "2026-05", tickets: 100, revenue: 1500, margin: 0.30 }], deal_type: "General Deposits", initial_deposit: 10000, scheduled_payments: [], total_deal_value: 10000, alert: "Volume 22% of projected plan — low growth" },
  { id: "sd_010", operator: "Peninsula Travel", country: "Mexico", status: "green", target_margin: 0.35, actual_margin_avg: 0.37, monthly_performance: [{ month: "2026-01", tickets: 430, revenue: 6450, margin: 0.36 }, { month: "2026-02", tickets: 480, revenue: 7200, margin: 0.37 }, { month: "2026-03", tickets: 510, revenue: 7650, margin: 0.38 }, { month: "2026-04", tickets: 495, revenue: 7425, margin: 0.37 }, { month: "2026-05", tickets: 470, revenue: 7050, margin: 0.36 }], deal_type: "General Deposits", initial_deposit: 35000, scheduled_payments: [{ date: "2026-08-01", amount: 25000 }], total_deal_value: 60000, alert: null },
  { id: "sd_011", operator: "Chiquila Holbox Extreme", country: "Mexico", status: "red", target_margin: 0.5, actual_margin_avg: 0.48, monthly_performance: [{ month: "2026-01", tickets: 45, revenue: 675, margin: 0.47 }, { month: "2026-02", tickets: 52, revenue: 780, margin: 0.48 }, { month: "2026-03", tickets: 38, revenue: 570, margin: 0.49 }, { month: "2026-04", tickets: 41, revenue: 615, margin: 0.48 }, { month: "2026-05", tickets: 35, revenue: 525, margin: 0.47 }], deal_type: "General Deposits", initial_deposit: 20000, scheduled_payments: [], total_deal_value: 20000, alert: "Critical volume — 3-5% of monthly plan of 1000+ tickets" },
  { id: "sd_012", operator: "Ride CR", country: "Costa Rica", status: "pending", target_margin: 0.32, actual_margin_avg: null, monthly_performance: [], deal_type: "General Deposits", initial_deposit: 18000, scheduled_payments: [], total_deal_value: 18000, alert: "No SD records in BQ — verify is_sd_booking tag" },
  { id: "sd_013", operator: "Central Line", country: "Guatemala", status: "red", target_margin: 0.30, actual_margin_avg: 0.41, monthly_performance: [{ month: "2026-01", tickets: 780, revenue: 11700, margin: 0.39 }, { month: "2026-02", tickets: 890, revenue: 13350, margin: 0.41 }, { month: "2026-03", tickets: 950, revenue: 14250, margin: 0.42 }, { month: "2026-04", tickets: 1020, revenue: 15300, margin: 0.41 }, { month: "2026-05", tickets: 980, revenue: 14700, margin: 0.40 }], deal_type: "General Deposits", initial_deposit: 25000, scheduled_payments: [], total_deal_value: 25000, alert: "Volume 2-3x plan — balance EXHAUSTED, urgent top-up required" },
  { id: "sd_014", operator: "Belize Go", country: "Belize", status: "green", target_margin: 0.35, actual_margin_avg: 0.37, monthly_performance: [{ month: "2026-01", tickets: 320, revenue: 4800, margin: 0.35 }, { month: "2026-02", tickets: 365, revenue: 5475, margin: 0.37 }, { month: "2026-03", tickets: 390, revenue: 5850, margin: 0.38 }, { month: "2026-04", tickets: 410, revenue: 6150, margin: 0.37 }, { month: "2026-05", tickets: 380, revenue: 5700, margin: 0.36 }], deal_type: "General Deposits", initial_deposit: 22000, scheduled_payments: [{ date: "2026-09-01", amount: 18000 }], total_deal_value: 40000, alert: null },
  { id: "sd_015", operator: "Opitours", country: "Guatemala", status: "yellow", target_margin: 0.33, actual_margin_avg: 0.34, monthly_performance: [{ month: "2026-01", tickets: 510, revenue: 7650, margin: 0.35 }, { month: "2026-02", tickets: 540, revenue: 8100, margin: 0.35 }, { month: "2026-03", tickets: 520, revenue: 7800, margin: 0.34 }, { month: "2026-04", tickets: 490, revenue: 7350, margin: 0.33 }, { month: "2026-05", tickets: 450, revenue: 6750, margin: 0.32 }], deal_type: "General Deposits", initial_deposit: 28000, scheduled_payments: [], total_deal_value: 28000, alert: "Volume declining in May — trend to monitor" },
  { id: "sd_016", operator: "Jorge's Taxis & Shuttles", country: "Belize", status: "green", target_margin: 0.35, actual_margin_avg: 0.37, monthly_performance: [{ month: "2026-01", tickets: 260, revenue: 3900, margin: 0.36 }, { month: "2026-02", tickets: 290, revenue: 4350, margin: 0.37 }, { month: "2026-03", tickets: 310, revenue: 4650, margin: 0.38 }, { month: "2026-04", tickets: 300, revenue: 4500, margin: 0.37 }, { month: "2026-05", tickets: 280, revenue: 4200, margin: 0.36 }], deal_type: "General Deposits", initial_deposit: 15000, scheduled_payments: [], total_deal_value: 15000, alert: null },
  { id: "sd_017", operator: "Galaxy Wave", country: "Honduras", status: "green", target_margin: 0.40, actual_margin_avg: 0.46, monthly_performance: [{ month: "2026-01", tickets: 190, revenue: 2850, margin: 0.45 }, { month: "2026-02", tickets: 220, revenue: 3300, margin: 0.46 }, { month: "2026-03", tickets: 210, revenue: 3150, margin: 0.47 }, { month: "2026-04", tickets: 230, revenue: 3450, margin: 0.46 }, { month: "2026-05", tickets: 215, revenue: 3225, margin: 0.45 }], deal_type: "General Deposits", initial_deposit: 12000, scheduled_payments: [], total_deal_value: 12000, alert: "Small balance — consider preventive top-up" },
  { id: "sd_018", operator: "Travel Site", country: "Colombia", status: "red", target_margin: 0.35, actual_margin_avg: 0.36, monthly_performance: [{ month: "2026-01", tickets: 380, revenue: 5700, margin: 0.35 }, { month: "2026-02", tickets: 420, revenue: 6300, margin: 0.36 }, { month: "2026-03", tickets: 410, revenue: 6150, margin: 0.37 }, { month: "2026-04", tickets: 390, revenue: 5850, margin: 0.36 }, { month: "2026-05", tickets: 400, revenue: 6000, margin: 0.35 }], deal_type: "General Deposits", initial_deposit: 30000, scheduled_payments: [], total_deal_value: 30000, alert: "⚠️ DEAL EXPIRED in May — active sales with no valid contract, URGENT renewal" },
  { id: "sd_019", operator: "Mary Cartagena", country: "Colombia", status: "green", target_margin: 0.38, actual_margin_avg: 0.40, monthly_performance: [{ month: "2026-01", tickets: 290, revenue: 4350, margin: 0.39 }, { month: "2026-02", tickets: 320, revenue: 4800, margin: 0.40 }, { month: "2026-03", tickets: 335, revenue: 5025, margin: 0.41 }, { month: "2026-04", tickets: 310, revenue: 4650, margin: 0.40 }, { month: "2026-05", tickets: 300, revenue: 4500, margin: 0.39 }], deal_type: "General Deposits", initial_deposit: 20000, scheduled_payments: [{ date: "2026-08-01", amount: 15000 }], total_deal_value: 35000, alert: null },
  { id: "sd_020", operator: "Marsol Transportes", country: "Colombia", status: "green", target_margin: 0.27, actual_margin_avg: 0.32, monthly_performance: [{ month: "2026-01", tickets: 520, revenue: 7800, margin: 0.30 }, { month: "2026-02", tickets: 580, revenue: 8700, margin: 0.32 }, { month: "2026-03", tickets: 610, revenue: 9150, margin: 0.33 }, { month: "2026-04", tickets: 595, revenue: 8925, margin: 0.32 }, { month: "2026-05", tickets: 560, revenue: 8400, margin: 0.31 }], deal_type: "General Deposits", initial_deposit: 25000, scheduled_payments: [{ date: "2026-09-01", amount: 20000 }], total_deal_value: 45000, alert: null },
  { id: "sd_021", operator: "Volcano Travel", country: "Nicaragua", status: "green", target_margin: 0.30, actual_margin_avg: 0.34, monthly_performance: [{ month: "2026-01", tickets: 310, revenue: 4650, margin: 0.33 }, { month: "2026-02", tickets: 340, revenue: 5100, margin: 0.34 }, { month: "2026-03", tickets: 360, revenue: 5400, margin: 0.35 }, { month: "2026-04", tickets: 375, revenue: 5625, margin: 0.34 }, { month: "2026-05", tickets: 355, revenue: 5325, margin: 0.33 }], deal_type: "General Deposits", initial_deposit: 20000, scheduled_payments: [{ date: "2026-10-01", amount: 15000 }], total_deal_value: 35000, alert: null },
  { id: "sd_022", operator: "Nica Expreso", country: "Nicaragua", status: "yellow", target_margin: 0.38, actual_margin_avg: 0.41, monthly_performance: [{ month: "2026-01", tickets: 420, revenue: 6300, margin: 0.38 }, { month: "2026-02", tickets: 460, revenue: 6900, margin: 0.41 }, { month: "2026-03", tickets: 445, revenue: 6675, margin: 0.42 }, { month: "2026-04", tickets: 470, revenue: 7050, margin: 0.44 }, { month: "2026-05", tickets: 430, revenue: 6450, margin: 0.41 }], deal_type: "General Deposits", initial_deposit: 22000, scheduled_payments: [{ date: "2026-11-01", amount: 18000 }], total_deal_value: 40000, alert: "Volume 70% of plan — excellent margin but slow growth" },
  { id: "sd_023", operator: "Tripnic Tours", country: "Nicaragua", status: "green", target_margin: 0.33, actual_margin_avg: 0.35, monthly_performance: [{ month: "2026-01", tickets: 180, revenue: 2700, margin: 0.32 }, { month: "2026-02", tickets: 210, revenue: 3150, margin: 0.33 }, { month: "2026-03", tickets: 250, revenue: 3750, margin: 0.35 }, { month: "2026-04", tickets: 290, revenue: 4350, margin: 0.36 }, { month: "2026-05", tickets: 310, revenue: 4650, margin: 0.36 }], deal_type: "General Deposits", initial_deposit: 15000, scheduled_payments: [{ date: "2026-10-01", amount: 12000 }], total_deal_value: 27000, alert: "Clear positive trend since March — on track to exceed plan" },
  { id: "sd_024", operator: "Transfer Holbox", country: "Mexico", status: "pending", target_margin: 0.35, actual_margin_avg: null, monthly_performance: [], deal_type: "General Deposits", initial_deposit: 12000, scheduled_payments: [], total_deal_value: 12000, alert: "No SD records in BQ — verify is_sd_booking tag" },
];

export const countries = Array.from(new Set(operators.map((o) => o.country))).sort();

export interface WowAnomaly {
  id: string;
  operator: string;
  route: string;
  country: string;
  brand: string;
  bookingsThisWeek: number;
  bookingsLastWeek: number;
  dropPct: number; // WoW % change (negative = drop)
  yoyPct: number; // YoY % change (same calendar week vs last year)
  searchesThisWeek: number;
  searchesLastWeek: number;
  l2bThisWeek: number; // Look-to-Book % this week (bookings / searches × 100)
  l2bLastWeek: number; // Look-to-Book % last week
  l2bDeltaPp: number;  // Δ in percentage points (this − last)
  severity: Severity;
}

const wowRaw = [
  {"operator":"flixbus","route":"sibenik to zagreb","country":"Croatia","brand":"traveling.com","last_week":22,"this_week":0,"change":-100,"yoy":-58,"s_last":520,"s_this":480},
  {"operator":"ao nang travel and tour","route":"koh lanta to ao nang","country":"Thailand","brand":"12go","last_week":34,"this_week":0,"change":-100,"yoy":-22,"s_last":610,"s_this":580},
  {"operator":"lalatović","route":"mostar (east) to kotor","country":"Bosnia and Herzegovina","brand":"traveling.com","last_week":29,"this_week":0,"change":-100,"yoy":-71,"s_last":410,"s_this":390},
  {"operator":"sons","route":"sarajevo (east) to podgorica","country":"Bosnia and Herzegovina","brand":"traveling.com","last_week":20,"this_week":0,"change":-100,"yoy":-64,"s_last":380,"s_this":355},
  {"operator":"torch","route":"donsak to phuket","country":"Thailand","brand":"12go","last_week":20,"this_week":0,"change":-100,"yoy":-18,"s_last":340,"s_this":325},
  {"operator":"sagales","route":"barcelona to girona airport","country":"Spain","brand":"traveling.com","last_week":113,"this_week":3,"change":-97.3,"yoy":-83,"s_last":1880,"s_this":1810},
  {"operator":"ao nang travel and tour","route":"ao nang to koh lanta","country":"Thailand","brand":"12go","last_week":60,"this_week":2,"change":-96.7,"yoy":-25,"s_last":980,"s_this":940},
  {"operator":"tp line","route":"split to hvar","country":"Croatia","brand":"traveling.com","last_week":28,"this_week":1,"change":-96.4,"yoy":-52,"s_last":520,"s_this":495},
  {"operator":"ra express vip","route":"siem reap to phnom penh","country":"Cambodia","brand":"12go","last_week":20,"this_week":1,"change":-95,"yoy":-12,"s_last":340,"s_this":330},
  {"operator":"arriva - autotrans","route":"pula to zagreb","country":"Croatia","brand":"traveling.com","last_week":27,"this_week":1,"change":-96.3,"yoy":-49,"s_last":500,"s_this":475},
  {"operator":"kondor bus","route":"belgrade to sarajevo","country":"Serbia","brand":"traveling.com","last_week":43,"this_week":3,"change":-93,"yoy":-67,"s_last":770,"s_this":730},
  {"operator":"indian railways","route":"bangalore to mysore","country":"India","brand":"12go","last_week":25,"this_week":2,"change":-92,"yoy":-44,"s_last":460,"s_this":440},
  {"operator":"suwimol speedboat","route":"phuket to koh yao yai","country":"Thailand","brand":"12go","last_week":28,"this_week":0,"change":-100,"yoy":-20,"s_last":490,"s_this":470},
  {"operator":"blablacar bus","route":"london to paris","country":"United Kingdom","brand":"traveling.com","last_week":20,"this_week":0,"change":-100,"yoy":-55,"s_last":410,"s_this":390},
  {"operator":"call me taxi","route":"koh tao to khao sok","country":"Thailand","brand":"12go","last_week":27,"this_week":0,"change":-100,"yoy":-15,"s_last":470,"s_this":455},
  // ── LatAm ──
  {"operator":"andesmar","route":"buenos aires to mendoza","country":"Argentina","brand":"12go","last_week":86,"this_week":12,"change":-86,"yoy":-31,"s_last":1420,"s_this":1380},
  {"operator":"chevallier","route":"buenos aires to bariloche","country":"Argentina","brand":"12go","last_week":54,"this_week":18,"change":-66.7,"yoy":-24,"s_last":980,"s_this":960},
  {"operator":"viação cometa","route":"são paulo to rio de janeiro","country":"Brazil","brand":"12go","last_week":142,"this_week":48,"change":-66.2,"yoy":-19,"s_last":2310,"s_this":2280},
  {"operator":"itapemirim","route":"rio de janeiro to belo horizonte","country":"Brazil","brand":"12go","last_week":71,"this_week":9,"change":-87.3,"yoy":-38,"s_last":1150,"s_this":1110},
  {"operator":"costa verde","route":"florianópolis to porto alegre","country":"Brazil","brand":"12go","last_week":48,"this_week":14,"change":-70.8,"yoy":-26,"s_last":880,"s_this":850},
  {"operator":"ado","route":"mexico city to puebla","country":"Mexico","brand":"12go","last_week":118,"this_week":34,"change":-71.2,"yoy":-22,"s_last":1980,"s_this":1940},
  {"operator":"primera plus","route":"guadalajara to puerto vallarta","country":"Mexico","brand":"12go","last_week":62,"this_week":8,"change":-87.1,"yoy":-41,"s_last":1080,"s_this":1050},
  {"operator":"ado","route":"cancún to playa del carmen","country":"Mexico","brand":"12go","last_week":205,"this_week":92,"change":-55.1,"yoy":-14,"s_last":3120,"s_this":3080},
  {"operator":"berlinas del fonce","route":"bogotá to medellín","country":"Colombia","brand":"12go","last_week":74,"this_week":11,"change":-85.1,"yoy":-29,"s_last":1240,"s_this":1200},
  {"operator":"expreso bolivariano","route":"bogotá to cartagena","country":"Colombia","brand":"12go","last_week":52,"this_week":17,"change":-67.3,"yoy":-21,"s_last":940,"s_this":910},
  {"operator":"cruz del sur","route":"lima to cusco","country":"Peru","brand":"12go","last_week":96,"this_week":21,"change":-78.1,"yoy":-33,"s_last":1610,"s_this":1570},
  {"operator":"peru hop","route":"lima to ica","country":"Peru","brand":"12go","last_week":58,"this_week":14,"change":-75.9,"yoy":-28,"s_last":1020,"s_this":990},
  {"operator":"turbus","route":"santiago to valparaíso","country":"Chile","brand":"12go","last_week":134,"this_week":42,"change":-68.7,"yoy":-18,"s_last":2240,"s_this":2200},
  {"operator":"pullman bus","route":"santiago to la serena","country":"Chile","brand":"12go","last_week":47,"this_week":7,"change":-85.1,"yoy":-36,"s_last":860,"s_this":830},
  {"operator":"trans copacabana","route":"la paz to copacabana","country":"Bolivia","brand":"12go","last_week":38,"this_week":12,"change":-68.4,"yoy":-23,"s_last":620,"s_this":600},
  {"operator":"copa transportes","route":"asunción to ciudad del este","country":"Paraguay","brand":"12go","last_week":24,"this_week":6,"change":-75,"yoy":-30,"s_last":410,"s_this":395},
  {"operator":"cot","route":"montevideo to punta del este","country":"Uruguay","brand":"12go","last_week":62,"this_week":22,"change":-64.5,"yoy":-16,"s_last":1080,"s_this":1050},
  {"operator":"transportes ecuador","route":"quito to guayaquil","country":"Ecuador","brand":"12go","last_week":51,"this_week":15,"change":-70.6,"yoy":-25,"s_last":920,"s_this":890},
  {"operator":"caribe shuttle","route":"san josé to la fortuna","country":"Costa Rica","brand":"12go","last_week":68,"this_week":19,"change":-72.1,"yoy":-27,"s_last":1180,"s_this":1150},
  {"operator":"interbus","route":"san josé to monteverde","country":"Costa Rica","brand":"12go","last_week":42,"this_week":8,"change":-81,"yoy":-34,"s_last":760,"s_this":730},
  {"operator":"panaline","route":"panama city to bocas del toro","country":"Panama","brand":"12go","last_week":36,"this_week":10,"change":-72.2,"yoy":-22,"s_last":640,"s_this":620},
  {"operator":"transportes turisticos atitrans","route":"antigua to lake atitlán","country":"Guatemala","brand":"12go","last_week":54,"this_week":13,"change":-75.9,"yoy":-31,"s_last":960,"s_this":930},
  {"operator":"hedman alas","route":"san pedro sula to copán","country":"Honduras","brand":"12go","last_week":29,"this_week":8,"change":-72.4,"yoy":-26,"s_last":520,"s_this":500},
  {"operator":"transnica","route":"managua to granada","country":"Nicaragua","brand":"12go","last_week":33,"this_week":11,"change":-66.7,"yoy":-19,"s_last":580,"s_this":560},
  {"operator":"caribbean shuttle","route":"belize city to san ignacio","country":"Belize","brand":"12go","last_week":21,"this_week":5,"change":-76.2,"yoy":-29,"s_last":380,"s_this":365},
  {"operator":"tica bus","route":"san salvador to guatemala city","country":"El Salvador","brand":"12go","last_week":27,"this_week":9,"change":-66.7,"yoy":-23,"s_last":470,"s_this":455},
  {"operator":"viazul","route":"havana to varadero","country":"Cuba","brand":"12go","last_week":45,"this_week":12,"change":-73.3,"yoy":-28,"s_last":790,"s_this":760},
  {"operator":"caribe tours","route":"santo domingo to punta cana","country":"Dominican Republic","brand":"12go","last_week":78,"this_week":26,"change":-66.7,"yoy":-20,"s_last":1310,"s_this":1280},
  {"operator":"capital coach line","route":"port-au-prince to cap-haïtien","country":"Haiti","brand":"12go","last_week":18,"this_week":4,"change":-77.8,"yoy":-32,"s_last":340,"s_this":325},
  {"operator":"knutsford express","route":"kingston to montego bay","country":"Jamaica","brand":"12go","last_week":56,"this_week":17,"change":-69.6,"yoy":-21,"s_last":980,"s_this":950},
];

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

const round1 = (n: number) => Math.round(n * 10) / 10;

export const wowAnomalies: WowAnomaly[] = wowRaw.map((r, i) => {
  const l2bLast = round1((r.last_week / r.s_last) * 100);
  const l2bThis = round1((r.this_week / r.s_this) * 100);
  return {
    id: `w${i + 1}`,
    operator: titleCase(r.operator),
    route: titleCase(r.route),
    country: r.country,
    brand: r.brand,
    bookingsThisWeek: r.this_week,
    bookingsLastWeek: r.last_week,
    dropPct: r.change,
    yoyPct: r.yoy,
    searchesThisWeek: r.s_this,
    searchesLastWeek: r.s_last,
    l2bThisWeek: l2bThis,
    l2bLastWeek: l2bLast,
    l2bDeltaPp: round1(l2bThis - l2bLast),
    severity: r.change <= -50 ? "critical" : r.change <= -30 ? "warning" : "info",
  };
});

const _avgL2bLast = round1(
  wowAnomalies.reduce((s, w) => s + w.l2bLastWeek, 0) / wowAnomalies.length,
);
const _avgL2bThis = round1(
  wowAnomalies.reduce((s, w) => s + w.l2bThisWeek, 0) / wowAnomalies.length,
);

export const wowKpis = {
  anomalies: 30,
  criticalDrops: 22,
  bookingsLost: 847,
  l2bThisWeek: _avgL2bThis,
  l2bLastWeek: _avgL2bLast,
  l2bDeltaPp: round1(_avgL2bThis - _avgL2bLast),
};

export const wowCountries = Array.from(new Set(wowAnomalies.map((w) => w.country))).sort();


export interface Contract {
  id: string;
  operator: string;
  country: string;
  totalValue: number;
  consumedValue: number;
  remainingValue: number;
  remainingPct: number;
  expiresOn: string;
  status: "healthy" | "low" | "expiring";
}

const contractSeed: { opId: string; total: number; consumed: number; expiresOn: string }[] = [
  { opId: "1", total: 240000, consumed: 96000, expiresOn: "2027-02-14" },
  { opId: "2", total: 180000, consumed: 162000, expiresOn: "2026-08-30" },
  { opId: "3", total: 150000, consumed: 88000, expiresOn: "2026-11-10" },
  { opId: "4", total: 220000, consumed: 70000, expiresOn: "2027-04-01" },
  { opId: "5", total: 200000, consumed: 188000, expiresOn: "2026-05-25" },
  { opId: "6", total: 175000, consumed: 52000, expiresOn: "2027-01-20" },
  { opId: "8", total: 130000, consumed: 64000, expiresOn: "2026-12-05" },
  { opId: "9", total: 95000, consumed: 81000, expiresOn: "2026-09-15" },
  { opId: "10", total: 140000, consumed: 42000, expiresOn: "2027-03-08" },
  { opId: "11", total: 165000, consumed: 152000, expiresOn: "2026-07-22" },
  { opId: "12", total: 190000, consumed: 78000, expiresOn: "2027-02-28" },
];

export const contracts: Contract[] = contractSeed.map((c, i) => {
  const op = operators.find((o) => o.id === c.opId)!;
  const remaining = c.total - c.consumed;
  const remainingPct = (remaining / c.total) * 100;
  const daysUntilExpiry =
    (new Date(c.expiresOn).getTime() - new Date("2026-05-18").getTime()) /
    (1000 * 60 * 60 * 24);
  const status: Contract["status"] =
    daysUntilExpiry < 30 ? "expiring" : remainingPct < 15 ? "low" : "healthy";
  return {
    id: `c${i + 1}`,
    operator: op.name,
    country: op.country,
    totalValue: c.total,
    consumedValue: c.consumed,
    remainingValue: remaining,
    remainingPct: Math.round(remainingPct * 10) / 10,
    expiresOn: c.expiresOn,
    status,
  };
});

export interface DailyBooking {
  date: string;
  bookings: number;
  avg7: number;
  anomaly: boolean;
}

function generateDailyBookings(): DailyBooking[] {
  // Deterministic pseudo-random series for last 30 days
  const days = 30;
  const today = new Date("2026-05-18T00:00:00Z");
  const raw: { date: string; bookings: number }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const base = 480 + Math.sin(i / 3) * 60 + (rand() - 0.5) * 120;
    let bookings = Math.round(base);
    // Inject a couple anomalies
    if (i === 4) bookings = Math.round(bookings * 0.65);
    if (i === 17) bookings = Math.round(bookings * 0.7);
    raw.push({ date: d.toISOString().slice(0, 10), bookings });
  }
  return raw.map((r, idx) => {
    const start = Math.max(0, idx - 7);
    const window = raw.slice(start, idx);
    const avg7 = window.length
      ? window.reduce((s, x) => s + x.bookings, 0) / window.length
      : r.bookings;
    const anomaly = window.length >= 3 && r.bookings < avg7 * 0.8;
    return { date: r.date, bookings: r.bookings, avg7: Math.round(avg7), anomaly };
  });
}

export const dailyBookings: DailyBooking[] = generateDailyBookings();

export interface OperatorDetail {
  route: string;
  bookingsLast7: number[];
  marginPct: number;
  recentAlerts: { date: string; description: string; severity: Severity }[];
}

const routesByOperator: Record<string, string> = {
  "1": "Athens → Santorini → Mykonos",
  "2": "Denpasar → Ubud → Uluwatu",
  "3": "El Calafate → Torres del Paine",
  "4": "Kyoto → Arashiyama → Fushimi",
  "5": "Marrakech → Merzouga → Fes",
  "6": "Reykjavik → Golden Circle → Vik",
  "7": "San José → Arenal → Monteverde",
  "8": "Lisbon → Sintra → Cascais",
  "9": "Marrakech Medina Loop",
  "10": "Hanoi Old Quarter Food Crawl",
  "11": "Cairo → Giza → Saqqara",
  "12": "Bolzano → Cortina → Alpe di Siusi",
};

export function getOperatorDetail(op: Operator): OperatorDetail {
  let seed = parseInt(op.id, 10) * 137;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const base = op.status === "critical" ? 40 : op.status === "warning" ? 90 : 150;
  const bookingsLast7 = Array.from({ length: 7 }, () =>
    Math.max(0, Math.round(base + (rand() - 0.5) * base * 0.6)),
  );
  const marginPct =
    op.status === "critical"
      ? Math.round((8 + rand() * 5) * 10) / 10
      : op.status === "warning"
        ? Math.round((12 + rand() * 4) * 10) / 10
        : Math.round((17 + rand() * 5) * 10) / 10;
  const recentAlerts = alerts
    .filter((a) => a.operator === op.name)
    .map((a) => ({ date: a.date, description: a.description, severity: a.severity }));
  return {
    route: routesByOperator[op.id] ?? "—",
    bookingsLast7,
    marginPct,
    recentAlerts,
  };
}
