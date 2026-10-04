"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Heart,
  ShoppingBag,
  Repeat,
  QrCode,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  Stethoscope,
  Smile,
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface DailyCareTask {
  id: string;
  title: string;
  time: string;
  category: "FOOD" | "MED" | "WALK" | "HYGIENE";
  completed: boolean;
}

export default function CustomerDashboardPage() {
  const { currentPet, pets, selectPet } = usePet();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<DailyCareTask[]>([
    { id: "t-1", title: "وعده صبح: غذای خشک رویال کنین (۸۰ گرم)", time: "۰۸:۳۰ صبح", category: "FOOD", completed: true },
    { id: "t-2", title: "پیاده‌روی صبحگاهی و بازی حیاط", time: "۰۹:۱۵ صبح", category: "WALK", completed: true },
    { id: "t-3", title: "قطره مکمل مفاصل و امگا۳", time: "۱۴:۰۰ بعدازظهر", category: "MED", completed: false },
    { id: "t-4", title: "برس‌کشی روزانه موها و معاینه لثه", time: "۱۹:۳۰ عصر", category: "HYGIENE", completed: false },
    { id: "t-5", title: "وعده شام: کنسرو مرغ و برنج با کدو", time: "۲۱:۰۰ شب", category: "FOOD", completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Top Greeting & Pet Switcher */}
      <div className="bg-surface-elevated/80 dark:bg-slate-900/60 p-6 rounded-3xl border border-border/80 backdrop-blur-xl shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black text-foreground">
              روز به‌خیر، {user?.fullName || "سرپرست عزیز"}!
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            برنامه سلامت و مراقبت امروز {currentPet?.name || "پت شما"} آماده پیگیری است.
          </p>
        </div>

        {/* Pet Switcher Buttons */}
        <div className="flex items-center gap-2 bg-surface-subtle p-1.5 rounded-2xl border border-border/60">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => selectPet(pet.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                currentPet?.id === pet.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              )}
            >
              <span className="text-base">{pet.species === "DOG" ? "🐶" : "🐱"}</span>
              <span>{pet.name}</span>
            </button>
          ))}
          <Link
            href="/dashboard/pets"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-bold"
            title="مدیریت پت‌ها"
          >
            +
          </Link>
        </div>
      </div>

      {/* Main Grid: Today's Routine & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Today's Care Routine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Care Card */}
          <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  برنامه مراقبت امروز (Today)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedCount} از {tasks.length} وظیفه انجام شده است ({progressPercent}٪)
                </p>
              </div>

              <Link
                href="/dashboard/care"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                برنامه هفتگی
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Tasks List */}
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                    task.completed
                      ? "bg-surface-subtle/50 border-border/40 opacity-70"
                      : "bg-surface-elevated hover:bg-surface-subtle border-border/70 shadow-xs"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="تکمیل وظیفه"
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                        task.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border/80 hover:border-emerald-500 text-transparent"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>
                    <div>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{task.time}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      task.category === "FOOD" && "bg-amber-500/10 text-amber-600",
                      task.category === "MED" && "bg-rose-500/10 text-rose-600",
                      task.category === "WALK" && "bg-blue-500/10 text-blue-600",
                      task.category === "HYGIENE" && "bg-purple-500/10 text-purple-600"
                    )}
                  >
                    {task.category === "FOOD" && "تغذیه"}
                    {task.category === "MED" && "دارو و مکمل"}
                    {task.category === "WALK" && "فعالیت"}
                    {task.category === "HYGIENE" && "بهداشت"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts: QR Passport + Autoship + Orders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Passport Hub Card */}
            <Link
              href="/dashboard/passport"
              className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">شناسنامه و پاسپورت هوشمند QR</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">پلاک ضد گم‌شدن با تماس اضطراری</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </Link>

            {/* Autoship Subscriptions Card */}
            <Link
              href="/dashboard/subscriptions"
              className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm hover:border-blue-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Repeat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">شارژ خودکار (Autoship)</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">ارسال منظم خاک و غذای خشک</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column (1/3): Pet Profile Snapshot & Upcoming Appointment */}
        <div className="space-y-6">
          {/* Pet Snapshot Card */}
          <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl">
                {currentPet?.species === "DOG" ? "🐶" : "🐱"}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{currentPet?.name || "پت شما"}</h3>
                <p className="text-xs text-muted-foreground">{currentPet?.breed || "نژاد مشخص نشده"}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-muted-foreground">
                  <span>وزن: {currentPet?.weightKg || "۴.۲"} کیلوگرم</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-subtle border border-border/50 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">وضعیت واکسیناسیون:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">به‌روز (تا دی ۱۴۰۳)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ضمانت خرید فعال:</span>
                <span className="font-bold text-blue-600">۴ ساعته بونیو</span>
              </div>
            </div>

            <Link
              href="/dashboard/pets"
              className="w-full py-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated border border-border/60 text-xs font-bold text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              مشاهده پرونده کامل سلامت
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Upcoming Vet Appointment Card */}
          <div className="bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-5 rounded-3xl border border-teal-500/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" />
                نوبت ویزیت بعدی
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                تأیید شده
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground">چکاپ فصلی و انگل‌تراپی</h4>
              <p className="text-xs text-muted-foreground mt-0.5">کلینیک دامپزشکی مهرگان • دکتر رادمنش</p>
              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-foreground font-bold">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>پنجشنبه، ۱۹ مهر • ۱۱:۳۰ صبح</span>
              </div>
            </div>

            <Link
              href="/vets"
              className="inline-block text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-1"
            >
              مدیریت یا جابجایی نوبت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
