"use client";

import React from "react";
import { ShieldCheck, Lock, EyeOff, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">سند رسمی امنیت و حریم خصوصی</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          حفظ حریم خصوصی و امنیت داده‌های سرپرستان و پت‌ها در بونیو
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          آخرین بازنگری: مهرماه ۱۴۰۳ • نسخه رسمی ۲.۴ پلتفرم بونیو
        </p>
      </div>

      <div className="space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-500" />
            <span>۱. اصل تفکیک داده‌های سلامت از فروشگاه (Medical Privacy)</span>
          </h2>
          <p>
            در معماری بونیو، پرونده پزشکی، سوابق واکسیناسیون، آلرژی‌ها و بیماری‌های پت شما در پایگاه داده‌های رمزنگاری‌شده نگهداری می‌شود. هیچ فروشنده یا تامین‌کننده کالا در بازارچه، تحت هیچ شرایطی به پرونده پزشکی شما دسترسی ندارد.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            <span>۲. دسترسی مبتنی بر رضایت سرپرست (Explicit Consent)</span>
          </h2>
          <p>
            دامپزشکان و کلینیک‌های همکار تنها در صورتی مجاز به مشاهده یا ویرایش پرونده حیوان خانگی شما هستند که نوبت بالینی فعال ثبت شده باشد یا با اسکن کد QR پاسپورت، رضایت صریح موقت صادر شده باشد.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>۳. حفاظت از داده‌های پرداخت و احراز هویت</span>
          </h2>
          <p>
            شماره کارت، رمز دوم و اطلاعات بانکی شما مستقیماً در درگاه شاپرک پردازش شده و هرگز در سرورهای بونیو ذخیره نمی‌شود. احراز هویت با شماره تلفن همراه و کدهای یک‌بارمصرف (OTP) امن محافظت می‌گردد.
          </p>
        </div>
      </div>
    </div>
  );
}
