"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  Heart, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag,
  Filter,
  X,
  Scale,
  Plus,
  Minus,
  Eye
} from "lucide-react";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { CatalogProduct, ProductCategory, ProductWeightVariant } from "@/types/catalog";
import { PetSpecies } from "@/types/pet";
import { usePet } from "@/context/pet-context";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

export function ShopCatalogView() {
  const { activePet, pets } = usePet();
  const { addItem } = useCart();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies | "ALL">("ALL");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [availableBrands, setAvailableBrands] = useState<string[]>([
    "Royal Canin",
    "Josera",
    "Hill's",
    "Pro Plan",
    "Beaphar",
    "Trixie",
    "Reflex",
    "Happy Dog",
  ]);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "rating">("popular");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});


  // Dynamic Weight Variant State: productId -> variantId
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Quick View / Detail Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogProduct | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalTargetPetId, setModalTargetPetId] = useState<string | null>(activePet ? activePet.id : null);

  // Toast Notification State with Auto-Dismiss (4 seconds) & Manual Dismiss
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  };

  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(mockCatalogProducts);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const b = params.get("brand");
      if (b) setSelectedBrand(b);
      const s = params.get("species");
      if (s && ["ALL", "CAT", "DOG", "BIRD", "SMALL_PET"].includes(s)) {
        setSelectedSpecies(s as any);
      }
      const c = params.get("category");
      if (c) setSelectedCategory(c as any);

      // Fetch distinct brands and live products from backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      fetch(`${apiUrl}/catalog/brands`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: string[]) => {
          if (data && data.length > 0) {
            setAvailableBrands(Array.from(new Set([...data, ...availableBrands])));
          }
        })
        .catch(() => {});

      fetch(`${apiUrl}/catalog/products`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: CatalogProduct[] = data.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              titleFa: p.title_fa,
              brand: p.brand || "متفرقه",
              category: p.category_slug || "food",
              targetSpecies: p.target_species || "DOG",
              isAvailable: (p.stock_quantity || 0) > 0,
              weightText: p.variants?.[0]?.title_fa || "بسته استاندارد",
              buyBoxOffer: {
                sellerId: p.buy_box_offer?.seller_id || "seller-1",
                storeNameFa: p.buy_box_offer?.store_name_fa || "انبار مرکزی بونیو",
                priceToman: p.old_price_tomans || p.price_tomans || 1000000,
                discountedPriceToman: p.discount_percent ? p.price_tomans : undefined,
                stockQuantity: p.stock_quantity || 10,
                leadTimeHours: (p.lead_time_days || 0) * 24,
                isBuyBox: true,
              },
              otherOffersCount: (p.alternative_offers || []).length,
              rating: p.rating_avg || 4.8,
              reviewsCount: p.rating_count || 12,
              imageSrc: p.primary_image_url || "/icons/food.svg",
              descriptionFa: p.description_fa,
              weightVariants: (p.variants || []).map((v: any) => ({
                id: v.id,
                weightKg: (v.weight_grams || 1000) / 1000,
                labelFa: v.title_fa,
                priceToman: v.old_price_tomans || v.price_tomans,
                discountedPriceToman: v.discount_percent ? v.price_tomans : undefined,
              })),
            }));
            setCatalogProducts(mapped);
          }
        })
        .catch(() => {});
    }

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Resolve active variant for a product
  const getProductActiveVariant = (product: CatalogProduct): ProductWeightVariant | null => {
    if (!product.weightVariants || product.weightVariants.length === 0) return null;
    const selectedId = selectedVariants[product.id];
    if (selectedId) {
      const found = product.weightVariants.find((v) => v.id === selectedId);
      if (found) return found;
    }
    return product.weightVariants[0];
  };

  const handleSelectVariant = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (
    product: CatalogProduct,
    variant?: ProductWeightVariant | null,
    quantity: number = 1,
    targetPetId?: string | null
  ) => {
    const activeVar = variant !== undefined ? variant : getProductActiveVariant(product);
    const assignedPetId = targetPetId !== undefined ? targetPetId : (activePet ? activePet.id : null);
    const assignedPet = assignedPetId ? pets.find((p) => p.id === assignedPetId) : null;

    addItem(product, undefined, assignedPetId, activeVar, quantity);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);

    const weightLabel = activeVar ? ` (${activeVar.labelFa})` : (product.weightText ? ` (${product.weightText})` : "");
    const petLabel = assignedPet ? ` برای ${assignedPet.name}` : "";
    showToast(`«${product.titleFa}${weightLabel}»${petLabel} به سبد خرید افزوده شد ✓`);
  };


  // Open Quick View Modal
  const openQuickView = (product: CatalogProduct) => {
    setQuickViewProduct(product);
    setModalQuantity(1);
    setModalTargetPetId(activePet ? activePet.id : null);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((p) => {
        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        if (selectedSpecies !== "ALL" && p.targetSpecies !== selectedSpecies && p.targetSpecies !== "ALL") return false;
        if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;
        if (onlyAvailable && !p.isAvailable) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.titleFa.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          const priceA = a.buyBoxOffer.discountedPriceToman || a.buyBoxOffer.priceToman;
          const priceB = b.buyBoxOffer.discountedPriceToman || b.buyBoxOffer.priceToman;
          return priceA - priceB;
        }
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        return b.reviewsCount - a.reviewsCount;
      });
  }, [selectedCategory, selectedSpecies, selectedBrand, onlyAvailable, searchQuery, sortBy]);


  return (
    <div className="w-full space-y-6 md:space-y-8" dir="rtl">
      
      {/* 1. Category Hero Banner matching reference image */}
      <div className="relative rounded-3xl md:rounded-4xl p-6 sm:p-10 bg-linear-to-r from-stone-900 via-stone-850 to-stone-950 text-white overflow-hidden shadow-glass border border-white/20">
        <div className="absolute top-0 end-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
              <Link href="/" className="hover:text-white transition-colors">صفحه اصلی</Link>
              <span>/</span>
              <span className="text-emerald-400">فروشگاه بونیو</span>
              {selectedSpecies !== "ALL" && (
                <>
                  <span>/</span>
                  <span className="text-white">
                    {selectedSpecies === "CAT" ? "گربه" : selectedSpecies === "DOG" ? "سگ" : selectedSpecies === "BIRD" ? "پرنده" : "جوندگان"}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {selectedSpecies === "CAT" ? "غذای گربه (Cat Nutrition)" : selectedSpecies === "DOG" ? "غذای سگ (Dog Nutrition)" : "فروشگاه تخصصی محصولات پت"}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              تغذیه اصیل و استاندارد با تضمین تاریخ انقضای معتبر و خرید مستقیم از ارزان‌ترین فروشنده دارای موجودی (Buy Box).
            </p>
          </div>

          {/* Banner Thumbnail Icon */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 border border-white/20 p-4 flex items-center justify-center shrink-0">
            <Image
              src={selectedSpecies === "DOG" ? "/icons/dog.svg" : selectedSpecies === "CAT" ? "/icons/cat.svg" : "/icons/food.svg"}
              alt="دسته بندی"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Cart Notification Toast with Manual Close & Auto-Dismiss (4s) */}
      {toastMessage && (
        <div className="fixed top-20 inset-x-4 max-w-md mx-auto z-50 p-3.5 sm:p-4 rounded-2xl bg-emerald-600/95 backdrop-blur-md text-white font-bold text-xs shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
            </div>
            <span className="truncate">{toastMessage}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link 
              href="/cart" 
              className="px-2.5 py-1 rounded-xl bg-white text-emerald-800 text-[11px] font-black hover:bg-emerald-50 transition-colors shadow-xs"
            >
              مشاهده سبد
            </Link>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="بستن اعلان"
              className="w-6 h-6 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Store Layout: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT SIDEBAR FILTERS (In RTL) matching reference (3 cols) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-border/70 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>فیلترهای کاتالوگ</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSpecies("ALL");
                  setSelectedBrand("all");
                  setBrandSearch("");
                  setOnlyAvailable(true);
                  setSearchQuery("");
                }}
                className="text-[11px] text-muted hover:text-primary transition-colors cursor-pointer"
              >
                پاکسازی همه
              </button>
            </div>

            {/* Filter Group: Product Type */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                نوع محصول (Product Type)
              </label>
              <div className="space-y-1">
                {[
                  { id: "all", title: "همه محصولات" },
                  { id: "food", title: "غذای خشک و مرطوب" },
                  { id: "treats", title: "تشویقی و اسنک" },
                  { id: "health", title: "سلامت، مالت و مکمل" },
                  { id: "toys", title: "اسباب‌بازی تعاملی" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ProductCategory)}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer",
                      selectedCategory === cat.id
                        ? "bg-primary text-white font-bold shadow-xs"
                        : "text-muted hover:text-foreground hover:bg-black/5"
                    )}
                  >
                    <span>{cat.title}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Animal Species */}
            <div className="pt-2 border-t border-border/50">
              <label className="block text-xs font-bold text-foreground mb-2">
                گونه حیوان (Animal)
              </label>
              <div className="space-y-1">
                {[
                  { id: "ALL", title: "همه حیوانات" },
                  { id: "CAT", title: "گربه‌ها" },
                  { id: "DOG", title: "سگ‌ها" },
                  { id: "BIRD", title: "پرندگان" },
                  { id: "SMALL_PET", title: "حیوانات کوچک" },
                ].map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedSpecies(spec.id as PetSpecies | "ALL")}
                    className={cn(
                      "w-full text-start px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer",
                      selectedSpecies === spec.id
                        ? "bg-primary text-white font-bold shadow-xs"
                        : "text-muted hover:text-foreground hover:bg-black/5"
                    )}
                  >
                    <span>{spec.title}</span>
                    {selectedSpecies === spec.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Brand Filter (Item 7) */}
            <div className="pt-2 border-t border-border/50">
              <label className="block text-xs font-bold text-foreground mb-1.5">
                فیلتر برندها (Brands)
              </label>
              {/* Brand Search Input */}
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="جستجوی برند..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border/60 mb-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand("all")}
                  className={cn(
                    "w-full text-start px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer",
                    selectedBrand === "all"
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "text-muted hover:text-foreground hover:bg-black/5"
                  )}
                >
                  <span>همه برندها</span>
                  {selectedBrand === "all" && <Check className="w-3 h-3" />}
                </button>
                {availableBrands
                  .filter((b) => !brandSearch.trim() || b.toLowerCase().includes(brandSearch.toLowerCase()))
                  .map((brandName) => (
                    <button
                      key={brandName}
                      type="button"
                      onClick={() => setSelectedBrand(selectedBrand === brandName ? "all" : brandName)}
                      className={cn(
                        "w-full text-start px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer",
                        selectedBrand === brandName
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "text-muted hover:text-foreground hover:bg-black/5"
                      )}
                    >
                      <span>{brandName}</span>
                      {selectedBrand === brandName && <Check className="w-3 h-3" />}
                    </button>
                  ))}
              </div>
            </div>


            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                فقط کالاهای موجود
              </span>
              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={cn(
                  "w-10 h-6 rounded-full transition-colors p-1 relative cursor-pointer",
                  onlyAvailable ? "bg-primary" : "bg-stone-300"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  onlyAvailable ? "translate-x-0" : "-translate-x-4"
                )} />
              </button>
            </div>

          </div>
        </aside>

        {/* LEFT PRODUCT GRID & TOP CONTROLS (9 cols) */}
        <main className="lg:col-span-9 space-y-5">
          
          {/* Top Control Bar: Search & Sorting */}
          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در بین محصولات این بخش..."
                className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-full ps-8 pe-4 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort & Results Count */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs">
              <span className="text-muted">
                {filteredProducts.length} محصول یافت شد
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-muted shrink-0">مرتب‌سازی:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface-subtle text-foreground text-xs rounded-xl px-2.5 py-1.5 border border-border focus:outline-none font-medium cursor-pointer"
                >
                  <option value="popular">محبوب‌ترین (پیش‌فرض)</option>
                  <option value="price_asc">ارزان‌ترین قیمت</option>
                  <option value="rating">بیشترین امتیاز خریداران</option>
                </select>
              </div>
            </div>

          </div>

          {/* Products Grid matching Reference Image */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isFav = !!favorites[product.id];
                const activeVariant = getProductActiveVariant(product);

                // Dynamic Price calculation based on active variant
                const activePrice = activeVariant
                  ? (activeVariant.discountedPriceToman || activeVariant.priceToman)
                  : (product.buyBoxOffer.discountedPriceToman || product.buyBoxOffer.priceToman);

                const originalPrice = activeVariant
                  ? (activeVariant.discountedPriceToman ? activeVariant.priceToman : null)
                  : (product.buyBoxOffer.discountedPriceToman ? product.buyBoxOffer.priceToman : null);

                const pricePerKg = activeVariant && activeVariant.weightKg > 0
                  ? Math.round(activePrice / activeVariant.weightKg)
                  : null;

                return (
                  <div
                    key={product.id}
                    className="glass-card glass-card-hover rounded-3xl p-3.5 sm:p-4 flex flex-col justify-between border border-border/70 transition-all duration-300 relative group"
                  >
                    <div>
                      {/* Product Image Container */}
                      <Link 
                        href={`/shop/${product.slug}`}
                        className="relative w-full aspect-square rounded-2xl bg-surface-subtle flex items-center justify-center p-3 mb-2.5 overflow-hidden cursor-pointer block"
                      >
                        <Image
                          src={product.imageSrc}
                          alt={product.titleFa}
                          width={90}
                          height={90}
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Brand Tag */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedBrand(product.brand);
                          }}
                          className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-primary hover:text-white backdrop-blur-xs text-[10px] font-semibold text-muted-foreground border border-black/5 dark:border-white/10 shadow-2xs z-10 transition-colors"
                        >
                          {product.brand}
                        </button>


                        {/* Quick View / Detail Badge */}
                        <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                          <Eye className="w-2.5 h-2.5" />
                          <span>نمایش ۳۶۰°</span>
                        </span>

                        {/* Favorite Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          aria-label="نشان کردن کالا"
                          className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                        >
                          <Heart className={cn("w-3.5 h-3.5", isFav ? "fill-rose-500 text-rose-500" : "text-stone-400")} />
                        </button>
                      </Link>

                      {/* Ratings */}
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium mb-1">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-muted text-[10px]">({product.reviewsCount})</span>
                      </div>

                      {/* Title Link to PDP */}
                      <Link 
                        href={`/shop/${product.slug}`}
                        className="text-xs font-bold text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block"
                      >
                        {product.titleFa}
                      </Link>

                      {/* Buy Box Seller Label */}
                      <p className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 inline-block font-medium">
                        ✓ {product.buyBoxOffer.storeNameFa}
                      </p>

                      {/* Weight Variant Selector Chips (if available) */}
                      {product.weightVariants && product.weightVariants.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-border/40">
                          <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                            <span className="flex items-center gap-1">
                              <Scale className="w-3 h-3 text-primary" />
                              <span>وزن:</span>
                            </span>
                            {pricePerKg && (
                              <span className="text-primary font-bold">
                                {pricePerKg.toLocaleString("fa-IR")} ت/کیلو
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {product.weightVariants.map((v) => {
                              const isSelected = activeVariant?.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectVariant(product.id, v.id);
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer",
                                    isSelected
                                      ? "bg-primary text-white border-primary shadow-xs scale-102"
                                      : "bg-surface-subtle hover:bg-white text-muted hover:text-foreground border-border/80"
                                  )}
                                >
                                  {v.labelFa}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price and Add to Cart Section */}
                    <div className="mt-3 pt-2.5 border-t border-border/40">
                      <Link 
                        href={`/shop/${product.slug}`}
                        className="flex flex-col mb-2.5 block hover:opacity-85 transition-opacity"
                      >
                        {originalPrice ? (
                          <>
                            <span className="text-[10px] text-muted line-through">
                              {originalPrice.toLocaleString("fa-IR")} ت
                            </span>
                            <span className="text-sm font-black text-primary">
                              {activePrice.toLocaleString("fa-IR")} <span className="text-[11px] font-normal">تومان</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-black text-primary">
                            {activePrice.toLocaleString("fa-IR")} <span className="text-[11px] font-normal">تومان</span>
                          </span>
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product, activeVariant, 1)}
                        className={cn(
                          "w-full py-2.5 px-3 rounded-full text-white text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer",
                          addedProductId === product.id
                            ? "bg-emerald-600 animate-pulse"
                            : "bg-primary hover:bg-primary-hover"
                        )}
                      >
                        {addedProductId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>محصول با موفقیت اضافه شد ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>افزودن به سبد</span>
                            {activePet && (
                              <span className="text-[10px] text-emerald-200">
                                ({activePet.name})
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    </div>


                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-10 text-center border border-border/60">
              <p className="text-sm font-bold text-foreground">
                هیچ کالایی با فیلترهای انتخابی پیدا نشد.
              </p>
              <p className="text-xs text-muted mt-1">
                لطفاً فیلتر نوع محصول یا گونه حیوان را تغییر دهید.
              </p>
            </div>
          )}

        </main>

      </div>

      {/* 3. Quick View / Product Detail Modal */}
      {quickViewProduct && (() => {
        const modalVariant = getProductActiveVariant(quickViewProduct);
        const modalPrice = modalVariant
          ? (modalVariant.discountedPriceToman || modalVariant.priceToman)
          : (quickViewProduct.buyBoxOffer.discountedPriceToman || quickViewProduct.buyBoxOffer.priceToman);
        const modalOriginalPrice = modalVariant
          ? (modalVariant.discountedPriceToman ? modalVariant.priceToman : null)
          : (quickViewProduct.buyBoxOffer.discountedPriceToman ? quickViewProduct.buyBoxOffer.priceToman : null);
        const modalTotal = modalPrice * modalQuantity;
        const modalPricePerKg = modalVariant && modalVariant.weightKg > 0
          ? Math.round(modalPrice / modalVariant.weightKg)
          : null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-surface border border-border/80 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] overflow-y-auto space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <span className="text-xs font-bold text-muted">جزئیات و انتخاب متغیر</span>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="w-7 h-7 rounded-full bg-surface-subtle hover:bg-black/10 flex items-center justify-center text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-2xl bg-surface-subtle p-3 flex items-center justify-center shrink-0 border border-border/60">
                  <Image
                    src={quickViewProduct.imageSrc}
                    alt={quickViewProduct.titleFa}
                    width={72}
                    height={72}
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-md">
                    {quickViewProduct.brand}
                  </span>
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {quickViewProduct.titleFa}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{quickViewProduct.rating}</span>
                    </span>
                    <span>•</span>
                    <span>{quickViewProduct.buyBoxOffer.storeNameFa}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {quickViewProduct.descriptionFa && (
                <p className="text-xs text-muted leading-relaxed bg-surface-subtle p-3 rounded-2xl border border-border/50">
                  {quickViewProduct.descriptionFa}
                </p>
              )}

              {/* Weight Variant Selector in Modal */}
              {quickViewProduct.weightVariants && quickViewProduct.weightVariants.length > 0 && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-primary" />
                      <span>انتخاب بسته وزن:</span>
                    </span>
                    {modalPricePerKg && (
                      <span className="text-primary text-[11px] font-bold">
                        هر کیلوگرم: {modalPricePerKg.toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {quickViewProduct.weightVariants.map((v) => {
                      const isSelected = modalVariant?.id === v.id;
                      const vPrice = v.discountedPriceToman || v.priceToman;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVariant(quickViewProduct.id, v.id)}
                          className={cn(
                            "p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20"
                              : "bg-surface hover:bg-white border-border text-foreground"
                          )}
                        >
                          <span className="block text-xs font-black">{v.labelFa}</span>
                          <span className={cn(
                            "block text-[10px] mt-0.5",
                            isSelected ? "text-emerald-100" : "text-primary font-bold"
                          )}>
                            {vPrice.toLocaleString("fa-IR")} ت
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Beneficiary Pet Assignment */}
              {pets.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    خرید برای کدام پت انجام می‌شود؟
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModalTargetPetId(null)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        modalTargetPetId === null
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface-subtle text-muted hover:text-foreground border-border"
                      )}
                    >
                      عمومی / بدون انتساب
                    </button>
                    {pets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setModalTargetPetId(p.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer",
                          modalTargetPetId === p.id
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface-subtle text-muted hover:text-foreground border-border"
                        )}
                      >
                        <Image src={p.avatarUrl} alt={p.name} width={16} height={16} className="object-contain" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Price Summary */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">تعداد:</span>
                  <div className="flex items-center border border-border rounded-xl bg-surface-subtle">
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-black/5 rounded-s-xl cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{modalQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setModalQuantity((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-black/5 rounded-e-xl cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-end">
                  <span className="block text-[11px] text-muted">مبلغ کل:</span>
                  <span className="text-base font-black text-primary">
                    {modalTotal.toLocaleString("fa-IR")} <span className="text-xs font-normal">تومان</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(quickViewProduct, modalVariant, modalQuantity, modalTargetPetId);
                  setQuickViewProduct(null);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-black transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>افزودن {modalQuantity} عدد به سبد خرید</span>
              </button>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
