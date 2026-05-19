import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type RegionKey = "latam" | "apac" | "europe" | "imea" | "all";

export interface RegionDef {
  key: RegionKey;
  name: string;
  flag: string;
  countries: string[];
}

export const REGIONS: Record<RegionKey, RegionDef> = {
  latam: {
    key: "latam",
    name: "LatAm",
    flag: "🌎",
    countries: [
      "Argentina","Brazil","Mexico","Colombia","Peru","Chile","Bolivia","Paraguay","Uruguay","Ecuador",
      "Costa Rica","Panama","Guatemala","Honduras","Nicaragua","Belize","El Salvador","Venezuela","Cuba",
      "Dominican Republic","Haiti","Jamaica","Trinidad and Tobago",
    ],
  },
  apac: {
    key: "apac",
    name: "APAC",
    flag: "🌏",
    countries: [
      "Thailand","Vietnam","Indonesia","Philippines","Cambodia","Malaysia","Singapore","Japan","South Korea",
      "India","Sri Lanka","Nepal","Myanmar","Laos","China","Australia","New Zealand","Hong Kong","Taiwan",
    ],
  },
  europe: {
    key: "europe",
    name: "Europe",
    flag: "🌍",
    countries: [
      "Croatia","Montenegro","Greece","Italy","France","Spain","Portugal","Germany","Netherlands",
      "United Kingdom","Czech Republic","Hungary","Romania","Bulgaria","Slovenia","Serbia","Albania",
      "Bosnia","Bosnia and Herzegovina","Poland","Austria","Switzerland","Belgium","North Macedonia",
    ],
  },
  imea: {
    key: "imea",
    name: "IMEA",
    flag: "🌍",
    countries: [
      "Turkey","Egypt","Morocco","Jordan","Israel","UAE","Saudi Arabia","Kenya","Tanzania",
      "South Africa","Ghana","Ethiopia","Rwanda",
    ],
  },
  all: { key: "all", name: "All Regions", flag: "🌐", countries: [] },
};

export const REGION_ORDER: RegionKey[] = ["latam", "apac", "europe", "imea", "all"];

// Region-specific dataset gating
export const LATAM_ONLY_SECTIONS = ["specialDeals", "contracts"] as const;

interface RegionContextValue {
  region: RegionDef;
  regionKey: RegionKey;
  setRegion: (key: RegionKey) => void;
  isLoading: boolean;
  /** Returns true if a country is included in the active region (or region is "all"). */
  includesCountry: (country: string) => boolean;
  /** Returns true when current region is LatAm — used to gate LatAm-only datasets. */
  isLatAm: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

const STORAGE_KEY = "supplyCopilot.region";

export function RegionProvider({ children }: { children: ReactNode }) {
  const [regionKey, setRegionKeyState] = useState<RegionKey>("latam");
  const [isLoading, setIsLoading] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as RegionKey | null;
    if (stored && REGIONS[stored]) setRegionKeyState(stored);
  }, []);

  const setRegion = (key: RegionKey) => {
    if (!REGIONS[key] || key === regionKey) return;
    setIsLoading(true);
    setRegionKeyState(key);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, key);
    window.setTimeout(() => setIsLoading(false), 1000);
  };

  const value = useMemo<RegionContextValue>(() => {
    const region = REGIONS[regionKey];
    const set = new Set(region.countries);
    return {
      region,
      regionKey,
      setRegion,
      isLoading,
      includesCountry: (c: string) => regionKey === "all" || set.has(c),
      isLatAm: regionKey === "latam",
    };
  }, [regionKey, isLoading]);

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
}
