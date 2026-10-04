"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCw,
  Box,
  Plus,
  Minus,
  Check,
  Heart,
  Share2,
  Sparkles,
  Store,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { CatalogProduct, ProductWeightVariant } from "@/types/catalog";
import { usePet } from "@/context/pet-context";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

import { fetchProductBySlug } from "@/lib/api/catalog";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentPet } = usePet();
  const { addItem, itemsCount } = useCart();

  const slug = params?.slug as string;

  const [liveProduct, setLiveProduct] = useState<CatalogProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slug) return;
      setIsLoadingProduct(true);
      try {
        const prod = await fetchProductBySlug(slug);
        if (isMounted) {
          if (prod) {
            setLiveProduct(prod);
          } else {
            const fallback = mockCatalogProducts.find((p) => p.slug === slug || p.id === slug) || mockCatalogProducts[0];
            setLiveProduct(fallback);
          }
        }
      } catch {
        if (isMounted) {
          const fallback = mockCatalogProducts.find((p) => p.slug === slug || p.id === slug) || mockCatalogProducts[0];
          setLiveProduct(fallback);
        }
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const product = liveProduct || mockCatalogProducts[0];

  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.weightVariants?.[0]?.id || "default"
  );
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  React.useEffect(() => {
    if (product.weightVariants && product.weightVariants.length > 0) {
      setSelectedVariantId(product.weightVariants[0].id);
    }
  }, [product]);

  // Active variant resolution
  const activeVariant: ProductWeightVariant | null = useMemo(() => {
    if (!product.weightVariants || product.weightVariants.length === 0) return null;
    return (
      product.weightVariants.find((v) => v.id === selectedVariantId) ||
      product.weightVariants[0]
    );
  }, [product, selectedVariantId]);

  const effectivePrice = activeVariant
    ? activeVariant.discountedPriceToman || activeVariant.priceToman
    : product.buyBoxOffer.discountedPriceToman || product.buyBoxOffer.priceToman;

  const originalPrice = activeVariant
    ? activeVariant.priceToman
    : product.buyBoxOffer.priceToman;

  // Handle Add to Cart
  const handleAddToCart = () => {
    addItem(
      product,
      product.buyBoxOffer,
      currentPet ? currentPet.id : null,
      activeVariant,
      quantity
    );

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 3000);
  };

  // Simulate 3D rotation
  const handleRotate = (direction: "left" | "right") => {
    setRotationDegree((prev) => (direction === "left" ? prev - 45 : prev + 45));
  };

  // Check pet compatibility
  const isCompatibleWithActivePet = currentPet
    ? (currentPet.species === "DOG" && product.targetSpecies === "DOG") ||
      (currentPet.species === "CAT" && product.targetSpecies === "CAT")
    : true;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-28 md:pb-10 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          <span>بازگشت به کاتالوگ فروشگاه</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-full bg-surface-subtle hover:bg-surface-elevated text-foreground border border-border/60 transition-transform active:scale-95"
            aria-label="افزودن به علاقه‌مندی‌ها"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
              )}
            />
          </button>
          <Link
            href="/cart"
            className="relative p-2 rounded-full bg-surface-subtle hover:bg-surface-elevated text-foreground border border-border/60 transition-transform active:scale-95"
            aria-label="سبد خرید"
          >
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            {itemsCount > 0 && (
              <span className="absolute -top-1 -start-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: 3D / 360° Pedestal Product View (Direct Reference Image Replication) */}
        <div className="relative flex flex-col items-center justify-center p-8 rounded-4xl bg-gradient-to-b from-surface-elevated via-surface-elevated/70 to-surface-subtle/50 border border-border/80 shadow-2xl overflow-hidden min-h-[440px]">
          {/* 3D / 360° Mode Toggle Button */}
          <div className="absolute top-4 start-4 z-10">
            <button
              type="button"
              onClick={() => setIs3DMode(!is3DMode)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-surface-elevated/90 backdrop-blur-md border border-border/80 text-xs font-bold text-foreground shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{is3DMode ? "نمایش ۳ بعدی / ۳۶۰°" : "عکس ثابت"}</span>
            </button>
          </div>

          {/* Floating Rating Badge */}
          <div className="absolute top-4 end-4 z-10">
            <div className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-surface-elevated/90 backdrop-blur-md border border-border/80 text-xs font-bold font-mono text-foreground shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Floating Price Pill (Reference Image Style) */}
          <div className="absolute top-16 end-4 z-10 animate-in fade-in zoom-in duration-300">
            <div className="py-1 px-3 rounded-full bg-emerald-600/90 text-white text-xs font-mono font-bold shadow-lg backdrop-blur-md">
              {effectivePrice.toLocaleString("fa-IR")} تومان
            </div>
          </div>

          {/* 3D Cylindrical Pedestal & Rotating Bag */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center select-none">
            {/* Soft Ambient Shadow */}
            <div className="absolute bottom-4 w-48 h-10 bg-emerald-950/20 dark:bg-emerald-500/10 rounded-full blur-xl -z-10" />

            {/* Stone / Marble Pedestal Disc */}
            <div className="absolute bottom-6 w-52 h-14 rounded-full bg-gradient-to-b from-stone-200 to-stone-400 dark:from-slate-700 dark:to-slate-800 border-2 border-stone-300 dark:border-slate-600 shadow-md flex items-center justify-center">
              <div className="w-48 h-10 rounded-full border border-white/30 dark:border-white/10" />
            </div>

            {/* Product Image on Pedestal */}
            <div
              className="relative z-10 transition-transform duration-500 ease-out flex items-center justify-center -translate-y-4"
              style={{
                transform: is3DMode
                  ? `translateY(-16px) rotateY(${rotationDegree}deg) scale(1.05)`
                  : "translateY(-16px)",
              }}
            >
              <div className="w-44 h-48 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 dark:from-slate-800 dark:to-slate-900 border border-amber-200 dark:border-slate-700 p-4 shadow-xl flex flex-col items-center justify-between">
                <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                  {product.brand.toUpperCase()}
                </div>
                <div className="text-3xl">
                  {product.targetSpecies === "CAT" ? "🐱" : "🐶"}
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-slate-800 dark:text-white line-clamp-1">
                    {product.titleFa.split(" ")[0]} {product.titleFa.split(" ")[1]}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {activeVariant?.labelFa || product.weightText}
                  </div>
                </div>
              </div>
            </div>

            {/* 360 Rotation Controls */}
            {is3DMode && (
              <div className="absolute bottom-0 flex items-center gap-6 z-20">
                <button
                  type="button"
                  onClick={() => handleRotate("left")}
                  className="p-1.5 rounded-full bg-surface-elevated/90 hover:bg-surface-elevated border border-border/80 shadow-md text-foreground transition-transform active:scale-90"
                  aria-label="چرخش به چپ"
                >
                  <RotateCw className="w-4 h-4 -scale-x-100 text-emerald-600 dark:text-emerald-400" />
                </button>
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider select-none">
                  ۳۶۰° چرخش
                </span>
                <button
                  type="button"
                  onClick={() => handleRotate("right")}
                  className="p-1.5 rounded-full bg-surface-elevated/90 hover:bg-surface-elevated border border-border/80 shadow-md text-foreground transition-transform active:scale-90"
                  aria-label="چرخش به راست"
                >
                  <RotateCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title, Variants, Pet Context, Buy Box & Add-to-Cart */}
        <div className="space-y-6">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                {product.brand}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewsCount} نظر خریداران)
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-foreground leading-snug">
              {product.titleFa}
            </h1>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {product.descriptionFa}
            </p>
          </div>

          {/* Pet Compatibility Indicator */}
          {currentPet && (
            <div
              className={cn(
                "p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-colors",
                isCompatibleWithActivePet
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
              )}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isCompatibleWithActivePet
                  ? `فرمولاسیون ۱۰۰٪ سازگار با ${currentPet.name} (${currentPet.breed})`
                  : `توجه: این محصول ویژه ${product.targetSpecies === "CAT" ? "گربه‌ها" : "سگ‌ها"} فرموله شده است.`}
              </span>
            </div>
          )}

          {/* Weight Variant Selector */}
          {product.weightVariants && product.weightVariants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                انتخاب وزن بسته‌بندی:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.weightVariants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "py-1.5 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200",
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-surface-subtle text-foreground border-border/70 hover:border-border"
                      )}
                    >
                      {variant.labelFa}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buy Box & Seller Guarantee Card */}
          <div className="p-4 rounded-3xl bg-surface-elevated border border-border/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-foreground">
                  فروشنده جعبه خرید (Buy Box):
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {product.buyBoxOffer.storeNameFa}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                کمترین قیمت پلتفرم
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                <span>تحویل در تهران: حداکثر ۳ ساعت کاری</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ضمانت اصالت و سلامت ۴ ساعته</span>
              </div>
            </div>
          </div>

          {/* Quantity & Prominent Green Add to Cart Button (Reference Image Style) */}
          <div className="flex items-center gap-3 pt-2">
            {/* Quantity Selector */}
            <div className="flex items-center bg-surface-subtle rounded-2xl border border-border/70 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 rounded-xl hover:bg-surface-elevated text-foreground transition-colors"
                aria-label="کاهش تعداد"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono font-bold text-xs text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 rounded-xl hover:bg-surface-elevated text-foreground transition-colors"
                aria-label="افزایش تعداد"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>افزودن به سبد خرید</span>
            </button>
          </div>

          {/* Toast Notification */}
          {isAddedToast && (
            <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>محصول با موفقیت به سبد خرید شما افزوده شد!</span>
              </div>
              <Link href="/cart" className="underline font-black text-white ms-3">
                مشاهده سبد
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Structured Data (JSON-LD) for Search Engine Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.titleFa,
            image: [product.imageSrc || product.primaryImageUrl || "https://bonnivo.ir/icons/bonnivo-logo-mark.svg"],
            description: product.descriptionFa,
            sku: product.id,
            brand: {
              "@type": "Brand",
              name: product.brand,
            },
            offers: {
              "@type": "Offer",
              url: `https://bonnivo.ir/shop/${product.slug || product.id}`,
              priceCurrency: "IRR",
              price: (effectivePrice * 10).toString(),
              priceValidUntil: "2027-12-31",
              itemCondition: "https://schema.org/NewCondition",
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: product.buyBoxOffer.storeNameFa,
              },
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: (product.rating || 4.8).toString(),
              reviewCount: (product.reviewsCount || 12).toString(),
            },
          }),
        }}
      />

      {/* Tabs Section: Specifications, Verified Reviews, Guarantee */}
      <ProductTabsSection product={product} />

      {/* Mobile Sticky Bottom CTA Bar */}
      <aside
        aria-label="خرید سریع در موبایل"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated/95 backdrop-blur-md border-t border-border p-3 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200"
        dir="rtl"
      >
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-medium">مبلغ قابل پرداخت:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-black text-sm text-foreground">
              {(effectivePrice * quantity).toLocaleString("fa-IR")}
            </span>
            <span className="text-[10px] text-muted-foreground">تومان</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 max-w-[200px] min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>افزودن به سبد خرید</span>
        </button>
      </aside>
    </div>
  );
}

