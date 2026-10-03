/**
 * Production Checkout API Client
 * Sends cart items to FastAPI for atomic inventory reservation, lead-time calculation,
 * coupon verification, and server-side draft order creation.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ReserveItemPayload {
  offer_id: string;
  quantity: number;
  pet_id?: string | null;
}

export interface CheckoutReserveRequest {
  items: ReserveItemPayload[];
  coupon_code?: string | null;
  shipping_address?: string | null;
  shipping_timeslot?: string | null;
}

export interface SplitPackageSummary {
  seller_id: string;
  seller_name: string;
  package_subtotal_tomans: number;
  shipping_fee_tomans: number;
  package_total_tomans: number;
}

export interface CheckoutReserveResult {
  order_id: string;
  status: string;
  total_goods_tomans: number;
  discount_amount_tomans: number;
  total_shipping_tomans: number;
  grand_total_tomans: number;
  coupon_code?: string;
  calculated_lead_time_days: number;
  earliest_delivery_date: string;
  preparation_notice?: string;
  packages: SplitPackageSummary[];
  reservation_expires_at: string;
}

export async function createServerOrderReservation(
  payload: CheckoutReserveRequest,
  token?: string
): Promise<{ success: boolean; data?: CheckoutReserveResult; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/v1/checkout/reserve`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.detail || `خطای سرور در ایجاد رزرو سفارش (${res.status})`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: "عدم برقراری ارتباط با سامانه سفارشات سرور.",
    };
  }
}
