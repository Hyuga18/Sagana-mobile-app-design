import {
  User,
  MapPin,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  BadgeCheck,
  Camera,
  Share2,
  Plus,
  Wallet,
  Moon,
  KeyRound,
  CreditCard,
  MessageSquareWarning,
  FileQuestion,
  Sprout,
  ShoppingBag,
} from "lucide-react";
import { Profile as ProfileType } from "../../lib/api";
import { cropById } from "../../data";

export function Profile({
  profile,
  darkMode = false,
  onToggleDark,
  onLogout,
  onAddCrop,
  onViewListings,
  onViewOrders,
}: {
  profile: ProfileType;
  darkMode?: boolean;
  onToggleDark?: () => void;
  onLogout: () => void;
  onAddCrop?: () => void;
  onViewListings?: () => void;
  onViewOrders?: () => void;
}) {
  const isFarmer = profile.role === "farmer";
  const name = isFarmer ? profile.name : profile.businessName || profile.name || "Buyer Name";
  const roleLabel = isFarmer
    ? `👨‍🌾 Farmer · ${profile.barangay || "Cavite"}`
    : `🛒 Buyer · ${profile.barangay || "Cavite"}`;
  const crops = profile.crops ?? [];

  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <h2>Profile</h2>
        <button className="size-10 rounded-full bg-card border border-border flex items-center justify-center">
          <Share2 size={18} className="text-foreground" />
        </button>
      </header>

      <section className="px-5">
        {/* Profile header */}
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="size-16 rounded-full bg-[#2F7D4F]/10 text-primary flex items-center justify-center">
              <User size={30} />
            </div>
            <button className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card">
              <Camera size={12} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: 18 }} className="truncate">
              {name}
            </p>
            <p className="text-[13px] text-muted-foreground flex items-center gap-1">
              <MapPin size={13} /> {roleLabel}
            </p>
            <p className="text-[13px] text-primary flex items-center gap-1 mt-0.5">
              <BadgeCheck size={13} /> Verified account
            </p>
          </div>
        </div>

        {!isFarmer && (
          <div className="rounded-2xl bg-card border border-border p-4 mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-muted-foreground">Contact info</p>
              {profile.businessType && (
                <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {profile.businessType}
                </span>
              )}
            </div>
            <Detail label="Contact" value={profile.contactPerson ?? profile.name ?? "Buyer Name"} />
            <Detail label="Phone" value={profile.phone || "—"} />
            <Detail label="Email" value={profile.email} />
            {profile.businessName && <Detail label="Business" value={profile.businessName} />}
            {profile.permitNumber && profile.businessName && (
              <Detail label="Permit no." value={profile.permitNumber} />
            )}
          </div>
        )}

        {/* Earnings summary (farmer) */}
        {isFarmer && (
          <div className="rounded-2xl p-4 mt-3 text-white bg-gradient-to-br from-[#2F7D4F] to-[#245f3d]">
            <p className="text-[13px] flex items-center gap-1.5 opacity-90">
              <Wallet size={15} /> Total earnings
            </p>
            <p className="mt-1" style={{ fontSize: 26 }}>
              ₱12,340
            </p>
            <p className="text-[13px] opacity-90 mt-0.5">This month · ₱4,200</p>
          </div>
        )}

        {/* Interactive stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat
            value={isFarmer ? "12" : "8"}
            label={isFarmer ? "Listings" : "Orders"}
            onClick={isFarmer ? onViewListings : onViewOrders}
          />
          <Stat
            value={isFarmer ? "38" : "5"}
            label={isFarmer ? "Sales" : "Farmers"}
            onClick={() => document.getElementById("favorite-farmers")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
          <Stat
            value="4.8★"
            label="Rating"
            onClick={() => document.getElementById("order-history")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
        </div>

        {/* Button for viewing orders (for buyers) is commented out for now, as per the original code. */}
        {/* {!isFarmer && (
          <button
            onClick={onViewOrders}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground mt-3 active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} /> View all orders
          </button>
        )} */}

        {!isFarmer && (
          <div id="favorite-farmers" className="rounded-2xl bg-card border border-border p-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-muted-foreground">Favorite Farmers</p>
              <span className="text-[11px] rounded-full bg-[#2F7D4F]/10 text-primary px-2 py-0.5">3 saved</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Aling Rosa", place: "Silang" },
                { name: "Ka Ben", place: "Naic" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                  <div>
                    <p className="text-[14px]">{item.name}</p>
                    <p className="text-[12px] text-muted-foreground">{item.place}</p>
                  </div>
                  <button className="h-9 px-3 rounded-xl border border-primary text-primary text-[13px]">
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        {/* {!isFarmer && (
          <div id="order-history" className="rounded-2xl bg-card border border-border p-4 mt-3 space-y-2">
            <p className="text-[13px] text-muted-foreground">Notification preferences</p>
            <div className="space-y-1.5 text-[13px] text-foreground">
              <p>🔔 New listings from favorite farmers</p>
              <p>🔔 Price drops on saved crops</p>
              <p>🔔 Order status updates</p>
              <p>🔔 Promotions & deals</p>
            </div>
          </div>
        )} */}

          {/* Payment Methods */}
        {/* {!isFarmer && (
          <div className="rounded-2xl bg-card border border-border p-4 mt-3 space-y-2">
            <p className="text-[13px] text-muted-foreground">Payment methods</p>
            <div className="space-y-1.5 text-[13px] text-foreground">
              <p>💳 Saved payment methods</p>
              <p>💰 Wallet balance</p>
            </div>
          </div>
        )} */}

        {/* Your crops with add CTA */}
        {isFarmer && (
          <div className="rounded-2xl bg-card border border-border p-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-muted-foreground">Your crops</p>
              <button
                onClick={onAddCrop}
                className="flex items-center gap-1 text-[13px] text-primary"
              >
                <Plus size={15} /> Add crop
              </button>
            </div>
            {crops.length === 0 ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="size-11 rounded-full bg-[#2F7D4F]/10 flex items-center justify-center mb-2">
                  <Sprout size={20} className="text-primary" />
                </div>
                <p className="text-[13px] text-muted-foreground max-w-[240px]">
                  You haven't added any crops yet. Start by creating your first
                  listing!
                </p>
                <button
                  onClick={onAddCrop}
                  className="mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-[13px] active:scale-[0.98] transition"
                >
                  + Add crop
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {crops.map((id) => {
                  const c = cropById(id);
                  return (
                    <span
                      key={id}
                      className="rounded-full bg-secondary px-3 py-1 text-[13px]"
                    >
                      {c.emoji} {c.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Grouped menu */}
      <section className="px-5 mt-6 space-y-5">
        <MenuGroup title="Account">
          <Row icon={User} label="Edit profile" />
          <Row icon={KeyRound} label="Change password" />
          <Row icon={CreditCard} label="Payment methods" />
        </MenuGroup>

        <MenuGroup title="Notifications">
          <Row icon={Bell} label="Order updates" />
          <Row icon={Settings} label="Price alerts" />
          <Row icon={Bell} label="Promotions" />
        </MenuGroup>

        {!isFarmer && (
          <MenuGroup title="Favorites">
            <Row icon={Sprout} label="Favorite farmers" />
            <Row icon={Sprout} label="Saved crops" />
          </MenuGroup>
        )}

        <MenuGroup title="Help & support">
          <Row icon={FileQuestion} label="FAQ" />
          <Row icon={HelpCircle} label="Contact us" />
          <Row icon={MessageSquareWarning} label="Report an issue" />
        </MenuGroup>

        <MenuGroup title="Appearance">
          <div className="w-full flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3.5">
            <Moon size={20} className="text-foreground" />
            <span className="flex-1 text-left text-[14px]">Dark mode</span>
            <button
              onClick={onToggleDark}
              role="switch"
              aria-checked={darkMode}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                darkMode ? "bg-primary" : "bg-switch-background"
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </MenuGroup>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#C1613D] text-[#C1613D] px-4 py-3.5 active:scale-[0.99] transition"
        >
          <LogOut size={18} /> Log out
        </button>
      </section>

      <p className="text-center text-[11px] text-muted-foreground mt-6 mb-2">
        Sagana · AgriConnect · v1.0
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[13px] text-right truncate">{value}</span>
    </div>
  );
}

function Stat({
  value,
  label,
  onClick,
}: {
  value: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="rounded-2xl bg-card border border-border p-3 text-center active:scale-[0.97] transition disabled:active:scale-100"
    >
      <p style={{ fontSize: 20 }} className="text-primary">
        {value}
      </p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </button>
  );
}

function MenuGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wide text-muted-foreground mb-2 px-1">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof User;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3.5 active:scale-[0.99] transition"
    >
      <Icon size={20} className="text-foreground" />
      <span className="flex-1 text-left text-[14px]">{label}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}
