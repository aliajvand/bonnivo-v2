/**
 * Unified API Client Configuration (Bonnivo Ecosystem)
 * Guarantees API_BASE always includes '/api/v1' without duplicate trailing slashes.
 */

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const cleanUrl = rawUrl.replace(/\/+$/, "");

export const API_BASE = cleanUrl.endsWith("/api/v1")
  ? cleanUrl
  : `${cleanUrl}/api/v1`;

export const API_BASE_URL = API_BASE;
