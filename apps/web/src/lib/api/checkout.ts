/**
 * Production Checkout API Client
 * Sends cart items to FastAPI for atomic inventory reservation, lead-time calculation,
 * coupon verification, and server-side draft order creation.
 */

import { API_BASE } from "./client";

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

    const res = await fetch(`${API_BASE}/checkout/reserve`, {
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

export interface PaymentRequestResult {
  order_id: string;
  authority: string;
  payment_url: string;
  amount_tomans: number;
}

export async function requestServerPayment(
  orderId: string,
  callbackUrl?: string,
  token?: string
): Promise<{ success: boolean; data?: PaymentRequestResult; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/payment/request`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        order_id: orderId,
        callback_url: callbackUrl || (typeof window !== "undefined" ? `${window.location.origin}/checkout/callback` : "http://localhost:3000/checkout/callback"),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.detail || `خطا در دریافت لینک پرداخت از درگاه (${res.status})`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "عدم برقراری ارتباط با سامانه درگاه پرداخت.",
    };
  }
}

export interface PaymentVerifyResult {
  order_id: string;
  status: string;
  payment_ref_id: string;
  total_amount_tomans: number;
  message: string;
}

export async function verifyServerPayment(
  authority: string,
  status: string
): Promise<{ success: boolean; data?: PaymentVerifyResult; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE}/payment/verify?Authority=${encodeURIComponent(authority)}&Status=${encodeURIComponent(status)}`,
      {
        headers: { "Accept": "application/json" },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.detail || "تایید تراکنش توسط درگاه بانکی ناموفق بود.",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "خطا در تایید اصالت پرداخت با سرور مرکزی.",
    };
  }
}

export interface ServerCartItem {
  id: string;
  offer_id: string;
  product_id: string;
  product_title: string;
  brand?: string;
  seller_name: string;
  unit_price_tomans: number;
  quantity: number;
  pet_id?: string | null;
  lead_time_days: number;
}

export async function fetchServerCart(
  token?: string
): Promise<{ success: boolean; data?: ServerCartItem[]; error?: string }> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/checkout/cart`, { headers });
    if (!res.ok) return { success: false, error: "Failed to fetch cart" };
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function syncServerCart(
  items: { offer_id: string; quantity: number; pet_id?: string | null }[],
  token?: string
): Promise<{ success: boolean; data?: ServerCartItem[]; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/checkout/cart/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
    });
    if (!res.ok) return { success: false, error: "Failed to sync cart" };
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function clearServerCart(token?: string): Promise<{ success: boolean }> {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/checkout/cart`, { method: "DELETE", headers });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

