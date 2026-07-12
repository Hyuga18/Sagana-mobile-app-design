import { CheckCircle2 } from "lucide-react";
import { Listing, cropById, peso } from "../../data";

export function OrderConfirm({
  listing,
  qty,
  total,
  onViewOrders,
  onDone,
}: {
  listing: Listing;
  qty: number;
  total: number;
  onViewOrders: () => void;
  onDone: () => void;
}) {
  const crop = cropById(listing.cropId);

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="size-20 rounded-full bg-[#2F7D4F]/10 flex items-center justify-center mb-5">
        <CheckCircle2 size={48} className="text-primary" />
      </div>
      <h2>Order placed!</h2>
      <p className="text-[14px] text-muted-foreground mt-2 max-w-[260px]">
        Your order is pending confirmation from {listing.farmer}.
      </p>

      <div className="w-full rounded-2xl bg-card border border-border p-4 mt-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[14px]">
            {crop.emoji} {crop.name}
          </span>
          <span className="text-[14px]">
            {qty} {listing.unit}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <span className="text-[13px] text-muted-foreground">Total</span>
          <span className="text-[#F0A93E]">{peso(total)}</span>
        </div>
      </div>

      <div className="w-full space-y-3 mt-8">
        <button
          onClick={onViewOrders}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground active:scale-[0.99] transition"
        >
          Track my order
        </button>
        <button
          onClick={onDone}
          className="w-full h-12 rounded-xl bg-card border border-border active:scale-[0.99] transition"
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
}
