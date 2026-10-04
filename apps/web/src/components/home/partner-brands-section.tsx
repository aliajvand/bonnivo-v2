"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

interface BrandItem {
  name: string;
  nameFa: string;
  country: string;
  specialty: string;
  tag: string;
  brandSlug: string;
  badgeLetter: string;
  badgeGradient: string;
  glowColor: string;
  delay: string;
}

const ROW_1_BRANDS: BrandItem[] = [
  {
    name: "Royal Canin",
    nameFa: "رویال کنین",
    country: "فرانسه",
    specialty: "تغذیه تخصصی نژادی و بالینی",
    tag: "توصیه اول دامپزشکان",
    brandSlug: "Royal Canin",
    badgeLetter: "RC",
    badgeGradient: "from-rose-500/20 via-red-500/10 to-stone-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(244,63,94,0.35)]",
    delay: "0.0s",
  },
  {
    name: "Josera",
    nameFa: "جوسرا",
    country: "آلمان",
    specialty: "سوپرپرمیوم ارگانیک و طبیعی",
    tag: "کیفیت برتر آلمانی",
    brandSlug: "Josera",
    badgeLetter: "J",
    badgeGradient: "from-amber-500/20 via-yellow-500/10 to-stone-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(245,158,11,0.35)]",
    delay: "0.4s",
  },
  {
    name: "Hill's",
    nameFa: "هیلز",
    country: "آمریکا",
    specialty: "رژیم‌های بالینی Prescription Diet",
    tag: "تغذیه مبتنی بر علم",
    brandSlug: "Hill's",
    badgeLetter: "H",
    badgeGradient: "from-blue-500/20 via-indigo-500/10 to-stone-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(59,130,246,0.35)]",
    delay: "0.8s",
  },
  {
    name: "Purina Pro Plan",
    nameFa: "پرو پلن",
    country: "سوئیس",
    specialty: "تقویت ایمنی و سلامت گوارش",
    tag: "تغذیه اپتیمال مفاصل",
    brandSlug: "Purina Pro Plan",
    badgeLetter: "P",
    badgeGradient: "from-emerald-500/20 via-teal-500/10 to-stone-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(16,185,129,0.35)]",
    delay: "1.2s",
  },
];

const ROW_2_BRANDS: BrandItem[] = [
  {
    name: "Beaphar",
    nameFa: "بیفار",
    country: "هلند",
    specialty: "مکمل‌های دارویی و مراقبت بهداشتی",
    tag: "استاندارد GMP دارویی",
    brandSlug: "Beaphar",
    badgeLetter: "B",
    badgeGradient: "from-cyan-500/20 via-sky-500/10 to-stone-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(6,182,212,0.35)]",
    delay: "0.3s",
  },
  {
    name: "Trixie",
    nameFa: "تریکسی",
    country: "آلمان",
    specialty: "تجهیزات ارگونومیک، باکس و بازی",
    tag: "طراحی مدرن اروپا",
    brandSlug: "Trixie",
    badgeLetter: "T",
    badgeGradient: "from-purple-500/20 via-violet-500/10 to-stone-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(168,85,247,0.35)]",
    delay: "0.7s",
  },
  {
    name: "GimCat",
    nameFa: "جیم کت",
    country: "آلمان",
    specialty: "خمیر مالت و مکمل‌های گوارشی",
    tag: "محبوب‌ترین مالت اروپا",
    brandSlug: "GimCat",
    badgeLetter: "G",
    badgeGradient: "from-orange-500/20 via-amber-500/10 to-stone-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(249,115,22,0.35)]",
    delay: "1.1s",
  },
  {
    name: "Reflex",
    nameFa: "رفلکس",
    country: "ترکیه",
    specialty: "خوراک کامل اقتصادی و پرمیوم",
    tag: "ارزش خرید بالا",
    brandSlug: "Reflex",
    badgeLetter: "R",
    badgeGradient: "from-teal-500/20 via-emerald-500/10 to-stone-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    glowColor: "group-hover:shadow-[0_12px_30px_rgba(20,184,166,0.35)]",
    delay: "1.5s",
  },
];

function BrandEmblemItem({ brand }: { brand: BrandItem }) {
  return (
    <div
      className="relative group flex flex-col items-center justify-center animate-wave-float select-none"
      style={{ animationDelay: brand.delay }}
    >
      {/* Floating Interactive Tooltip Hint on Hover / Focus - Never Clipped */}
      <div className="absolute bottom-full mb-3.5 start-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 z-50 whitespace-nowrap">
        <div className="rounded-2xl px-4 py-2.5 bg-stone-900/95 dark:bg-stone-850/95 backdrop-blur-xl text-white text-center shadow-2xl border border-white/15 min-w-[130px]">
          <div className="flex items-center justify-center gap-1">
            <p className="font-black text-xs text-emerald-400">{brand.nameFa}</p>
            <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
          </div>
          <p className="text-[10px] text-stone-300 font-mono mt-0.5">
            {brand.name} • {brand.country}
          </p>
          <p className="text-[9px] text-emerald-200/70 font-light mt-0.5">
            {brand.specialty}
          </p>
          {/* Tooltip Downward Arrow */}
          <div className="absolute top-full start-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-stone-900/95 dark:border-t-stone-850/95" />
        </div>
      </div>

      {/* Pure Frameless Brand Emblem with Luxury Frosted Styling */}
      <Link
        href={`/shop?brand=${encodeURIComponent(brand.brandSlug)}`}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${brand.badgeGradient} backdrop-blur-xl border flex items-center justify-center shadow-md ${brand.glowColor} hover:scale-115 active:scale-95 transition-all duration-300 cursor-pointer`}
        aria-label={brand.nameFa}
      >
        <span className="font-black text-lg sm:text-xl tracking-wider">
          {brand.badgeLetter}
        </span>
      </Link>
    </div>
  );
}

export function PartnerBrandsSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-10 sm:py-12 overflow-visible" dir="rtl">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              برندهای معتبر و همکار بنیوو
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              تضمین اصالت فیزیکی و واردات قانونی کلیه مکمل‌ها و خوراک تخصصی
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>۱۰۰٪ کالاها با بارکد رسمی اصالت</span>
          </div>
        </div>

        {/* 2-Row Zigzag Staggered Brand Constellation */}
        <div className="relative flex flex-col items-center justify-center gap-6 sm:gap-8 pt-6 pb-4 overflow-visible">
          
          {/* Row 1 (4 Brands) */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 w-full overflow-visible">
            {ROW_1_BRANDS.map((brand, idx) => (
              <BrandEmblemItem key={idx} brand={brand} />
            ))}
          </div>

          {/* Row 2 (4 Brands with Staggered Zigzag Horizontal Offset) */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 w-full overflow-visible translate-x-3 sm:translate-x-6 md:translate-x-8">
            {ROW_2_BRANDS.map((brand, idx) => (
              <BrandEmblemItem key={idx} brand={brand} />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
