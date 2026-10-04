"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft,
  Clock,
  Sparkles
} from "lucide-react";

interface ServiceCardItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  location: string;
  rating: number;
  description: string;
  image: string;
  href: string;
  ctaText: string;
}

const SERVICES: ServiceCardItem[] = [
  {
    id: "vet-1",
    title: "بیمارستان دامپزشکی شبانه‌روزی پایتخت",
    category: "دامپزشکی تخصصی",
    badge: "اورژانس ۲۴ ساعته",
    location: "تهران، ولنجک",
    rating: 4.9,
    description: "مجهز به بخش جراحی بافت نرم و ارتوپدی، سونوگرافی داپلر، آزمایشگاه خون اختصاصی و آی‌سی‌یو.",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
    href: "/vets/clinic-paytakht-01",
    ctaText: "مشاهده پروفایل و رزرو نوبت",
  },
  {
    id: "board-1",
    title: "ریزورت هتل حیوانات خانگی آرمانی",
    category: "پانسیون ۵ ستاره VIP",
    badge: "استاندارد ایمنی و سلامت",
    location: "تهران، الهیه",
    rating: 4.9,
    description: "اتاق‌های اختصاصی دارای تهویه مطبوع، پایش ویدیویی ۲۴ ساعته، حیاط چمن طبیعی و دامپزشک مقیم.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80",
    href: "/boarding/board-1",
    ctaText: "مشاهده پروفایل و رزرو اتاق",
  },
];

export function LocalEcosystemSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200/50 dark:border-emerald-800/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مراکز منتخب دارای مجوز رسمی</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              مراکز درمانی و اقامتگاهی مورد اعتماد بنیوو
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5 font-light">
              ارزیابی کیفی بر اساس نظرات واقعی سرپرستان و استانداردهای بهداشتی
            </p>
          </div>

          <Link
            href="/vets"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity shrink-0"
          >
            <span>مشاهده همه مراکز</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Two Service Cards Styled Identically to Event Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {SERVICES.map((srv) => (
            <Link
              key={srv.id}
              href={srv.href}
              className="group flex flex-col justify-between rounded-3xl bg-surface border border-border/80 overflow-hidden hover:border-emerald-600/40 shadow-xs hover:shadow-md transition-all duration-300 select-none"
            >
              {/* Photo Banner with Overlay Badges */}
              <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-stone-100 dark:bg-stone-900">
                <Image
                  src={srv.image}
                  alt={srv.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/30" />

                {/* Floating Badges */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                    {srv.category}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md bg-emerald-500/90 text-white shadow-xs flex items-center gap-1">
                    {srv.id === "vet-1" ? (
                      <Clock className="w-3 h-3 text-white" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-white" />
                    )}
                    <span>{srv.badge}</span>
                  </span>
                </div>
              </div>

              {/* Service Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                      {srv.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/50 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{srv.rating.toLocaleString("fa-IR")}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-stone-500 dark:text-stone-400 font-light">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{srv.location}</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light line-clamp-2">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                  <span>{srv.ctaText}</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
