export type Role = "farmer" | "buyer";

export type Crop = {
  id: string;
  name: string;
  emoji: string;
  image: string;
  unit: string; // e.g. "kg", "sack"
};

export type ForecastPoint = {
  label: string; // short date e.g. "Jul 10"
  date: string; // full date
  price: number;
  predicted: boolean;
};

export type Listing = {
  id: string;
  cropId: string;
  farmer: string;
  barangay: string;
  quantity: number;
  unit: string;
  price: number; // per unit in PHP
  harvestDate: string;
  image: string;
  own?: boolean;
  createdAt?: string; // ISO timestamp; used for the "NEW" badge
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  listingId: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  placedOn: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerLocation?: string;
  createdAt?: string;
};

export const CROPS: Crop[] = [
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "eggplant",
    name: "Eggplant",
    emoji: "🍆",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "rice",
    name: "Palay (Rice)",
    emoji: "🌾",
    unit: "sack",
    image:
      "https://images.unsplash.com/photo-1536153635972-1fc2e818f642?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "banana",
    name: "Saba Banana",
    emoji: "🍌",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "pepper",
    name: "Bell Pepper",
    emoji: "🫑",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1585159079680-8dec029b76ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export const BARANGAYS = [
  "Silang",
  "Amadeo",
  "Indang",
  "Alfonso",
  "Tagaytay",
  "Mendez",
  "General Trias",
  "Naic",
];

export function cropById(id: string): Crop {
  return CROPS.find((c) => c.id === id) ?? CROPS[0];
}

// Deterministic-ish forecast generator: 5 historical + 5 predicted points.
export function forecastForCrop(cropId: string): ForecastPoint[] {
  const seedMap: Record<string, number> = {
    tomato: 42,
    eggplant: 55,
    rice: 1850,
    banana: 38,
    pepper: 120,
  };
  const base = seedMap[cropId] ?? 50;
  const labels = [
    "Jun 20",
    "Jun 27",
    "Jul 4",
    "Jul 11",
    "Jul 18",
    "Jul 25",
    "Aug 1",
    "Aug 8",
    "Aug 15",
    "Aug 22",
  ];
  // Per-crop wobble so different crops trend up, down, or hold flat — this makes
  // the sell-now-vs-hold recommendation vary in a realistic way.
  const WOBBLES: Record<string, number[]> = {
    // rising → "hold"
    tomato: [0, 0.06, -0.03, 0.02, 0.09, 0.14, 0.19, 0.16, 0.24, 0.31],
    // falling → "sell now"
    eggplant: [0.02, 0.05, 0.01, 0.04, 0.03, -0.04, -0.09, -0.14, -0.18, -0.24],
    // gently rising → "hold"
    banana: [0, 0.02, 0.05, 0.03, 0.06, 0.09, 0.11, 0.13, 0.15, 0.18],
    // roughly flat → "steady"
    rice: [0, 0.01, -0.01, 0.02, 0.01, 0.0, 0.02, -0.01, 0.01, 0.02],
    // falling → "sell now"
    pepper: [0.05, 0.08, 0.03, 0.02, 0.0, -0.05, -0.1, -0.13, -0.17, -0.2],
  };
  const wobble =
    WOBBLES[cropId] ?? [0, 0.06, -0.03, 0.02, 0.09, 0.14, 0.19, 0.16, 0.24, 0.31];
  return labels.map((label, i) => {
    const price = Math.round(base * (1 + wobble[i]));
    return {
      label,
      date: `2026 ${label}`,
      price,
      predicted: i >= 4,
    };
  });
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "l1",
    cropId: "tomato",
    farmer: "Aling Rosa",
    barangay: "Silang",
    quantity: 120,
    unit: "kg",
    price: 45,
    harvestDate: "Jul 12, 2026",
    image: CROPS[0].image,
  },
  {
    id: "l2",
    cropId: "eggplant",
    farmer: "Mang Tonyo",
    barangay: "Indang",
    quantity: 80,
    unit: "kg",
    price: 58,
    harvestDate: "Jul 14, 2026",
    image: CROPS[1].image,
  },
  {
    id: "l3",
    cropId: "rice",
    farmer: "Ka Ben",
    barangay: "Naic",
    quantity: 25,
    unit: "sack",
    price: 1950,
    harvestDate: "Jul 20, 2026",
    image: CROPS[2].image,
  },
  {
    id: "l4",
    cropId: "banana",
    farmer: "Aling Rosa",
    barangay: "Silang",
    quantity: 200,
    unit: "kg",
    price: 40,
    harvestDate: "Jul 11, 2026",
    image: CROPS[3].image,
  },
  {
    id: "l5",
    cropId: "pepper",
    farmer: "Nanay Cely",
    barangay: "Amadeo",
    quantity: 60,
    unit: "kg",
    price: 130,
    harvestDate: "Jul 16, 2026",
    image: CROPS[4].image,
  },
  {
    id: "l6",
    cropId: "tomato",
    farmer: "Kuya Jun",
    barangay: "Alfonso",
    quantity: 90,
    unit: "kg",
    price: 48,
    harvestDate: "Jul 18, 2026",
    image: CROPS[0].image,
  },
];

