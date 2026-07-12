import { MapPin, Sprout } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AdviceBadge } from "./ForecastRecommendation";
import {
  Listing,
  cropById,
  forecastAdvice,
  forecastForCrop,
  harvestInfo,
  isNewListing,
  peso,
} from "../data";
import { haptic } from "../lib/haptics";

export function ListingCard({
  listing,
  onClick,
  onQuickAction,
}: {
  listing: Listing;
  onClick?: () => void;
  onQuickAction?: (listing: Listing) => void;
}) {
  const crop = cropById(listing.cropId);
  const advice = forecastAdvice(forecastForCrop(crop.id), crop.name);
  const harvest = harvestInfo(listing.harvestDate);
  const isNew = isNewListing(listing);

  return (
    <div className="relative w-full rounded-2xl bg-card border border-border overflow-hidden flex active:scale-[0.99] transition-transform">
      {isNew && (
        <span className="absolute top-2 right-2 z-10 text-[10px] px-2 py-0.5 rounded-full bg-[#C1613D] text-white shadow-sm">
          NEW
        </span>
      )}
      <button
        onClick={onClick}
        className="w-[104px] shrink-0 bg-muted self-stretch"
      >
        <ImageWithFallback
          src={listing.image}
          alt={crop.name}
          className="w-full h-full object-cover"
        />
      </button>
      <div className="flex-1 p-3.5 min-w-0">
        <button onClick={onClick} className="w-full text-left">
          <div className="flex items-center gap-2">
            <p className="truncate text-[16px]">
              {crop.emoji} {crop.name}
            </p>
            {listing.own && (
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#2F7D4F]/10 text-primary">
                Yours
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
            by {listing.farmer}
          </p>

          {/* +8px breathing room before the detail rows */}
          <div className="mt-2.5 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{listing.barangay}</span>
            </span>
            <span
              className="flex items-center gap-1 shrink-0 rounded-full bg-muted px-2 py-0.5"
              style={{ color: harvest.past ? "#9c3a25" : "#48505e" }}
            >
              <Sprout size={12} /> {harvest.label}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-[#C1613D]">
              {peso(listing.price)}
              <span className="text-[12px] text-muted-foreground">
                /{listing.unit}
              </span>
            </span>
            <AdviceBadge advice={advice} />
          </div>
        </button>

        <div className="flex items-center justify-between mt-2.5 gap-2">
          <span className="text-[12px] text-muted-foreground">
            {listing.quantity} {listing.unit} left
          </span>
          {onQuickAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic(8);
                onQuickAction(listing);
              }}
              className="text-[12px] px-3 py-1 rounded-full border border-primary text-primary active:bg-primary/10"
            >
              {listing.own ? "Update price" : "Sell"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
