import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Minus,
  Plus,
  Sparkles,
  MapPin,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  BARANGAYS,
  CROPS,
  Listing,
  cropById,
  forecastForCrop,
} from "../../data";
import { haptic } from "../../lib/haptics";

export function CreateListing({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (l: Listing) => void;
}) {
  const [cropId, setCropId] = useState(CROPS[0].id);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [barangay, setBarangay] = useState(BARANGAYS[0]);
  const [locating, setLocating] = useState(false);

  const crop = cropById(cropId);
  const valid = quantity && price && harvestDate;

  // Fill the price from the latest predicted forecast value for this crop.
  function suggestPrice() {
    const data = forecastForCrop(cropId);
    const nextPredicted = data.find((d) => d.predicted) ?? data[data.length - 1];
    setPrice(String(nextPredicted.price));
    haptic(8);
  }

  function stepQuantity(delta: number) {
    const next = Math.max(0, (Number(quantity) || 0) + delta);
    setQuantity(String(next));
    haptic(6);
  }

  // Best-effort GPS detect. Without a geocoding service we pick the nearest
  // demo barangay deterministically from the coordinates so it feels real.
  function detectLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    haptic(8);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const idx =
          Math.abs(Math.round(pos.coords.latitude * 1000 + pos.coords.longitude)) %
          BARANGAYS.length;
        setBarangay(BARANGAYS[idx]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  function submit() {
    if (!valid) return;
    haptic([10, 30, 10]);
    onSubmit({
      id: "l" + Date.now(),
      cropId,
      farmer: "Aling Rosa",
      barangay,
      quantity: Number(quantity),
      unit: crop.unit,
      price: Number(price),
      harvestDate: new Date(harvestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      image: crop.image,
      own: true,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-5 pt-14 pb-3 flex items-center gap-3 border-b border-border">
        <button onClick={onBack} className="-ml-1">
          <ArrowLeft size={24} />
        </button>
        <h3>New listing</h3>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <label className="text-[13px]">Photo</label>
          <div className="mt-2 rounded-2xl overflow-hidden h-40 bg-muted relative">
            <ImageWithFallback
              src={crop.image}
              alt={crop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <span className="flex items-center gap-2 text-white text-[13px] bg-black/30 rounded-full px-3 py-1.5">
                <Camera size={16} /> Using {crop.name} photo
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[13px]">Crop</label>
          <div className="mt-2 flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
            {CROPS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCropId(c.id);
                  haptic(6);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] border transition-colors ${
                  cropId === c.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Quantity (${crop.unit})`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepQuantity(-1)}
                className="size-12 shrink-0 rounded-xl border border-border flex items-center justify-center active:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter amount"
                className="input text-center"
              />
              <button
                onClick={() => stepQuantity(1)}
                className="size-12 shrink-0 rounded-xl border border-border flex items-center justify-center active:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
          </Field>
        </div>

        <Field
          label={`Price / ${crop.unit} (₱)`}
          action={
            <button
              onClick={suggestPrice}
              className="flex items-center gap-1 text-[12px] text-primary"
            >
              <Sparkles size={13} /> Suggest based on forecast
            </button>
          }
        >
          <input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter amount"
            className="input"
          />
        </Field>

        <Field label="Harvest date">
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            className="input"
          />
        </Field>

        <Field
          label="Barangay"
          action={
            <button
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1 text-[12px] text-primary disabled:opacity-60"
            >
              {locating ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <MapPin size={13} />
              )}
              {locating ? "Detecting…" : "Use my location"}
            </button>
          }
        >
          <select
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            className="input"
          >
            {BARANGAYS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="px-5 pt-3 pb-6 border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={submit}
          disabled={!valid}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99] transition"
        >
          📤 Post Listing Now
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: var(--input-background);
          padding: 0 14px;
          font-size: 14px;
          outline: none;
          color: var(--foreground);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[13px]">{label}</label>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
