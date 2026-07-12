import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { BottomTabBar, Tab } from "./components/BottomTabBar";
import { AuthScreen } from "./components/screens/AuthScreen";
import { PendingApproval } from "./components/screens/PendingApproval";
import { EditBusiness } from "./components/screens/EditBusiness";
import { FarmerHome } from "./components/screens/FarmerHome";
import { BuyerHome } from "./components/screens/BuyerHome";
import { CreateListing } from "./components/screens/CreateListing";
import { ListingDetail } from "./components/screens/ListingDetail";
import { OrderConfirm } from "./components/screens/OrderConfirm";
import { Orders } from "./components/screens/Orders";
import { Profile as ProfileScreen } from "./components/screens/Profile";
import {
  Profile,
  fetchProfile,
  getAccessToken,
  signOutUser,
} from "./lib/api";
import {
  MOCK_LISTINGS,
  MOCK_ORDERS,
  MY_LISTINGS,
  Listing,
  Order,
  OrderStatus,
} from "./data";

type Overlay =
  | { type: "create" }
  | { type: "detail"; listing: Listing }
  | { type: "confirm"; listing: Listing; qty: number; total: number }
  | null;

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  pending: "confirmed",
  confirmed: "completed",
  packed: "shipped",
  shipped: "completed",
  completed: "completed",
  cancelled: "cancelled",
};

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [myListings, setMyListings] = useState<Listing[]>(MY_LISTINGS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  // Restore an existing session on load.
  useEffect(() => {
    (async () => {
      try {
        const t = await getAccessToken();
        if (t) {
          setToken(t);
          setProfile(await fetchProfile(t));
        }
      } catch (e) {
        console.error("Session restore failed:", e);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const allListings = useMemo(() => {
    const extra = myListings.filter(
      (m) => !MOCK_LISTINGS.some((l) => l.id === m.id),
    );
    return [...extra, ...MOCK_LISTINGS];
  }, [myListings]);

  async function onAuthed(p: Profile) {
    setProfile(p);
    setToken(await getAccessToken());
    setTab("home");
  }

  async function logout() {
    await signOutUser();
    setProfile(null);
    setToken(null);
    setOverlay(null);
    setTab("home");
  }

  async function refreshStatus() {
    if (!token) return;
    setRefreshing(true);
    try {
      setProfile(await fetchProfile(token));
    } catch (e) {
      console.error("Status refresh failed:", e);
    } finally {
      setRefreshing(false);
    }
  }

  function openListing(listing: Listing) {
    setOverlay({ type: "detail", listing });
  }

  function placeOrder(listing: Listing, qty: number, total: number) {
    const order: Order = {
      id: "o" + Date.now(),
      listingId: listing.id,
      quantity: qty,
      total,
      status: "pending",
      placedOn: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setOrders((o) => [order, ...o]);
    setOverlay({ type: "confirm", listing, qty, total });
  }

  function advanceOrder(id: string) {
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        const next = NEXT_STATUS[o.status];
        const message =
          next === "confirmed"
            ? "Order confirmed"
            : next === "packed"
              ? "Order packed"
              : next === "shipped"
                ? "Order shipped"
                : "Order marked completed";
        toast.success(message);
        return { ...o, status: next };
      }),
    );
  }

  function cancelOrder(id: string) {
    setOrders((os) =>
      os.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)),
    );
    toast("Order cancelled");
  }

  function renderScreen() {
    if (!profile) return null;
    const role = profile.role;
    switch (tab) {
      case "home":
      case "listings":
        // Buyers only have a Market (home) tab; farmers get a dashboard (home)
        // and a manage-listings (listings) tab.
        if (role !== "farmer") {
          return <BuyerHome listings={allListings} onOpenListing={openListing} />;
        }
        return (
          <FarmerHome
            view={tab === "listings" ? "listings" : "home"}
            listings={myListings}
            pendingOrders={orders.filter((o) => o.status === "pending").length}
            onCreate={() => setOverlay({ type: "create" })}
            onOpenListing={openListing}
            onQuickAction={openListing}
            onGoToListings={() => setTab("listings")}
          />
        );
      case "orders":
        return (
          <Orders
            orders={orders}
            listings={allListings}
            role={role === "farmer" ? "farmer" : "buyer"}
            onAdvance={advanceOrder}
            onCancel={cancelOrder}
            onGoToListings={() => setTab("listings")}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode((d) => !d)}
            onLogout={logout}
            onAddCrop={() => setOverlay({ type: "create" })}
            onViewListings={() => setTab("listings")}
            onViewOrders={() => setTab("orders")}
          />
        );
    }
  }

  function renderOverlay() {
    if (!overlay || !profile) return null;
    if (overlay.type === "create") {
      return (
        <CreateListing
          onBack={() => setOverlay(null)}
          onSubmit={(l) => {
            setMyListings((ls) => [l, ...ls]);
            setOverlay(null);
            toast.success("Listing posted", {
              description: "Buyers in Cavite can now see your harvest.",
            });
          }}
        />
      );
    }
    if (overlay.type === "detail") {
      return (
        <ListingDetail
          listing={overlay.listing}
          role={profile.role === "farmer" ? "farmer" : "buyer"}
          onBack={() => setOverlay(null)}
          onOrder={(qty, total) => placeOrder(overlay.listing, qty, total)}
        />
      );
    }
    if (overlay.type === "confirm") {
      return (
        <OrderConfirm
          listing={overlay.listing}
          qty={overlay.qty}
          total={overlay.total}
          onViewOrders={() => {
            setOverlay(null);
            setTab("orders");
          }}
          onDone={() => setOverlay(null)}
        />
      );
    }
    return null;
  }

  function renderApp() {
    if (booting) {
      return (
        <div className="h-full flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" />
        </div>
      );
    }
    if (!profile) return <AuthScreen onAuthed={onAuthed} />;

    // Business buyers must be approved before they can use the app.
    if (profile.role === "buyer" && profile.status !== "active") {
      if (editingBusiness) {
        return (
          <EditBusiness
            token={token ?? ""}
            profile={profile}
            onBack={() => setEditingBusiness(false)}
            onUpdated={(p) => {
              setProfile(p);
              setEditingBusiness(false);
            }}
          />
        );
      }
      return (
        <PendingApproval
          profile={profile}
          onRefresh={refreshStatus}
          onLogout={logout}
          onEdit={() => setEditingBusiness(true)}
          refreshing={refreshing}
        />
      );
    }

    return (
      <>
        <div className="absolute inset-0">{renderScreen()}</div>
        {overlay && (
          <div className="absolute inset-0 z-20 bg-background">
            {renderOverlay()}
          </div>
        )}
        {!overlay && (
          <BottomTabBar
            active={tab}
            role={profile.role === "farmer" ? "farmer" : "buyer"}
            onChange={setTab}
          />
        )}
      </>
    );
  }

  return (
    <div className="size-full min-h-screen flex items-center justify-center bg-[#E7E1D4] p-4">
      {/* Mobile device frame 390 x 844 */}
      <div
        className={`relative bg-background overflow-hidden shadow-2xl rounded-[40px] border-8 border-[#1c1c18] ${
          darkMode ? "dark" : ""
        }`}
        style={{ width: 390, height: 844 }}
      >
        {renderApp()}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{ style: { borderRadius: 14 } }}
        />
      </div>
    </div>
  );
}
