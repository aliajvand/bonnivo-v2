"use client";

import React, { useState, useEffect } from "react";
import {
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Store,
  Stethoscope,
  GraduationCap,
  Home,
  Calendar,
  Wallet,
  FileText,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureFlagItem {
  moduleKey: string;
  nameFa: string;
  description: string;
  isEnabled: boolean;
  category: "COMMERCE" | "HEALTH" | "SERVICES" | "COMMUNITY" | "FINANCE";
  iconName: string;
  updatedAt: string;
  impactLevel: "HIGH" | "MEDIUM" | "LOW";
}

const INITIAL_FLAGS: FeatureFlagItem[] = [
  {
    moduleKey: "shop",
    nameFa: "فروشگاه آنلاین و ملزومات",
    description: "کاتالوگ محصولات، سبد خرید، کدهای تخفیف، انتخاب زمان تحویل و تسویه حساب بانکی",
    isEnabled: true,
    category: "COMMERCE",
    iconName: "Store",
    updatedAt: "امروز، ۱۲:۳۰",
    impactLevel: "HIGH",
  },
  {
    moduleKey: "veterinary",
    nameFa: "خدمات دامپزشکی و کلینیک‌ها",
    description: "جستجوی مراکز درمانی، رزرواسیون نوبت آنلاین، استرداد پلکانی و پرونده بالینی",
    isEnabled: true,
    category: "HEALTH",
    iconName: "Stethoscope",
    updatedAt: "دیروز",
    impactLevel: "HIGH",
  },
  {
    moduleKey: "trainers",
    nameFa: "مربیان و رفتارشناسی پت",
    description: "فهرست مربیان تاییدشده، جلسات اصلاح رفتار، تمرینات خانگی و گزارش پیشرفت",
    isEnabled: true,
    category: "SERVICES",
    iconName: "GraduationCap",
    updatedAt: "۳ روز پیش",
    impactLevel: "MEDIUM",
  },
  {
    moduleKey: "boarding",
    nameFa: "پانسیون و هتلینگ حیوانات",
    description: "رزرو اقامتگاه‌های دارای مجوز با الزامات واکسیناسیون و نظارت تصویری",
    isEnabled: true,
    category: "SERVICES",
    iconName: "Home",
    updatedAt: "هفته گذشته",
    impactLevel: "MEDIUM",
  },
  {
    moduleKey: "events",
    nameFa: "رویدادها و دورهمی‌های جامعه بونیو",
    description: "رویدادهای تفریحی، کارگاه‌های آموزشی، ثبت‌نام آنلاین و صدور کارت ورود دیجیتال با بارکد",
    isEnabled: true,
    category: "COMMUNITY",
    iconName: "Calendar",
    updatedAt: "امروز، ۰۹:۱۵",
    impactLevel: "MEDIUM",
  },
  {
    moduleKey: "wallet",
    nameFa: "کیف پول و تسویه ریالی بونیو",
    description: "مدیریت اعتبار، استرداد آنی خسارت ۴ ساعته، شارژ درگاه و درخواست برداشت به شماره شبا",
    isEnabled: true,
    category: "FINANCE",
    iconName: "Wallet",
    updatedAt: "امروز، ۱۴:۰۰",
    impactLevel: "HIGH",
  },
  {
    moduleKey: "passport",
    nameFa: "شناسنامه دیجیتال سلامت (Pet Passport)",
    description: "سوابق واکسیناسیون، انگل‌تراپی، آلرژی‌ها و شناسه میکروچیپ با حفظ حریم خصوصی پزشک",
    isEnabled: true,
    category: "HEALTH",
    iconName: "FileText",
    updatedAt: "۵ روز پیش",
    impactLevel: "HIGH",
  },
  {
    moduleKey: "care",
    nameFa: "دستیار و برنامه روزانه مراقبت پت",
    description: "تقویم هوشمند داروها، وظایف روزانه و قفل‌گذاری روی تجویزهای رسمی دامپزشک",
    isEnabled: true,
    category: "HEALTH",
    iconName: "HeartPulse",
    updatedAt: "۲ روز پیش",
    impactLevel: "LOW",
  },
];

export function AdminFeatureFlagsManagement() {
  const [flags, setFlags] = useState<FeatureFlagItem[]>(INITIAL_FLAGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync with backend if available
  useEffect(() => {
    async function fetchBackendFlags() {
      try {
        const res = await fetch("/api/v1/feature-flags");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFlags((prev) =>
              prev.map((f) => {
                const match = data.find((d: any) => d.module_key === f.moduleKey);
                if (match) {
                  return {
                    ...f,
                    isEnabled: match.is_enabled,
                    nameFa: match.name_fa || f.nameFa,
                    description: match.description || f.description,
                  };
                }
                return f;
              })
            );
          }
        }
      } catch (err) {
        // Fallback to local state safely
      }
    }
    fetchBackendFlags();
  }, []);

  const handleToggle = async (moduleKey: string) => {
    const targetFlag = flags.find((f) => f.moduleKey === moduleKey);
    if (!targetFlag) return;

    const nextState = !targetFlag.isEnabled;

    // Optimistic update
    setFlags((prev) =>
      prev.map((f) =>
        f.moduleKey === moduleKey
          ? { ...f, isEnabled: nextState, updatedAt: "هم‌اکنون" }
          : f
      )
    );

    setFeedbackMessage(
      `ماژول «${targetFlag.nameFa}» با موفقیت ${nextState ? "فعال" : "غیرفعال"} شد.`
    );
    setTimeout(() => setFeedbackMessage(null), 4000);

    try {
      await fetch(`/api/v1/feature-flags/admin/${moduleKey}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: nextState }),
      });
    } catch (e) {
      // Backend request silent fallback if offline
    }
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Store":
        return <Store className="w-5 h-5 text-blue-500" />;
      case "Stethoscope":
        return <Stethoscope className="w-5 h-5 text-emerald-500" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
      case "Home":
        return <Home className="w-5 h-5 text-indigo-500" />;
      case "Calendar":
        return <Calendar className="w-5 h-5 text-rose-500" />;
      case "Wallet":
        return <Wallet className="w-5 h-5 text-teal-500" />;
      case "FileText":
        return <FileText className="w-5 h-5 text-cyan-500" />;
      default:
        return <HeartPulse className="w-5 h-5 text-pink-500" />;
    }
  };

  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.moduleKey.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "ALL" || f.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const activeCount = flags.filter((f) => f.isEnabled).length;
  const disabledCount = flags.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-foreground">
              مدیریت پرچم‌های ویژگی پلتفرم (Platform Feature Flags)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            فعال‌سازی یا غیرفعال‌سازی آنی بخش‌های کلیدی سامانه بدون نیاز به استقرار مجدد کُد (Zero-Downtime Hot Toggle).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 font-mono">
            <span>فعال: {activeCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 text-muted-foreground text-xs font-bold border border-border font-mono">
            <span>غیرفعال: {disabledCount}</span>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-amber-700 dark:text-amber-300">
            هشدار سطح عملیاتی ممیزی:
          </span>
          <p className="text-amber-600 dark:text-amber-400/90 leading-relaxed">
            غیرفعال‌سازی هر ماژول سبب پنهان شدن خودکار لینک‌ها از ناوبری، مسدودسازی موقت روت‌های کلاینت و رد درخواست‌های API متناظر می‌گردد. داده‌های موجود در پایگاه داده هرگز حذف نخواهند شد.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {feedbackMessage}
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در نام، ماژول، یا توضیحات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-surface-elevated border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "همه ماژول‌ها" },
            { id: "COMMERCE", label: "بازارگاه و فروش" },
            { id: "HEALTH", label: "سلامت و کلینیک" },
            { id: "SERVICES", label: "خدمات میدانی" },
            { id: "COMMUNITY", label: "جامعه و رویداد" },
            { id: "FINANCE", label: "امور مالی" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                filterCategory === cat.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/60"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Flags Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map((flag) => (
          <div
            key={flag.moduleKey}
            className={cn(
              "p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between group",
              flag.isEnabled
                ? "bg-surface-elevated border-border/70 shadow-xs hover:border-blue-500/40"
                : "bg-surface-subtle/60 border-dashed border-border/50 opacity-80 hover:opacity-100"
            )}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border/60 flex items-center justify-center shrink-0">
                    {getModuleIcon(flag.iconName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {flag.nameFa}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        {flag.moduleKey}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        • به‌روزرسانی: {flag.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Action */}
                <button
                  type="button"
                  onClick={() => handleToggle(flag.moduleKey)}
                  className={cn(
                    "p-1.5 rounded-2xl transition-all flex items-center gap-1.5 font-bold text-xs",
                    flag.isEnabled
                      ? "text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20"
                      : "text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80"
                  )}
                  title={flag.isEnabled ? "کلیک جهت غیرفعال‌سازی" : "کلیک جهت فعال‌سازی"}
                >
                  {flag.isEnabled ? (
                    <>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold px-1">
                        روشن
                      </span>
                      <ToggleRight className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-muted-foreground font-bold px-1">
                        خاموش
                      </span>
                      <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                {flag.description}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">تاثیر پلتفرمی:</span>
                <span
                  className={cn(
                    "font-bold px-2 py-0.5 rounded-full text-[10px]",
                    flag.impactLevel === "HIGH" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                    flag.impactLevel === "MEDIUM" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                    flag.impactLevel === "LOW" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  )}
                >
                  {flag.impactLevel === "HIGH" ? "بحرانی" : flag.impactLevel === "MEDIUM" ? "متوسط" : "عادی"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    flag.isEnabled ? "bg-emerald-500" : "bg-muted-foreground"
                  )}
                />
                <span className="text-muted-foreground font-mono text-[10px]">
                  {flag.isEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
