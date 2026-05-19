import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Search, TrendingDown, TrendingUp, Sparkles, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { operators } from "@/lib/mock-data";
import { useRegion } from "@/lib/region-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rate-shop")({
  head: () => ({ meta: [{ title: "Rate Shop — Supply Copilot" }] }),
  component: RateShop,
});

const COMPETITORS = ["GetYourGuide", "Viator", "Civitatis", "Klook", "Direct site"] as const;

type RouteShop = {
  id: string;
  country: string;
  flag: string;
  route: string;
  product: string;
  source: string;
  sourceUrl: string;
  scrapedChars: number;
  scrapedAt: string;
  ourPrice: number;
  competitorName: string;
  competitorPrices: { label: string; price: number }[];
  includes: string;
  recommendation: string;
  notes: string;
  confidence: "low" | "medium" | "high";
  position: "cheapest" | "competitive" | "expensive";
};

// Top LatAm routes — sourced from our supply dashboards (one per major country).
const LATAM_ROUTES: RouteShop[] = [
  { id: "cr-fortuna-monteverde", country: "Costa Rica", flag: "🇨🇷", route: "La Fortuna → Monteverde", product: "Jeep Boat Jeep",
    source: "aventurasellago.com", sourceUrl: "https://aventurasellago.com/jeep-boat-jeep/", scrapedChars: 12422, scrapedAt: "2026-05-18 20:30",
    ourPrice: 35, competitorName: "Aventuras El Lago",
    competitorPrices: [{ label: "morning", price: 33 }, { label: "afternoon", price: 40 }],
    includes: "Round-trip transfer La Fortuna ↔ Monteverde — jeep, boat and luggage. Departures 8:00 AM / 2:00 PM.",
    recommendation: "Emphasize comfort and scenic stops. Add a mid-morning departure to match the $33 morning slot.",
    notes: "Competitor lists two prices ($33 / $40). Our $35 sits between — competitive AM, cheaper PM.",
    confidence: "medium", position: "competitive" },
  { id: "mx-cancun-tulum", country: "Mexico", flag: "🇲🇽", route: "Cancún → Tulum", product: "Day Tour + Cenote",
    source: "viator.com", sourceUrl: "https://www.viator.com/", scrapedChars: 18540, scrapedAt: "2026-05-18 19:10",
    ourPrice: 89, competitorName: "Cancún Adventures",
    competitorPrices: [{ label: "small group", price: 95 }, { label: "private", price: 140 }],
    includes: "Round-trip transport, guided cenote swim, Tulum ruins ticket, light lunch.",
    recommendation: "We are 6% under the small-group baseline — push as 'best price' in paid placements.",
    notes: "Three competitors with overlapping itineraries; we are the cheapest of the small-group cluster.",
    confidence: "high", position: "cheapest" },
  { id: "br-rio-paraty", country: "Brazil", flag: "🇧🇷", route: "Rio → Paraty", product: "Schooner + Beach Hop",
    source: "civitatis.com", sourceUrl: "https://www.civitatis.com/", scrapedChars: 9870, scrapedAt: "2026-05-18 18:45",
    ourPrice: 62, competitorName: "Paraty Tours",
    competitorPrices: [{ label: "shared", price: 58 }, { label: "premium", price: 78 }],
    includes: "Schooner cruise across the Paraty bay, 4 swim stops, snorkel gear, fresh fruit.",
    recommendation: "Re-price to $58 to match the shared baseline OR add 1 stop and hold the $62 premium.",
    notes: "We are 7% above the cheapest shared option; risk of losing budget travelers.",
    confidence: "high", position: "expensive" },
  { id: "ar-bariloche-circuito", country: "Argentina", flag: "🇦🇷", route: "Bariloche · Circuito Chico", product: "Half-day Bus Tour",
    source: "getyourguide.com", sourceUrl: "https://www.getyourguide.com/", scrapedChars: 7120, scrapedAt: "2026-05-18 17:25",
    ourPrice: 28, competitorName: "Patagonia Trails",
    competitorPrices: [{ label: "standard", price: 30 }, { label: "with chairlift", price: 42 }],
    includes: "Half-day guided drive, photo stops, Cerro Campanario base (chairlift extra).",
    recommendation: "We're cheapest on the base tour — bundle the chairlift add-on for an extra $10 margin.",
    notes: "Position holds 6/7 days; weekends competitor drops to $27 briefly.",
    confidence: "medium", position: "cheapest" },
  { id: "co-cartagena-rosario", country: "Colombia", flag: "🇨🇴", route: "Cartagena → Islas del Rosario", product: "Catamaran Day Trip",
    source: "klook.com", sourceUrl: "https://www.klook.com/", scrapedChars: 11230, scrapedAt: "2026-05-18 16:50",
    ourPrice: 75, competitorName: "Rosario Catamarans",
    competitorPrices: [{ label: "shared", price: 70 }, { label: "all-inclusive", price: 110 }],
    includes: "Catamaran round-trip, island access, lunch, snorkel stop.",
    recommendation: "Match $70 for shared OR reposition as 'all-inclusive lite' to defend the $75 price.",
    notes: "Our offer falls between the two competitor tiers — unclear value perception.",
    confidence: "medium", position: "competitive" },
  { id: "pe-cusco-machupicchu", country: "Peru", flag: "🇵🇪", route: "Cusco → Machu Picchu", product: "Full-day Train + Guide",
    source: "viator.com", sourceUrl: "https://www.viator.com/", scrapedChars: 21340, scrapedAt: "2026-05-18 15:30",
    ourPrice: 245, competitorName: "Inca Rail Express",
    competitorPrices: [{ label: "expedition", price: 230 }, { label: "vistadome", price: 295 }],
    includes: "Round-trip train, Machu Picchu entry, bilingual guide, bus to citadel.",
    recommendation: "We are 6% above expedition baseline — highlight included guide (competitor charges extra).",
    notes: "Guide inclusion is the differentiator; surface it in product copy.",
    confidence: "high", position: "competitive" },
  { id: "cl-atacama-tatio", country: "Chile", flag: "🇨🇱", route: "San Pedro de Atacama · Géiseres del Tatio", product: "Sunrise Tour",
    source: "civitatis.com", sourceUrl: "https://www.civitatis.com/", scrapedChars: 8430, scrapedAt: "2026-05-18 14:10",
    ourPrice: 55, competitorName: "Atacama Stargazing",
    competitorPrices: [{ label: "standard", price: 60 }, { label: "small group", price: 75 }],
    includes: "Pre-dawn pickup, geyser field entry, breakfast at altitude, return by noon.",
    recommendation: "We're 8% cheaper than standard — push in last-minute search ads.",
    notes: "Cheapest in market 5/7 days; defend by keeping breakfast included.",
    confidence: "high", position: "cheapest" },
  { id: "bo-uyuni-3dias", country: "Bolivia", flag: "🇧🇴", route: "Uyuni · Salar 3 días", product: "3-day Salt Flats Tour",
    source: "getyourguide.com", sourceUrl: "https://www.getyourguide.com/", scrapedChars: 9920, scrapedAt: "2026-05-18 13:15",
    ourPrice: 195, competitorName: "Salar Expeditions",
    competitorPrices: [{ label: "shared 4x4", price: 180 }, { label: "private", price: 320 }],
    includes: "3 days / 2 nights, 4x4 transport, basic lodging, meals, English guide.",
    recommendation: "Drop to $185 to defend shared segment OR upsell English guide as premium.",
    notes: "Budget travelers price-sensitive; risk of churn at current $195.",
    confidence: "medium", position: "expensive" },
  { id: "pa-bocas-island-hop", country: "Panama", flag: "🇵🇦", route: "Bocas del Toro · Island Hop", product: "Boat Day Trip",
    source: "viator.com", sourceUrl: "https://www.viator.com/", scrapedChars: 6890, scrapedAt: "2026-05-18 12:00",
    ourPrice: 48, competitorName: "Bocas Boat Tours",
    competitorPrices: [{ label: "shared", price: 45 }, { label: "private", price: 95 }],
    includes: "Boat tour to 3 islands, snorkel gear, lunch stop at Red Frog Beach.",
    recommendation: "Match $45 for shared, or add 4th island stop to justify $48.",
    notes: "Marginally above baseline — easy lever to defend with one extra stop.",
    confidence: "medium", position: "competitive" },
  { id: "ec-galapagos-bartolome", country: "Ecuador", flag: "🇪🇨", route: "Galápagos · Isla Bartolomé", product: "Day Excursion",
    source: "civitatis.com", sourceUrl: "https://www.civitatis.com/", scrapedChars: 10120, scrapedAt: "2026-05-18 11:20",
    ourPrice: 180, competitorName: "Galápagos Wildlife",
    competitorPrices: [{ label: "shared", price: 195 }, { label: "private yacht", price: 380 }],
    includes: "Round-trip boat, naturalist guide, lunch, snorkel at Pinnacle Rock.",
    recommendation: "We're 8% under shared baseline — feature in 'best value Galápagos' campaigns.",
    notes: "Cheapest shared option in market; defend by keeping naturalist guide included.",
    confidence: "high", position: "cheapest" },
];

