"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[9999] bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300"
        dir="rtl"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>اتصال اینترنت مجدداً برقرار گردید.</span>
      </aside>
    );
  }

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300"
      dir="rtl"
    >
      <svg
        className="w-4 h-4 shrink-0 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L3 3m15.364 2.636L5.636 18.364m0 0a9 9 0 010-12.728m0 0l2.829 2.829"
        />
      </svg>
      <span>ارتباط شما با اینترنت قطع شده است. برخی بخش‌ها ممکن است کار نکنند.</span>
    </aside>
  );
}
