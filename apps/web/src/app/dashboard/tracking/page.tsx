"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Check, 
  User, 
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  QrCode
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { LiveCourierMap } from "@/components/logistics/live-courier-map";
import { cn } from "@/lib/utils";

interface StageInfo {
  number: number;
  title: string;
  shortDesc: string;
  subTasks: string[];
}

const operationalStages: StageInfo[] = [
  {
    number: 1,
    title: "ثبت و تأیید پرداخت سفارش",
    shortDesc: "تراکنش بانکی موفق و ایجاد رکورد سفارش در هسته بونیو",
    subTasks: [
      "تأیید تراکنش شاپرک / زرین‌پال",
      "صدور شناسه یکتای سفارش (Order ID)",
      "ارسال پیامک خوش‌آمد و تأیید ثبت سفارش به سرپرست",
    ],
  },
  {
    number: 2,
    title: "جمع‌آوری اقلام از تأمین‌کنندگان",
    shortDesc: "تأمین از انبارهای تخصصی و تطبیق اصالت اقلام",
    subTasks: [
      "اطلاع‌رسانی سیستمی به فروشندگان برنده بای‌باکس",
      "بررسی تاریخ انقضا و بارکد کالا",
      "خروج کالا از قفسه انبار (Item Picking)",
    ],
  },
  {
    number: 3,
    title: "بسته‌بندی و پلمب امنیتی",
    shortDesc: "بسته‌بندی با عایق حرارتی و نصب لیبل پلمب ۴ ساعته",
    subTasks: [
      "قرار دادن اقلام در کارتن استاندارد بونیو با محافظ ضربه",
      "الصاق هولوگرام و برچسب پلمب امنیتی عدم دستکاری",
      "صدور فاکتور رسمی و شناسنامه اقلام مرسوله",
    ],
  },
  {
    number: 4,
    title: "ارسال به هاب مرکزی توزیع",
    shortDesc: "ورود به مرکز لجستیک و مسیریابی هوشمند مناطق تهران",
    subTasks: [
      "بارگیری و انتقال به مرکز پردازش مرکزی",
      "تفکیک براساس منطقه شهرداری مقصد",
      "زمان‌بندی نوبت شیفت ارسالی",
    ],
  },
  {
    number: 5,
    title: "تحویل به سفیر و حمل در مسیر",
    shortDesc: "سفیر بونیو در مسیر نشانی شماست (رهگیری زنده نقشه)",
    subTasks: [
      "تخصیص سفیر معتمد و تحویل مرسوله به پیک",
      "ارسال پیامک کد امنیتی تحویل (Delivery OTP)",
      "ردیابی موقعیت مکانی لحظه‌ای سفیر روی نقشه",
    ],
  },
  {
    number: 6,
    title: "تحویل موفق به سرپرست پت",
    shortDesc: "تطبیق کد تحویل و آغاز مهلت ۴ ساعته ضمانت بونیو",
    subTasks: [
      "رسیدن سفیر به درب نشانی خریدار",
      "دریافت کد امنیتی ۴ رقمی از تحویل‌گیرنده",
      "ثبت وضعیت DELIVERED و شروع مهلت تضمین اصالت",
    ],
  },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId");
  const { lastOrder } = useCart();

  // Active Stage (1 to 6)
  const [currentStage, setCurrentStage] = useState<number>(
    lastOrder?.fulfillmentStage || 3
  );

  // Completed subtasks per stage (mapped by "stageNumber-subTaskIndex")
  const [completedSubtasks, setCompletedSubtasks] = useState<Record<string, boolean>>({
    "1-0": true, "1-1": true, "1-2": true,
    "2-0": true, "2-1": true, "2-2": true,
    "3-0": true, "3-1": true, "3-2": false,
  });

  const orderId = urlOrderId || lastOrder?.orderId || "ORD-2026-TEH-8821";
  const orderNumber = lastOrder?.orderNumber || "BNY-748921";
  const recipientName = lastOrder?.recipientName || "علی ایجرندی";
  const recipientPhone = lastOrder?.recipientPhone || "09121234567";
  const deliveryAddress = lastOrder?.deliveryAddress || "تهران، شهرک غرب، خیابان ایران‌زمین، کوچه دوم، پلاک ۸";
  const deliveryShift = lastOrder?.deliveryShiftLabel || "فردا (پنج‌شنبه) • شیفت عصر (۱۴:۰۰ الی ۱۸:۰۰)";

  const toggleSubtask = (stageNum: number, taskIdx: number) => {
    const key = `${stageNum}-${taskIdx}`;
    setCompletedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Check if all subtasks in a stage are completed
  const isStageFullyCompleted = (stageNum: number) => {
    const stage = operationalStages.find((s) => s.number === stageNum);
    if (!stage) return false;
    return stage.subTasks.every((_, idx) => completedSubtasks[`${stageNum}-${idx}`]);
  };

  const advanceStage = () => {
    if (currentStage < 6) {
      const next = currentStage + 1;
      // mark previous stage subtasks as complete
      const updated = { ...completedSubtasks };
      operationalStages[currentStage - 1].subTasks.forEach((_, idx) => {
        updated[`${currentStage}-${idx}`] = true;
      });
      setCompletedSubtasks(updated);
      setCurrentStage(next);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">
          داشبورد
        </Link>
        <span>/</span>
        <Link href="/dashboard/pets" className="hover:text-primary">
          پت‌های من
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">رهگیری ۶ مرحله‌ای سفارش</span>
      </div>

      {/* Main Header & Order Overview Banner */}
      <div className="bg-surface-elevated rounded-3xl p-6 sm:p-8 border border-border/80 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
              پرداخت با موفقیت انجام شده ✓
            </span>
            <span className="font-mono font-bold text-xs bg-surface-subtle px-2.5 py-1 rounded-full border border-border text-primary">
              {orderNumber}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            رهگیری فرآیند پردازش و ارسال مرسوله
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            تحویل‌گیرنده: <strong className="text-foreground">{recipientName}</strong> ({recipientPhone}) • زمان‌بندی: {deliveryShift}
          </p>
        </div>

        {/* Auditor / User Interactive Stepper Controls */}
        <div className="bg-surface-subtle p-3.5 rounded-2xl border border-border flex flex-col gap-2 shrink-0">
          <span className="text-[11px] font-bold text-muted-foreground text-center">
            تست شبیه‌ساز پیشرفت مراحل عملیاتی
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStage <= 1}
              onClick={prevStage}
              className="p-2 rounded-xl bg-surface hover:bg-black/5 disabled:opacity-40 text-foreground text-xs font-bold flex items-center gap-1 border border-border"
            >
              <ChevronRight className="w-4 h-4" />
              مرحله قبل
            </button>
            <span className="text-xs font-black text-primary px-2 font-mono">
              مرحله {currentStage} از ۶
            </span>
            <button
              type="button"
              disabled={currentStage >= 6}
              onClick={advanceStage}
              className="p-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              مرحله بعد
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6-Stage Horizontal Progress Stepper */}
      <div className="bg-surface-elevated rounded-3xl p-6 border border-border/80 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>چرخه ۶ مرحله‌ای عملیات توزیع بونیو</span>
        </h2>

        {/* Stepper Track */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {operationalStages.map((stage) => {
            const isPassed = stage.number < currentStage;
            const isCurrent = stage.number === currentStage;
            const isPending = stage.number > currentStage;

            return (
              <div
                key={stage.number}
                onClick={() => setCurrentStage(stage.number)}
                className={cn(
                  "p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-3 relative",
                  isCurrent && "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-xs",
                  isPassed && "bg-emerald-500/5 border-emerald-500/30 text-emerald-900 dark:text-emerald-300",
                  isPending && "bg-surface-subtle/50 border-border/60 opacity-60 hover:opacity-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono",
                    isCurrent && "bg-primary text-white",
                    isPassed && "bg-emerald-600 text-white",
                    isPending && "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {isPassed ? "✓" : stage.number}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isCurrent && "bg-primary/20 text-primary",
                    isPassed && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                    isPending && "bg-muted/10 text-muted-foreground"
                  )}>
                    {isCurrent ? "در جریان" : isPassed ? "انجام شد" : "در انتظار"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-black text-foreground leading-snug line-clamp-1">
                    {stage.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {stage.shortDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Operational Subtasks for Active Stage */}
        <div className="mt-4 p-5 rounded-2xl bg-surface-subtle/80 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h3 className="font-bold text-xs sm:text-sm text-foreground">
                چک‌لیست کنترل کیفیت و وظایف مرحله {currentStage}: {operationalStages[currentStage - 1].title}
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              تکمیل کلیه موارد جهت ورود به مرحله بعد الزامی است
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {operationalStages[currentStage - 1].subTasks.map((taskText, idx) => {
              const key = `${currentStage}-${idx}`;
              const isChecked = !!completedSubtasks[key];

              return (
                <div
                  key={idx}
                  onClick={() => toggleSubtask(currentStage, idx)}
                  className={cn(
                    "p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none text-xs",
                    isChecked
                      ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                      : "bg-surface border-border text-foreground hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-transform",
                    isChecked ? "bg-emerald-600 text-white" : "border border-muted text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className={cn("leading-relaxed", isChecked && "font-medium")}>
                    {taskText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Live Map Section (Available when courier is dispatched, Stage >= 4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-black text-foreground">
              رهگیری زنده سفیر بونیو اکسپرس روی نقشه
            </h2>
          </div>
          {currentStage < 4 ? (
            <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
              نقشه با رسیدن به مرحله ۴ (توزیع مرکزی) فعال می‌شود
            </span>
          ) : (
            <span className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              موقعیت زنده سفیر فعال است
            </span>
          )}
        </div>

        {/* Map View */}
        <div className={cn("transition-opacity duration-300", currentStage < 4 && "opacity-60")}>
          <LiveCourierMap
            orderId={orderNumber}
            recipientAddress={deliveryAddress}
            district={2}
            deliveryTier="EXPRESS_3H"
          />
        </div>
      </div>

      {/* Address & Security Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span>نشانی پستی تحویل مرسوله</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{deliveryAddress}</p>
          <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50">
            تحویل‌گیرنده: {recipientName} • تماس: {recipientPhone}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>کد امنیتی تحویل و پلمب ۴ ساعته</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            مرسوله با هولوگرام یکتا پلمب شده است. لطفاً هنگام تحویل از سفیر، کد ۴ رقمی پیامک‌شده را به ایشان اعلام فرمایید. مهلت ۴ ساعته استرداد بلافاصله پس از دریافت فعال خواهد شد.
          </p>
        </div>
      </div>

    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-muted-foreground">
        در حال بارگذاری اطلاعات رهگیری...
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
