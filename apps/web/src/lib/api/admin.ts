/**
 * Bonnivo Admin API Client
 * Secure communication with /api/v1/admin and /api/v1/admin/auth
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active?: boolean;
  last_login_at?: string;
  created_at?: string;
}

export interface AdminLoginResult {
  status: string;
  message: string;
  csrf_token: string;
  token?: string;
  admin: AdminUser;
}

export async function adminLogin(
  usernameOrEmail: string,
  password: string,
  rememberMe: boolean = false
): Promise<AdminLoginResult> {
  const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send and receive httpOnly cookies
    body: JSON.stringify({
      username_or_email: usernameOrEmail,
      password: password,
      remember_me: rememberMe,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || "نام کاربری یا گذرواژه نادرست است.";
    throw new Error(message);
  }

  const data: AdminLoginResult = await res.json();
  if (typeof window !== "undefined" && data.token) {
    // Also store token in sessionStorage as fallback for client fetch headers
    sessionStorage.setItem("bonnivo_admin_token", data.token);
    sessionStorage.setItem("bonnivo_admin_csrf", data.csrf_token);
    sessionStorage.setItem("bonnivo_admin_user", JSON.stringify(data.admin));
  }
  return data;
}

export async function adminLogout(): Promise<void> {
  try {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("bonnivo_admin_token") : null;
    await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
  } finally {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("bonnivo_admin_token");
      sessionStorage.removeItem("bonnivo_admin_csrf");
      sessionStorage.removeItem("bonnivo_admin_user");
    }
  }
}

export async function adminGetMe(): Promise<AdminUser | null> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("bonnivo_admin_token") : null;
  const res = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function adminForgotPassword(usernameOrEmail: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username_or_email: usernameOrEmail }),
  });
  const data = await res.json().catch(() => ({}));
  return data.message || "در صورت وجود حساب کاربری، دستورالعمل ارسال شد.";
}

export async function adminGetAuditLogs(limit: number = 50) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("bonnivo_admin_token") : null;
  const res = await fetch(`${API_BASE_URL}/admin/auth/audit-logs?limit=${limit}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) return [];
  return res.json();
}
