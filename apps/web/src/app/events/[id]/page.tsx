"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  QrCode
} from "lucide-react";

const EVENTS_DATA: Record<string, {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  remainingSpots: number;
  priceText: string;
  priceTomans: number;
  description: string;
  petRequirements: string[];
  schedule: string[];
}> = {
  "ev-1": {
    id: "ev-1",
    title: "دورهمی پاییزی سرپرستان نژاد گلدن و هاسکی",
    date: "جمعه ۲۸ مهر ۱۴۰۳",
    time: "۱۶:۰۰ الی ۱۹:۰۰",
    location: "تهران، بوستان آب و آتش (محوطه اختصاصی حیوانات خانگی)",
    organizer: "باشگاه سگ‌های مهربان بونیو",
    remainingSpots: 12,
    priceText: "رایگان (نیازمند ثبت‌نام)",
    priceTomans: 0,
    description: "فضایی شاد و صمیمانه برای تخلیه انرژی سگ‌های پرانرژی نژاد بزرگ، آشنایی سرپرستان و مشاوره رایگان با مربیان رفتارشناسی بونیو.",
    petRequirements: [
      "شناسنامه واکسیناسیون معتبر",
      "استفاده از قلاده بدنی یا کمری استاندارد",
      "عدم پرخاشگری کنترل‌نشده"
    ],
    schedule: ["۱۶:۰۰ پذیرش و کنترل شناسنامه", "۱۶:۴۵ بازی‌های گروهی تخلیه انرژی", "۱۸:۰۰ کارگاه کوتاه رفتارشناسی با استاد پوریا شایان", "۱۸:۴۵ عکس یادگاری و اهدای هدایای اسپانسر"]
  },
  "ev-2": {
    id: "ev-2",
    title: "وبینار تخصصی تغذیه بالینی و بیماری‌های ادراری گربه‌ها",
    date: "دوشنبه ۲ آبان ۱۴۰۳",
    time: "۱۹:۰۰ الی ۲۱:۰۰",
    location: "آنلاین در بستر اختصاصی بونیو (پخش زنده)",
    organizer: "دکتر فرزانه صامتی (متخصص داخلی دام‌های کوچک)",
    remainingSpots: 54,
    priceText: "۱۵۰,۰۰۰ تومان",
    priceTomans: 150000,
    description: "بررسی جامع علل بروز سنگ‌های مثانه و انسداد مجاری ادراری (FLUTD)، نقش آب آشامیدنی، انتخاب صحیح غذای خشک و تر و رژیم‌های درمانی.",
    petRequirements: ["ویژه سرپرستان گربه - بدون نیاز به حضور پت در وبینار"],
    schedule: ["۱۹:۰۰ مقدمه و فیزیولوژی کلیه و مجاری ادرار", "۱۹:۴۵ رژیم غذایی پیشگیرانه و درمانی", "۲۰:۳۰ پرسش و پاسخ زنده با شرکت‌کنندگان"]
  },
  "ev-3": {
    id: "ev-3",
    title: "کارگاه عملی آموزش همقدم و پیاده‌روی شهری بدون کشیدن قلاده",
    date: "پنجشنبه ۵ آبان ۱۴۰۳",
    time: "۱۰:۰۰ الی ۱۲:۳۰",
    location: "تهران، باشگاه ورزشی اکباتان (زمین چمن آموزشی)",
    organizer: "آکادمی تربیت سگ بونیو",
    remainingSpots: 4,
    priceText: "۴۸۰,۰۰۰ تومان",
    priceTomans: 480000,
    description: "تمرینات فشرده میدانی برای حل مشکل کشیدن بند قلاده در کوچه و خیابان، نحوه صحیح تغییر مسیر و افزایش تمرکز سگ در محیط‌های دارای محرک‌های گوناگون.",
    petRequirements: ["سگ‌های بالای ۶ ماه", "بند قلاده استاندارد ۱.۵ متری (بدون قلاده متری جمع‌شونده)", "تشویقی خوش‌خوراک و خردشده به مقدار زیاد"],
    schedule: ["۱۰:۰۰ گرم‌کردن و ارزیابی هماهنگی سرپرست و سگ", "۱۰:۳۰ تکنیک‌های توجه و نگاه به چشم سرپرست", "۱۱:۱۵ شبیه‌سازی مواجهه با محرک‌ها", "۱۲:۰۰ پرسش و رفع اشکال انفرادی"]
  }
};

export default function EventDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "ev-1";
  const event = EVENTS_DATA[id] || EVENTS_DATA["ev-1"];
  const [registered, setRegistered] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست رویدادها</span>
        </Link>
      </div>

      {/* Main Event Card */}
      <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                رویداد تاییدشده بونیو
              </span>
              <span className="text-xs text-stone-500">
                ظرفیت باقی‌مانده: {event.remainingSpots.toLocaleString("fa-IR")} نفر
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-400" />
                {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                {event.location}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs text-stone-500">بهای بلیت:</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
              {event.priceText}
            </span>
            <button
              type="button"
              onClick={() => setRegistered(true)}
              className="mt-1 w-full md:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>{registered ? "بلیت شما صادر شد ✓" : "ثبت‌نام و دریافت بلیت"}</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">درباره رویداد</h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
            {event.description}
          </p>
        </div>

        {/* Schedule */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-foreground">برنامه زمان‌بندی رویداد</h2>
          <div className="space-y-2">
            {event.schedule.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 bg-[#F7F8F6] dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-2 pt-2">
          <h2 className="text-sm font-bold text-foreground">الزامات و شرایط حضور پت</h2>
          <ul className="list-disc list-inside text-xs text-stone-600 dark:text-stone-400 space-y-1">
            {event.petRequirements.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
