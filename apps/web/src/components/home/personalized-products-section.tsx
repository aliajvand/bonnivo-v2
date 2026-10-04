"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { usePet } from "@/context/pet-context";
import { FeaturedProductsRow } from "@/components/home/featured-products-row";

export function PersonalizedProductsSection() {
  const { activePet } = usePet();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Filter or select 4 products based on active pet species or curated selection
  const petName = activePet?.name || "همراه دلبند شما";
  const petSpecies = activePet?.species;

  const filteredProducts = mockCatalogProducts
    .filter((p) => {
      if (activeCategory === "ALL") return true;
      if (activeCategory === "DOG") return p.targetSpecies === "DOG";
      if (activeCategory === "CAT") return p.targetSpecies === "CAT";
      return true;
    })
    .slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
      <div className="space-y-6">
        
        {/* Header with Pet Personalization Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full mb-1.5 border border-emerald-200/50 dark:border-emerald-800/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پیشنهاد هوشمند متناسب با نژاد و سن</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              پیشنهاد شده برای {petName}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              سبد منتخب غذا، مکمل‌های تقویتی و لوازم نگهداری بر اساس پرونده سلامت
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === "ALL"
                  ? "bg-emerald-700 text-white dark:bg-emerald-600"
                  : "bg-surface border border-border text-stone-600 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              همه پیشنهادات
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("CAT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === "CAT"
                  ? "bg-emerald-700 text-white dark:bg-emerald-600"
                  : "bg-surface border border-border text-stone-600 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              گربه‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("DOG")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === "DOG"
                  ? "bg-emerald-700 text-white dark:bg-emerald-600"
                  : "bg-surface border border-border text-stone-600 dark:text-stone-300 hover:bg-stone-50"
              }`}
            >
              سگ‌ها
            </button>
          </div>
        </div>

        {/* Product Cards using existing robust component */}
        <FeaturedProductsRow products={filteredProducts} />

      </div>
    </section>
  );
}
