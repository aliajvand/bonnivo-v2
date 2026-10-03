import React from "react";
import Link from "next/link";
import { Home, Star, ShieldCheck, MapPin, Check, CalendarCheck } from "lucide-react";
import { FeatureFlagGuard } from "@/components/common/feature-flag-guard";

export default function BoardingPage() {
  const boardingPlaces = [
    {
      id: "board-1",
      name: "ریزورت هتل حیوانات خانگی آرمانی",
      location: "تهران، الهیه",
      rating: 4.9,
      reviewCount: 64,
      features: ["اتاق‌های اختصاصی با کنترل دما", "پایش تصویری ۲۴ ساعته اختصاصی سرپرست", "حضور مقیم دامپزشک", "فضای باز چمن طبیعی"],
      pricePerNight: "شبی ۹۵۰,۰۰۰ تومان",
    },
    {
      id: "board-2",
      name: "پانسیون تخصصی گربه‌های اشرافی پرشین",
      location: "تهران، شهرک غرب",
      rating: 4.8,
      reviewCount: 42,
      features: ["محیط بدون صدا و بدون سگ (کاملاً گربه‌محور)", "درخت‌های بازی چوبی و کمدهای لوکس", "تغذیه مطابق رژیم غذایی خانه"],
      pricePerNight: "شبی ۶۵۰,۰۰۰ تومان",
    },
    {
      id: "board-3",
      name: "باغ پانسیون و نگهداری سگ‌های مهرشهر",
      location: "البرز، مهرشهر",
      rating: 4.9,
      reviewCount: 88,
      features: ["استخر اختصاصی آب‌درمانی سگ‌ها", "زمین بازی ۲۰۰۰ متری محصور", "برنامه بازی و پیاده‌روی گروهی و انفرادی"],
      pricePerNight: "شبی ۸۰۰,۰۰۰ تومان",
    },
  ];

  return (
    <FeatureFlagGuard
      moduleKey="boarding"
      moduleTitleFa="پانسیون و هتل حیوانات خانگی"
      descriptionFa="خدمات رزرو آنلاین هتل و پانسیون حیوانات خانگی پس از پایان بازرسی‌های بهداشتی و میدانی مراکز همکار فعال خواهد شد."
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-stone-950 p-6 md:p-10 rounded-4xl text-white border border-amber-500/20 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          <Home className="w-3.5 h-3.5" />
          <span>هتل‌ها و پانسیون‌های تایید صلاحیت‌شده بونیو</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black">
          نگهداری، پانسیون و اقامت امن حیوانات خانگی
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
          با خیال آسوده به سفر بروید. تمام پانسیون‌های همکار بونیو مجهز به دوربین مداربسته، نظارت دامپزشکی و پروتکل‌های بهداشتی سخت‌گیرانه هستند.
        </p>
      </div>

      {/* Boarding Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boardingPlaces.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  تاییدیه بهداشتی بونیو
                </span>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-foreground">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{b.rating}</span>
                  <span className="text-muted-foreground text-[10px]">({b.reviewCount})</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{b.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{b.location}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/50">
                {b.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs font-bold text-foreground">
                <span>تعرفه اقامت: </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{b.pricePerNight}</span>
              </div>
            </div>

            <Link
              href="/dashboard/care"
              className="w-full py-2.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>استعلام ظرفیت و رزرو اقامت</span>
            </Link>
          </div>
        ))}
      </div>
      </div>
    </FeatureFlagGuard>
  );
}
