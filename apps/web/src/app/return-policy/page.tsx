"use client";

import React from "react";
import { ShieldCheck, Clock, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8" dir="rtl">
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">سیاست طلایی مشتریان</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          راهنمای جامع ضمانت اصالت، سلامت و بازگشت وجه ۴ ساعته بونیو
        </h1>
        <p className="text-xs text-muted-foreground mt-2">
          سریع‌ترین ضمانت تجارت الکترونیک حوزه حیوانات خانگی در ایران
        </p>
      </div>

      <div className="space-y-6 text-xs md:text-sm text-muted-foreground leading-relaxed">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">ضمانت ۴ ساعته چگونه کار می‌کند؟</h2>
          </div>
          <p>
            هنگامی که پیک سفارش را تحویل می‌دهد، شما تا ۴ ساعت تمام فرصت دارید تا ظاهر بسته، تاریخ انقضا و سلامت فیزیکی غذای خشک، داروها یا کنسروها را بررسی کنید. در صورت مشاهده هرگونه مغایرت یا عیب، با یک کلیک در پنل سفارشات گزارش خود را ثبت می‌فرمایید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
            <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>موارد تحت پوشش ضمانت</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>پارگی، له‌شدگی یا سوراخ بودن کیسه غذای خشک</li>
              <li>مغایرت در طعم، برند یا وزن با فاکتور صادرشده</li>
              <li>تاریخ انقضای کمتر از ۶ ماه (مگر با تخفیف صریح در صفحه کالا)</li>
              <li>خدشه یا مخدوش بودن پلمپ کارخانه</li>
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
            <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>موارد خارج از شمول</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>باز شدن و مصرف بیش از یک وعده از بسته‌بندی پلمپ</li>
              <li>کالاهای بهداشتی با پلمپ بازشده (مانند قطره چشم و گوش)</li>
              <li>گزارش‌های ثبت‌شده پس از انقضای سقف زمانی ۴ ساعت</li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-surface-elevated border border-border/80 space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>نحوه استرداد وجه</span>
          </h2>
          <p>
            به محض تایید گزارش توسط اپراتور آنلاین، کل مبلغ بلافاصله به کیف‌پول کاربری شما در بونیو واریز می‌گردد یا ظرف ۲۴ ساعت کاری پایا به شماره شبای شما برگشت داده می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}
