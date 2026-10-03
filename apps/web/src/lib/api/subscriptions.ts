import {
  PetFoodSubscriptionItem,
  CreateSubscriptionPayload,
  SubscriptionFrequency,
} from "@/types/subscription";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const STORAGE_KEY_SUBSCRIPTIONS = "bonnivo_food_subscriptions_v1";

const defaultDemoSubscriptions: PetFoodSubscriptionItem[] = [
  {
    id: "sub-demo-01",
    userId: "usr-demo-01",
    petId: "pet-milo",
    petName: "میلو",
    productId: "royal-canin-golden-retriever",
    productTitleFa: "غذای خشک سگ بالغ گلدن رتریور رویال کنین",
    weightVariantText: "۱۲ کیلوگرم",
    packageWeightKg: 12.0,
    dailyConsumptionGrams: 350.0,
    unitPriceToman: 4650000,
    frequency: "MONTHLY",
    status: "ACTIVE",
    daysDuration: 34,
    nextDeliveryDate: "۱۴۰۳/۰۸/۲۴",
    deliveryAddress: "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین، کوچه دوم، پلاک ۸",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sub-demo-02",
    userId: "usr-demo-01",
    petId: "pet-bella",
    petName: "بلا",
    productId: "pro-plan-sterilised-cat",
    productTitleFa: "غذای خشک گربه عقیم‌شده پروپلن مدل سالمون",
    weightVariantText: "۳ کیلوگرم",
    packageWeightKg: 3.0,
    dailyConsumptionGrams: 55.0,
    unitPriceToman: 1980000,
    frequency: "EVERY_2_MONTHS",
    status: "ACTIVE",
    daysDuration: 54,
    nextDeliveryDate: "۱۴۰۳/۰۹/۱۰",
    deliveryAddress: "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین، کوچه دوم، پلاک ۸",
    createdAt: new Date().toISOString(),
  },
];

export async function fetchMySubscriptions(): Promise<PetFoodSubscriptionItem[]> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/my`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fallback to local
  }

  if (typeof window !== "undefined") {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS) || "null");
      if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    } catch {
      // Ignore
    }
  }

  return defaultDemoSubscriptions;
}

export async function createSubscription(payload: CreateSubscriptionPayload): Promise<PetFoodSubscriptionItem> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const days = Math.max(7, Math.round((payload.packageWeightKg * 1000) / Math.max(1, payload.dailyConsumptionGrams)));
  const nextDelivery = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const newSub: PetFoodSubscriptionItem = {
    id: `sub-${Date.now()}`,
    userId: "usr-demo-01",
    petId: payload.petId,
    petName: "پت من",
    productId: payload.productId,
    productTitleFa: payload.productTitleFa,
    weightVariantText: payload.weightVariantText,
    packageWeightKg: payload.packageWeightKg,
    dailyConsumptionGrams: payload.dailyConsumptionGrams,
    unitPriceToman: payload.unitPriceToman,
    frequency: payload.frequency,
    status: "ACTIVE",
    daysDuration: days,
    nextDeliveryDate: nextDelivery,
    deliveryAddress: payload.deliveryAddress,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = await fetchMySubscriptions();
      const updated = [newSub, ...existing];
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  return newSub;
}

export async function pauseSubscription(subscriptionId: string): Promise<boolean> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/${subscriptionId}/pause`, {
      method: "PUT",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }

  if (typeof window !== "undefined") {
    try {
      const stored = await fetchMySubscriptions();
      const updated = stored.map((s) => (s.id === subscriptionId ? { ...s, status: "PAUSED" as const } : s));
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(updated));
      return true;
    } catch {
      // Ignore
    }
  }
  return true;
}

export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/${subscriptionId}/resume`, {
      method: "PUT",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }

  if (typeof window !== "undefined") {
    try {
      const stored = await fetchMySubscriptions();
      const updated = stored.map((s) => (s.id === subscriptionId ? { ...s, status: "ACTIVE" as const } : s));
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(updated));
      return true;
    } catch {
      // Ignore
    }
  }
  return true;
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const authStored = typeof window !== "undefined" ? localStorage.getItem("bonnivo_auth_token") : null;
  const headers: Record<string, string> = {};
  if (authStored) headers["Authorization"] = `Bearer ${authStored}`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/${subscriptionId}/cancel`, {
      method: "PUT",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }

  if (typeof window !== "undefined") {
    try {
      const stored = await fetchMySubscriptions();
      const updated = stored.map((s) => (s.id === subscriptionId ? { ...s, status: "CANCELLED" as const } : s));
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(updated));
      return true;
    } catch {
      // Ignore
    }
  }
  return true;
}
