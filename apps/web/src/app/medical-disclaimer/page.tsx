"use client";

import React from "react";
import { AlertCircle, Stethoscope, HeartPulse } from "lucide-react";

export default function MedicalDisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">سلب مسئولیت پزشکی و بالینی</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          سلب مسئولیت بالینی و پزشکی اکوسیستم بونیو
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          دستورالعمل تعامل با مشاوره هوش مصنوعی و اطلاعات مقالات سلامت
        </p>
      </div>

      <div className="space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        <div className="p-6 rounded-3xl bg-surface-elevated border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <HeartPulse className="w-6 h-6" />
            <h2 className="text-base font-bold text-foreground">هشدار موارد اورژانسی (Emergency Notice)</h2>
          </div>
          <p>
            محتوای آموزشی بونیو، چت‌بات پشتیبان و برنامه مراقبت به هیچ وجه جایگزین معاینه حضوری، سونوگرافی، آزمایش خون و تشخیص قطعی دکتر دامپزشک نیست. در صورت مشاهده علائم حاد نظیر تنگی نفس، تشنج، خونریزی، بلع جسم خارجی یا بی‌حالی شدید، بلافاصله پت خود را به نزدیک‌ترین بیمارستان دامپزشکی شبانه‌روزی برسانید.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>مسئولیت تشخیص و درمان</span>
          </h2>
          <p>
            هرگونه تجویز دارو، تعیین دوز آنتی‌بیوتیک یا واکسیناسیون باید منحصراً توسط دامپزشک دارای شماره نظام دامپزشکی معتبر انجام پذیرد. بونیو بستری امن جهت اتصال سرپرست به پزشک و مدیریت پرونده فراهم می‌کند و در قبال اقدامات درمانی خارج از این چارچوب مسئولیتی ندارد.
          </p>
        </div>
      </div>
    </div>
  );
}
