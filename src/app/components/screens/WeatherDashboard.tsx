import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Sparkles,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CROPS,
  cropById,
  forecastAdvice,
  forecastConfidence,
  forecastForCrop,
  peso,
  weatherSnapshotForBarangay,
  type WeatherSnapshot,
} from "../../data";
import { ForecastChart } from "../ForecastChart";
import { ForecastRecommendation } from "../ForecastRecommendation";

const ALERT_STYLES: Record<
  WeatherSnapshot["alerts"][number]["severity"],
  { bg: string; border: string; fg: string; badge: string }
> = {
  Critical: { bg: "rgba(230,57,70,0.12)", border: "rgba(230,57,70,0.35)", fg: "#9b1d29", badge: "#E63946" },
  High: { bg: "rgba(244,162,97,0.14)", border: "rgba(244,162,97,0.35)", fg: "#8d4c13", badge: "#F4A261" },
  Medium: { bg: "rgba(255,209,102,0.18)", border: "rgba(255,209,102,0.4)", fg: "#8a6a00", badge: "#FFD166" },
  Low: { bg: "rgba(141,153,174,0.16)", border: "rgba(141,153,174,0.35)", fg: "#4b5563", badge: "#8D99AE" },
};

const RAIN_STYLES = {
  low: { bg: "rgba(42,157,143,0.12)", fg: "#1e7a70" },
  medium: { bg: "rgba(244,162,97,0.14)", fg: "#8d5a12" },
  high: { bg: "rgba(230,57,70,0.12)", fg: "#9b1d29" },
};

