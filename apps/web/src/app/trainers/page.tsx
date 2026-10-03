import React from "react";
import Link from "next/link";
import { GraduationCap, Star, ShieldCheck, MapPin, Phone, CalendarCheck } from "lucide-react";
import { FeatureFlagGuard } from "@/components/common/feature-flag-guard";

export default function TrainersPage() {
  const trainers = [
    {
      id: "tr-1",
      name: "استاد پوریا شایان",
      specialty: "اصلاح رفتارهای پرخاشگرانه و ناهنجاری‌های آپارتمانی",
      experience: "۱۲ سال سابقه",
      rating: 4.9,
      reviewCount: 78,
      location: "تهران، سعادت‌آباد و شهرک غرب (اعزام به محل)",
      price: "جلسه‌ای ۸۵۰,۰۰۰ تومان",
    },
    {
      id: "tr-2",
      name: "مهندس نسترن فراهانی",
      specialty: "آموزش مقدماتی، همقدم و فرامین پایه‌ای توله‌ها",
      experience: "۷ سال سابقه",
      rating: 4.8,
      reviewCount: 45,
      location: "تهران، پاسداران و نیاوران",
      price: "جلسه‌ای ۶۵۰,۰۰۰ تومان",
    },
    {
      id: "tr-3",
      name: "دکتر حامد توکلی",
      specialty: "تربیت سگ‌های کار، جستجو و رفتاردرمانی اضطراب جدایی",
      experience: "۱۵ سال سابقه بین‌المللی",
      rating: 5.0,
      reviewCount: 110,
      location: "تهران و حومه (میدان ونک)",
      price: "جلسه‌ای ۱,۲۰۰,۰۰۰ تومان",
    },
  ];

  return (
    <FeatureFlagGuard
      moduleKey="trainers"
      moduleTitleFa="مربیان و رفتارشناسی پت"
      descriptionFa="شبکه مربیان تخصصی بونیو پس از تکمیل ارزیابی‌های میدانی و تاییدیه رسمی فدراسیون فعال خواهد شد."
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 md:p-10 rounded-4xl text-white border border-blue-500/20 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>شبکه مربیان و رفتارشناسان معتمد بونیو</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black">
            آموزش، تربیت و اصلاح رفتار علمی حیوانات خانگی
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            دسترسی به مربیان تایید صلاحیت‌شده با متدهای تشویقی و بدون خشونت. اعزام به محل زندگی شما با ثبت پرونده رفتارشناسی در اکوسیستم بونیو.
          </p>
        </div>

        {/* Trainers List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainers.map((tr) => (
            <div
              key={tr.id}
              className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {tr.experience}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-foreground">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{tr.rating}</span>
                    <span className="text-muted-foreground text-[10px]">({tr.reviewCount})</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{tr.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tr.specialty}</p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{tr.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span>هزینه:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{tr.price}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/care"
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>هماهنگی جلسه مشاوره</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </FeatureFlagGuard>
  );
}
