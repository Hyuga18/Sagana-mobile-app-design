import { useMemo, useState } from "react";
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  Inbox,
  MessageCircle,
  CalendarClock,
  XCircle,
  Ban,
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
const FLOW: OrderStatus[] = ["pending", "confirmed", "completed"];

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
}: {
  orders: Order[];
  listings: Listing[];
  role: Role;
  onAdvance: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
}) {
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-3">
        <h2>{role === "farmer" ? "Incoming orders" : "My orders"}</h2>
      </header>

      {/* Filter tabs so farmers can jump to what needs attention */}
      <div className="px-5 sticky top-0 z-10 bg-background pb-3">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] border transition-colors ${
                  filter === f.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className="ml-1 opacity-70">{count}</span>
                )}
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
          return (
            <div
              key={o.id}
              className="rounded-2xl bg-card border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  <ImageWithFallback
                    src={listing.image}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    {crop.emoji} {crop.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {o.quantity} {listing.unit} ·{" "}
                    {role === "farmer" ? "Buyer order" : listing.farmer}
                  </p>
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    Placed {o.placedOn}
                    {since && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                        <CalendarClock size={11} /> {since}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className="shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px]"
                  style={{ color: meta.color, background: meta.bg }}
                >
                  <Icon size={13} /> {meta.label}
                </span>
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
                          className="size-2.5 rounded-full"
                          style={{
                            background:
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
                    {FLOW.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] text-muted-foreground"
                      >
                        {STATUS_META[s].label}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-[#F0A93E]">{peso(o.total)}</span>
                <div className="flex items-center gap-3">
                  {/* Chat is always available; greyed once the order is closed */}
                  <button
                    onClick={() =>
                      setChatWith(role === "farmer" ? "Buyer" : listing.farmer)
                    }
                    disabled={cancelled}
                    className={`flex items-center gap-1 text-[13px] ${
                      cancelled
                        ? "text-muted-foreground opacity-50"
                        : "text-muted-foreground"
                    }`}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>

                  {/* Context-aware primary action */}
                  {o.status === "pending" && role === "buyer" && onCancel && (
                    <button
                      onClick={() => onCancel(o.id)}
                      className="flex items-center gap-1 text-[13px] text-[#C1613D]"
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  )}
                  {(o.status === "pending" || o.status === "confirmed") &&
                    !(o.status === "pending" && role === "buyer") && (
                      <button
                        onClick={() => onAdvance(o.id)}
                        className="flex items-center gap-1 text-[13px] text-primary"
                      >
                        {role === "farmer"
                          ? o.status === "pending"
                            ? "Confirm order"
                            : "Mark completed"
                          : "Mark received"}
                        <ChevronRight size={16} />
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={
              filter !== "all"
                ? `No ${filter} orders`
                : role === "farmer"
                  ? "No incoming orders"
                  : "No orders yet"
            }
            subtitle={
              filter !== "all"
                ? "Try a different filter to see more orders."
                : role === "farmer"
                  ? "When a buyer orders from one of your listings, it'll show up here."
                  : "Browse the marketplace and place your first order to see it tracked here."
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