function ProductTabsSection({ product }: { product: CatalogProduct }) {
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "guarantee">("specs");

  const [reviewsList, setReviewsList] = useState([
    {
      id: "rev-1",
      author: "سارا احمدی",
      rating: 5,
      date: "۳ روز پیش",
      isVerified: true,
      title: "عالی برای گربه‌های عقیم شده پرشین",
      comment: "از زمان مصرف این غذا وزن گربه‌ام کاملاً تثبیت شده و ریزش موهاش هم خیلی کم شده. تحویل با ضمانت ۴ ساعته بونیو هم عالی بود.",
    },
    {
      id: "rev-2",
      author: "محسن کریمی",
      rating: 5,
      date: "۱ هفته پیش",
      isVerified: true,
      title: "اصالت کالا و تاریخ انقضای معتبر",
      comment: "بارکد و سریال محصول اصالت رویال کنین رو تأیید می‌کنه و تاریخ انقضا هم بیش از یک سال اعتبار داشت.",
    },
    {
      id: "rev-3",
      author: "نیلوفر حسینی",
      rating: 4,
      date: "۲ هفته پیش",
      isVerified: true,
      title: "پذیرش عالی توسط پت",
      comment: "طعم غذا رو خیلی دوست داشت، بسته‌بندی زیپ‌کیپ داشت که باعث می‌شه عطر و طعم تازه بمونه.",
    },
  ]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      date: "هم‌اکنون",
      isVerified: true, // Marked as verified for simulation
      title: newTitle || "دیدگاه خریدار بونیو",
      comment: newComment,
    };

    setReviewsList([newRev, ...reviewsList]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setSubmitSuccess(false);
      setNewTitle("");
      setNewComment("");
      setNewAuthor("");
    }, 1500);
  };

  return (
    <div className="pt-8 border-t border-border/80 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-border/70 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={cn(
            "pb-3 text-xs md:text-sm font-bold transition-all relative",
            activeTab === "specs"
              ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          مشخصات فنی و تحلیل تغذیه‌ای
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "pb-3 text-xs md:text-sm font-bold transition-all relative flex items-center gap-1.5",
            activeTab === "reviews"
              ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>دیدگاه‌های خریداران تأییدشده</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold">
            {reviewsList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guarantee")}
          className={cn(
            "pb-3 text-xs md:text-sm font-bold transition-all relative",
            activeTab === "guarantee"
              ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ضمانت اصالت و سلامت ۴ ساعته
        </button>
      </div>

      {/* Tab 1: Specs */}
      {activeTab === "specs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-elevated p-6 rounded-3xl border border-border/80 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">جدول مشخصات و سازگاری نژادی</h3>
            <div className="space-y-3 text-xs divide-y divide-border/40">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">برند سازنده:</span>
                <span className="font-bold text-foreground font-mono">{product.brand}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">گونه هدف:</span>
                <span className="font-bold text-foreground">
                  {product.targetSpecies === "CAT" ? "گربه 🐱" : "سگ 🐶"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">رده سنی:</span>
                <span className="font-bold text-foreground">بالغ (Adult)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">وزن استاندارد بسته:</span>
                <span className="font-bold text-foreground font-mono">{product.weightText}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">کشور مبدأ برند:</span>
                <span className="font-bold text-foreground">فرانسه</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">تحلیل بیوشیمیایی و ترکیبات مغذی</h3>
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border/60 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">پروتئین خام (حداقل):</strong> ۳۲٪ با قابلیت هضم بسیار بالا (L.I.P)
              </p>
              <p>
                <strong className="text-foreground">چربی خام:</strong> ۱۲٪ بهینه‌سازی‌شده برای کنترل وزن گربه‌های کم‌تحرک
              </p>
              <p>
                <strong className="text-foreground">فیبر خام:</strong> ۵.۸٪ جهت خروج طبیعی هربال (گلوله‌های مو)
              </p>
              <p>
                <strong className="text-foreground">مواد معدنی ضروری:</strong> کلسیم، فسفر، روی، آهن، تائورین و امگا ۳
              </p>
              <p className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-border/40">
                ✓ فرمولاسیون فاقد مواد نگه‌دارنده مضر شیمیایی یا رنگ‌های مصنوعی
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Top Review Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-elevated p-5 rounded-3xl border border-border/80 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-black font-mono text-foreground">{product.rating}</div>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">از ۵ امتیاز</div>
              </div>
              <div className="h-10 w-px bg-border/80" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground">۱۰۰٪ دیدگاه‌های این بخش متعلق به خریداران قطعی است.</p>
                <p className="text-[11px]">اصالت نظرات با اتصال به درگاه پرداخت و بارنامه تحویل تأیید شده است.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="py-2 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              + ثبت دیدگاه خریدار
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-surface-elevated border border-border/70 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{rev.author}</span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        خریدار تأییدشده
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn("w-3 h-3", s <= rev.rating ? "fill-current" : "text-border")}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground ms-2">{rev.title}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>

          {/* Review Submission Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-surface-elevated w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h4 className="text-sm font-bold text-foreground">ثبت تجربه خرید برای {product.titleFa}</h4>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    بستن
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-foreground block mb-1">نام و نام خانوادگی شما:</label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="مثال: مریم کریمی"
                      className="w-full p-2.5 bg-surface-subtle border border-border/70 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">امتیاز به محصول (۱ تا ۵ ستاره):</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-400 transition-transform hover:scale-110"
                        >
                          <Star className={cn("w-5 h-5", star <= newRating ? "fill-current" : "text-border")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">عنوان کوتاه نظر:</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="مثال: کیفیت عالی و بسته‌بندی پلمپ"
                      className="w-full p-2.5 bg-surface-subtle border border-border/70 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-foreground block mb-1">متن کامل دیدگاه:</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="تجربه پت شما از مصرف این محصول، طعم‌پذیری و تغییرات ظاهری..."
                      className="w-full p-2.5 bg-surface-subtle border border-border/70 rounded-xl"
                    />
                  </div>

                  {submitSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-center">
                      دیدگاه شما با موفقیت ثبت شد و پس از بازبینی منتشر می‌گردد!
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="py-2 px-4 rounded-xl bg-surface-subtle text-foreground border border-border/60 font-bold"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      ارسال دیدگاه
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Guarantee */}
      {activeTab === "guarantee" && (
        <div className="p-6 rounded-3xl bg-surface-elevated border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-sm font-bold text-foreground">قوانین و چارچوب ضمانت بازگشت وجه ۴ ساعته بونیو</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            در بونیو، سلامت پت شما اولویت مطلق است. چنانچه پس از تحویل سفارش هر یک از موارد زیر رخ دهد، ظرف حداکثر ۴ ساعت از ثبت گزارش، بدون نیاز به پیگیری‌های طولانی اداری، کل وجه به کیف‌پول شما مسترد خواهد شد:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground">
            <li>آسیب‌دیدگی فیزیکی یا پارگی در بسته‌بندی غذای خشک یا کنسروها در حین ارسال پیک.</li>
            <li>هرگونه مغایرت در وزن، طعم، برند یا تاریخ انقضا با فاکتور صادرشده در سیستم.</li>
            <li>عدم اصالت کالا یا مخدوش بودن پلمپ کارخانه سازنده.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
