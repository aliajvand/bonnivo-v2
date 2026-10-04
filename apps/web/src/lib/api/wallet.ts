/**
 * Production Wallet API Client
 * Manages balance, transactions, deposits, and withdrawal requests with FastAPI backend.
 */

import { API_BASE } from "./client";

export interface WalletTransactionItem {
  id: string;
  amount_tomans: number;
  transaction_type: "CREDIT_REFUND" | "CREDIT_DEPOSIT" | "DEBIT_PURCHASE" | "WITHDRAWAL";
  reference_id?: string;
  reference_type?: string;
  description: string;
  created_at: string;
}

export interface WalletData {
  id: string;
  balance_tomans: number;
  transactions: WalletTransactionItem[];
}

export interface WithdrawalRequestItem {
  id: string;
  amount_tomans: number;
  card_number: string;
  sheba_number?: string;
  status: "REQUESTED" | "PROCESSING" | "PAID" | "REJECTED";
  admin_note?: string;
  created_at: string;
}

export async function fetchUserWallet(token?: string): Promise<WalletData | null> {
  try {
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/wallet/me`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("[WalletAPI] Error fetching wallet:", err);
    return null;
  }
}

export async function depositWallet(amountTomans: number, token?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/wallet/deposit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ amount_tomans: amountTomans }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: errData.detail || "خطا در برقراری ارتباط با درگاه بانکی" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: "خطای شبکه در ارتباط با سرور" };
  }
}

export async function submitWithdrawalRequest(
  payload: { amount_tomans: number; card_number: string; sheba_number?: string },
  token?: string
): Promise<{ success: boolean; message?: string; item?: WithdrawalRequestItem }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/wallet/withdraw`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: errData.detail || "ثبت درخواست تسویه با خطا مواجه شد." };
    }

    const item = await res.json();
    return { success: true, item };
  } catch (err) {
    return { success: false, message: "خطای شبکه در ثبت درخواست برداشت" };
  }
}
