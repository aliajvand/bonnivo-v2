"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowLeft, ShieldCheck } from "lucide-react";

interface TrainerCardItem {
  id: string;
  name: string;
  specialty: string;
  city: string;
  district: string;
  rating: number;
  reviewCount: number;
  price: string;
  image: string;
}

const TRAINERS: TrainerCardItem[] = [
  {
    id: "tr-1",
    name: "استاد پوریا شایان",
    specialty: "اصلاح رفتارهای پرخاشگرانه و ناهنجاری‌های آپارتمانی",
    city: "تهران",
    district: "سعادت‌آباد و غرب",
    rating: 4.9,
    reviewCount: 78,
    price: "جلسه‌ای ۸۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "tr-2",
    name: "مهندس نسترن فراهانی",
    specialty: "آموزش مقدماتی، همقدم و فرامین پایه‌ای توله‌ها",
    city: "تهران",
    district: "پاسداران و نیاوران",
    rating: 4.8,
    reviewCount: 45,
    price: "جلسه‌ای ۶۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "tr-3",
    name: "دکتر حامد توکلی",
    specialty: "تربیت سگ‌های کار و رفتاردرمانی اضطراب جدایی",
    city: "تهران",
    district: "میدان ونک و مرکز",
    rating: 5.0,
    reviewCount: 110,
    price: "جلسه‌ای ۱,۲۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
];

export function BestTrainersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              مربی‌های منتخب بنیوو
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              متخصصین تاییدصلاحیت‌شده رفتارشناسی با متدهای تشویقی و اعزام به محل
            </p>
          </div>

          <Link
            href="/trainers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            <span>همه مربیان</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Trainers Grid with Full-Width Portrait Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {TRAINERS.map((trainer) => (
            <div
              key={trainer.id}
              className="group flex flex-col justify-between rounded-3xl bg-surface border border-border/80 overflow-hidden hover:border-emerald-600/40 shadow-xs hover:shadow-md transition-all duration-300"
            >
              {/* Full-width Trainer Photo Banner */}
              <Link
                href={`/trainers/${trainer.id}`}
                className="relative block w-full h-48 sm:h-52 overflow-hidden bg-stone-100 dark:bg-stone-900 cursor-pointer"
              >
                <Image
                  src={trainer.image}
                  alt={trainer.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Rating Badge Overlay */}
                <div className="absolute top-3.5 end-3.5 z-10">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{trainer.rating.toLocaleString("fa-IR")}</span>
                  </span>
                </div>

                {/* Verified Trainer Badge */}
                <div className="absolute top-3.5 start-3.5 z-10">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>تایید هویت</span>
                  </span>
                </div>

                {/* Name on Image Base */}
                <div className="absolute bottom-3 inset-x-4 z-10 text-white">
                  <h3 className="font-black text-base sm:text-lg tracking-tight">
                    {trainer.name}
                  </h3>
                  <span className="text-xs text-stone-200 flex items-center gap-1 font-light">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {trainer.city}، {trainer.district}
                  </span>
                </div>
              </Link>

              {/* Trainer Body Details */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed font-light">
                    {trainer.specialty}
                  </p>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-stone-500">تعرفه جلسه حضوری:</span>
                    <span className="font-bold text-foreground">{trainer.price}</span>
                  </div>
                </div>

                {/* CTA Link */}
                <div className="pt-1">
                  <Link
                    href={`/trainers/${trainer.id}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 select-none"
                  >
                    <span>مشاهده رزومه و رزرو جلسه</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
