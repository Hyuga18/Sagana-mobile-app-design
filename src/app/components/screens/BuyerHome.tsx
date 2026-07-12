import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, MapPin, SearchX } from "lucide-react";
import { ListingCard } from "../ListingCard";
import { ListingCardSkeleton } from "../Skeleton";
import { EmptyState } from "../EmptyState";
import { BARANGAYS, CROPS, Listing } from "../../data";

type Sort = "recent" | "price-asc" | "price-desc" | "harvest";

const SORTS: { id: Sort; label: string }[] = [
  { id: "recent", label: "Newest" },
  { id: "price-asc", label: "Price: low" },
  { id: "price-desc", label: "Price: high" },
  { id: "harvest", label: "Harvest soon" },
];

export function BuyerHome({
  listings,
  onOpenListing,
}: {
  listings: Listing[];
  onOpenListing: (l: Listing) => void;
}) {
  const [query, setQuery] = useState("");
  const [cropFilter, setCropFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");
  const [loading, setLoading] = useState(true);

  // Brief load so the marketplace feels like it's fetching fresh listings.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const result = listings.filter((l) => {
      const crop = CROPS.find((c) => c.id === l.cropId);
      const matchesQuery =
        !query ||
        crop?.name.toLowerCase().includes(query.toLowerCase()) ||
        l.farmer.toLowerCase().includes(query.toLowerCase()) ||
        l.barangay.toLowerCase().includes(query.toLowerCase());
      const matchesCrop = !cropFilter || l.cropId === cropFilter;
      const matchesLoc = !locationFilter || l.barangay === locationFilter;
      const matchesPrice = maxPrice == null || l.price <= maxPrice;
      return matchesQuery && matchesCrop && matchesLoc && matchesPrice;
    });
    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "harvest":
        sorted.sort(
          (a, b) => Date.parse(a.harvestDate) - Date.parse(b.harvestDate),
        );
        break;
      default:
        break; // "recent" keeps the incoming (newest-first) order
    }
    return sorted;
  }, [listings, query, cropFilter, locationFilter, maxPrice, sort]);

  const activeFilters =
    (cropFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (maxPrice != null ? 1 : 0);

  function clearFilters() {
    setCropFilter(null);
    setLocationFilter(null);
    setMaxPrice(null);
    setQuery("");
  }

  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-3">
        <p className="text-[13px] text-muted-foreground flex items-center gap-1">
          <MapPin size={14} /> Cavite, Philippines
        </p>
        <h2 className="mt-0.5">Fresh from the farm 🧺</h2>
      </header>

      <div className="px-5 sticky top-0 z-10 bg-background pb-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-input-background px-3.5 h-11">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crops, farmers, barangay"
              className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="size-11 shrink-0 rounded-xl bg-card border border-border flex items-center justify-center relative"
          >
            <SlidersHorizontal size={19} className="text-foreground" />
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 rounded-2xl bg-card border border-border p-4 space-y-4">
            <FilterRow label="Crop">
              {CROPS.map((c) => (
                <Chip
                  key={c.id}
                  active={cropFilter === c.id}
                  onClick={() =>
                    setCropFilter(cropFilter === c.id ? null : c.id)
                  }
                >
                  {c.emoji} {c.name}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Location">
              {BARANGAYS.map((b) => (
                <Chip
                  key={b}
                  active={locationFilter === b}
                  onClick={() =>
                    setLocationFilter(locationFilter === b ? null : b)
                  }
                >
                  {b}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Max price">
              {[50, 100, 500, 2000].map((p) => (
                <Chip
                  key={p}
                  active={maxPrice === p}
                  onClick={() => setMaxPrice(maxPrice === p ? null : p)}
                >
                  ≤ ₱{p.toLocaleString()}
                </Chip>
              ))}
            </FilterRow>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[13px] text-[#C1613D]"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Sort strip */}
        <div className="flex gap-2 overflow-x-auto pt-3 -mx-1 px-1">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] border transition-colors ${
                sort === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 space-y-3">
        {loading ? (
          <>
            <p className="text-[13px] text-muted-foreground">
              Loading fresh listings…
            </p>
            {[0, 1, 2, 3].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <p className="text-[13px] text-muted-foreground">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} available
            </p>
            {filtered.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                onClick={() => onOpenListing(l)}
              />
            ))}
            {filtered.length === 0 && (
              <EmptyState
                icon={SearchX}
                title="No matching listings"
                subtitle="Try widening your search or clearing the filters to see more produce."
                action={
                  activeFilters > 0 || query
                    ? { label: "Clear filters", onClick: clearFilters }
                    : undefined
                }
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[13px] mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[13px] border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border"
      }`}
    >
      {children}
    </button>
  );
}
