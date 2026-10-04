"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Bell } from "lucide-react";

interface FeatureFlagGuardProps {
  moduleKey: "trainers" | "boarding" | "events" | "adopt" | "veterinary";
  moduleTitleFa: string;
  descriptionFa?: string;
  children: React.ReactNode;
}

export function FeatureFlagGuard({
  moduleKey,
  moduleTitleFa,
  descriptionFa,
  children,
}: FeatureFlagGuardProps) {
  // By default in production readiness, non-core services are safely paused
  // unless explicitly activated in database feature flags
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function checkFlag() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/feature-flags/status-dict`);
        if (res.ok) {
          const dict = await res.json();
          if (isMounted && typeof dict[moduleKey] === "boolean") {
            setIsEnabled(dict[moduleKey]);
          }
        }
      } catch {
        // Safe default: paused in production mode
        if (isMounted) setIsEnabled(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkFlag();
    return () => {
      isMounted = false;
    };
  }, [moduleKey]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>در حال بررسی وضعیت دسترسی به سرویس...</span>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 dir-rtl" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
            در حال آماده‌سازی و پیاده‌سازی زیرساخت رسمی
          </span>
          <h1 className="text-2xl font-black text-foreground">
            سرویس {moduleTitleFa} به زودی فعال می‌شود
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {descriptionFa ||
              `این سرویس به منظور اتصال به ارائه‌دهندگان دارای مجوز رسمی و سامانه احراز صلاحیت بونیو، در فاز جاری به صورت محدود و کنترل‌شده نگه‌داری می‌شود.`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-subtle border border-border/80 text-xs text-muted-foreground max-w-md mx-auto space-y-2 text-right">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>سیاست شفافیت و تضمین کیفیت بونیو:</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            ما از ارائه داده‌های شبیه‌سازی‌شده یا پذیرش رزروهای غیرواقعی در محیط نهایی خودداری می‌کنیم تا آرامش خاطر و سلامت پت شما همواره تضمین‌شده باقی بماند.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <span>مشاهده فروشگاه و ملزومات پت</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/pets"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-subtle hover:bg-surface-elevated text-foreground text-xs font-medium border border-border transition-colors"
          >
            <span>تکمیل پرونده سلامت پت</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