type RateRow = {
  operatorId: string;
  operator: string;
  country: string;
  product: string;
  date: string; // checkin/tour date
  ourPrice: number; // USD
  competitors: Record<(typeof COMPETITORS)[number], number | null>;
  currency: string;
};

// Deterministic mock generator — stable across renders
function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const PRODUCT_TEMPLATES: Record<string, string[]> = {
  default: ["Half-day City Tour", "Full-day Adventure", "Sunset Cruise", "Wine Tasting Experience", "Hiking Excursion"],
};

const rateRows: RateRow[] = operators.flatMap((op, i) => {
  const rng = seedRandom(parseInt(op.id, 10) * 17 + 3);
  const products = PRODUCT_TEMPLATES.default;
  return products.slice(0, 2 + Math.floor(rng() * 2)).map((product, j) => {
    const base = 40 + Math.floor(rng() * 220);
    const competitors = COMPETITORS.reduce((acc, c) => {
      const present = rng() > 0.15;
      if (!present) { acc[c] = null; return acc; }
      const drift = (rng() - 0.45) * 0.35; // -16% .. +20%
      acc[c] = Math.round(base * (1 + drift));
      return acc;
    }, {} as RateRow["competitors"]);
    const day = 10 + ((i + j) % 18);
    return {
      operatorId: op.id,
      operator: op.name,
      country: op.country,
      product,
      date: `2026-06-${String(day).padStart(2, "0")}`,
      ourPrice: base,
      competitors,
      currency: "USD",
    };
  });
});

