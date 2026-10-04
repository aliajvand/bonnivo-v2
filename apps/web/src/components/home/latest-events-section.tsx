"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";

interface EventCardItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  priceText: string;
  isFree: boolean;
  category: string;
  image: string;
}

const EVENTS: EventCardItem[] = [
  {
    id: "ev-1",
    title: "دورهمی پاییزی سرپرستان نژاد گلدن و هاسکی",
    date: "۲۸ مهر ۱۴۰۳",
    time: "۱۶:۰۰ الی ۱۹:۰۰",
    location: "تهران، بوستان آب و آتش",
    priceText: "رایگان",
    isFree: true,
    category: "دورهمی و بازی",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ev-2",
    title: "وبینار تخصصی تغذیه بالینی و بیماری‌های ادراری گربه‌ها",
    date: "۲ آبان ۱۴۰۳",
    time: "۱۹:۰۰ الی ۲۱:۰۰",
    location: "پخش زنده آنلاین در بستر بونیو",
    priceText: "۱۵۰,۰۰۰ تومان",
    isFree: false,
    category: "وبینار پزشکی",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ev-3",
    title: "کارگاه عملی آموزش همقدم و پیاده‌روی شهری بدون کشیدن قلاده",
    date: "۵ آبان ۱۴۰۳",
    time: "۱۰:۰۰ الی ۱۲:۳۰",
    location: "تهران، باشگاه ورزشی اکباتان",
    priceText: "۴۸۰,۰۰۰ تومان",
    isFree: false,
    category: "کارگاه رفتارشناسی",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80",
  },
];

export function LatestEventsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              آخرین رویدادها و دورهمی‌ها
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              کارگاه‌های آموزشی، وبینارهای تخصصی پزشکی و دورهمی‌های دوستانه حیوانات خانگی
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            <span>همه رویدادها</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Events Grid with Crisp Visual Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {EVENTS.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="group flex flex-col justify-between rounded-3xl bg-surface border border-border/80 overflow-hidden hover:border-emerald-600/40 shadow-xs hover:shadow-md transition-all duration-300 select-none"
            >
              {/* Event Image Banner with Overlay Badges */}
              <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-stone-100 dark:bg-stone-900">
                <Image
                  src={ev.image}
                  alt={ev.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Floating Badges */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                    {ev.category}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${ev.isFree ? "bg-emerald-500/90 text-white shadow-xs" : "bg-black/70 text-amber-300 border border-amber-400/30"}`}>
                    {ev.priceText}
                  </span>
                </div>
              </div>

              {/* Event Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {ev.title}
                  </h3>

                  <div className="space-y-1.5 pt-1 text-xs text-stone-500 dark:text-stone-400 font-light">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{ev.date} • {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                  <span>مشاهده جزئیات و بلیت</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
