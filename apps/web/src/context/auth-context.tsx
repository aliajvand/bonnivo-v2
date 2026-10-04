"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, AuthModalStep, AppUserRole } from "@/types/auth";
import { API_BASE } from "@/lib/api/client";

interface AuthContextType {
  user: UserProfile | null;
  currentRole: AppUserRole;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  activeStep: AuthModalStep;
  setActiveStep: (step: AuthModalStep) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  countdownSeconds: number;
  isTimerActive: boolean;
  requestOtp: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: () => Promise<void>;
  logout: () => void;
  switchRole: (role: AppUserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION_KEY = "bonnivo_auth_user_v1";
const OTP_COUNTDOWN_DURATION = 120; // 2 minutes

// Default demo user seeded ONLY when DEMO_MODE=true and non-production
const defaultDemoUser: UserProfile = {
  id: "usr-demo-01",
  phoneNumber: "09121234567",
  fullName: "علی ایجرندی",
  avatarUrl: "/icons/dog.svg",
  createdAt: "۱۴۰۳/۰۵/۱۰",
  role: "CUSTOMER",
  email: "customer@test.bonyo.local",
};

const isDemoActive = typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(isDemoActive ? defaultDemoUser : null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<AuthModalStep>("PHONE_ENTRY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countdownSeconds, setCountdownSeconds] = useState(OTP_COUNTDOWN_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate user session from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUser(parsed);
        }
      } else if (!isDemoActive) {
        setUser(null);
      }
    } catch {
      // Fallback gracefully
    }
    setIsHydrated(true);
  }, []);

  // Save session updates
  useEffect(() => {
    if (isHydrated) {
      try {
        if (user) {
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
      } catch {
        // Ignore quota
      }
    }
  }, [user, isHydrated]);

  // Reliable, single-interval countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isTimerActive && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownSeconds === 0) {
      setIsTimerActive(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, countdownSeconds]);

  const openAuthModal = useCallback(() => {
    setActiveStep("PHONE_ENTRY");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setActiveStep("PHONE_ENTRY");
  }, []);

  // Request OTP contract - connected to FastAPI /api/v1/auth/otp/request
  const requestOtp = async (phone: string): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = phone.trim();
    // Validate Iranian mobile regex (09xxxxxxxxx or 9xxxxxxxxx)
    const iranPhoneRegex = /^(?:09|9)[0-9]{9}$/;
    if (!iranPhoneRegex.test(cleanPhone)) {
      return { success: false, message: "شماره موبایل وارد شده معتبر نمی‌باشد (فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹)" };
    }
    const formattedPhone = cleanPhone.startsWith("9") ? `0${cleanPhone}` : cleanPhone;

    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedPhone }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        return {
          success: false,
          message: errorData?.detail || "خطا در ارسال کد تایید. لطفاً مجدداً تلاش کنید.",
        };
      }

      setPhoneNumber(formattedPhone);
      setCountdownSeconds(OTP_COUNTDOWN_DURATION);
      setIsTimerActive(true);
      setActiveStep("OTP_VERIFY");
      return { success: true };
    } catch (err) {
      console.error("[Auth] OTP request error:", err);
      return {
        success: false,
        message: "خطای ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی نمایید.",
      };
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdownSeconds > 0 || !phoneNumber) return;
    await requestOtp(phoneNumber);
  };

  // Verify OTP contract - connected to FastAPI /api/v1/auth/otp/verify
  const verifyOtp = async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (code.length !== 5) {
      return { success: false, message: "لطفاً کد تأیید ۵ رقمی را کامل وارد نمایید." };
    }

    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, code }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        return {
          success: false,
          message: errorData?.detail || "کد تأیید نادرست یا منقضی شده است.",
        };
      }

      const tokenData = await res.json();
      const serverUser = tokenData.user;
      if (!serverUser || !tokenData.access_token) {
        return { success: false, message: "پاسخ نامعتبر از سرور احراز هویت." };
      }

      // Sole source of truth: Server user profile
      const authenticatedUser: UserProfile = {
        id: serverUser.id,
        phoneNumber: serverUser.phone_number,
        fullName: serverUser.full_name || "سرپرست پت",
        role: (serverUser.role as AppUserRole) || "CUSTOMER",
        createdAt: serverUser.created_at ? new Date(serverUser.created_at).toLocaleDateString("fa-IR") : new Date().toLocaleDateString("fa-IR"),
      };

      // Store access token
      localStorage.setItem("bonnivo_access_token", tokenData.access_token);
      document.cookie = `bonnivo_access_token=${tokenData.access_token}; path=/; max-age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

      setUser(authenticatedUser);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(authenticatedUser));
      setActiveStep("SUCCESS");

      setTimeout(() => {
        closeAuthModal();
      }, 1500);

      return { success: true };
    } catch (err) {
      console.error("[Auth] OTP verify error:", err);
      return {
        success: false,
        message: "خطا در تایید کد. لطفاً دوباره تلاش نمایید.",
      };
    }
  };

  const logout = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bonnivo_access_token") : null;
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    setUser(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem("bonnivo_access_token");
      document.cookie = "bonnivo_access_token=; path=/; max-age=0;";
    } catch {
      // Ignore
    }
  };

  const switchRole = useCallback((newRole: AppUserRole) => {
    // Security Guard: switchRole is STRICTLY disabled in production and non-demo environments
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
    if (!isDemo) {
      console.warn("[Security] switchRole is blocked: Available only when DEMO_MODE=true in non-production.");
      return;
    }

    setUser((prev) => {
      if (!prev) return null;
      const roleProfiles: Record<AppUserRole, Partial<UserProfile>> = {
        CUSTOMER: {
          fullName: "علی ایجرندی (سرپرست پت)",
          email: "customer@test.bonyo.local",
          role: "CUSTOMER",
        },
        ADMIN: {
          fullName: "مدیر ارشد بونیو (Admin)",
          email: "admin@test.bonyo.local",
          role: "ADMIN",
        },
        VETERINARIAN: {
          fullName: "دکتر آرین پارسا (دامپزشک)",
          email: "vet@test.bonyo.local",
          role: "VETERINARIAN",
          clinicName: "بیمارستان دامپزشکی پایتخت",
        },
        EVENT_ORGANIZER: {
          fullName: "مریم ناصری (برگزارکننده رویداد)",
          email: "organizer@test.bonyo.local",
          role: "EVENT_ORGANIZER",
          organizerName: "باشگاه سلامت حیوانات البرز",
        },
        TRAINER: {
          fullName: "کامران بهرامی (مربی رفتارشناسی)",
          email: "trainer@test.bonyo.local",
          role: "TRAINER",
        },
        SELLER: {
          fullName: "پت‌شاپ مرکزی ونک",
          email: "seller@test.bonyo.local",
          role: "SELLER",
        },
      };

      const updated = {
        ...prev,
        ...roleProfiles[newRole],
        role: newRole,
      };
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole: user?.role || "CUSTOMER",
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        activeStep,
        setActiveStep,
        phoneNumber,
        setPhoneNumber,
        countdownSeconds,
        isTimerActive,
        requestOtp,
        verifyOtp,
        resendOtp,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