function minCompetitor(row: RateRow) {
  const vals = Object.values(row.competitors).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return Math.min(...vals);
}

function position(row: RateRow): "cheapest" | "competitive" | "expensive" {
  const min = minCompetitor(row);
  if (min == null) return "competitive";
  if (row.ourPrice <= min) return "cheapest";
  const diff = (row.ourPrice - min) / min;
  if (diff <= 0.05) return "competitive";
  return "expensive";
}

function RateShop() {
  const { includesCountry, region, regionKey } = useRegion();
  const [country, setCountry] = useState<string>("all");
  const [pos, setPos] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Featured-card filters (top routes)
  const availableRoutes = useMemo(
    () => LATAM_ROUTES.filter((r) => includesCountry(r.country)),
    [includesCountry],
  );
  const routeCountries = useMemo(
    () => Array.from(new Set(availableRoutes.map((r) => r.country))).sort(),
    [availableRoutes],
  );
  const [routeCountry, setRouteCountry] = useState<string>("all");
  const filteredRoutes = useMemo(
    () => (routeCountry === "all" ? availableRoutes : availableRoutes.filter((r) => r.country === routeCountry)),
    [availableRoutes, routeCountry],
  );
  const [routeId, setRouteId] = useState<string>(availableRoutes[0]?.id ?? "");
  const activeRoute =
    filteredRoutes.find((r) => r.id === routeId) ?? filteredRoutes[0] ?? availableRoutes[0];

  const aiCardRef = useRef<HTMLDivElement>(null);
  const selectRoute = (r: RouteShop) => {
    // Preserve current country filter: only widen it if the route is outside.
    if (routeCountry !== "all" && r.country !== routeCountry) setRouteCountry("all");
    setRouteId(r.id);
    requestAnimationFrame(() => {
      aiCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const regional = useMemo(
    () => rateRows.filter((r) => includesCountry(r.country)),
    [includesCountry],
  );

  const countries = useMemo(
    () => Array.from(new Set(regional.map((r) => r.country))).sort(),
    [regional],
  );

  const rows = useMemo(() => {
    return regional.filter((r) => {
      if (country !== "all" && r.country !== country) return false;
      if (pos !== "all" && position(r) !== pos) return false;
      if (search && !`${r.operator} ${r.product}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [regional, country, pos, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    let cheapest = 0, competitive = 0, expensive = 0, sumGap = 0, gapCount = 0;
    for (const r of rows) {
      const p = position(r);
      if (p === "cheapest") cheapest++;
      else if (p === "competitive") competitive++;
      else expensive++;
      const m = minCompetitor(r);
      if (m != null) { sumGap += (r.ourPrice - m) / m; gapCount++; }
    }
    const avgGap = gapCount ? (sumGap / gapCount) * 100 : 0;
    return { total, cheapest, competitive, expensive, avgGap };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Rate Shop</h2>
        <p className="text-sm text-muted-foreground">
          Compare our prices vs major OTAs across the supply base
          {regionKey !== "all" && <> in <span className="font-medium text-foreground">{region.flag} {region.name}</span></>}.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Top routes · AI Rate Shopper</CardTitle>
            <p className="text-xs text-muted-foreground">Filter by country or pick a specific route from our supply dashboards.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={routeCountry} onValueChange={(v) => { setRouteCountry(v); setRouteId(""); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LatAm countries</SelectItem>
                {routeCountries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={activeRoute?.id ?? ""} onValueChange={setRouteId}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder="Route" /></SelectTrigger>
              <SelectContent>
                {filteredRoutes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.flag} {r.route} · {r.product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {activeRoute && (
      <Card ref={aiCardRef} className="scroll-mt-20 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-success/5">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" /> AI Rate Shopper · Live
              </span>
              <Badge variant="outline" className="text-[10px]">openai/gpt-oss-20b</Badge>
            </div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {activeRoute.route} · {activeRoute.product}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {activeRoute.flag} {activeRoute.country} · scraped {activeRoute.scrapedChars.toLocaleString()} chars from{" "}
              <a href={activeRoute.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">
                {activeRoute.source} <ExternalLink className="h-3 w-3" />
              </a>{" "}
              · {activeRoute.scrapedAt}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PositionBadge pos={activeRoute.position} />
            <Select value={activeRoute.id} onValueChange={setRouteId}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder="Switch route" /></SelectTrigger>
              <SelectContent>
                {filteredRoutes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.flag} {r.route} · {r.product}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const minComp = Math.min(...activeRoute.competitorPrices.map((c) => c.price));
            const delta = activeRoute.ourPrice - minComp;
            const deltaPct = (delta / minComp) * 100;
            const deltaTone: "success" | "warning" | "danger" = delta < 0 ? "success" : delta === 0 ? "warning" : deltaPct > 5 ? "danger" : "warning";
            const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
            return (
              <div className="grid gap-3 sm:grid-cols-4">
                <PriceTile label="Our price" value={`$${activeRoute.ourPrice.toFixed(2)}`} tone="neutral" />
                {activeRoute.competitorPrices.slice(0, 2).map((c) => {
                  const tone: "success" | "danger" = c.price <= activeRoute.ourPrice ? "success" : "danger";
                  return <PriceTile key={c.label} label={activeRoute.competitorName} value={`$${c.price.toFixed(2)}`} tone={tone} subtitle={c.label} />;
                })}
                <PriceTile label="Δ vs cheapest" value={`${sign}$${Math.abs(delta).toFixed(2)}`} tone={deltaTone} subtitle={`${sign}${Math.abs(deltaPct).toFixed(1)}%`} />
              </div>
            );
          })()}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-card/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Includes</p>
              <p className="mt-1 text-sm text-foreground">{activeRoute.includes}</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">AI Recommendation</p>
              <p className="mt-1 text-sm text-foreground">{activeRoute.recommendation}</p>
            </div>
          </div>
          <div className="rounded-md border-l-2 border-warning/60 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Notes:</span> {activeRoute.notes}{" "}
            <span className="ml-1 text-[10px] uppercase tracking-wide text-warning">Confidence: {activeRoute.confidence}</span>
          </div>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top LatAm routes overview</CardTitle>
          <p className="text-xs text-muted-foreground">Snapshot across {availableRoutes.length} flagship routes pulled from our supply dashboards.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Our price</TableHead>
                  <TableHead>Top competitor</TableHead>
                  <TableHead className="text-right">From</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((r) => {
                  const minP = Math.min(...r.competitorPrices.map((c) => c.price));
                  return (
                    <TableRow
                      key={r.id}
                      className={cn("cursor-pointer hover:bg-muted/40", r.id === activeRoute?.id && "bg-primary/5")}
                      onClick={() => selectRoute(r)}
                    >
                      <TableCell>{r.flag} {r.country}</TableCell>
                      <TableCell className="font-medium">{r.route}</TableCell>
                      <TableCell className="text-muted-foreground">{r.product}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">${r.ourPrice}</TableCell>
                      <TableCell className="text-muted-foreground">{r.competitorName}</TableCell>
                      <TableCell className="text-right tabular-nums">${minP}</TableCell>
                      <TableCell><PositionBadge pos={r.position} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Products tracked" value={stats.total} tone="neutral" />
        <KpiCard label="Cheapest in market" value={stats.cheapest} tone="success" icon={<TrendingDown className="h-4 w-4" />} />
        <KpiCard label="Within 5%" value={stats.competitive} tone="warning" icon={<Minus className="h-4 w-4" />} />
        <KpiCard label="Above market" value={stats.expensive} tone="danger" icon={<TrendingUp className="h-4 w-4" />} subtitle={`Avg gap: ${stats.avgGap.toFixed(1)}%`} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Price comparison</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Operator or product"
                className="w-[220px] pl-8"
              />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={pos} onValueChange={setPos}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All positions</SelectItem>
                <SelectItem value="cheapest">Cheapest</SelectItem>
                <SelectItem value="competitive">Within 5%</SelectItem>
                <SelectItem value="expensive">Above market</SelectItem>
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
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Our price</TableHead>
                  {COMPETITORS.map((c) => (
                    <TableHead key={c} className="text-right">{c}</TableHead>
                  ))}
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Gap vs min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => {
                  const min = minCompetitor(r);
                  const gap = min != null ? ((r.ourPrice - min) / min) * 100 : null;
                  const p = position(r);
                  return (
                    <TableRow key={`${r.operatorId}-${idx}`}>
                      <TableCell className="font-medium">{r.operator}</TableCell>
                      <TableCell className="text-muted-foreground">{r.country}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{r.date}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">${r.ourPrice}</TableCell>
                      {COMPETITORS.map((c) => {
                        const v = r.competitors[c];
                        const isMin = v != null && min != null && v === min;
                        return (
                          <TableCell key={c} className={cn("text-right tabular-nums", isMin ? "font-semibold text-success" : "text-muted-foreground")}>
                            {v == null ? <span className="text-muted-foreground/60">—</span> : `$${v}`}
                          </TableCell>
                        );
                      })}
                      <TableCell><PositionBadge pos={p} /></TableCell>
                      <TableCell className={cn("text-right tabular-nums", gap == null ? "text-muted-foreground" : gap > 0 ? "text-danger" : gap < 0 ? "text-success" : "text-muted-foreground")}>
                        {gap == null ? "—" : (
                          <span className="inline-flex items-center gap-0.5">
                            {gap > 0 ? <ArrowUp className="h-3 w-3" /> : gap < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                            {Math.abs(gap).toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={6 + COMPETITORS.length + 2} className="py-8 text-center text-muted-foreground">No products match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-border/60 px-4 py-3 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Methodology:</span>{" "}
            Daily snapshot of public OTA list prices for the same product & date.{" "}
            <span className="text-success">Cheapest</span> = lowest in market ·{" "}
            <span className="text-warning">Within 5%</span> = competitive ·{" "}
            <span className="text-danger">Above market</span> = priced &gt;5% over the cheapest competitor.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PositionBadge({ pos }: { pos: "cheapest" | "competitive" | "expensive" }) {
  const map = {
    cheapest: { label: "Cheapest", cls: "bg-success/15 text-success border-success/30" },
    competitive: { label: "Within 5%", cls: "bg-warning/15 text-warning border-warning/30" },
    expensive: { label: "Above market", cls: "bg-danger/15 text-danger border-danger/30" },
  }[pos];
  return <Badge variant="outline" className={cn("border", map.cls)}>{map.label}</Badge>;
}

function KpiCard({ label, value, tone, icon, subtitle }: { label: string; value: number | string; tone: "danger" | "warning" | "success" | "neutral"; icon?: React.ReactNode; subtitle?: string }) {
  const toneMap = {
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
    neutral: "text-foreground",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {icon && <span className={toneMap}>{icon}</span>}
        </div>
        <p className={cn("mt-2 text-3xl font-semibold tabular-nums", toneMap)}>{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function PriceTile({ label, value, tone, subtitle }: { label: string; value: string; tone: "danger" | "warning" | "success" | "neutral"; subtitle?: string }) {
  const toneMap = {
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
    neutral: "text-foreground",
  }[tone];
  return (
    <div className="rounded-lg border bg-card/60 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneMap)}>{value}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
