"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Check, 
  CalendarCheck, 
  ArrowRight, 
  Camera, 
  Thermometer, 
  HeartHandshake 
} from "lucide-react";

const BOARDING_DATA: Record<string, {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  features: string[];
  pricePerNight: string;
  description: string;
  amenities: string[];
  rules: string[];
}> = {
  "board-1": {
    id: "board-1",
    name: "ریزورت هتل حیوانات خانگی آرمانی",
    location: "تهران، الهیه",
    rating: 4.9,
    reviewCount: 64,
    features: ["اتاق‌های اختصاصی با کنترل دما", "پایش تصویری ۲۴ ساعته اختصاصی سرپرست", "حضور مقیم دامپزشک", "فضای باز چمن طبیعی"],
    pricePerNight: "شبی ۹۵۰,۰۰۰ تومان",
    description: "ریزورت اقامتی ۵ ستاره ویژه سگ و گربه با استانداردهای هتلداری بین‌المللی. محیطی آرام و بهداشتی با تهویه پیشرفته و پایش شبانه‌روزی وضعیت سلامت.",
    amenities: ["پخش موسیقی آرامش‌بخش در طول روز", "رژیم غذایی شخصی‌سازی‌شده طبق سلیقه پت", "پیاده‌روی روزانه اختصاصی در باغ محصور", "گزارش وضعیت روزانه همراه با ویدیو و عکس"],
    rules: ["شناسنامه معتبر و واکسیناسیون کامل الزامی است", "انجام انگل‌تراپی حداکثر یک ماه قبل از پذیرش", "پذیرش صرفاً با هماهنگی قبلی و معاینه اولیه"]
  },
  "board-2": {
    id: "board-2",
    name: "پانسیون تخصصی گربه‌های اشرافی پرشین",
    location: "تهران، شهرک غرب",
    rating: 4.8,
    reviewCount: 42,
    features: ["محیط بدون صدا و بدون سگ (کاملاً گربه‌محور)", "درخت‌های بازی چوبی و کمدهای لوکس", "تغذیه مطابق رژیم غذایی خانه"],
    pricePerNight: "شبی ۶۵۰,۰۰۰ تومان",
    description: "محیطی کاملاً امن، بی‌صدا و طراحی‌شده بر اساس رفتارهای طبیعی گربه‌ها. دور از هرگونه استرس صوتی یا حضور سگ‌ها با درخت‌های چوبی مرتفع و باکس‌های شیشه‌ای بزرگ.",
    amenities: ["پخش فرومون‌های آرامش‌بخش Feliway در فضا", "خاک‌های بهداشتی بدون گرد و غبار با تعویض مستمر", "پنجره‌های ایمن با دید به فضای سبز"],
    rules: ["تست سلامت FPV/FeLV معتبر", "عدم وجود سابقه پرخاشگری شدید یا بیماری واگیردار"]
  },
  "board-3": {
    id: "board-3",
    name: "باغ پانسیون و نگهداری سگ‌های مهرشهر",
    location: "البرز، مهرشهر",
    rating: 4.9,
    reviewCount: 88,
    features: ["استخر اختصاصی آب‌درمانی سگ‌ها", "زمین بازی ۲۰۰۰ متری محصور", "برنامه بازی و پیاده‌روی گروهی و انفرادی"],
    pricePerNight: "شبی ۸۰۰,۰۰۰ تومان",
    description: "بهشت سگ‌های پرانرژی در باغی سرسبز و دوهزار متری با پرچین‌های استاندارد دو متری، استخر آب‌درمانی و مربیان مستقر برای تخلیه انرژی بهینه.",
    amenities: ["استخر با فیلتراسیون ازن برای بازی و شنا", "جلسات بازی گروهی تحت نظارت مربی رفتارشناس", "سوییت‌های شبانه عایق حرارتی با تخت‌های ارتوپدیک"],
    rules: ["آزمایش هاری و واکسن ۷ گانه الزامی است", "اجتماعی بودن و عدم پرخاشگری نسبت به سایر سگ‌ها"]
  }
};

export default function BoardingDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "board-1";
  const boarding = BOARDING_DATA[id] || BOARDING_DATA["board-1"];
  const [booked, setBooked] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      {/* Back button */}
      <div>
        <Link
          href="/boarding"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست پانسیون‌ها</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/50">
              <Home className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">{boarding.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  استاندارد بونیو
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">{boarding.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {boarding.rating.toLocaleString("fa-IR")} ({boarding.reviewCount.toLocaleString("fa-IR")} نظر)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {boarding.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs text-stone-500">تعرفه اقامت هر شب:</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
              {boarding.pricePerNight}
            </span>
            <button
              type="button"
              onClick={() => setBooked(true)}
              className="mt-1 w-full md:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {booked ? "درخواست رزرو ثبت شد ✓" : "ثبت درخواست رزرو اقامت"}
            </button>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">امکانات ویژه اقامتی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {boarding.features.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 bg-[#F7F8F6] dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2 pt-2">
          <h2 className="text-sm font-bold text-foreground">خدمات رفاهی روزانه</h2>
          <ul className="list-disc list-inside text-xs text-stone-600 dark:text-stone-400 space-y-1">
            {boarding.amenities.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>

        {/* Rules */}
        <div className="space-y-2 pt-2">
          <h2 className="text-sm font-bold text-foreground">شرایط و قوانین پذیرش</h2>
          <ul className="list-disc list-inside text-xs text-stone-500 space-y-1">
            {boarding.rules.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
