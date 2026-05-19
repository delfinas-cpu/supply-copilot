import { Globe, Loader2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REGIONS, REGION_ORDER, useRegion, type RegionKey } from "@/lib/region-context";
import { cn } from "@/lib/utils";

export function RegionSelector() {
  const { region, regionKey, setRegion, isLoading } = useRegion();
  const countryCount = region.countries.length;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
              "bg-brand-dark text-white shadow-sm transition hover:bg-brand-dark/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light",
            )}
            aria-label="Select region"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-sm leading-none">{region.flag}</span>
            <span>{region.name}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          {REGION_ORDER.map((key) => {
            const r = REGIONS[key];
            const active = key === regionKey;
            return (
              <DropdownMenuItem
                key={key}
                onSelect={() => setRegion(key as RegionKey)}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <span>{r.flag}</span>
                  <span>{r.name}</span>
                </span>
                {active && <Check className="h-3.5 w-3.5 text-brand-dark" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {regionKey !== "all" && (
        <span className="hidden rounded-full bg-brand-light/15 px-2 py-0.5 text-xs font-medium text-brand-dark sm:inline-flex">
          {countryCount} countries
        </span>
      )}

      {isLoading && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Loading" />
      )}
    </div>
  );
}
