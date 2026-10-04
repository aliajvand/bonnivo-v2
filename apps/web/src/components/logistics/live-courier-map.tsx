"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export type CourierStatus = "COURIER_ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

interface LiveCourierMapProps {
  orderId?: string;
  recipientAddress?: string;
  district?: number;
  deliveryTier?: "STANDARD" | "EXPRESS_3H";
}

export function LiveCourierMap({
  orderId = "ORD-2026-TEH-8821",
  recipientAddress = "تهران، شهرک غرب، خیابان ایران‌زمین، کوچه دوم، پلاک ۸",
  district = 2,
  deliveryTier = "EXPRESS_3H",
}: LiveCourierMapProps) {
  const [status, setStatus] = useState<CourierStatus>("IN_TRANSIT");
  const [courierPosition, setCourierPosition] = useState({ x: 55, y: 48 }); // percent on map
  const [etaMinutes, setEtaMinutes] = useState(38);
  const [distanceKm, setDistanceKm] = useState(2.8);

  // Animate courier movement along route
  useEffect(() => {
    if (status !== "IN_TRANSIT") return;

    const interval = setInterval(() => {
      setCourierPosition((prev) => {
        // Move towards destination (75, 28)
        const targetX = 75;
        const targetY = 28;
        const dx = (targetX - prev.x) * 0.08;
        const dy = (targetY - prev.y) * 0.08;

        const newX = prev.x + dx;
        const newY = prev.y + dy;

        // Decrease distance and ETA proportionally
        const distRemaining = Math.sqrt(Math.pow(targetX - newX, 2) + Math.pow(targetY - newY, 2)) * 0.08;
        setDistanceKm(Math.max(0.4, Number(distRemaining.toFixed(1))));
        setEtaMinutes(Math.max(5, Math.round(distRemaining * 12)));

        return { x: newX, y: newY };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  const statusSteps = [
    { key: "COURIER_ASSIGNED", label: "تخصیص سفیر" },
    { key: "PICKED_UP", label: "دریافت از انبار" },
    { key: "IN_TRANSIT", label: "در مسیر تحویل" },
    { key: "DELIVERED", label: "تحویل شد" },
  ];

  const currentStepIdx = statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl" dir="rtl">
      {/* Top Header Card */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-extrabold text-white text-base sm:text-lg">رهگیری زنده سفیر بونیو اکسپرس</h3>
            <span className="text-[11px] bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30 font-bold">
              {deliveryTier === "EXPRESS_3H" ? "اکسپرس زیر ۳ ساعت" : "همان‌روز"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            شماره سفارش: <strong className="text-slate-200 font-mono" dir="ltr">{orderId}</strong> • مقصد: منطقه {district} تهران
          </p>
        </div>

        {/* ETA & Distance Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">زمان تخمینی تحویل</span>
            <span className="text-sm font-extrabold text-teal-300">{etaMinutes} دقیقه دیگر</span>
          </div>
          <div className="w-px h-7 bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">فاصله تا مقصد</span>
            <span className="text-sm font-extrabold text-white">{distanceKm} کیلومتر</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulated Map Canvas Area */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-950 overflow-hidden select-none">
        {/* Stylized Dark Tehran Map Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main Highway Lines (Niayesh, Hemmat, Chamran, Yadegar) */}
          <path d="M 0 120 Q 300 180 800 140" fill="none" stroke="#0f766e" strokeWidth="3" strokeDasharray="6,4" />
          <path d="M 150 0 Q 320 250 450 400" fill="none" stroke="#334155" strokeWidth="2.5" />
          <path d="M 0 260 Q 400 240 800 290" fill="none" stroke="#1e293b" strokeWidth="4" />
          <path d="M 600 0 Q 580 200 680 400" fill="none" stroke="#334155" strokeWidth="2" />
        </svg>

        {/* Planned Route Line (Warehouse to Customer) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 25% 72% Q 40% 60% 55% 48% T 75% 28%"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="8,6"
            className="animate-pulse opacity-80"
          />
        </svg>

        {/* 1. Origin Marker: Central Bonyo Warehouse */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ left: "25%", top: "72%" }}
        >
          <div className="w-9 h-9 rounded-2xl bg-slate-900 border-2 border-slate-600 shadow-xl flex items-center justify-center text-sm">
            🏢
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-700/60 mt-1 inline-block whitespace-nowrap">
            انبار مرکزی بونیو
          </span>
        </div>

        {/* 2. Destination Marker: Customer Address */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ left: "75%", top: "28%" }}
        >
          <div className="relative">
            <span className="animate-ping absolute -inset-1 rounded-full bg-emerald-400 opacity-60"></span>
            <div className="relative w-10 h-10 rounded-2xl bg-emerald-600 border-2 border-emerald-300 shadow-2xl flex items-center justify-center text-white text-base">
              📍
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-200 bg-slate-900/95 px-2.5 py-0.5 rounded-full border border-emerald-500/40 mt-1 inline-block whitespace-nowrap shadow-md">
            آدرس تحویل شما
          </span>
        </div>

        {/* 3. Moving Courier Marker */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${courierPosition.x}%`, top: `${courierPosition.y}%` }}
        >
          <div className="relative group cursor-pointer">
            <span className="animate-ping absolute -inset-2 rounded-full bg-teal-400 opacity-75"></span>
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xl">
              🛵
            </div>
            {/* Courier Floating Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 text-white text-xs py-1.5 px-3 rounded-xl border border-slate-700 shadow-xl whitespace-nowrap pointer-events-none">
              <strong className="text-teal-300">سفیر: رضا مرادی</strong> (پلاک ۲۲-۳۱۴ ط ۸۸)
            </div>
          </div>
        </div>

        {/* District & Speed HUD Pill */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>محدوده:</span>
            <strong className="text-white">بزرگراه یادگار امام / نیایش</strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>سرعت سفیر:</span>
            <span className="text-emerald-400 font-mono">۴۵ km/h</span>
          </div>
        </div>
      </div>

      {/* State Machine Steps Progression Bar */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/80">
        <div className="grid grid-cols-4 gap-2 relative">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div key={step.key} className="text-center relative">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                    isCompleted
                      ? "bg-teal-500 text-white shadow-md shadow-teal-900/50"
                      : "bg-slate-800 text-slate-500"
                  } ${isCurrent ? "ring-4 ring-teal-500/30" : ""}`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-xs block font-semibold ${
                    isCurrent ? "text-teal-300 font-bold" : isCompleted ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier Profile & Contact Actions Footer */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-2xl">
            👨🏻‍✈️
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">سفیر اختصاصی: رضا مرادی</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              موتور سیکلت باکس‌دار ویژه حمل غذای حساس و تجهیزات پت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:09195556677"
            className="rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 px-4 py-2.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>📞</span>
            <span>تماس امن با سفیر</span>
          </a>

          <Link
            href="/shop"
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 text-xs font-semibold transition-all"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}