export function WeatherWidget({
  barangay,
  onOpenForecast,
  onOpenImpact,
}: {
  barangay: string;
  onOpenForecast: () => void;
  onOpenImpact: () => void;
}) {
  const snapshot = useMemo(() => weatherSnapshotForBarangay(barangay), [barangay]);
  const currentRain = snapshot.current.rainChance;
  const rainTone = currentRain >= 60 ? RAIN_STYLES.high : currentRain >= 30 ? RAIN_STYLES.medium : RAIN_STYLES.low;
  const forecastTip = snapshot.impacts[0];

  return (
    <section className="px-5 mb-5">
      <div className="rounded-[28px] border border-border bg-gradient-to-br from-[#F9F6EF] via-white to-[#EEF5F1] p-4 shadow-[0_12px_40px_rgba(47,125,79,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-muted-foreground flex items-center gap-1">
              <MapPin size={14} /> {snapshot.city}
            </p>
            <h3 className="mt-1">{snapshot.current.emoji} {snapshot.current.temperature}°C</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Feels like {snapshot.current.feelsLike}°C · {snapshot.current.condition}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground">Updated</p>
            <p className="text-[13px]">{snapshot.updatedAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <MiniStat label="Humidity" value={`${snapshot.current.humidity}%`} />
          <MiniStat label="Wind" value={`${snapshot.current.windSpeed} km/h`} />
          <MiniStat label="Rain chance" value={`${currentRain}%`} tone={rainTone} />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#2F7D4F]/15 bg-white/70 px-3 py-2.5">
          <div className="size-9 rounded-xl bg-[#2F7D4F]/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px]">{forecastTip.cropName} price impact is live</p>
            <p className="text-[12px] text-muted-foreground truncate">
              {forecastTip.weatherImpact} · {forecastTip.recommendation} with {Math.round(forecastTip.confidenceScore * 100)}% confidence
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onOpenForecast}
            className="h-11 rounded-xl bg-primary text-primary-foreground text-[13px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            7-day forecast <ArrowRight size={16} />
          </button>
          <button
            onClick={onOpenImpact}
            className="h-11 rounded-xl bg-card border border-border text-[13px] flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            Price impact <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function WeatherDashboard({
  barangay,
  focusSection,
}: {
  barangay: string;
  focusSection?: "forecast" | "impact" | "alerts" | "current";
}) {
  const snapshot = useMemo(() => weatherSnapshotForBarangay(barangay), [barangay]);
  const [selectedCropId, setSelectedCropId] = useState(snapshot.impacts[0]?.cropId ?? CROPS[0].id);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const forecastRef = useRef<HTMLDivElement | null>(null);
  const impactRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const cropDetailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target =
      focusSection === "forecast"
        ? forecastRef.current
        : focusSection === "impact"
          ? impactRef.current
          : focusSection === "alerts"
            ? alertsRef.current
            : currentRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusSection]);

  useEffect(() => {
    cropDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCropId]);

  const selectedCrop = cropById(selectedCropId);
  const selectedForecast = forecastForCrop(selectedCropId);
  const selectedAdvice = forecastAdvice(selectedForecast, selectedCrop.name);
  const selectedConfidence = forecastConfidence(selectedForecast);
  const selectedImpact = snapshot.impacts.find((item) => item.cropId === selectedCropId) ?? snapshot.impacts[0];

  return (
    <div className="h-full overflow-y-auto pb-[92px]">
      <header className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground flex items-center gap-1">
            <CalendarDays size={14} /> Weather dashboard
          </p>
          <h2 className="mt-0.5">Silang, Cavite</h2>
        </div>
        <button className="size-10 rounded-full bg-card border border-border flex items-center justify-center">
          <TriangleAlert size={18} className="text-foreground" />
        </button>
      </header>

      <section ref={currentRef} className="px-5 space-y-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] text-muted-foreground">CURRENT WEATHER</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-[32px] leading-none text-[#F0A93E]">{snapshot.current.temperature}°C</span>
                <span className="text-[13px] text-muted-foreground pb-1">Feels like {snapshot.current.feelsLike}°C</span>
              </div>
              <p className="text-[14px] mt-2">{snapshot.current.emoji} {snapshot.current.condition} · Humidity: {snapshot.current.humidity}%</p>
              <p className="text-[14px] text-muted-foreground mt-0.5">Wind: {snapshot.current.windSpeed} km/h · 🌧️ Rain chance: {snapshot.current.rainChance}%</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                🌅 Sunrise: {snapshot.current.sunrise} · 🌇 Sunset: {snapshot.current.sunset}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">Location</p>
              <p className="text-[13px]">{snapshot.city}</p>
              <p className="text-[12px] text-muted-foreground mt-2">Updated</p>
              <p className="text-[13px]">{snapshot.updatedAt}</p>
            </div>
          </div>
          <button className="mt-3 flex items-center gap-1 text-[13px] text-primary">
            <MapPin size={14} /> Change location
          </button>
        </div>
      </section>

      <section ref={forecastRef} className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3>7-DAY FORECAST</h3>
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <ChevronLeft size={14} /> Swipe to view all 7 days <ChevronRight size={14} />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <div className="grid grid-cols-7 gap-2">
            {snapshot.forecast.map((day) => {
              const tone = day.severity === "high" ? RAIN_STYLES.high : day.severity === "medium" ? RAIN_STYLES.medium : RAIN_STYLES.low;
              return (
                <button
                  key={day.day}
                  className="rounded-2xl border border-border/70 px-1.5 py-3 text-center"
                  style={{ background: tone.bg }}
                >
                  <p className="text-[12px]">{day.day}</p>
                  <p className="text-[18px] leading-none mt-1">{day.icon}</p>
                  <p className="text-[13px] mt-1">{day.high}°</p>
                  <p className="text-[11px] text-muted-foreground">↓{day.low}°</p>
                  <p className="text-[11px] mt-1" style={{ color: tone.fg }}>{day.rainChance}%</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={impactRef} className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3>PRICE IMPACT FORECAST</h3>
          <p className="text-[12px] text-muted-foreground">Based on upcoming weather patterns</p>
        </div>
        <div className="space-y-3">
          {snapshot.impacts.map((impact) => {
            const up = impact.changePercent >= 0;
            const active = impact.cropId === selectedCropId;
            return (
              <button
                key={impact.cropId}
                onClick={() => setSelectedCropId(impact.cropId)}
                className={`w-full rounded-3xl border p-4 text-left transition-colors ${
                  active ? "border-primary bg-[#2F7D4F]/5" : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px]">
                      {impact.emoji} {impact.cropName}
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-1">{impact.weatherImpact}</p>
                  </div>
                  <div className={`text-[18px] ${up ? "text-primary" : "text-[#E76F51]"}`}>
                    {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className={`text-[14px] ${up ? "text-primary" : "text-[#E76F51]"}`}>
                    {up ? "⬆️" : "⬇️"} {impact.changePercent >= 0 ? "+" : ""}{impact.changePercent}%
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    Confidence: {Math.round(impact.confidenceScore * 100)}%
                  </p>
                </div>
                <p className="text-[13px] mt-2 text-muted-foreground leading-relaxed">{impact.rationale}</p>
                <p className="text-[13px] mt-1" style={{ color: up ? "#1f5a37" : "#9c3a25" }}>
                  💡 {impact.tip}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section ref={alertsRef} className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3>WEATHER ALERTS</h3>
          <button className="text-[13px] text-primary">Ask AI about weather impact</button>
        </div>
        <div className="space-y-3">
          {snapshot.alerts.map((alert) => {
            const style = ALERT_STYLES[alert.severity];
            return (
              <div
                key={alert.id}
                className="rounded-3xl border p-4"
                style={{ background: style.bg, borderColor: style.border, color: style.fg }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px]">⚠️ {alert.title}</p>
                    <p className="text-[13px] mt-1 leading-relaxed">{alert.description}</p>
                    <p className="text-[13px] mt-2">🔧 Action: {alert.action}</p>
                    <p className="text-[12px] mt-1 opacity-80">⏰ Issued: {alert.issuedAt}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: style.badge, color: "#fff" }}>
                    {alert.severity}
                  </span>
                </div>
                <button className="mt-3 text-[13px] font-medium flex items-center gap-1">
                  View details <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section ref={cropDetailRef} className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3>CROP DETAIL WITH WEATHER CONTEXT</h3>
          <p className="text-[12px] text-muted-foreground">Tap a crop above to switch</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4 space-y-4">
          <div>
            <p className="text-[16px]">{selectedCrop.emoji} {selectedCrop.name}</p>
            <p className="text-[13px] text-muted-foreground mt-1">by Aling Rosa · {snapshot.city}</p>
          </div>

          <div className="rounded-2xl bg-[#2F7D4F]/5 border border-[#2F7D4F]/15 p-4">
            <p className="text-[13px] text-muted-foreground">PRICE OUTLOOK</p>
            <p className="mt-1 text-[18px]">{selectedAdvice.title}</p>
            <p className="text-[13px] text-muted-foreground mt-1">Current: {peso(selectedForecast[selectedForecast.length - 2]?.price ?? selectedForecast[0].price)} → Predicted: {peso(selectedForecast[selectedForecast.length - 1]?.price ?? selectedForecast[0].price)}</p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <p className="text-[13px] text-muted-foreground">WEATHER IMPACT ANALYSIS</p>
            <div className="mt-2 space-y-2 text-[13px] leading-relaxed">
              <p>🌧️ {selectedImpact?.weatherImpact ?? "Weather impact available"}</p>
              <p>Rainfall and temperature swings can reshape supply in the local market.</p>
              <p>Historical trend: {Math.abs(selectedAdvice.changePct)}% projected change with {selectedConfidence.level.toLowerCase()} confidence.</p>
            </div>
            <div className="mt-3">
              <ForecastRecommendation advice={selectedAdvice} />
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <ForecastChart data={selectedForecast} unit={selectedCrop.unit} />
          </div>

          <div className="rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-muted-foreground">SET PRICE ALERT</p>
              <p className="text-[13px] mt-1">Alert me when price reaches: ₱___ /kg</p>
            </div>
            <button className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-[13px]">
              Set Alert
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: { bg: string; fg: string };
}) {
  return (
    <div className="rounded-2xl border border-border px-3 py-2" style={tone ? { background: tone.bg, color: tone.fg } : undefined}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-[13px] mt-0.5">{value}</p>
    </div>
  );
}
