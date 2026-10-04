"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Plus, 
  Award, 
  Heart, 
  Flame, 
  Calendar, 
  Utensils, 
  Footprints, 
  Droplet, 
  ShieldAlert,
  ArrowLeft,
  Lock,
  Trash2,
  X,
  Stethoscope,
  User,
  Cpu,
  Filter
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { MultiPetSwitcher } from "@/components/pet/multi-pet-switcher";
import { SmartReorderWidget } from "@/components/care/smart-reorder-widget";
import { TaskCategory, CareTask } from "@/types/pet";
import { cn } from "@/lib/utils";

type DayView = "YESTERDAY" | "TODAY" | "TOMORROW";
type FilterRole = "ALL" | "OWNER" | "VET" | "SYSTEM";

export function TodayCareDashboard() {
  const { 
    pets, 
    activePet, 
    activePetTasks, 
    toggleTaskCompletion, 
    addTask,
    deleteTask,
    dailyProgressPercentage,
    walkProgressMinutes,
    setIsWizardOpen 
  } = usePet();

  // State
  const [selectedDay, setSelectedDay] = useState<DayView>("TODAY");
  const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // New Task Form
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("۱۸:۰۰");
  const [newCategory, setNewCategory] = useState<TaskCategory>("FOOD");
  const [newNotes, setNewNotes] = useState("");

  // Filter tasks based on role and day
  const filteredTasks = useMemo(() => {
    return activePetTasks.filter((task) => {
      if (filterRole === "OWNER" && task.creatorRole !== "OWNER") return false;
      if (filterRole === "VET" && task.creatorRole !== "VET") return false;
      if (filterRole === "SYSTEM" && task.creatorRole !== "SYSTEM") return false;
      return true;
    });
  }, [activePetTasks, filterRole]);

  // If no pets registered, render the Empty State
  if (!pets.length || !activePet) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
        <div className="glass-card rounded-4xl p-8 sm:p-14 text-center border border-border/80 shadow-glass">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10 text-primary animate-pulse" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            هنوز پتی برای شما ثبت نشده است!
          </h2>

          <p className="mt-2 text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
            با ساخت اولین شناسنامه پت، برنامه اختصاصی مراقبت روزانه، یادآورهای تغذیه و تخمین اتمام غذا به صورت هوشمند برای شما فعال می‌شود.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ساخت شناسنامه اولین پت</span>
            </button>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground font-medium text-sm transition-all"
            >
              <span>مشاهده محصولات فروشگاه</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedTasksCount = activePetTasks.filter((t) => t.isCompleted).length;
  const isAllCompleted = activePetTasks.length > 0 && completedTasksCount === activePetTasks.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      petId: activePet.id,
      title: newTitle.trim(),
      species: activePet.species,
      category: newCategory,
      scheduledTime: newTime,
      notes: newNotes.trim() || undefined,
      isCompleted: false,
      creatorRole: "OWNER",
      isLocked: false,
    });

    setNewTitle("");
    setNewNotes("");
    setIsNewTaskModalOpen(false);
  };

  const handleDeleteTask = (e: React.MouseEvent, task: CareTask) => {
    e.stopPropagation();
    if (task.isLocked || task.creatorRole === "VET") {
      setLockedNotice(`دستور درمانی «${task.title}» توسط دامپزشک ثبت شده و به دلایل پزشکی تنها توسط پزشک معالج قابل حذف است.`);
      setTimeout(() => setLockedNotice(null), 5000);
      return;
    }
    deleteTask(task.id);
  };

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* 1. Multi-Pet Switcher Header */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-border/60">
        <MultiPetSwitcher />
      </div>

      {/* 2. Today Overview Banner (Progress & Walking Bar) */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-primary/15 relative overflow-hidden">
        
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 end-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Active Pet Identity & Day Navigation */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 border shrink-0 shadow-xs",
              activePet.species === "DOG" && "bg-amber-50 border-amber-200/80",
              activePet.species === "CAT" && "bg-purple-50 border-purple-200/80",
              activePet.species === "BIRD" && "bg-sky-50 border-sky-200/80",
              activePet.species === "SMALL_PET" && "bg-emerald-50 border-emerald-200/80"
            )}>
              <Image
                src={activePet.avatarUrl}
                alt={activePet.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  برنامه مراقبت {activePet.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {activePet.breed}
                </span>
              </div>

              {/* Day Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-subtle/80 p-1 rounded-2xl border border-border/60 w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedDay("YESTERDAY")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                    selectedDay === "YESTERDAY"
                      ? "bg-surface-elevated text-primary shadow-xs"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  دیروز
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay("TODAY")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                    selectedDay === "TODAY"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  امروز (جاری)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay("TOMORROW")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                    selectedDay === "TOMORROW"
                      ? "bg-surface-elevated text-primary shadow-xs"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  فردا
                </button>
              </div>
            </div>
          </div>

          {/* Daily Progress Ring / Counter */}
          <div className="flex items-center gap-4 bg-surface-subtle/80 rounded-2xl p-3.5 border border-border/60">
            <div className="flex flex-col text-end">
              <span className="text-xs font-semibold text-muted">
                پیشرفت کارهای {selectedDay === "TODAY" ? "امروز" : selectedDay === "YESTERDAY" ? "دیروز" : "فردا"}
              </span>
              <span className="text-lg font-black text-foreground">
                {completedTasksCount} از {activePetTasks.length} وظیفه ({dailyProgressPercentage}٪)
              </span>
            </div>

            {/* Circular Gauge / Percentage Badge */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 shadow-xs",
              isAllCompleted
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-primary text-white border-primary/30"
            )}>
              {dailyProgressPercentage}٪
            </div>
          </div>

        </div>

        {/* Dog Walking Progress Bar (Rendered for Dogs) */}
        {activePet.species === "DOG" && (
          <div className="mt-6 pt-5 border-t border-border/50">
            <div className="flex items-center justify-between text-xs font-bold text-foreground mb-2">
              <span className="flex items-center gap-1.5 text-terracotta">
                <Footprints className="w-4 h-4" />
                <span>ورزش و پیاده‌روی روزانه {activePet.name}</span>
              </span>
              <span>
                {walkProgressMinutes.completed} از {walkProgressMinutes.target} دقیقه
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden border border-border/60">
              <div 
                className="h-full rounded-full bg-linear-to-r from-terracotta to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((walkProgressMinutes.completed / walkProgressMinutes.target) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* 100% Completed Celebration Banner */}
        {isAllCompleted && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-900 font-medium">
              <span className="font-bold block">عالی بود! تمام کارهای امروز {activePet.name} انجام شد.</span>
              پت شما امروز در شادترین و سالم‌ترین وضعیت خود قرار دارد 🎉
            </div>
          </div>
        )}

      </div>

      {/* 2.5 Smart Replenishment & Buy Again Widget */}
      <SmartReorderWidget />

      {/* Locked Task Notice Toast if clicked delete on locked task */}
      {lockedNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* 3. Interactive Tasks List Header & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-base font-black text-foreground">
              وظایف و مراقبت‌های روزانه
            </h2>
            <p className="text-xs text-muted">
              برای ثبت انجام، روی هر کارت کلیک کنید • وظایف دامپزشک با قفل امنیتی مشخص شده‌اند
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-2xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setFilterRole("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-xl font-bold transition-all",
                  filterRole === "ALL" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
                )}
              >
                همه ({activePetTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRole("OWNER")}
                className={cn(
                  "px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1",
                  filterRole === "OWNER" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
                )}
              >
                <User className="w-3 h-3" />
                صاحب پت
              </button>
              <button
                type="button"
                onClick={() => setFilterRole("VET")}
                className={cn(
                  "px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1",
                  filterRole === "VET" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
                )}
              >
                <Stethoscope className="w-3 h-3 text-rose-500" />
                دامپزشک
              </button>
              <button
                type="button"
                onClick={() => setFilterRole("SYSTEM")}
                className={cn(
                  "px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1",
                  filterRole === "SYSTEM" ? "bg-surface-elevated text-primary shadow-xs" : "text-muted hover:text-foreground"
                )}
              >
                <Cpu className="w-3 h-3 text-sky-500" />
                سیستم
              </button>
            </div>

            {/* Add Owner Task Button */}
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(true)}
              className="py-1.5 px-3.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مراقبت جدید</span>
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTasks.map((task) => {
            const isDone = task.isCompleted;
            const isVet = task.creatorRole === "VET" || task.isLocked;

            return (
              <div
                key={task.id}
                onClick={() => toggleTaskCompletion(task.id)}
                className={cn(
                  "group p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer select-none flex items-start justify-between gap-4 relative",
                  isDone
                    ? "bg-white/60 dark:bg-slate-900/40 border-emerald-200/70 dark:border-emerald-900/40 shadow-2xs opacity-85"
                    : isVet
                    ? "glass-card border-rose-500/20 hover:border-rose-500/40"
                    : "glass-card glass-card-hover border-border/70 hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Interactive Checkbox */}
                  <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110 active:scale-90">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted group-hover:text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Role & Lock Badges */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {isVet ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20">
                          <Lock className="w-2.5 h-2.5" />
                          <span>تجویز دامپزشک (قفل شده)</span>
                        </span>
                      ) : task.creatorRole === "SYSTEM" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[10px] font-bold border border-sky-500/20">
                          <Cpu className="w-2.5 h-2.5" />
                          <span>هوشمند سیستم</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-muted text-[10px] font-bold border border-border">
                          <User className="w-2.5 h-2.5" />
                          <span>سرپرست</span>
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h3 className={cn(
                      "text-sm font-bold transition-all truncate",
                      isDone ? "line-through text-muted" : "text-foreground"
                    )}>
                      {task.title}
                    </h3>

                    {/* Task Details & Time */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted">
                      {task.scheduledTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-subtle text-[11px] font-medium border border-border/50">
                          <Clock className="w-3 h-3 text-muted" />
                          <span>ساعت {task.scheduledTime}</span>
                        </span>
                      )}

                      {task.notes && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {task.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Area: Category Icon + Delete Button for Owner Tasks */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="p-2 rounded-xl bg-surface-subtle border border-border/40 text-muted">
                    {task.category === "FOOD" && <Utensils className="w-4 h-4 text-orange-500" />}
                    {task.category === "WALK" && <Footprints className="w-4 h-4 text-emerald-600" />}
                    {task.category === "WATER" && <Droplet className="w-4 h-4 text-sky-500" />}
                    {task.category === "HYGIENE" && <Sparkles className="w-4 h-4 text-teal-600" />}
                    {task.category === "MEDICATION" && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                  </div>

                  {!isVet && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(e, task)}
                      title="حذف مراقبت"
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-rose-600 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Care Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-elevated border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>تعریف مراقبت جدید برای {activePet.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-subtle text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1.5">عنوان مراقبت یا یادآوری *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: دادن مالت، شانه زدن، پیاده‌روی بعدازظهر"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">دسته‌بندی</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="FOOD">غذا و تغذیه</option>
                    <option value="WALK">ورزش و پیاده‌روی</option>
                    <option value="WATER">آب و هیدراتاسیون</option>
                    <option value="HYGIENE">بهداشت و نظافت</option>
                    <option value="MEDICATION">دارو و مکمل</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">ساعت یادآوری</label>
                  <input
                    type="text"
                    placeholder="مثلاً: ۰۹:۳۰ یا ۱۸:۰۰"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs font-mono text-center focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">توضیحات و مقادیر (اختیاری)</label>
                <textarea
                  rows={2}
                  placeholder="مثلاً: به مقدار ۵۰ گرم، همراه با تشویقی مورد علاقه"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-surface-subtle p-3 rounded-2xl border border-border text-foreground text-xs resize-none focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-bold hover:bg-surface-subtle transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-xs"
                >
                  ثبت مراقبت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
