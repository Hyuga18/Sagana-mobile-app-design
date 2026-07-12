import { useState } from "react";
import {
  Plus,
  Bell,
  Sprout,
  Package,
  ClipboardList,
  Info,
  ChevronRight,
} from "lucide-react";
import { ForecastChart } from "../ForecastChart";
import { ForecastRecommendation } from "../ForecastRecommendation";
import { ListingCard } from "../ListingCard";
import { EmptyState } from "../EmptyState";
import { Listing, cropById, forecastAdvice, forecastForCrop } from "../../data";

export function FarmerHome({
  view = "home",
  listings,
  pendingOrders = 0,
  onCreate,
  onOpenListing,
  onQuickAction,
  onGoToListings,
}: {
  view?: "home" | "listings";
  listings: Listing[];
  pendingOrders?: number;
  onCreate: () => void;
  onOpenListing: (l: Listing) => void;
  onQuickAction?: (l: Listing) => void;
  onGoToListings?: () => void;
}) {
  const ownCropIds = Array.from(new Set(listings.map((l) => l.cropId)));
  const cropChoices = (ownCropIds.length ? ownCropIds : ["tomato"]).map(
    cropById,
  );
  const [selected, setSelected] = useState(cropChoices[0].id);
  const crop = cropById(selected);
  const forecast = forecastForCrop(crop.id);
  const advice = forecastAdvice(forecast, crop.name);

  // ---- LISTINGS TAB: manage your harvest listings ----
  if (view === "listings") {
    return (
      <div className="h-full overflow-y-auto pb-[92px]">
        <header className="px-5 pt-14 pb-4 flex items-center justify-between">
          <div>
            <h2>Your listings</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {listings.length} active listing{listings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onCreate}
            className="flex items-center gap-1 text-[13px] text-primary"
          >
            <Plus size={16} /> New
          </button>
        </header>

        <section className="px-5 space-y-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onClick={() => onOpenListing(l)}
              onQuickAction={onQuickAction}
            />
          ))}
          {listings.length === 0 && (
            <EmptyState
              icon={Sprout}
              title="No listings yet"
              subtitle="Post your first harvest so buyers in Cavite can find and order from you."
              action={{ label: "Post a harvest", onClick: onCreate }}
            />
          )}
        </section>

        <button
          onClick={onCreate}
          className="absolute right-5 bottom-[92px] size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={26} />
        </button>
      </div>
    );
  }

  // ---- HOME TAB: dashboard + sell-now forecast ----
  const preview = listings.slice(0, 2);
  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">Magandang araw,</p>
          <h2>Aling Rosa 🌱</h2>
        </div>
        <button className="size-10 rounded-full bg-card border border-border flex items-center justify-center relative">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-[#C1613D]" />
        </button>
      </header>

      <section className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-3 flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#2F7D4F]/10 flex items-center justify-center shrink-0">
              <Package size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] leading-none">{listings.length}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                active listings
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-3 flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#F0A93E]/15 flex items-center justify-center shrink-0">
              <ClipboardList size={18} className="text-[#C1613D]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] leading-none">{pendingOrders}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                pending orders
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-between mb-2">
          <h3>Should you sell now?</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {cropChoices.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] border transition-colors ${
                selected === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <ForecastChart data={forecast} unit={crop.unit} />
        </div>
        <div className="mt-3">
          <ForecastRecommendation advice={advice} />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#8D99AE]/12 border border-[#8D99AE]/30 px-3 py-2.5">
          <Info size={16} className="text-[#48505e] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#48505e] leading-relaxed">
            Typhoon season approaching — factor in storage costs if you plan to
            hold your harvest.
          </p>
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3>Your listings</h3>
          <button
            onClick={onGoToListings}
            className="flex items-center gap-1 text-[13px] text-primary"
          >
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {preview.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onClick={() => onOpenListing(l)}
              onQuickAction={onQuickAction}
            />
          ))}
          {listings.length === 0 && (
            <EmptyState
              icon={Sprout}
              title="No listings yet"
              subtitle="Post your first harvest so buyers in Cavite can find and order from you."
              action={{ label: "Post a harvest", onClick: onCreate }}
            />
          )}
        </div>
      </section>

      <button
        onClick={onCreate}
        className="absolute right-5 bottom-[92px] size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