// Listings owned by the logged-in farmer persona.
export const MY_LISTINGS: Listing[] = [
  { ...MOCK_LISTINGS[0], own: true },
  { ...MOCK_LISTINGS[3], own: true },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    listingId: "l2",
    quantity: 20,
    total: 1160,
    status: "confirmed",
    placedOn: "Jul 8, 2026",
    buyerName: "Juan Dela Cruz",
    buyerPhone: "0912-345-6789",
    buyerLocation: "Barangay Silang, Cavite",
    createdAt: "2026-07-08T09:10:00.000Z",
  },
  {
    id: "o2",
    listingId: "l5",
    quantity: 10,
    total: 1300,
    status: "completed",
    placedOn: "Jul 2, 2026",
    buyerName: "Maria Santos",
    buyerPhone: "0917-888-1122",
    buyerLocation: "Indang, Cavite",
    createdAt: "2026-07-02T14:40:00.000Z",
  },
];

export function peso(n: number): string {
  return "₱" + n.toLocaleString("en-PH");
}

// ---- Sell-now-vs-hold recommendation engine ----
export type Advice = {
  action: "sell" | "hold" | "steady";
  title: string;
  detail: string;
  changePct: number; // projected % change from today to end of forecast
};

// Compares the latest actual price against the final predicted price and turns
// that trend into a plain-language recommendation for the farmer.
export function forecastAdvice(
  data: ForecastPoint[],
  cropName = "this crop",
): Advice {
  const actuals = data.filter((d) => !d.predicted);
  const predicted = data.filter((d) => d.predicted);
  const now = actuals[actuals.length - 1]?.price ?? data[0].price;
  const future = predicted[predicted.length - 1]?.price ?? now;
  const changePct = Math.round(((future - now) / now) * 100);
  const crop = cropName.toLowerCase();

  if (changePct >= 5) {
    return {
      action: "hold",
      title: "Hold — prices are rising",
      detail: `${cropName} is projected to climb about ${changePct}% over the coming weeks. Consider holding part of your harvest to sell later at a better price.`,
      changePct,
    };
  }
  if (changePct <= -5) {
    return {
      action: "sell",
      title: "Sell now — prices are falling",
      detail: `${cropName} is projected to drop about ${Math.abs(
        changePct,
      )}% soon. Selling ${crop} now locks in today's higher price.`,
      changePct,
    };
  }
  return {
    action: "steady",
    title: "Steady — prices are stable",
    detail: `${cropName} prices look steady (about ${
      changePct >= 0 ? "+" : ""
    }${changePct}%). It's a fair time to sell whenever you're ready.`,
    changePct,
  };
}

// Confidence in the forecast, derived from how consistent (monotonic) the
// predicted trajectory is. A steady one-directional trend → High confidence;
// a choppy one → Medium/Low.
export type Confidence = { level: "High" | "Medium" | "Low"; score: number };

