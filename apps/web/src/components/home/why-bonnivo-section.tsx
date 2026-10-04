"use client";

import Link from "next/link";
import { Truck, HeartPulse, Stethoscope, Users } from "lucide-react";

interface BenefitCard {
  title: string;
  description: string;
  icon: typeof Truck;
  href: string;
}

const BENEFITS: BenefitCard[] = [
  {
    title: "خرید و ارسال مطمئن",
    description: "تضمین ۱۰۰٪ اصالت برندها، رقابت قیمت در جعبه خرید و ارسال اکسپرس شهری",
    icon: Truck,
    href: "/shop",
  },
  {
    title: "سلامت و پرونده پت",
    description: "ثبت هوشمند سوابق واکسیناسیون، وزن، شناسنامه QR و یادآور دوره‌ای مراقبت",
    icon: HeartPulse,
    href: "/dashboard/pets",
  },
  {
    title: "نوبت دامپزشکی و خدمات",
    description: "رزرو آنلاین بهترین کلینیک‌ها و بیمارستان‌های تخصصی با پشتیبانی ۲۴ ساعته",
    icon: Stethoscope,
    href: "/vets",
  },
  {
    title: "جامعه، مربی، پانسیون و رویداد",
    description: "شبکه مربیان تاییدصلاحیت‌شده، هتل‌های اقامت امن و دورهمی‌های ماهانه سرپرستان",
    icon: Users,
    href: "/events",
  },
];

export function WhyBonnivoSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {BENEFITS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="group p-4 sm:p-5 rounded-2xl bg-surface border border-border/70 hover:border-emerald-600/30 shadow-xs hover:shadow-md transition-all duration-200 flex items-start gap-3.5 select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/30 transition-transform duration-200 group-hover:scale-105">
                <Icon className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
