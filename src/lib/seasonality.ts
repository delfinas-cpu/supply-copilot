// Seasonality intelligence for Sales Anomaly Detection.
// Provides holiday/peak-season context so the UI can distinguish true
// anomalies from expected seasonal movement.

export type ImpactLevel = "VERY HIGH" | "HIGH" | "MEDIUM" | "LOW" | "NEGATIVE";

export interface Holiday {
  name: string;
  dates_2025: string[];
  dates_2026: string[];
  impact: ImpactLevel;
}

export interface CountrySeasonality {
  peak: string[]; // Three-letter month abbreviations
  holidays: Holiday[];
}

export const SEASONALITY_CALENDAR: Record<string, CountrySeasonality> = {
  // ─── LATAM ─────────────────────────────────────────────────────────────
  Argentina: {
    peak: ["Jan", "Feb", "Jul", "Dec"],
    holidays: [
      { name: "Carnaval", dates_2025: ["Mar 3", "Mar 4"], dates_2026: ["Feb 16", "Feb 17"], impact: "HIGH" },
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Vacaciones de Invierno", dates_2025: ["Jul 14–25"], dates_2026: ["Jul 13–24"], impact: "HIGH" },
      { name: "Fin de Año / Verano", dates_2025: ["Dec 20 - Jan 31"], dates_2026: ["Dec 20 - Jan 31"], impact: "HIGH" },
      { name: "Día de la Independencia", dates_2025: ["Jul 9"], dates_2026: ["Jul 9"], impact: "MEDIUM" },
      { name: "Puente Turístico", dates_2025: ["Aug 18"], dates_2026: ["Aug 17"], impact: "MEDIUM" },
    ],
  },
  Brazil: {
    peak: ["Jan", "Feb", "Jul", "Dec"],
    holidays: [
      { name: "Carnaval", dates_2025: ["Feb 28 - Mar 4"], dates_2026: ["Feb 13–17"], impact: "VERY HIGH" },
      { name: "Semana Santa / Páscoa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Festa Junina", dates_2025: ["Jun"], dates_2026: ["Jun"], impact: "MEDIUM" },
      { name: "Recesso Escolar Julho", dates_2025: ["Jul 1–31"], dates_2026: ["Jul 1–31"], impact: "HIGH" },
      { name: "Reveillon / Verão", dates_2025: ["Dec 26 - Jan 7"], dates_2026: ["Dec 26 - Jan 7"], impact: "HIGH" },
      { name: "Tiradentes", dates_2025: ["Apr 21"], dates_2026: ["Apr 21"], impact: "LOW" },
      { name: "Proclamação da República", dates_2025: ["Nov 15"], dates_2026: ["Nov 16"], impact: "MEDIUM" },
    ],
  },
  Mexico: {
    peak: ["Dec", "Jan", "Mar", "Jul"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Vacaciones Verano", dates_2025: ["Jul 1 - Aug 15"], dates_2026: ["Jul 1 - Aug 15"], impact: "HIGH" },
      { name: "Día de Muertos", dates_2025: ["Nov 1–2"], dates_2026: ["Nov 1–2"], impact: "HIGH" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 22 - Jan 6"], dates_2026: ["Dec 22 - Jan 6"], impact: "VERY HIGH" },
      { name: "Independencia", dates_2025: ["Sep 16"], dates_2026: ["Sep 16"], impact: "MEDIUM" },
    ],
  },
  Colombia: {
    peak: ["Dec", "Jan", "Jun", "Jul"],
    holidays: [
      { name: "Carnaval de Barranquilla", dates_2025: ["Mar 3–4"], dates_2026: ["Feb 16–17"], impact: "HIGH" },
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Feria de las Flores", dates_2025: ["Aug 1–10"], dates_2026: ["Aug 1–10"], impact: "HIGH" },
      { name: "Receso Escolar Jun-Jul", dates_2025: ["Jun 15 - Jul 15"], dates_2026: ["Jun 15 - Jul 15"], impact: "HIGH" },
      { name: "Batalla de Boyacá", dates_2025: ["Aug 7"], dates_2026: ["Aug 7"], impact: "MEDIUM" },
      { name: "Navidad / Fin de Año", dates_2025: ["Dec 20 - Jan 5"], dates_2026: ["Dec 20 - Jan 5"], impact: "HIGH" },
    ],
  },
  Peru: {
    peak: ["Jun", "Jul", "Aug", "Dec"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Inti Raymi", dates_2025: ["Jun 24"], dates_2026: ["Jun 24"], impact: "VERY HIGH" },
      { name: "Fiestas Patrias", dates_2025: ["Jul 28–29"], dates_2026: ["Jul 28–29"], impact: "VERY HIGH" },
      { name: "Día de la Canción Criolla", dates_2025: ["Oct 31"], dates_2026: ["Oct 31"], impact: "LOW" },
      { name: "Navidad / Fin de Año", dates_2025: ["Dec 25 - Jan 1"], dates_2026: ["Dec 25 - Jan 1"], impact: "HIGH" },
    ],
  },
  Chile: {
    peak: ["Jan", "Feb", "Jul", "Sep"],
    holidays: [
      { name: "Verano", dates_2025: ["Jan 1 - Feb 28"], dates_2026: ["Jan 1 - Feb 28"], impact: "VERY HIGH" },
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Invierno escolar", dates_2025: ["Jul 14–25"], dates_2026: ["Jul 13–24"], impact: "HIGH" },
      { name: "Fiestas Patrias", dates_2025: ["Sep 18–19"], dates_2026: ["Sep 18–19"], impact: "VERY HIGH" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 25 - Jan 2"], dates_2026: ["Dec 25 - Jan 2"], impact: "HIGH" },
    ],
  },
  "Costa Rica": {
    peak: ["Dec", "Jan", "Mar", "Jul"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Vacaciones Julio", dates_2025: ["Jul 1–31"], dates_2026: ["Jul 1–31"], impact: "HIGH" },
      { name: "Día de Independencia", dates_2025: ["Sep 15"], dates_2026: ["Sep 15"], impact: "MEDIUM" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 24 - Jan 2"], dates_2026: ["Dec 24 - Jan 2"], impact: "HIGH" },
    ],
  },
  Panama: {
    peak: ["Dec", "Jan", "Feb", "Jul"],
    holidays: [
      { name: "Carnaval", dates_2025: ["Mar 1–4"], dates_2026: ["Feb 14–17"], impact: "VERY HIGH" },
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Independencia", dates_2025: ["Nov 3–10"], dates_2026: ["Nov 3–10"], impact: "HIGH" },
      { name: "Navidad / Fin de Año", dates_2025: ["Dec 25 - Jan 1"], dates_2026: ["Dec 25 - Jan 1"], impact: "HIGH" },
    ],
  },
  Guatemala: {
    peak: ["Dec", "Mar", "Jul"],
    holidays: [
      { name: "Semana Santa (Antigua)", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Independencia", dates_2025: ["Sep 15"], dates_2026: ["Sep 15"], impact: "MEDIUM" },
      { name: "Todos Santos", dates_2025: ["Nov 1"], dates_2026: ["Nov 1"], impact: "MEDIUM" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 24 - Jan 1"], dates_2026: ["Dec 24 - Jan 1"], impact: "HIGH" },
    ],
  },
  Bolivia: {
    peak: ["Jun", "Jul", "Aug"],
    holidays: [
      { name: "Carnaval de Oruro", dates_2025: ["Mar 1–4"], dates_2026: ["Feb 14–17"], impact: "VERY HIGH" },
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Inti Watana / San Juan", dates_2025: ["Jun 21–24"], dates_2026: ["Jun 21–24"], impact: "HIGH" },
      { name: "Fiestas Patrias", dates_2025: ["Aug 6"], dates_2026: ["Aug 6"], impact: "HIGH" },
    ],
  },
  Nicaragua: {
    peak: ["Dec", "Mar", "Apr"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Independencia", dates_2025: ["Sep 15"], dates_2026: ["Sep 15"], impact: "MEDIUM" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 24 - Jan 1"], dates_2026: ["Dec 24 - Jan 1"], impact: "HIGH" },
    ],
  },
  Belize: {
    peak: ["Dec", "Jan", "Mar", "Apr"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Independence Day", dates_2025: ["Sep 21"], dates_2026: ["Sep 21"], impact: "MEDIUM" },
      { name: "Christmas / New Year", dates_2025: ["Dec 25 - Jan 1"], dates_2026: ["Dec 25 - Jan 1"], impact: "HIGH" },
    ],
  },
  Honduras: {
    peak: ["Mar", "Apr", "Dec"],
    holidays: [
      { name: "Semana Santa", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Independencia", dates_2025: ["Sep 15"], dates_2026: ["Sep 15"], impact: "MEDIUM" },
      { name: "Navidad / Año Nuevo", dates_2025: ["Dec 24 - Jan 1"], dates_2026: ["Dec 24 - Jan 1"], impact: "HIGH" },
    ],
  },

  // ─── APAC ───────────────────────────────────────────────────────────────
  Thailand: {
    peak: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    holidays: [
      { name: "Songkran (Thai New Year)", dates_2025: ["Apr 13–15"], dates_2026: ["Apr 13–15"], impact: "VERY HIGH" },
      { name: "Chinese New Year", dates_2025: ["Jan 29"], dates_2026: ["Feb 17"], impact: "HIGH" },
      { name: "Loy Krathong", dates_2025: ["Nov 5"], dates_2026: ["Nov 5"], impact: "HIGH" },
      { name: "King's Birthday", dates_2025: ["Dec 5"], dates_2026: ["Dec 5"], impact: "MEDIUM" },
      { name: "New Year / Christmas (intl)", dates_2025: ["Dec 25 - Jan 5"], dates_2026: ["Dec 25 - Jan 5"], impact: "VERY HIGH" },
      { name: "High Season", dates_2025: ["Nov - Mar"], dates_2026: ["Nov - Mar"], impact: "VERY HIGH" },
      { name: "Low Season (monsoon)", dates_2025: ["May - Oct"], dates_2026: ["May - Oct"], impact: "NEGATIVE" },
    ],
  },
  Vietnam: {
    peak: ["Jan", "Feb", "Mar", "Dec"],
    holidays: [
      { name: "Tết Nguyên Đán", dates_2025: ["Jan 28 - Feb 3"], dates_2026: ["Feb 16–22"], impact: "VERY HIGH" },
      { name: "Reunification Day", dates_2025: ["Apr 30"], dates_2026: ["Apr 30"], impact: "HIGH" },
      { name: "National Day", dates_2025: ["Sep 2"], dates_2026: ["Sep 2"], impact: "MEDIUM" },
      { name: "High Season (North)", dates_2025: ["Oct - Apr"], dates_2026: ["Oct - Apr"], impact: "HIGH" },
      { name: "High Season (South)", dates_2025: ["Nov - Apr"], dates_2026: ["Nov - Apr"], impact: "HIGH" },
    ],
  },
  Indonesia: {
    peak: ["Jul", "Aug", "Dec"],
    holidays: [
      { name: "Lebaran / Eid al-Fitr", dates_2025: ["Mar 30 - Apr 2"], dates_2026: ["Mar 19–22"], impact: "VERY HIGH" },
      { name: "Independence Day", dates_2025: ["Aug 17"], dates_2026: ["Aug 17"], impact: "HIGH" },
      { name: "School Holiday", dates_2025: ["Jul 1 - Aug 15"], dates_2026: ["Jul 1 - Aug 15"], impact: "HIGH" },
      { name: "Christmas / New Year", dates_2025: ["Dec 25 - Jan 1"], dates_2026: ["Dec 25 - Jan 1"], impact: "HIGH" },
    ],
  },
  Philippines: {
    peak: ["Dec", "Jan", "Mar", "Apr"],
    holidays: [
      { name: "Holy Week", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "VERY HIGH" },
      { name: "Fiesta Season", dates_2025: ["May - Jun"], dates_2026: ["May - Jun"], impact: "MEDIUM" },
      { name: "Undas", dates_2025: ["Nov 1"], dates_2026: ["Nov 1"], impact: "HIGH" },
      { name: "Christmas / New Year", dates_2025: ["Dec 25 - Jan 1"], dates_2026: ["Dec 25 - Jan 1"], impact: "VERY HIGH" },
    ],
  },
  Cambodia: {
    peak: ["Nov", "Dec", "Jan", "Feb"],
    holidays: [
      { name: "Khmer New Year", dates_2025: ["Apr 14–16"], dates_2026: ["Apr 14–16"], impact: "VERY HIGH" },
      { name: "Pchum Ben", dates_2025: ["Oct 3–5"], dates_2026: ["Sep 22–24"], impact: "HIGH" },
      { name: "Water Festival", dates_2025: ["Nov 5–7"], dates_2026: ["Nov 5–7"], impact: "HIGH" },
      { name: "Independence Day", dates_2025: ["Nov 9"], dates_2026: ["Nov 9"], impact: "MEDIUM" },
      { name: "High Season (dry)", dates_2025: ["Nov - Apr"], dates_2026: ["Nov - Apr"], impact: "HIGH" },
    ],
  },

  // ─── EUROPE ─────────────────────────────────────────────────────────────
  Croatia: {
    peak: ["Jun", "Jul", "Aug", "Sep"],
    holidays: [
      { name: "Easter / Spring Break", dates_2025: ["Apr 14–20"], dates_2026: ["Apr 2–8"], impact: "HIGH" },
      { name: "Summer Peak", dates_2025: ["Jun 15 - Sep 15"], dates_2026: ["Jun 15 - Sep 15"], impact: "VERY HIGH" },
      { name: "European School Summer Break", dates_2025: ["Jul 1 - Aug 31"], dates_2026: ["Jul 1 - Aug 31"], impact: "VERY HIGH" },
      { name: "Statehood Day", dates_2025: ["Jun 25"], dates_2026: ["Jun 25"], impact: "MEDIUM" },
      { name: "Low Season", dates_2025: ["Nov - Mar"], dates_2026: ["Nov - Mar"], impact: "NEGATIVE" },
    ],
  },
  Montenegro: {
    peak: ["Jun", "Jul", "Aug"],
    holidays: [
      { name: "Summer Peak (Adriatic)", dates_2025: ["Jun 15 - Sep 15"], dates_2026: ["Jun 15 - Sep 15"], impact: "VERY HIGH" },
      { name: "Easter", dates_2025: ["Apr 20"], dates_2026: ["Apr 5"], impact: "MEDIUM" },
      { name: "Statehood Day", dates_2025: ["Jul 13"], dates_2026: ["Jul 13"], impact: "HIGH" },
    ],
  },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthAbbr(d: Date) {
  return MONTHS[d.getUTCMonth()];
}

/** Parse a holiday date entry into a [start, end] Date range for the given year.
 * Supports "Apr 2–8", "Dec 20 - Jan 31", "Jul 9", "Nov - Mar".
 */
function parseRange(entry: string, year: number): [Date, Date] | null {
  const monthIdx = (m: string) => MONTHS.indexOf(m.slice(0, 3));
  // Cross-year month-only range e.g. "Nov - Mar"
  const monthOnly = entry.match(/^([A-Z][a-z]{2})\s*-\s*([A-Z][a-z]{2})$/);
  if (monthOnly) {
    const a = monthIdx(monthOnly[1]);
    const b = monthIdx(monthOnly[2]);
    const start = new Date(Date.UTC(year, a, 1));
    const end = b >= a
      ? new Date(Date.UTC(year, b + 1, 0))
      : new Date(Date.UTC(year + 1, b + 1, 0));
    return [start, end];
  }
  // Single month e.g. "Jun"
  const onlyMonth = entry.match(/^([A-Z][a-z]{2})$/);
  if (onlyMonth) {
    const a = monthIdx(onlyMonth[1]);
    return [new Date(Date.UTC(year, a, 1)), new Date(Date.UTC(year, a + 1, 0))];
  }
  // Cross-month range "Dec 20 - Jan 31" or "Jul 1 - Aug 15"
  const cross = entry.match(/^([A-Z][a-z]{2})\s*(\d+)\s*-\s*([A-Z][a-z]{2})\s*(\d+)$/);
  if (cross) {
    const sm = monthIdx(cross[1]);
    const sd = parseInt(cross[2], 10);
    const em = monthIdx(cross[3]);
    const ed = parseInt(cross[4], 10);
    const start = new Date(Date.UTC(year, sm, sd));
    const end = em >= sm
      ? new Date(Date.UTC(year, em, ed))
      : new Date(Date.UTC(year + 1, em, ed));
    return [start, end];
  }
  // Same-month day range "Apr 2–8" (en dash or hyphen)
  const sameMonth = entry.match(/^([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*(\d+)$/);
  if (sameMonth) {
    const m = monthIdx(sameMonth[1]);
    return [
      new Date(Date.UTC(year, m, parseInt(sameMonth[2], 10))),
      new Date(Date.UTC(year, m, parseInt(sameMonth[3], 10))),
    ];
  }
  // Single date "Jul 9" or "Mar 3"
  const single = entry.match(/^([A-Z][a-z]{2})\s*(\d+)$/);
  if (single) {
    const m = monthIdx(single[1]);
    const d = parseInt(single[2], 10);
    return [new Date(Date.UTC(year, m, d)), new Date(Date.UTC(year, m, d))];
  }
  return null;
}

export interface HolidayWindow {
  holiday: Holiday;
  start: Date;
  end: Date;
  offsetDaysVsLastYear: number | null;
}

function dayDiff(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

/** Holidays whose 2026 window overlaps a ±N day window around `date`. */
export function upcomingHolidays(country: string, date: Date, withinDays = 14): HolidayWindow[] {
  const seasonality = SEASONALITY_CALENDAR[country];
  if (!seasonality) return [];
  const out: HolidayWindow[] = [];
  for (const h of seasonality.holidays) {
    for (const raw of h.dates_2026) {
      const range = parseRange(raw, 2026);
      if (!range) continue;
      const [start, end] = range;
      // overlap with [date - withinDays, date + withinDays]
      const winStart = new Date(date.getTime() - withinDays * 86_400_000);
      const winEnd = new Date(date.getTime() + withinDays * 86_400_000);
      if (end >= winStart && start <= winEnd) {
        // offset vs 2025
        const raw25 = h.dates_2025[0];
        const range25 = raw25 ? parseRange(raw25, 2025) : null;
        const offset = range25 ? dayDiff(start, range25[0]) - 365 : null;
        out.push({ holiday: h, start, end, offsetDaysVsLastYear: offset });
        break;
      }
    }
  }
  return out;
}

/** All holiday windows that contain `date`. */
export function activeHolidays(country: string, date: Date): HolidayWindow[] {
  return upcomingHolidays(country, date, 0).filter((h) => date >= h.start && date <= h.end);
}

export function isPeakMonth(country: string, date: Date): boolean {
  const s = SEASONALITY_CALENDAR[country];
  if (!s) return false;
  return s.peak.includes(monthAbbr(date));
}

/** Is `date` inside a NEGATIVE-impact (low-season) holiday window? */
export function isLowSeason(country: string, date: Date): boolean {
  return activeHolidays(country, date).some((h) => h.holiday.impact === "NEGATIVE");
}

export type ContextTone = "critical" | "info" | "positive" | "investigate" | "shift";

export interface AnomalyContext {
  tone: ContextTone;
  label: string;
  detail: string;
  isExpected: boolean;
  peak: boolean;
  active: HolidayWindow[];
  nearby: HolidayWindow[];
}

/** Classify an anomaly given country + change direction. */
export function classifyAnomaly(
  country: string,
  changePct: number,
  date: Date,
): AnomalyContext {
  const peak = isPeakMonth(country, date);
  const active = activeHolidays(country, date);
  const lowSeason = isLowSeason(country, date);
  const nearby = upcomingHolidays(country, date, 14).filter(
    (h) => !active.find((a) => a.holiday.name === h.holiday.name),
  );
  const shifted = nearby.find(
    (h) => h.offsetDaysVsLastYear !== null && Math.abs(h.offsetDaysVsLastYear) >= 5,
  );

  const isDrop = changePct < 0;
  const positiveHoliday = active.find((h) => h.holiday.impact !== "NEGATIVE");

  if (isDrop) {
    if (peak && !lowSeason) {
      return {
        tone: "critical",
        label: `ANOMALY — drop during peak season${positiveHoliday ? ` (${positiveHoliday.holiday.name})` : ""}`,
        detail: `${country} is in peak season — drop is unexpected.`,
        isExpected: false,
        peak, active, nearby,
      };
    }
    if (lowSeason) {
      const low = active.find((h) => h.holiday.impact === "NEGATIVE")!;
      return {
        tone: "info",
        label: `Expected drop — ${low.holiday.name}`,
        detail: `Seasonally explained by ${low.holiday.name}.`,
        isExpected: true,
        peak, active, nearby,
      };
    }
    if (shifted) {
      return {
        tone: "shift",
        label: `Holiday shift — ${shifted.holiday.name} ${shifted.offsetDaysVsLastYear! > 0 ? "+" : ""}${shifted.offsetDaysVsLastYear}d vs 2025`,
        detail: `Compare with a ${shifted.offsetDaysVsLastYear}-day offset window.`,
        isExpected: true,
        peak, active, nearby,
      };
    }
    return {
      tone: "critical",
      label: "STRUCTURAL ISSUE — no seasonal explanation",
      detail: "No holiday or low-season context — investigate operator/route.",
      isExpected: false,
      peak, active, nearby,
    };
  }
  // spike
  if (positiveHoliday) {
    return {
      tone: "positive",
      label: `Expected uplift — ${positiveHoliday.holiday.name}`,
      detail: `Spike aligns with ${positiveHoliday.holiday.name}.`,
      isExpected: true,
      peak, active, nearby,
    };
  }
  if (peak) {
    return {
      tone: "positive",
      label: "Expected uplift — peak season",
      detail: `${country} peak month — spike is normal.`,
      isExpected: true,
      peak, active, nearby,
    };
  }
  if (lowSeason) {
    return {
      tone: "investigate",
      label: "Unusual spike — low season",
      detail: "Spike during low season — worth investigating cause.",
      isExpected: false,
      peak, active, nearby,
    };
  }
  return {
    tone: "investigate",
    label: "Unexpected spike",
    detail: "Spike with no obvious seasonal trigger.",
    isExpected: false,
    peak, active, nearby,
  };
}

export interface WeekMarker {
  weekStart: Date;
  label: string;
  dots: { country: string; holiday: Holiday; impact: ImpactLevel }[];
}

/** Build a strip of the next N weeks with holiday markers for the given countries. */
export function buildTimeline(countries: string[], from: Date, weeks = 8): WeekMarker[] {
  const start = new Date(from);
  // align to Monday of the current week (UTC)
  const day = start.getUTCDay();
  const diff = (day + 6) % 7;
  start.setUTCDate(start.getUTCDate() - diff);
  const out: WeekMarker[] = [];
  for (let i = 0; i < weeks; i++) {
    const ws = new Date(start.getTime() + i * 7 * 86_400_000);
    const we = new Date(ws.getTime() + 6 * 86_400_000);
    const dots: WeekMarker["dots"] = [];
    for (const country of countries) {
      const s = SEASONALITY_CALENDAR[country];
      if (!s) continue;
      for (const h of s.holidays) {
        for (const raw of h.dates_2026) {
          const range = parseRange(raw, 2026);
          if (!range) continue;
          const [hs, he] = range;
          if (he >= ws && hs <= we) {
            dots.push({ country, holiday: h, impact: h.impact });
            break;
          }
        }
      }
    }
    out.push({
      weekStart: ws,
      label: `${MONTHS[ws.getUTCMonth()]} ${ws.getUTCDate()}`,
      dots,
    });
  }
  return out;
}
