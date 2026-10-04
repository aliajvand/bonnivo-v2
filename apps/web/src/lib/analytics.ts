/**
 * Bonyo Telemetry & Analytics Event Tracker
 * Source of truth: docs/11-analytics-plan.md
 */

export type AnalyticsEventMap = {
  // Identity & Onboarding
  user_otp_requested: { phone_masked: string };
  user_otp_verified: { user_id: string; is_new_user: boolean };
  pet_profile_created: { pet_id: string; species: string; breed: string; has_weight: boolean };

  // Daily Pet Care
  care_task_completed: { pet_id: string; task_id: string; category: string; duration_minutes?: number };
  care_day_completed: { pet_id: string; total_tasks: number };
  reminder_sms_dispatched: { user_id: string; pet_id: string; reminder_type: string };

  // Commerce & Pet-Connected Checkout
  product_viewed: { product_id: string; category_slug: string; brand?: string };
  cart_item_added: { product_id: string; seller_id: string; pet_id?: string; price_toman: number };
  checkout_initiated: { cart_id?: string; total_items: number; split_sellers_count: number };
  inventory_locked: { order_id: string; lock_duration_minutes: number };
  payment_completed: { order_id: string; amount_toman: number; commission_toman: number };
  buy_again_clicked: { pet_id: string; product_id: string; days_since_last_order?: number };

  // QR Passport & Safety
  qr_passport_scanned: { qr_token: string; is_lost_active: boolean };
  lost_pet_toggled: { pet_id: string; has_custom_message: boolean };
  emergency_contact_dialed: { qr_token: string };
};

export type EventName = keyof AnalyticsEventMap;

export interface EventEnvelope<T extends EventName = EventName> {
  event: T;
  payload: AnalyticsEventMap[T];
  timestamp: string;
  sessionId: string;
}

let activeSessionId: string = "";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr-session";
  if (!activeSessionId) {
    activeSessionId = `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  }
  return activeSessionId;
}

// In-memory ledger accessible on window for automated verification
declare global {
  interface Window {
    __bonnivo_events__?: EventEnvelope[];
  }
}

export function trackEvent<T extends EventName>(
  eventName: T,
  payload: AnalyticsEventMap[T]
): EventEnvelope<T> {
  const envelope: EventEnvelope<T> = {
    event: eventName,
    payload,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  if (typeof window !== "undefined") {
    // 1. In-browser inspection ledger
    if (!window.__bonnivo_events__) {
      window.__bonnivo_events__ = [];
    }
    window.__bonnivo_events__.push(envelope);

    // 2. Dev console output with styling
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `%c[BONNIVO ANALYTICS] %c${eventName}`,
        "color: #0F766E; font-weight: bold;",
        "color: #D97706; font-weight: bold;",
        payload
      );
    }

    // 3. Dispatch DOM event for testing & external monitoring
    window.dispatchEvent(
      new CustomEvent("bonnivo:analytics", { detail: envelope })
    );

    // 4. Non-blocking beacon/fetch to backend ingest if available
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/v1/analytics/events",
          JSON.stringify(envelope)
        );
      }
    } catch {
      // Ignored for offline/mock safety
    }
  }

  return envelope;
}