export function forecastConfidence(data: ForecastPoint[]): Confidence {
  const predicted = data.filter((d) => d.predicted);
  if (predicted.length < 2) return { level: "Medium", score: 0.6 };
  const deltas = predicted
    .slice(1)
    .map((p, i) => p.price - predicted[i].price);
  const positive = deltas.filter((d) => d > 0).length;
  const negative = deltas.filter((d) => d < 0).length;
  // Fraction of steps that agree with the dominant direction.
  const agreement = Math.max(positive, negative) / deltas.length;
  const score = Math.round(agreement * 100) / 100;
  const level = agreement >= 0.85 ? "High" : agreement >= 0.6 ? "Medium" : "Low";
  return { level, score };
}

// Days between now and a harvest date string like "Jul 12, 2026".
// Returns a human label + whether it's in the past.
export function harvestInfo(harvestDate: string): {
  days: number;
  label: string;
  past: boolean;
} {
  const target = new Date(harvestDate);
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(target) - startOfDay(now)) / 86_400_000,
  );
  if (Number.isNaN(diffDays)) return { days: 0, label: "Harvest date", past: false };
  if (diffDays === 0) return { days: 0, label: "Harvest today", past: false };
  if (diffDays > 0)
    return {
      days: diffDays,
      label: `Harvest in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
      past: false,
    };
  const ago = Math.abs(diffDays);
  return {
    days: diffDays,
    label: `Harvested ${ago} day${ago === 1 ? "" : "s"} ago`,
    past: true,
  };
}

// True if the listing was created within the last 24 hours.
export function isNewListing(listing: Listing): boolean {
  if (!listing.createdAt) return false;
  return Date.now() - new Date(listing.createdAt).getTime() < 86_400_000;
}

// "Today" / "Yesterday" / "N days ago" for an order's placed date. Helps
// farmers prioritise the orders that have been waiting longest.
export function daysSince(dateStr: string): string {
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return "";
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export type WeatherDay = {
  day: string;
  date: string;
  icon: string;
  high: number;
  low: number;
  rainChance: number;
  condition: string;
  severity: "low" | "medium" | "high";
};

export type WeatherAlert = {
  id: string;
  type: "TYPHOON" | "HEAVY_RAIN" | "HEATWAVE" | "COLD_SNAP" | "WIND_ADVISORY";
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  action: string;
  issuedAt: string;
  startDate: string;
  endDate: string;
};

export type PriceImpact = {
  cropId: string;
  cropName: string;
  emoji: string;
  currentPrice: number;
  predictedPrice: number;
  changePercent: number;
  direction: "UP" | "DOWN" | "STABLE";
  recommendation: "HOLD" | "SELL" | "WAIT";
  confidenceScore: number;
  weatherImpact: string;
  rationale: string;
  tip: string;
  weatherWindow: string;
};

export type WeatherSnapshot = {
  barangay: string;
  city: string;
  updatedAt: string;
  current: {
    emoji: string;
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    rainChance: number;
    sunrise: string;
    sunset: string;
  };
  forecast: WeatherDay[];
  alerts: WeatherAlert[];
  impacts: PriceImpact[];
};

function hashText(value: string): number {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function weatherSnapshotForBarangay(barangay: string): WeatherSnapshot {
  const seed = hashText(barangay || "Silang");
  const offset = seed % 4;
  const temperature = 31 + offset;
  const feelsLike = temperature + 3;
  const humidity = 74 + (seed % 8);
  const windSpeed = 10 + (seed % 6);
  const rainChance = 18 + (seed % 4) * 7;

  const forecastTemplates: Omit<WeatherDay, "date">[] = [
    { day: "Mon", icon: "☀️", high: 32, low: 24, rainChance: 10, condition: "Clear sky", severity: "low" },
    { day: "Tue", icon: "⛅", high: 30, low: 22, rainChance: 30, condition: "Partly cloudy", severity: "medium" },
    { day: "Wed", icon: "🌧️", high: 28, low: 23, rainChance: 80, condition: "Heavy rain", severity: "high" },
    { day: "Thu", icon: "🌧️", high: 27, low: 22, rainChance: 70, condition: "Heavy rain", severity: "high" },
    { day: "Fri", icon: "☀️", high: 31, low: 23, rainChance: 15, condition: "Sunny", severity: "low" },
    { day: "Sat", icon: "☀️", high: 32, low: 24, rainChance: 10, condition: "Clear sky", severity: "low" },
    { day: "Sun", icon: "⛅", high: 30, low: 22, rainChance: 25, condition: "Cloudy", severity: "medium" },
  ];

  const forecast = forecastTemplates.map((entry, index) => ({
    ...entry,
    date: `Jul ${14 + index}, 2026`,
    high: entry.high + (seed % 2),
    low: entry.low + (seed % 2),
    rainChance: Math.max(5, Math.min(95, entry.rainChance + (seed % 5) - 2)),
  }));

  const alerts: WeatherAlert[] = [
    {
      id: "heavy-rain",
      type: "HEAVY_RAIN",
      severity: "High",
      title: "Heavy rain warning: Jul 16-18",
      description: "Protect your crops from flooding and waterlogging.",
      action: "Clear drainage systems. Harvest early if possible.",
      issuedAt: "2 hours ago",
      startDate: "Jul 16, 2026",
      endDate: "Jul 18, 2026",
    },
    {
      id: "heatwave",
      type: "HEATWAVE",
      severity: "Medium",
      title: "Heatwave advisory: Jul 20-22",
      description: "Irrigate early morning to reduce heat stress.",
      action: "Water crops before 8:00 AM.",
      issuedAt: "1 day ago",
      startDate: "Jul 20, 2026",
      endDate: "Jul 22, 2026",
    },
  ];

  const impacts: PriceImpact[] = [
    {
      cropId: "tomato",
      cropName: "Tomato",
      emoji: "🍅",
      currentPrice: 45,
      predictedPrice: 48.6,
      changePercent: 8,
      direction: "UP",
      recommendation: "HOLD",
      confidenceScore: 0.85,
      weatherImpact: "Rain expected Jul 15-17",
      rationale: "Rain may reduce supply and push prices higher.",
      tip: "Hold your stock for better prices.",
      weatherWindow: "Jul 15-17",
    },
    {
      cropId: "pepper",
      cropName: "Bell Pepper",
      emoji: "🫑",
      currentPrice: 130,
      predictedPrice: 114.4,
      changePercent: -12,
      direction: "DOWN",
      recommendation: "SELL",
      confidenceScore: 0.82,
      weatherImpact: "Heatwave expected Jul 20-22",
      rationale: "Heat can speed ripening and create oversupply.",
      tip: "Sell now before prices fall.",
      weatherWindow: "Jul 20-22",
    },
    {
      cropId: "banana",
      cropName: "Saba Banana",
      emoji: "🍌",
      currentPrice: 40,
      predictedPrice: 46,
      changePercent: 15,
      direction: "UP",
      recommendation: "HOLD",
      confidenceScore: 0.7,
      weatherImpact: "Typhoon risk Jul 18-19",
      rationale: "Supply disruption may push prices up.",
      tip: "Hold part of your harvest for higher prices.",
      weatherWindow: "Jul 18-19",
    },
    {
      cropId: "eggplant",
      cropName: "Eggplant",
      emoji: "🍆",
      currentPrice: 58,
      predictedPrice: 54,
      changePercent: -7,
      direction: "DOWN",
      recommendation: "SELL",
      confidenceScore: 0.74,
      weatherImpact: "Rain expected Jul 16-18",
      rationale: "Moist conditions can accelerate supply.",
      tip: "Sell soon before market prices soften.",
      weatherWindow: "Jul 16-18",
    },
  ];

  return {
    barangay: barangay || "Silang",
    city: `${barangay || "Silang"}, Cavite`,
    updatedAt: "6:00 AM today",
    current: {
      emoji: "🌤️",
      temperature,
      feelsLike,
      condition: "Clear sky",
      humidity,
      windSpeed,
      rainChance,
      sunrise: "5:36 AM",
      sunset: "6:28 PM",
    },
    forecast,
    alerts,
    impacts,
  };
}
