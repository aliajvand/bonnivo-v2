"use client";

import React, { useState } from "react";
import {
  Award,
  CalendarCheck,
  Users,
  Star,
  CheckCircle2,
  Clock,
  Dog,
  MapPin,
  TrendingUp,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingSession {
  id: string;
  petName: string;
  petBreed: string;
  ownerName: string;
  sessionType: "OBEDIENCE" | "BEHAVIORAL_CORRECTION" | "PUPPY_SOCIALIZATION" | "AGILITY";
  date: string;
  time: string;
  location: "HOME_VISIT" | "PARK" | "TRAINER_CENTER";
  behaviorNotes: string; // Only behavioral training context, strictly NO medical/health data
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}

export default function TrainerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "services" | "reviews">("sessions");

  const [sessions, setSessions] = useState<TrainingSession[]>([
    {
      id: "TRN-501",
      petName: "ماکس",
      petBreed: "ژرمن شپرد",
      ownerName: "سینا کریمی",
      sessionType: "OBEDIENCE",
      date: "امروز، ۱۱ مهر",
      time: "۱۶:۰۰ عصر",
      location: "HOME_VISIT",
      behaviorNotes: "تمرین همگام‌قدم و عدم واکنش به زنگ در ورودی",
      status: "SCHEDULED",
    },
    {
      id: "TRN-502",
      petName: "کوکو",
      petBreed: "پودل مینیاتوری",
      ownerName: "پگاه زمانی",
      sessionType: "PUPPY_SOCIALIZATION",
      date: "فردا، ۱۲ مهر",
      time: "۱۰:۰۰ صبح",
      location: "PARK",
      behaviorNotes: "آشنایی تدریجی با افراد ناشناس و صداهای محیطی",
      status: "SCHEDULED",
    },
    {
      id: "TRN-503",
      petName: "ببری",
      petBreed: "هاسکی سیبرین",
      ownerName: "کیوان امانی",
      sessionType: "BEHAVIORAL_CORRECTION",
      date: "دیروز، ۱۰ مهر",
      time: "۱۷:۳۰ عصر",
      location: "TRAINER_CENTER",
      behaviorNotes: "کنترل اضطراب جدایی و بازیابی تمرکز",
      status: "COMPLETED",
    },
  ]);

  const handleCompleteSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "COMPLETED" } : s))
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Trainer Header */}
      <div className="bg-surface-elevated/80 dark:bg-slate-900/60 p-5 rounded-3xl border border-border/80 backdrop-blur-xl shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                میز کار مربیگری و رفتارشناسی بونیو
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                مربی: سپهر رفیعی
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مدیریت دوره‌های آموزشی، رزرو جلسات خصوصی و ارزیابی رفتارشناسی
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-subtle p-1 rounded-2xl border border-border/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "sessions"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            جلسات آموزشی ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "services"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            پکیج‌ها و تعرفه‌ها
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all",
              activeTab === "reviews"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            نظرات و درآمد
          </button>
        </div>
      </div>

      {/* Scoped KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">جلسات فعال ماه</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۲۲ جلسه</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">مراجعین فعال</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۱۶ پت</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Dog className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">امتیاز رضایت</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۵.۰ / ۵</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-elevated p-4 rounded-2xl border border-border/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold">درآمد اختصاصی مربی</span>
            <div className="text-2xl font-black text-foreground font-mono mt-1">۱۱.۲ م.ت</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">جلسات برنامه‌ریزی‌شده مربیگری</h2>
            <span className="text-xs text-muted-foreground">حفظ حریم خصوصی: عدم نمایش پرونده‌های پزشکی بالینی</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((ses) => (
              <div
                key={ses.id}
                className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {ses.id}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        ses.status === "SCHEDULED" && "bg-blue-500/10 text-blue-600",
                        ses.status === "COMPLETED" && "bg-emerald-500/10 text-emerald-600"
                      )}
                    >
                      {ses.status === "SCHEDULED" ? "رزرو شده" : "تکمیل شده"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">
                    {ses.petName} ({ses.petBreed})
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    سرپرست: {ses.ownerName}
                  </div>

                  <div className="mt-3 p-3 rounded-2xl bg-surface-subtle border border-border/50 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ses.date} • {ses.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        {ses.location === "HOME_VISIT" && "ویزیت در محل مشتری"}
                        {ses.location === "PARK" && "محیط باز / پارک"}
                        {ses.location === "TRAINER_CENTER" && "مرکز تخصصی مربی"}
                      </span>
                    </div>
                    <p className="text-foreground pt-1 border-t border-border/40 font-medium">
                      هدف جلسه: {ses.behaviorNotes}
                    </p>
                  </div>
                </div>

                {ses.status === "SCHEDULED" && (
                  <button
                    onClick={() => handleCompleteSession(ses.id)}
                    className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تأیید برگزاری و تکمیل جلسه
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">پکیج‌ها و خدمات آموزشی فعال</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-surface-subtle border space-y-2">
              <h3 className="font-bold text-sm text-foreground">پکیج مقدماتی فرمان‌پذیری (۵ جلسه)</h3>
              <p className="text-xs text-muted-foreground">آموزش بشین، بیا، بمون و همگام‌قدم</p>
              <div className="text-lg font-bold font-mono text-purple-600">۲,۸۰۰,۰۰۰ تومان</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border space-y-2">
              <h3 className="font-bold text-sm text-foreground">پکیج اصلاح رفتاری پیشرفته</h3>
              <p className="text-xs text-muted-foreground">کنترل پارس بی‌دلیل و پرخاشگری محیطی</p>
              <div className="text-lg font-bold font-mono text-purple-600">۴,۲۰۰,۰۰۰ تومان</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border space-y-2">
              <h3 className="font-bold text-sm text-foreground">جلسه تک‌مشاوره آنلاین</h3>
              <p className="text-xs text-muted-foreground">ارزیابی تصویری اولیه رفتار پت</p>
              <div className="text-lg font-bold font-mono text-purple-600">۴۵۰,۰۰۰ تومان</div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground">نظرات تأییدشده سرپرستان پت</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-surface-subtle border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">سینا کریمی (سرپرست ماکس)</span>
                <div className="flex text-amber-500">★★★★★</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                بعد از جلسه دوم رفتار ماکس با زنگ در کاملاً تغییر کرد و آرام شد. بسیار صبور و حرفه‌ای.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
