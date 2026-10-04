"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  ArrowLeft,
  Calendar
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { useCart } from "@/context/cart-context";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { cn } from "@/lib/utils";

export function SmartReorderWidget() {
  const { activePet } = usePet();
  const { buyAgain } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activePet) return null;

  // Resolve matching routine product for the active pet based on species
  const routineProduct = mockCatalogProducts.find((p) => {
    if (activePet.species === "DOG") return p.category === "food" && (p.targetSpecies === "DOG" || p.targetSpecies === "ALL");
    if (activePet.species === "CAT") return p.category === "food" && (p.targetSpecies === "CAT" || p.targetSpecies === "ALL");
    return p.category === "food";
  }) || mockCatalogProducts[0];

  // Simulation: food depleted by 80%, roughly 5 days left
  const daysLeft = 5;
  const depletionPercent = 82;

  const handleBuyAgain = () => {
    setIsProcessing(true);
    const result = buyAgain(routineProduct.id, activePet.id);
    setIsProcessing(false);
    setFeedback(result.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-primary/20 shadow-md space-y-4" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3>شارژ مجدد هوشمند غذای {activePet.name} (Smart Reorder)</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          هشدار اتمام موجودی
        </span>
      </div>

      {feedback && (
        <div className="rounded-2xl p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <Link href="/cart" className="text-primary font-bold hover:underline shrink-0 text-xs">
            مشاهده سبد خرید ←
          </Link>
        </div>
      )}

      {/* Product & Depletion Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Product Visual & Title (7 cols) */}
        <div className="md:col-span-7 flex items-center gap-3.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-subtle p-2 flex items-center justify-center shrink-0 border border-border/80">
            <Image
              src={routineProduct.imageSrc}
              alt={routineProduct.titleFa}
              width={54}
              height={54}
              className="object-contain max-h-full"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase">
              {routineProduct.brand} • جیره روزانه {activePet.name}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
              {routineProduct.titleFa}
            </h4>
            <div className="text-xs font-black text-foreground">
              {(routineProduct.buyBoxOffer.discountedPriceToman || routineProduct.buyBoxOffer.priceToman).toLocaleString("fa-IR")}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">تومان (قیمت روز)</span>
            </div>
          </div>
        </div>

        {/* Depletion Progress Gauge & Action (5 cols) */}
        <div className="md:col-span-5 space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>تنها {daysLeft} روز تا اتمام بسته</span>
              </span>
              <span className="font-bold text-amber-700 font-mono">{depletionPercent}% مصرف‌شده</span>
            </div>
            
            {/* Depletion Bar */}
            <div className="w-full h-2 rounded-full bg-surface-subtle border border-border overflow-hidden">
              <div 
                className="h-full bg-gradient-to-l from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${depletionPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleBuyAgain}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>خرید مجدد سریع برای {activePet.name}</span>
          </button>
        </div>

      </div>

      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
        <Calendar className="w-3 h-3 text-muted" />
        <span>محاسبه شده بر اساس وزن پت ({activePet.weightKg} کیلوگرم) و تخمین جیره استاندارد بونیو</span>
      </div>

    </div>
  );
}
