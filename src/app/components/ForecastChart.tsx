import { useMemo, useState } from "react";
import { TrendingUp, ShieldCheck } from "lucide-react";
import { ForecastPoint, forecastConfidence, peso } from "../data";
import { haptic } from "../lib/haptics";

// Hand-rolled SVG chart. We deliberately avoid recharts here: its LineChart
// emitted a persistent "duplicate null key" React warning in this environment
// (see memory: recharts-null-key-forecastchart). A custom SVG gives us the
// same look (grey actual line + bold green forecast + tappable points) with
// full control and no library warnings.

const W = 340;
const H = 156;
const PAD_X = 14;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export function ForecastChart({
  data,
  unit,
}: {
  data: ForecastPoint[];
  unit: string;
}) {
  const [activeIdx, setActiveIdx] = useState(
    Math.max(0, data.findIndex((d) => d.predicted)),
  );
  const active = data[activeIdx] ?? data[data.length - 1];

  const first = data[0].price;
  const last = data[data.length - 1].price;
  const changePct = Math.round(((last - first) / first) * 100);
  const confidence = useMemo(() => forecastConfidence(data), [data]);

  const geo = useMemo(() => {
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || 1;
    const n = data.length;
    const pts = data.map((d, i) => {
      const x = n === 1 ? W / 2 : PAD_X + (i / (n - 1)) * (W - PAD_X * 2);
      const y =
        PAD_TOP + (1 - (d.price - min) / span) * (H - PAD_TOP - PAD_BOTTOM);
      return { x, y, ...d };
    });
    const splitIdx = data.findIndex((d) => d.predicted);
    const actualPts = splitIdx <= 0 ? pts : pts.slice(0, splitIdx);
    // Start the predicted line at the last actual point so the two connect.
    const predictedPts =
      splitIdx <= 0 ? [] : pts.slice(Math.max(0, splitIdx - 1));
    const toPath = (arr: typeof pts) =>
      arr.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
    return {
      pts,
      splitIdx,
      actualPath: toPath(actualPts),
      predictedPath: toPath(predictedPts),
    };
  }, [data]);

  const activePt = geo.pts[activeIdx];
  // The "current date" point that invites tapping = first predicted point.
  const inviteIdx = geo.splitIdx <= 0 ? -1 : geo.splitIdx;

  const conf =
    confidence.level === "High"
      ? { bg: "rgba(47,125,79,0.12)", fg: "#1f5a37" }
      : confidence.level === "Medium"
        ? { bg: "rgba(240,169,62,0.16)", fg: "#8a5a12" }
        : { bg: "rgba(231,111,81,0.14)", fg: "#9c3a25" };

  function selectIdx(i: number) {
    setActiveIdx(i);
    haptic(8);
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[13px] text-muted-foreground">Price forecast</p>
          <p className="text-[13px] text-muted-foreground">
            Tap a point to see the predicted price
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 rounded-full bg-[#2F7D4F]/10 px-2.5 py-1">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-[13px] text-primary">
              {changePct >= 0 ? "+" : ""}
              {changePct}%
            </span>
          </div>
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
            style={{ background: conf.bg, color: conf.fg }}
          >
            <ShieldCheck size={11} /> {confidence.level} confidence
          </span>
        </div>
      </div>

      {active && (
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] leading-none text-[#F0A93E]">
              {peso(active.price)}
            </span>
            <span className="text-[14px] text-muted-foreground">/{unit}</span>
          </div>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            {active.label} · {active.predicted ? "Predicted" : "Actual"}
          </p>
        </div>
      )}

      <div className="h-[156px] -mx-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* actual (thin muted grey, dotted) */}
          <path
            d={geo.actualPath}
            fill="none"
            stroke="#8D99AE"
            strokeWidth={1.75}
            strokeDasharray="2 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* predicted (bold brand green) */}
          <path
            d={geo.predictedPath}
            fill="none"
            stroke="#2F7D4F"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* pulsing "tap me" dot on the current-date (first predicted) point */}
          {inviteIdx >= 0 && geo.pts[inviteIdx] && (
            <circle
              cx={geo.pts[inviteIdx].x}
              cy={geo.pts[inviteIdx].y}
              r={5}
              fill="none"
              stroke="#2F7D4F"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            >
              <animate
                attributeName="r"
                values="5;13;5"
                dur="1.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.9;0;0.9"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          )}

          {/* points + hit targets */}
          {geo.pts.map((p, i) => {
            const color = p.predicted ? "#2F7D4F" : "#8D99AE";
            const isActive = i === activeIdx;
            return (
              <g
                key={p.label}
                onClick={() => selectIdx(i)}
                style={{ cursor: "pointer" }}
              >
                {/* invisible larger tap target */}
                <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5.5 : 3.2}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={isActive ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}

          {/* tooltip popup at the active point */}
          {activePt &&
            (() => {
              const label = `${activePt.label} · ${peso(activePt.price)}/${unit}`;
              const boxW = Math.max(78, label.length * 5.4);
              const boxH = 22;
              let tx = activePt.x - boxW / 2;
              tx = Math.max(2, Math.min(W - boxW - 2, tx));
              let ty = activePt.y - boxH - 10;
              if (ty < 0) ty = activePt.y + 10;
              return (
                <g pointerEvents="none">
                  <rect
                    x={tx}
                    y={ty}
                    width={boxW}
                    height={boxH}
                    rx={7}
                    fill="#2B2B25"
                  />
                  <text
                    x={tx + boxW / 2}
                    y={ty + boxH / 2 + 3.5}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#fff"
                  >
                    {label}
                  </text>
                </g>
              );
            })()}

          {/* x labels: show every other to avoid crowding */}
          {geo.pts.map((p, i) =>
            i % 2 === 0 ? (
              <text
                key={`t-${p.label}`}
                x={p.x}
                y={H - 6}
                textAnchor="middle"
                fontSize={9}
                fill="#7A7566"
              >
                {p.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="flex items-center gap-4 mt-2 justify-center">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-3 h-0.5 rounded-full bg-[#8D99AE]" /> Actual
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-3 h-1 rounded-full bg-primary" /> Predicted
        </span>
      </div>
    </div>
  );
}
