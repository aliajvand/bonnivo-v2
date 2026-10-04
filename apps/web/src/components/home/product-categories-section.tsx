"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  href: string;
  iconSrc: string;
}

const SPECIES_CATEGORIES: CategoryItem[] = [
  { id: "dog", name: "سگ", href: "/shop?species=DOG", iconSrc: "/icons/dog.svg" },
  { id: "cat", name: "گربه", href: "/shop?species=CAT", iconSrc: "/icons/cat.svg" },
  { id: "small-pets", name: "حیوانات کوچک", href: "/shop?species=SMALL_PET", iconSrc: "/icons/small-pets.svg" },
  { id: "birds", name: "پرندگان", href: "/shop?species=BIRD", iconSrc: "/icons/birds.svg" },
];

const STORE_SECTIONS: CategoryItem[] = [
  { id: "food", name: "غذا و تغذیه", href: "/shop?category=food", iconSrc: "/icons/food.svg" },
  { id: "toys", name: "اسباب‌بازی", href: "/shop?category=toys", iconSrc: "/icons/toys.svg" },
  { id: "health", name: "سلامت و بهداشت", href: "/shop?category=health", iconSrc: "/icons/health.svg" },
  { id: "all", name: "سایر ملزومات", href: "/shop?category=all", iconSrc: "/icons/all.svg" },
];

export function ProductCategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              دسته‌بندی‌های بنیوو
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              کاوش هوشمند محصولات بر اساس نوع پت یا نیازهای روزمره
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            <span>همه دسته‌ها</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid (Species + Store Sections) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
          
          {/* Species Aware Discovery */}
          {SPECIES_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-surface border border-border/70 hover:border-emerald-600/30 transition-all duration-200 hover:shadow-sm select-none"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F7F8F6] dark:bg-stone-900/60 flex items-center justify-center p-2 mb-2 transition-transform duration-200 group-hover:scale-105 border border-stone-200/50 dark:border-stone-800/40">
                <Image
                  src={item.iconSrc}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="w-auto h-auto max-h-8 max-w-8 sm:max-h-10 sm:max-w-10 object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5 hidden sm:inline">
                نوع پت
              </span>
            </Link>
          ))}

          {/* Store Section Discovery */}
          {STORE_SECTIONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-surface border border-border/70 hover:border-emerald-600/30 transition-all duration-200 hover:shadow-sm select-none"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F7F8F6] dark:bg-stone-900/60 flex items-center justify-center p-2 mb-2 transition-transform duration-200 group-hover:scale-105 border border-stone-200/50 dark:border-stone-800/40">
                <Image
                  src={item.iconSrc}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="w-auto h-auto max-h-8 max-w-8 sm:max-h-10 sm:max-w-10 object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5 hidden sm:inline">
                کالای مصرفی
              </span>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
