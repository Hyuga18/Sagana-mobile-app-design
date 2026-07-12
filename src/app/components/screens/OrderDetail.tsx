import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  MessageCircle,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Ban,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Listing,
  Order,
  OrderStatus,
  cropById,
  daysSince,
  peso,
} from "../../data";

const STEP_META: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "#F4A261" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "#2A9D8F" },
  packed: { label: "Packed", icon: Package, color: "#4A90D9" },
  shipped: { label: "Shipped", icon: Truck, color: "#9B59B6" },
  completed: { label: "Completed", icon: PackageCheck, color: "#8D99AE" },
  cancelled: { label: "Cancelled", icon: Ban, color: "#B23B3B" },
};

const FLOW: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "completed"];

export function OrderDetail({
  order,
  listing,
  onBack,
  onAdvance,
  onCancel,
  onChat,
}: {
  order: Order;
  listing: Listing;
  onBack: () => void;
  onAdvance: () => void;
  onCancel?: () => void;
  onChat: () => void;
}) {
  const crop = cropById(listing.cropId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const step = FLOW.indexOf(order.status);
  const since = daysSince(order.placedOn);
  const isCancelled = order.status === "cancelled";
  const buyerName = order.buyerName ?? "Buyer";
  const buyerLocation = order.buyerLocation ?? listing.barangay;
  const buyerPhone = order.buyerPhone ?? "—";
  const nextStep =
    order.status === "pending"
      ? "Confirm the order"
      : order.status === "confirmed"
        ? "Pack the order"
        : order.status === "packed"
          ? "Ship the order"
          : order.status === "shipped"
            ? "Mark as complete"
            : "Order closed";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="relative h-48 bg-muted">
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

        <div className="px-5 -mt-6 relative space-y-3">
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate">
                  {crop.emoji} {crop.name}
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1 truncate">
                  Buyer: {buyerName}
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  color: STEP_META[order.status].color,
                  background: `${STEP_META[order.status].color}18`,
                }}
              >
                {STEP_META[order.status].label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-[13px]">
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-muted-foreground">Placed</p>
                <p className="mt-0.5 flex items-center gap-1.5">
                  <CalendarClock size={13} /> {order.placedOn} · {since}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-muted-foreground">Quantity</p>
                <p className="mt-0.5">{order.quantity} {listing.unit}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-muted-foreground">Pickup</p>
                <p className="mt-0.5 flex items-center gap-1.5">
                  <MapPin size={13} /> {buyerLocation}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-muted-foreground">Contact</p>
                <p className="mt-0.5">{buyerPhone}</p>
              </div>
            </div>
          </div>

          {!isCancelled && (
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between gap-1">
                {FLOW.map((status, index) => {
                  const active = index <= step;
                  return (
                    <div key={status} className="flex flex-1 items-center last:flex-none">
                      <div
                        className="size-2.5 rounded-full border"
                        style={{
                          background: active ? STEP_META[status].color : "transparent",
                          borderColor: active ? STEP_META[status].color : "#D8D2C4",
                        }}
                      />
                      {index < FLOW.length - 1 && (
                        <div
                          className="flex-1 h-0.5 mx-1"
                          style={{
                            background: index < step ? STEP_META[FLOW[index + 1]].color : "#D8D2C4",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1.5">
                {FLOW.map((status, index) => (
                  <span
                    key={status}
                    className={`text-[10px] ${index <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {STEP_META[status].label}
                  </span>
                ))}
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">Next: {nextStep}</p>
            </div>
          )}

          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <p className="text-[13px] text-muted-foreground">Order summary</p>
            <div className="flex items-center justify-between text-[13px]">
              <span>{crop.name} × {order.quantity} {listing.unit}</span>
              <span>{peso(order.total)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-muted-foreground">
              <span>Price per unit</span>
              <span>{peso(listing.price)}/{listing.unit}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[14px] font-medium">Total revenue</span>
              <span className="text-[18px] font-semibold text-primary">{peso(order.total)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
            <p className="text-[13px] font-medium">Buyer info</p>
            <p className="text-[13px] text-muted-foreground">👤 {buyerName}</p>
            <p className="text-[13px] text-muted-foreground">📍 {buyerLocation}</p>
            <p className="text-[13px] text-muted-foreground">📞 {buyerPhone}</p>
          </div>

          {isCancelled && (
            <div className="rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/20 px-4 py-3 text-[13px] text-[#9c3a25]">
              This order was cancelled.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onChat}
              className="flex-1 h-12 rounded-xl border border-primary text-primary flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> Chat buyer
            </button>
            {onCancel && !isCancelled && order.status !== "completed" && (
              <>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="flex-1 h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-2"
                >
                  Cancel order
                </button>
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the order as cancelled and notify the buyer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onCancel();
                        setCancelOpen(false);
                      }}
                    >
                      Cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {!isCancelled && order.status !== "completed" && (
        <div className="px-5 pt-3 pb-6 border-t border-border">
          <button
            onClick={onAdvance}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground active:scale-[0.99] transition"
          >
            {nextStep}
          </button>
        </div>
      )}
    </div>
  );
}