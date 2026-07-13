import { Home, Sprout, ShoppingBag, User, Store, CloudSun } from "lucide-react";
import { Role } from "../data";

export type Tab = "home" | "listings" | "orders" | "weather" | "profile";

const FARMER_TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "listings", label: "Listings", icon: Sprout },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "profile", label: "Profile", icon: User },
];

// Buyers don't manage listings, so they get a Market tab instead.
const BUYER_TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Market", icon: Store },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomTabBar({
  active,
  role,
  onChange,
}: {
  active: Tab;
  role: Role;
  onChange: (t: Tab) => void;
}) {
  const tabs = role === "farmer" ? FARMER_TABS : BUYER_TABS;
  return (
    <nav className="absolute bottom-0 inset-x-0 h-[76px] bg-card border-t border-border flex items-stretch px-2 pb-2 pt-1.5">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors"
          >
            <Icon
              size={22}
              className={isActive ? "text-primary" : "text-muted-foreground"}
              strokeWidth={isActive ? 2.4 : 1.8}
            />
            <span
              className={`text-[11px] leading-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
