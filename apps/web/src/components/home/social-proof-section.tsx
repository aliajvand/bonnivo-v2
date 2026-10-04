"use client";

import { Star, ShieldCheck, HeartHandshake, CheckCircle } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  petInfo: string;
  text: string;
  rating: number;
  productOrService: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "فرناز موسوی",
    petInfo: "سرپرست میلو (گربه بریتیش)",
    text: "خرید غذای رویال کنین با تضمین اصالت و تحویل دقیق در بازه ۳ ساعته در نیاوران. پشتیبانی فوق‌العاده سریع بود.",
    rating: 5,
    productOrService: "خرید غذای تخصصی گربه",
  },
  {
    id: "rev-2",
    author: "امیرحسین رضایی",
    petInfo: "سرپرست تدی (پامرانین)",
    text: "رزرو آنلاین بیمارستان پایتخت در شب تعطیل جان تدی رو نجات داد. بدون معطلی و با دسترسی کامل به پرونده آنلاین.",
    rating: 5,
    productOrService: "نوبت اورژانس دامپزشکی",
  },
  {
    id: "rev-3",
    author: "سارا کریمی",
    petInfo: "سرپرست بارفی (هاسکی)",
    text: "جلسه اصلاح رفتار با استاد شایان عالی بود. مشکل پارس آپارتمانی بارفی در دو جلسه کاملاً برطرف شد.",
    rating: 5,
    productOrService: "آموزش و اصلاح رفتار",
  },
];

export function SocialProofSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              تجربه واقعی سرپرستان پت بنیوو
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              رضایت بیش از ۲۴,۰۰۰ سرپرست متعهد در سراسر کشور با امتیاز رضایت ۹۸.۴٪
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>نظرات ۱۰۰٪ تاییدشده خریداران</span>
            </span>
          </div>
        </div>

        {/* 3 Editorial Restrained Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl bg-surface border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 font-light">
                    {rev.productOrService}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-light">
                  «{rev.text}»
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">
                    {rev.author}
                  </h4>
                  <span className="text-[11px] text-stone-400 font-light">
                    {rev.petInfo}
                  </span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
