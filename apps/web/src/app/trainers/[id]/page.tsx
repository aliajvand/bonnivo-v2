"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  Star, 
  ShieldCheck, 
  MapPin, 
  CalendarCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Award, 
  Phone
} from "lucide-react";

const TRAINERS_DATA: Record<string, {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: string;
  bio: string;
  methodology: string[];
  certifications: string[];
  sessions: string[];
}> = {
  "tr-1": {
    id: "tr-1",
    name: "استاد پوریا شایان",
    specialty: "اصلاح رفتارهای پرخاشگرانه و ناهنجاری‌های آپارتمانی",
    experience: "۱۲ سال سابقه حرفه‌ای",
    rating: 4.9,
    reviewCount: 78,
    location: "تهران، سعادت‌آباد و شهرک غرب (اعزام به محل)",
    price: "جلسه‌ای ۸۵۰,۰۰۰ تومان",
    bio: "مربی ارشد رفتارشناسی با بیش از ۱۲ سال تجربه تخصصی در کاهش اضطراب، اصلاح پرخاشگری سگ‌های نگهبان و آپارتمانی بر پایه متدهای تقویتی مثبت (Positive Reinforcement).",
    methodology: [
      "آموزش بر پایه تشویق و بدون ابزارهای تنبیهی",
      "جلسات ارزیابی جامع محیط زندگی در منزل",
      "طراحی برنامه روزانه اختصاصی برای صاحب پت",
      "پشتیبانی مستمر آنلاین بین جلسات"
    ],
    certifications: [
      "مدرک بین‌المللی رفتارشناسی حیوانات خانگی از آلمان",
      "عضو رسمی انجمن رفتارشناسان تشویقی",
      "مربی ارشد باشگاه‌های کار و امداد"
    ],
    sessions: ["جلسه اول: ارزیابی و رفتارشناسی", "جلسه دوم: کنترل پارس و هیجان", "جلسه سوم: همقدم در محیط بیرونی", "جلسه چهارم: تثبیت فرامین"]
  },
  "tr-2": {
    id: "tr-2",
    name: "مهندس نسترن فراهانی",
    specialty: "آموزش مقدماتی، همقدم و فرامین پایه‌ای توله‌ها",
    experience: "۷ سال سابقه",
    rating: 4.8,
    reviewCount: 45,
    location: "تهران، پاسداران و نیاوران",
    price: "جلسه‌ای ۶۵۰,۰۰۰ تومان",
    bio: "متخصص آموزش اجتماعی‌سازی و فرامین پایه‌ای برای توله‌های ۲ تا ۸ ماهه با رویکرد بازی‌محور و اعتمادسازی عمیق میان سرپرست و توله.",
    methodology: [
      "اجتماعی‌سازی بدون استرس در محیط‌های شلوغ",
      "رفع گاز گرفتن و بازی‌های مخرب توله‌ها",
      "آموزش دستشویی در پد و محیط بیرون در کمترین زمان"
    ],
    certifications: ["دوره تخصصی Puppy Kindergarten", "گواهی تربیت حیوانات خانگی"],
    sessions: ["جلسه اول: آشنایی و تمرکز", "جلسه دوم: فرامین بیا و بشین", "جلسه سوم: ماندن و عدم پرش", "جلسه چهارم: پیاده‌روی بدون کشیدن قلاده"]
  },
  "tr-3": {
    id: "tr-3",
    name: "دکتر حامد توکلی",
    specialty: "تربیت سگ‌های کار، جستجو و رفتاردرمانی اضطراب جدایی",
    experience: "۱۵ سال سابقه بین‌المللی",
    rating: 5.0,
    reviewCount: 110,
    location: "تهران و حومه (میدان ونک)",
    price: "جلسه‌ای ۱,۲۰۰,۰۰۰ تومان",
    bio: "دکترای رفتارشناسی تطبیقی، مدرس دانشگاه و متخصص پروتکل‌های کلینیکی درمان وسواس و اضطراب جدایی در سگ‌های خانگی.",
    methodology: [
      "پروتکل دارودرمانی همگام با تمرینات اصلاح رفتار",
      "سنجش سطح کورتیزول و استرس فیزیولوژیک",
      "برنامه ویژه کاهش پارس در زمان تنهایی"
    ],
    certifications: ["PhD رفتارشناسی جانوری", "مدیر سابق دپارتمان آموزش هلال احمر"],
    sessions: ["جلسه اول: تست رفتاری تخصصی", "جلسه دوم: طراحی پروتکل حساسیت‌زدایی", "جلسه سوم: سناریوی شبیه‌سازی تنهایی", "جلسه چهارم: ارزیابی ثبات رفتار"]
  }
};

export default function TrainerDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "tr-1";
  const trainer = TRAINERS_DATA[id] || TRAINERS_DATA["tr-1"];
  const [booked, setBooked] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      {/* Back button */}
      <div>
        <Link
          href="/trainers"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست مربیان</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/50 text-2xl font-black">
              {trainer.name.slice(0, 1)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">{trainer.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مورد اعتماد بونیو
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">{trainer.specialty}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {trainer.rating.toLocaleString("fa-IR")} ({trainer.reviewCount.toLocaleString("fa-IR")} نظر)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {trainer.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {trainer.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs text-stone-500">تعرفه مصوب:</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
              {trainer.price}
            </span>
            <button
              type="button"
              onClick={() => setBooked(true)}
              className="mt-1 w-full md:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {booked ? "درخواست شما ثبت شد ✓" : "رزرو جلسه ارزیابی حضوری"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">درباره مربی و پیشینه</h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
            {trainer.bio}
          </p>
        </div>

        {/* Methodology */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-foreground">اصول و متدولوژی آموزشی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trainer.methodology.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 bg-[#F7F8F6] dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-2 pt-2">
          <h2 className="text-sm font-bold text-foreground">گواهینامه‌ها و سوابق رسمی</h2>
          <ul className="list-disc list-inside text-xs text-stone-600 dark:text-stone-400 space-y-1">
            {trainer.certifications.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
