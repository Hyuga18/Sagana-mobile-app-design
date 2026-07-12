import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Minus,
  Plus,
  User,
  MessageCircle,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ForecastChart } from "../ForecastChart";
import { ForecastRecommendation } from "../ForecastRecommendation";
import { ChatSheet } from "../ChatSheet";
import {
  Role,
  Listing,
  cropById,
  forecastAdvice,
  forecastForCrop,
  peso,
} from "../../data";

export function ListingDetail({
  listing,
  role,
  onBack,
  onOrder,
}: {
  listing: Listing;
  role: Role;
  onBack: () => void;
  onOrder: (qty: number, total: number) => void;
}) {
  const crop = cropById(listing.cropId);
  const forecast = forecastForCrop(crop.id);
  const advice = forecastAdvice(forecast, crop.name);
  const [qty, setQty] = useState(Math.min(10, listing.quantity));
  const [chatOpen, setChatOpen] = useState(false);
  const total = qty * listing.price;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="relative h-56 bg-muted">
          <ImageWithFallback
            src={listing.image}
            alt={crop.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onBack}
            className="absolute top-14 left-5 size-10 rounded-full bg-black/35 backdrop-blur flex items-center justify-center text-white"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        <div className="px-5 -mt-6 relative">
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2>
                  {crop.emoji} {crop.name}
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {listing.barangay}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} /> {listing.harvestDate}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#C1613D]" style={{ fontSize: 22 }}>
                  {peso(listing.price)}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  per {listing.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <div className="size-9 rounded-full bg-[#2F7D4F]/10 text-primary flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <p className="text-[14px]">{listing.farmer}</p>
                <p className="text-[12px] text-muted-foreground">
                  {listing.quantity} {listing.unit} available
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <ForecastChart data={forecast} unit={crop.unit} />
        </div>

        <div className="px-5 mt-3">
          <ForecastRecommendation advice={advice} />
        </div>

        {!listing.own && (
          <div className="px-5 mt-3">
            <button
              onClick={() => setChatOpen(true)}
              className="w-full h-12 rounded-xl border border-primary text-primary flex items-center justify-center gap-2 active:bg-primary/10 transition"
            >
              <MessageCircle size={18} /> Contact {listing.farmer}
            </button>
          </div>
        )}

        {role === "buyer" && (
          <div className="px-5 mt-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <p className="text-[14px] mb-3">Select quantity</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="size-10 rounded-xl bg-input-background flex items-center justify-center"
                >
                  <Minus size={18} />
                </button>
                <span style={{ fontSize: 20 }}>
                  {qty}{" "}
                  <span className="text-[14px] text-muted-foreground">
                    {listing.unit}
                  </span>
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(listing.quantity, q + 1))
                  }
                  className="size-10 rounded-xl bg-input-background flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {role === "buyer" && (
        <div className="px-5 pt-3 pb-6 border-t border-border flex items-center gap-4">
          <div>
            <p className="text-[12px] text-muted-foreground">Total</p>
            <p className="text-[#F0A93E]" style={{ fontSize: 20 }}>
              {peso(total)}
            </p>
          </div>
          <button
            onClick={() => onOrder(qty, total)}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground active:scale-[0.99] transition"
          >
            Place order
          </button>
        </div>
      )}

      {chatOpen && (
        <ChatSheet name={listing.farmer} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}
