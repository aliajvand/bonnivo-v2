"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BonyoLogo } from "@/components/brand/bonyo-logo";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Heart,
  Instagram,
  Send,
  ArrowLeft,
  Check
} from "lucide-react";

export function DesktopFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="mt-16 border-t border-emerald-950/80 bg-[#07120D] text-stone-300 relative overflow-hidden" dir="rtl">
      {/* Subtle Ambient Emerald Backlight */}
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        
        {/* Top Region: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <BonyoLogo variant="horizontal" size="md" themeMode="dark" showSubtitle={false} />
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-sm mt-3 font-light">
              بنیوو، اکوسیستم یکپارچه سرپرستی، سلامت و خرید ملزومات پت در ایران. تضمین ۱۰۰٪ اصالت کالاها، پرونده پزشکی هوشمند و دسترسی فوری به متخصصین معتمد.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ضمانت اصالت و سلامت ۱۰۰٪ سفارشات</span>
              </div>
            </div>

            <div className="text-xs text-stone-300 space-y-2 pt-2 font-light">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-white font-medium">۰۲۱-۹۱۰۱۵۵۶۶</span>
                <span className="text-stone-400">(پشتیبانی شبانه‌روزی)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-stone-200">support@bonnivo.ir</span>
              </div>
            </div>
          </div>

          {/* Nav Column 1: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider text-white uppercase">خدمات اکوسیستم</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/shop" className="hover:text-emerald-300 transition-colors">
                  فروشگاه و غذای پت
                </Link>
              </li>
              <li>
                <Link href="/vets" className="hover:text-emerald-300 transition-colors">
                  دامپزشکی و بیمارستان‌ها
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="hover:text-emerald-300 transition-colors">
                  مربیان و رفتارشناسی
                </Link>
              </li>
              <li>
                <Link href="/boarding" className="hover:text-emerald-300 transition-colors">
                  پانسیون و هتل اقامتی
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-emerald-300 transition-colors">
                  رویدادها و دورهمی‌ها
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 2: Pet Owners / Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider text-white uppercase">راهنمای سرپرستان</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/dashboard/pets" className="hover:text-emerald-300 transition-colors">
                  شناسنامه آنلاین پت
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-300 transition-colors">
                  پیگیری سبد خرید
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
                  حفظ حریم خصوصی
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-300 transition-colors">
                  شرایط استفاده از خدمات
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-emerald-300 transition-colors">
                  شرایط بازگشت کالا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider text-white uppercase">خبرنامه تخصصی</h4>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              تازه‌ترین مقالات سلامت، تخفیف‌های ویژه برندها و رویدادهای فصلی را دریافت کنید.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="ایمیل خود را وارد کنید..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>عضویت با موفقیت ثبت شد</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>عضویت در خبرنامه</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-emerald-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>توسعه‌یافته با</span>
            <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 inline" />
            <span>برای ارتقای کیفیت زندگی حیوانات خانگی ایران • تمامی حقوق برای بنیوو محفوظ است.</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>نسخه ۳.۰.۰</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">زیرساخت اختصاصی بنیوو</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
