"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  Stethoscope, 
  Home as HomeIcon, 
  Users, 
  Sparkles,
  HeartHandshake,
  HeartPulse,
  Award,
  Calendar,
  ShoppingBag
} from "lucide-react";
import { IslandProgressiveContainer } from "@/components/home/island-progressive-container";

// Core Ecosystem Sections requested for Hero Dock Capsule:
// 1. پت‌های من, 2. کلینیک, 3. پزشکی, 4. مربی, 5. ایونت, 6. فروشگاه
const HERO_CORE_SERVICES = [
  {
    id: "pets",
    name: "پت‌های من",
    subtitle: "شناسنامه و سوابق",
    href: "/dashboard/pets",
    icon: HeartHandshake,
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/50",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
  {
    id: "clinic",
    name: "کلینیک",
    subtitle: "نوبت‌دهی آنلاین",
    href: "/vets",
    icon: Stethoscope,
    badgeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/50",
    iconColor: "text-blue-600 dark:text-cyan-300",
  },
  {
    id: "health",
    name: "پزشکی و سلامت",
    subtitle: "مشاوره تخصصی",
    href: "/vets",
    icon: HeartPulse,
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/50",
    iconColor: "text-rose-600 dark:text-rose-300",
  },
  {
    id: "trainer",
    name: "مربی",
    subtitle: "آموزش و رفتار",
    href: "/trainers",
    icon: Award,
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/50",
    iconColor: "text-amber-600 dark:text-amber-300",
  },
  {
    id: "events",
    name: "ایونت",
    subtitle: "دورهمی و کارگاه",
    href: "/events",
    icon: Calendar,
    badgeBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/50",
    iconColor: "text-purple-600 dark:text-purple-300",
  },
  {
    id: "shop",
    name: "فروشگاه",
    subtitle: "ملزومات اورجینال",
    href: "/shop",
    icon: ShoppingBag,
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/50",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
];

export function HeroIslandBanner() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/shop?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <section className="relative w-full pt-2 pb-4 overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Dark Forest Green Hero Container */}
        <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#0B1A14] via-[#10261E] to-[#08140F] text-white shadow-2xl border border-emerald-900/40 flex flex-col justify-between">
          
          {/* Subtle Ambient Glow & Soft Forest Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,_rgba(16,185,129,0.18),_transparent_60%)] pointer-events-none" />
          <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#08140F] to-transparent pointer-events-none" />

          {/* Body: Two-Column Composition */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Start Column (Right in RTL): Core Value Proposition & Search */}
            <div className="lg:col-span-6 space-y-6 text-right">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>فروشگاه جامع محصولات و خدمات حیوانات خانگی</span>
              </div>

              {/* Title per spec */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-white tracking-tight leading-[1.25]">
                مراقبت بهتر برای
                <br />
                <span className="text-emerald-300">
                  پت‌های شادتر و سالم‌تر
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light max-w-xl">
                با بهترین برندها، محصولات اورجینال و خدمات تخصصی همیشه در کنار پت دوست‌داشتنی‌تان هستیم.
              </p>

              {/* Action CTAs: Primary 'مشاهده محصولات' & Secondary 'مشاهده خدمات' */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:scale-102 active:scale-98"
                >
                  <span>مشاهده محصولات</span>
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  href="/vets"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-102 active:scale-98"
                >
                  <span>مشاهده خدمات</span>
                </Link>
              </div>

            </div>

            {/* End Column (Left in RTL): 3D Island Graphic with Pinpoint Accurate Hotspots positioned directly ON the houses */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-full max-w-[420px] lg:max-w-[480px] aspect-square flex items-center justify-center">
                
                {/* 3D Island Graphic */}
                <IslandProgressiveContainer />

                {/* 1. Shop Hotspot Badge (Positioned directly over the Store building with striped awning on the left) */}
                <Link
                  href="/shop"
                  className="absolute top-[32%] sm:top-[34%] left-[6%] sm:left-[10%] px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/85 backdrop-blur-md text-stone-900 dark:text-stone-100 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg border border-emerald-500/40 hover:scale-110 active:scale-95 transition-all select-none z-30 group"
                  style={{ animation: "floatIsland 6s ease-in-out infinite 0.2s" }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                  <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>فروشگاه</span>
                </Link>

                {/* 2. Clinic Hotspot Badge (Positioned directly over the Mint Medical Clinic building with green cross on the right) */}
                <Link
                  href="/vets"
                  className="absolute top-[24%] sm:top-[26%] right-[6%] sm:right-[10%] px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/85 backdrop-blur-md text-stone-900 dark:text-stone-100 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg border border-emerald-500/40 hover:scale-110 active:scale-95 transition-all select-none z-30 group"
                  style={{ animation: "floatIsland 6s ease-in-out infinite 0.4s" }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500 group-hover:animate-ping" />
                  <Stethoscope className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>کلینیک</span>
                </Link>

                {/* 3. Pet Cottage / Boarding Hotspot Badge (Positioned directly over the cozy hill house at top-center) */}
                <Link
                  href="/dashboard/pets"
                  className="absolute top-[10%] sm:top-[12%] left-1/2 -translate-x-1/2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/85 backdrop-blur-md text-stone-900 dark:text-stone-100 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg border border-emerald-500/40 hover:scale-110 active:scale-95 transition-all select-none z-30 group"
                  style={{ animation: "floatIsland 6s ease-in-out infinite 0.6s" }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 group-hover:animate-ping" />
                  <HomeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>پت‌های من</span>
                </Link>

                {/* 4. Events / Community Hotspot Badge (Positioned directly over the wooden gazebo pavilion on the lower right) */}
                <Link
                  href="/events"
                  className="absolute top-[52%] sm:top-[54%] right-[4%] sm:right-[8%] px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/85 backdrop-blur-md text-stone-900 dark:text-stone-100 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 sm:gap-1.5 shadow-lg border border-emerald-500/40 hover:scale-110 active:scale-95 transition-all select-none z-30 group"
                  style={{ animation: "floatIsland 6s ease-in-out infinite 0.8s" }}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 group-hover:animate-ping" />
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>ایونت و جامعه</span>
                </Link>

              </div>
            </div>

          </div>

          {/* Bottom Core Ecosystem Dock Capsule (Elevated High-Contrast Frosted Glass Capsule) */}
          <div className="relative z-20 w-full flex items-center justify-center pb-8 pt-2 px-4">
            <div className="w-full max-w-4xl rounded-3xl md:rounded-full py-4 px-4 sm:px-8 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-around gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
              {HERO_CORE_SERVICES.map((srv) => {
                const Icon = srv.icon;
                return (
                  <Link
                    key={srv.id}
                    href={srv.href}
                    className="group shrink-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-2xl hover:bg-stone-100 dark:hover:bg-white/10 transition-all duration-300 select-none"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${srv.badgeBg} border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md shadow-xs`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${srv.iconColor} transition-transform group-hover:rotate-6`} />
                    </div>
                    
                    <div className="text-center">
                      <span className="block text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors whitespace-nowrap">
                        {srv.name}
                      </span>
                      <span className="hidden md:block text-[10px] text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-300 font-medium transition-colors mt-0.5 whitespace-nowrap">
                        {srv.subtitle}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
