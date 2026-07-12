import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  LucideIcon,
} from "lucide-react";
import { Advice } from "../data";

// Status semantics (per design spec):
//   Hold     → prices rising, wait → GREEN (success)
//   Sell now → prices falling, act → RED-ORANGE (danger)
//   Steady   → stable → GREY (neutral)
// Text tones are darkened for WCAG AA contrast on the tinted backgrounds.
const STYLES: Record<
  Advice["action"],
  { bg: string; border: string; text: string; icon: LucideIcon; badge: string }
> = {
  hold: {
    bg: "rgba(47,125,79,0.12)",
    border: "rgba(47,125,79,0.4)",
    text: "#1f5a37",
    icon: ArrowUp,
    badge: "#2F7D4F",
  },
  sell: {
    bg: "rgba(231,111,81,0.14)",
    border: "rgba(231,111,81,0.45)",
    text: "#9c3a25",
    icon: ArrowDown,
    badge: "#E76F51",
  },
  steady: {
    bg: "rgba(141,153,174,0.16)",
    border: "rgba(141,153,174,0.5)",
    text: "#48505e",
    icon: ArrowUpDown,
    badge: "#5c6575",
  },
};

// Full-width recommendation card (used on the farmer home + listing detail).
export function ForecastRecommendation({ advice }: { advice: Advice }) {
  const s = STYLES[advice.action];
  const Icon = s.icon;
  const Trend =
    advice.changePct > 0 ? TrendingUp : advice.changePct < 0 ? TrendingDown : Minus;
  return (
    <div
      className="rounded-2xl border p-3.5"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <div className="flex items-center gap-2">
        <div
          className="size-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: s.badge, color: "#fff" }}
        >
          <Icon size={17} />
        </div>
        <p className="flex-1" style={{ color: s.text }}>
          {advice.title}
        </p>
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]"
          style={{ background: "#fff", color: s.badge }}
        >
          <Trend size={13} />
          {advice.changePct >= 0 ? "+" : ""}
          {advice.changePct}%
        </span>
      </div>
      <p className="text-[13px] mt-2 leading-relaxed" style={{ color: s.text }}>
        {advice.detail}
      </p>
    </div>
  );
}

// Compact pill (used on listing cards).
export function AdviceBadge({ advice }: { advice: Advice }) {
  const s = STYLES[advice.action];
  const label =
    advice.action === "sell"
      ? "Sell now"
      : advice.action === "hold"
        ? "Hold"
        : "Steady";
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
      style={{ background: s.bg, color: s.badge }}
    >
      <Icon size={11} /> {label}
    </span>
  );
}
