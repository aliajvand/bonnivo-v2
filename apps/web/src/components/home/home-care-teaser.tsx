"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Plus, Sparkles } from "lucide-react";
import { usePet } from "@/context/pet-context";

export function HomeCareTeaser() {
  const { pets, activePet, activePetTasks, dailyProgressPercentage, setIsWizardOpen } = usePet();

  if (!pets.length || !activePet) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                هنوز شناسنامه پت خود را ثبت نکرده‌اید؟
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                با ثبت اطلاعات پت، برنامه پیاده‌روی، یادآورهای غذا و خرید هوشمند برای شما فعال می‌شود.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0"
          >
            + ساخت رایگان شناسنامه پت
          </button>
        </div>
      </section>
    );
  }

  const completedCount = activePetTasks.filter((t) => t.isCompleted).length;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/15">
        <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden p-2">
            <Image 
              src={activePet.avatarUrl} 
              alt={activePet.name} 
              width={48} 
              height={48} 
              className="object-contain" 
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>برنامه مراقبت امروز {activePet.name}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {completedCount} از {activePetTasks.length} وظیفه امروز انجام شد ({dailyProgressPercentage}٪ پیشرفت)
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              نژاد: {activePet.breed} • وزن: {activePet.weightKg || "—"} کیلوگرم
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link
            href="/dashboard/care"
            className="w-full md:w-auto text-center px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-all duration-200 shadow-sm"
          >
            مشاهده داشبورد مراقبت
          </Link>
        </div>
      </div>
    </section>
  );
}
