"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft, Sparkles, GraduationCap } from "lucide-react";

export function CityEventBanner() {
  const [userCity, setUserCity] = useState("تهران");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("bonnivo_user_city");
      if (savedCity) {
        setUserCity(savedCity);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="rounded-2xl bg-gradient-to-l from-emerald-950/90 via-[#0d1e18] to-stone-900 p-3 sm:py-3.5 sm:px-5 border border-emerald-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        
        {/* Right Info (RTL) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                رویداد و آموزش {userCity}
              </span>
              <span className="text-[11px] text-stone-300 font-bold hidden sm:inline">
                جمعه این هفته • ساعت ۱۶:۰۰
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">
              دورهمی پاییزه سرپرستان پت و کارگاه اصلاح رفتار با مربیان ارشد بنیوو
            </p>
          </div>
        </div>

        {/* Left CTA (RTL) */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <Link
            href="/events/ev-1"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span>مشاهده و ثبت‌نام</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
