import { useMemo, useState } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { useLocationCity } from "@/hooks/use-location";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LocationPicker({
  variant = "header",
}: {
  variant?: "header" | "compact";
}) {
  const { city, setCity, cities } = useLocationCity();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q),
    );
  }, [cities, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof cities>();
    for (const c of filtered) {
      if (!map.has(c.region)) map.set(c.region, []);
      map.get(c.region)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const triggerClasses =
    variant === "header"
      ? "hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      : "flex items-center gap-1.5 text-sm text-foreground";

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClasses}>
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium underline decoration-primary/30 decoration-dashed underline-offset-4">
            {city}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <div className="font-display font-bold text-base mb-2">
            Choose your city
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or state…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 rounded-lg border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {grouped.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No cities match "{query}"
            </div>
          ) : (
            grouped.map(([region, list]) => (
              <div key={region}>
                <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {region}
                </div>
                {list.map((c) => {
                  const isActive = c.name === city;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setCity(c.name);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        isActive ? "text-primary font-semibold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        {c.name}
                      </div>
                      {isActive ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
