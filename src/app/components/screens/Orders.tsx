import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  Inbox,
  MessageCircle,
  CalendarClock,
  Ban,
  Package,
  Truck,
  RotateCcw,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { EmptyState } from "../EmptyState";
import { ChatSheet } from "../ChatSheet";
import {
  Listing,
  Order,
  OrderStatus,
  Role,
  cropById,
  daysSince,
  peso,
} from "../../data";

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "#B5811A",
    bg: "rgba(240,169,62,0.18)",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "#2F7D4F",
    bg: "rgba(47,125,79,0.14)",
  },
  packed: {
    label: "Packed",
    icon: Package,
    color: "#7A5C16",
    bg: "rgba(240,169,62,0.18)",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "#3B6EA5",
    bg: "rgba(59,110,165,0.14)",
  },
  completed: {
    label: "Completed",
    icon: PackageCheck,
    color: "#3B6EA5",
    bg: "rgba(59,110,165,0.14)",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    color: "#B23B3B",
    bg: "rgba(178,59,59,0.12)",
  },
};

// Progress timeline steps (cancelled orders skip the timeline entirely).
const FLOW: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "completed"];

type Filter = "all" | "pending" | "confirmed" | "completed";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
];

export function Orders({
  orders,
  listings,
  role,
  onAdvance,
  onCancel,
  onGoToListings,
}: {
  orders: Order[];
  listings: Listing[];
  role: Role;
  onAdvance: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onGoToListings?: () => void;
}) {
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter(
        (o) => o.status === "confirmed" || o.status === "packed" || o.status === "shipped",
      ).length,
      completed: orders.filter((o) => o.status === "completed").length,
    };
  }, [orders]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((o) =>
            filter === "confirmed"
              ? o.status === "confirmed" || o.status === "packed" || o.status === "shipped"
              : o.status === filter,
          ),
    [orders, filter],
  );

  const incomingTotal = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders],
  );

  function primaryActionLabel(status: OrderStatus) {
    if (status === "pending") return "Confirm";
    if (status === "confirmed") return "Mark received";
    if (status === "packed" || status === "shipped") return "Track";
    if (status === "completed") return "Reorder";
    return "Completed";
  }

  function currentStep(status: OrderStatus) {
    const index = FLOW.indexOf(status);
    if (index >= 0) return index;
    return 0;
  }

  function statusHelp(status: OrderStatus) {
    switch (status) {
      case "pending":
        return "Waiting for farmer confirmation";
      case "confirmed":
        return "Farmer accepted your order";
      case "packed":
        return "Your order is being prepared";
      case "shipped":
        return "On the way to you";
      case "completed":
        return "Order delivered. Thank you!";
      default:
        return "Order cancelled";
    }
  }

  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-4 space-y-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2>{role === "farmer" ? "Incoming orders" : "My orders"}</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Track order flow, chat with buyers, and keep shipments moving.
            </p>
          </div>
          <button className="size-10 rounded-full bg-card border border-border flex items-center justify-center">
            <Inbox size={18} className="text-foreground" />
          </button>
        </div>
        <div className="rounded-2xl bg-card border border-border px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted-foreground flex items-center gap-2 min-w-0">
            <Package size={15} className="shrink-0 text-primary" />
            <span className="truncate">{counts.all} incoming orders</span>
          </p>
          <p className="text-[13px] text-muted-foreground flex items-center gap-2 shrink-0">
            <span className="text-primary font-medium">{peso(incomingTotal)}</span>
            total value
          </p>
        </div>
      </header>

      {/* Filter tabs so farmers can jump to what needs attention */}
      <div className="px-5 sticky top-[132px] z-10 bg-background pb-3">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {FILTERS.map((f) => {
            const count = counts[f.id];
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] border transition-colors ${
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/70 text-foreground border-transparent"
                }`}
              >
                {f.label}
                <span className={`ml-1 ${filter === f.id ? "text-white/80" : "text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="px-5 space-y-3">
        {visible.map((o) => {
          const listing = listings.find((l) => l.id === o.listingId);
          if (!listing) return null;
          const crop = cropById(listing.cropId);
          const meta = STATUS_META[o.status];
          const Icon = meta.icon;
          const step = FLOW.indexOf(o.status);
          const cancelled = o.status === "cancelled";
          const since = daysSince(o.placedOn);
          const isNew = since === "Today";
          const actionLabel = primaryActionLabel(o.status);
          const primaryDisabled = o.status === "completed" || o.status === "cancelled";
          return (
            <div
              key={o.id}
              className="relative rounded-2xl bg-card border border-border p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  <ImageWithFallback
                    src={listing.image}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[16px] font-semibold leading-tight">
                    {crop.emoji} {crop.name}
                  </p>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      <Icon size={12} /> {meta.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {o.quantity} {listing.unit} · {role === "farmer" ? "Buyer order" : listing.farmer}
                  </p>
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    <CalendarClock size={11} className="shrink-0" />
                    <span className="truncate">Placed {o.placedOn} · {since}</span>
                    {isNew && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E76F51]/12 px-2 py-0.5 text-[#C84B2B] font-semibold animate-pulse">
                        NEW
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* status tracker (hidden once cancelled) */}
              {!cancelled && (
                <>
                  <div className="flex items-center mt-4">
                    {FLOW.map((s, i) => (
                      <div
                        key={s}
                        className="flex items-center flex-1 last:flex-none"
                      >
                        <div
                          className="size-2.5 rounded-full border"
                          style={{
                            background: i <= step ? STATUS_META[s].color : "transparent",
                            borderColor:
                              i <= step ? STATUS_META[s].color : "#D8D2C4",
                          }}
                        />
                        {i < FLOW.length - 1 && (
                          <div
                            className="flex-1 h-0.5 mx-1"
                            style={{
                              background:
                                i < step
                                  ? STATUS_META[FLOW[i + 1]].color
                                  : "#D8D2C4",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {FLOW.map((s, index) => (
                      <span
                        key={s}
                        className={`text-[10px] ${index <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {STATUS_META[s].label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-2">
                    {statusHelp(o.status)}
                  </p>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[18px] font-semibold text-primary">{peso(o.total)}</span>
                  <div className="flex items-center gap-2 justify-end flex-wrap">
                    {/* Chat is always available; greyed once the order is closed */}
                    <button
                      onClick={() =>
                        setChatWith(role === "farmer" ? "Buyer" : listing.farmer)
                      }
                      disabled={cancelled || o.status === "completed"}
                      className={`h-10 px-4 rounded-xl border flex items-center gap-1.5 text-[13px] ${
                        cancelled || o.status === "completed"
                          ? "text-muted-foreground opacity-50 border-border bg-muted/40"
                          : "text-foreground border-border bg-card"
                      }`}
                    >
                      <MessageCircle size={16} /> Chat
                    </button>

                    {!primaryDisabled && !(o.status === "pending" && role === "buyer") && (
                      <button
                        onClick={() => onAdvance(o.id)}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5 text-[13px] font-medium shadow-sm"
                      >
                        {actionLabel}
                        <ChevronRight size={16} />
                      </button>
                    )}
                    {o.status === "completed" && (
                      <button
                        onClick={() => setChatWith(role === "farmer" ? "Buyer" : listing.farmer)}
                        className="h-10 px-4 rounded-xl bg-muted/70 text-foreground border border-border flex items-center gap-1.5 text-[13px]"
                      >
                        <RotateCcw size={15} /> Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isNew && (
                <div className="absolute -top-2 -right-2 size-3 rounded-full bg-[#E76F51] shadow-[0_0_0_6px_rgba(231,111,81,0.14)] animate-pulse" />
              )}
            </div>
          );
        })}

        {visible.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No incoming orders yet"
            subtitle="Share your listings to start selling and receive new orders from buyers."
            action={
              role === "farmer"
                ? { label: "Share my listings", onClick: onGoToListings ?? (() => {}) }
                : undefined
            }
          />
        )}
      </section>

      {chatWith && (
        <ChatSheet name={chatWith} onClose={() => setChatWith(null)} />
      )}
    </div>
  );
}
