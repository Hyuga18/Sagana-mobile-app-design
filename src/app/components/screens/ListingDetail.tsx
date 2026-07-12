import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Minus,
  Plus,
  User,
  MessageCircle,
  BadgeCheck,
  Star,
  Phone,
  Truck,
  Package,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ForecastChart } from "../ForecastChart";
import { ForecastRecommendation } from "../ForecastRecommendation";
import { ChatSheet } from "../ChatSheet";
import {
  Role,
  Listing,
  cropById,
  harvestInfo,
  peso,
  forecastForCrop,
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
  const [qty, setQty] = useState(Math.min(10, listing.quantity));
  const [chatOpen, setChatOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "delivery">("pickup");
  const harvest = harvestInfo(listing.harvestDate);
  const farmerSales = 38;
  const farmerRating = 4.8;
  const isBuyer = role === "buyer";
  const deliveryFee = deliveryMode === "delivery" ? 50 : 0;
  const subtotal = qty * listing.price;
  const total = subtotal + deliveryFee;

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
                <p className="text-[13px] text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    by {listing.farmer}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2F7D4F]/10 px-2 py-0.5 text-primary font-medium">
                    <BadgeCheck size={12} /> Verified
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-medium">{listing.farmer}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    <Star size={11} className="text-[#F0A93E]" />
                    {farmerRating} ({farmerSales} sales)
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>{listing.quantity} {listing.unit} available</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    <CalendarDays size={11} /> {harvest.label}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {isBuyer ? (
          <div className="px-5 mt-4 space-y-3">
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-muted-foreground">Freshness</p>
                  <p className="text-[14px] font-medium flex items-center gap-1.5 mt-0.5">
                    <Package size={15} className="text-primary" />
                    {harvest.past ? `Harvested ${Math.abs(harvest.days)} days ago` : "Freshly harvested today"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] text-muted-foreground">Pickup location</p>
                  <p className="text-[14px] font-medium mt-0.5 flex items-center gap-1.5 justify-end">
                    <MapPin size={14} className="text-primary" />
                    {listing.barangay}, Cavite
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/60 px-3 py-2 flex items-center justify-between gap-3">
                <p className="text-[13px] text-muted-foreground">
                  Best price in Silang this week
                </p>
                <span className="text-[13px] font-medium text-[#2F7D4F]">
                  Below market average
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium">Delivery options</p>
                <p className="text-[12px] text-muted-foreground">Choose one</p>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={() => setDeliveryMode("pickup")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    deliveryMode === "pickup"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={15} className="text-primary" />
                    Pickup at farm
                  </span>
                  <span className="text-[13px] text-muted-foreground">Free</span>
                </button>
                <button
                  onClick={() => setDeliveryMode("delivery")}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    deliveryMode === "delivery"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Truck size={15} className="text-primary" />
                    Delivery to buyer
                  </span>
                  <span className="text-[13px] text-muted-foreground">₱50 fee</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 mt-4">
            <ForecastChart data={forecastForCrop(crop.id)} unit={crop.unit} />
          </div>
        )}

        {!listing.own && (
          <div className="px-5 mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => setChatOpen(true)}
              className="h-12 rounded-xl border border-primary text-primary flex items-center justify-center gap-2 active:bg-primary/10 transition"
            >
              <MessageCircle size={18} /> Message {listing.farmer}
            </button>
            <button
              onClick={() => {
                window.location.href = "tel:+639000000000";
              }}
              className="h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-2 active:bg-muted transition"
            >
              <Phone size={18} /> Call
            </button>
          </div>
        )}

        {role === "buyer" && (
          <div className="px-5 mt-4 space-y-3">
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
                  {qty} {" "}
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

            <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
              <p className="text-[14px] font-medium">Order summary</p>
              <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                <span>{crop.name} × {qty} {listing.unit}</span>
                <span>{peso(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                <span>Delivery fee</span>
                <span>{peso(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[14px] font-medium">Total</span>
                <span className="text-[#F0A93E] text-[18px] font-semibold">{peso(total)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#2F7D4F]/10 border border-[#2F7D4F]/20 px-4 py-3 text-[13px] text-primary">
              <span className="font-medium">Secure checkout</span> · Free cancellation within 24 hours
            </div>
          </div>
        )}
      </div>

      {role === "buyer" && (
        <div className="px-5 pt-3 pb-6 border-t border-border space-y-3">
          <button
            onClick={() => onOrder(qty, total)}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground active:scale-[0.99] transition"
          >
            Place Order Now
          </button>
          <p className="text-[12px] text-muted-foreground text-center">
            You'll receive order confirmation within 5 minutes.
          </p>
        </div>
      )}

      {chatOpen && (
        <ChatSheet name={listing.farmer} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
}
