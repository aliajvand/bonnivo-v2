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
  ShoppingBag,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CatalogProduct, ProductCategory } from "@/types/catalog";
import { PetSpecies } from "@/types/pet";
import { usePet } from "@/context/pet-context";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api/client";

// Species definition with Persian labels
const SPECIES_OPTIONS: { id: PetSpecies; label: string }[] = [
  { id: "DOG", label: "سگ" },
  { id: "CAT", label: "گربه" },
  { id: "BIRD", label: "پرندگان" },
  { id: "SMALL_PET", label: "جوندگان و خرگوش" },
];

// Categories with Persian labels
const CATEGORY_OPTIONS: { id: ProductCategory; label: string }[] = [
  { id: "food", label: "غذای خشک و تر" },
  { id: "treats", label: "تشویقی و دنتال" },
  { id: "health", label: "مکمل، دارو و بهداشت" },
  { id: "toys", label: "اسباب‌بازی و سرگرمی" },
  { id: "accessories", label: "لوازم نگهداری و جای خواب" },
];

// Sort Options
type SortOption = "bestselling" | "price_asc" | "price_desc" | "rating" | "newest";
const SORT_TABS: { id: SortOption; label: string }[] = [
  { id: "bestselling", label: "پرفروش‌ترین" },
  { id: "price_asc", label: "ارزان‌ترین" },
  { id: "price_desc", label: "گران‌ترین" },
  { id: "rating", label: "محبوب‌ترین" },
  { id: "newest", label: "جدیدترین" },
];

const ITEMS_PER_PAGE = 12;

export function ShopCatalogView() {
  const { activePet } = usePet();
  const { addItem, isAdding } = useCart();

  // Multi-select filters state
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState<SortOption>("bestselling");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Accordion collapsed state
  const [openSections, setOpenSections] = useState({
    species: true,
    categories: true,
    brands: true,
    price: true,
  });

  // Brand filter internal state
  const [brandSearch, setBrandSearch] = useState<string>("");
  const [showAllBrands, setShowAllBrands] = useState<boolean>(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([
    "رویال کنین (Royal Canin)",
    "ژوزرا (Josera)",
    "هیلز (Hill's)",
    "پرو پلن (Pro Plan)",
    "بیافار (Beaphar)",
    "تریکسی (Trixie)",
    "رفلکس (Reflex)",
    "هپی داگ (Happy Dog)",
  ]);

  // Mobile Bottom Sheet Filter State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Loading & Products State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  // Sync from URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sp = params.getAll("species") as PetSpecies[];
      if (sp.length > 0) setSelectedSpecies(sp);

      const cat = params.getAll("category") as ProductCategory[];
      if (cat.length > 0) setSelectedCategories(cat);

      const br = params.getAll("brand");
      if (br.length > 0) setSelectedBrands(br);

      const s = params.get("sort") as SortOption;
      if (s && SORT_TABS.some((t) => t.id === s)) setSortBy(s);

      const q = params.get("q");
      if (q) setSearchQuery(q);

      const p = parseInt(params.get("page") || "1", 10);
      if (!isNaN(p) && p > 0) setCurrentPage(p);

      // Fetch distinct brands from backend API
      fetch(`${API_BASE}/catalog/brands`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: string[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAvailableBrands((prev) => Array.from(new Set([...prev, ...data])));
          }
        })
        .catch(() => {});

      // Fetch live products
      setIsLoading(true);
      fetch(`${API_BASE}/catalog/products`)
        .then((res) => (res.ok ? res.json() : []))
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
          } else {
            setCatalogProducts([]);
          }
        })
        .catch(() => {
          setCatalogProducts([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Update URL Query Parameters on filter changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      selectedSpecies.forEach((s) => params.append("species", s));
      selectedCategories.forEach((c) => params.append("category", c));
      selectedBrands.forEach((b) => params.append("brand", b));
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (sortBy !== "bestselling") params.set("sort", sortBy);
      if (currentPage > 1) params.set("page", currentPage.toString());

      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [selectedSpecies, selectedCategories, selectedBrands, searchQuery, sortBy, currentPage]);

  // Compute dynamic counts per filter option
  const counts = useMemo(() => {
    const speciesCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};

    catalogProducts.forEach((p) => {
      // Species
      speciesCount[p.targetSpecies] = (speciesCount[p.targetSpecies] || 0) + 1;
      // Category
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
      // Brand
      brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;
    });

    return { speciesCount, categoryCount, brandCount };
  }, [catalogProducts]);

  // Toggle filter selections
  const toggleSpecies = (s: PetSpecies) => {
    setCurrentPage(1);
    setSelectedSpecies((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleCategory = (c: ProductCategory) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const toggleBrand = (b: string) => {
    setCurrentPage(1);
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
  };

  const clearAllFilters = () => {
    setSelectedSpecies([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery("");
    setPriceRange([0, 5000000]);
    setOnlyAvailable(true);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedSpecies.length > 0 ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    searchQuery.trim().length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000000 ||
    !onlyAvailable;

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((p) => {
        if (selectedSpecies.length > 0 && !selectedSpecies.includes(p.targetSpecies as any) && p.targetSpecies !== "ALL") {
          return false;
        }
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
          return false;
        }
        if (selectedBrands.length > 0 && !selectedBrands.some((b) => p.brand.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(p.brand.toLowerCase()))) {
          return false;
        }
        if (onlyAvailable && !p.isAvailable) {
          return false;
        }
        const effectivePrice = p.buyBoxOffer.discountedPriceToman || p.buyBoxOffer.priceToman;
        if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.titleFa.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.buyBoxOffer.discountedPriceToman || a.buyBoxOffer.priceToman;
        const priceB = b.buyBoxOffer.discountedPriceToman || b.buyBoxOffer.priceToman;

        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "newest") return b.id.localeCompare(a.id);
        return b.reviewsCount - a.reviewsCount; // bestselling default
      });
  }, [catalogProducts, selectedSpecies, selectedCategories, selectedBrands, onlyAvailable, priceRange, searchQuery, sortBy]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const end = currentPage * ITEMS_PER_PAGE;
    return filteredProducts.slice(0, end);
  }, [filteredProducts, currentPage]);

  const canLoadMore = paginatedProducts.length < filteredProducts.length;

  const handleAddToCart = (product: CatalogProduct) => {
    addItem(product, undefined, activePet ? activePet.id : null, undefined, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
    showToast(`«${product.titleFa}» به سبد خرید افزوده شد ✓`);
  };

  // Visible brands based on search & showAll
  const visibleBrands = useMemo(() => {
    let list = availableBrands;
    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase();
      list = list.filter((b) => b.toLowerCase().includes(q));
    }
    return showAllBrands ? list : list.slice(0, 6);
  }, [availableBrands, brandSearch, showAllBrands]);

  // Reusable Filter Sidebar Content
  const FilterContent = (
    <aside className="space-y-6" dir="rtl" aria-label="فیلترهای کاتالوگ فروشگاه">
      {/* Clear All Header Button if filters active */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2 text-foreground font-black text-sm">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>فیلترهای جستجو</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>حذف همه</span>
          </button>
        )}
      </div>

      {/* 1. Pet Species Accordion */}
      <div className="border-b border-border/40 pb-4">
        <button
          type="button"
          onClick={() => setOpenSections((p) => ({ ...p, species: !p.species }))}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground hover:text-emerald-600 transition-colors"
        >
          <span>گونه حیوان خانگی</span>
          {openSections.species ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.species && (
          <div className="mt-2.5 space-y-2">
            {SPECIES_OPTIONS.map((sp) => {
              const isChecked = selectedSpecies.includes(sp.id);
              const count = counts.speciesCount[sp.id] || 0;
              return (
                <label
                  key={sp.id}
                  className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-1 px-1 rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSpecies(sp.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className={cn(isChecked && "font-bold text-foreground")}>{sp.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtle text-muted-foreground">
                    {count.toLocaleString("fa-IR")}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Product Categories Accordion */}
      <div className="border-b border-border/40 pb-4">
        <button
          type="button"
          onClick={() => setOpenSections((p) => ({ ...p, categories: !p.categories }))}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground hover:text-emerald-600 transition-colors"
        >
          <span>دسته‌بندی محصولات</span>
          {openSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.categories && (
          <div className="mt-2.5 space-y-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              const count = counts.categoryCount[cat.id] || 0;
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-1 px-1 rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className={cn(isChecked && "font-bold text-foreground")}>{cat.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtle text-muted-foreground">
                    {count.toLocaleString("fa-IR")}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Brands Accordion with Live Search */}
      <div className="border-b border-border/40 pb-4">
        <button
          type="button"
          onClick={() => setOpenSections((p) => ({ ...p, brands: !p.brands }))}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground hover:text-emerald-600 transition-colors"
        >
          <span>برندهای معتبر</span>
          {openSections.brands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.brands && (
          <div className="mt-2.5 space-y-2">
            {/* Live Brand Search Input */}
            <div className="relative mb-2">
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="جستجوی نام برند..."
                className="w-full py-1.5 pe-8 ps-2 text-[11px] bg-surface-subtle border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute end-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {visibleBrands.map((brand) => {
              const isChecked = selectedBrands.includes(brand);
              const count = counts.brandCount[brand] || 0;
              return (
                <label
                  key={brand}
                  className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-1 px-1 rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className={cn(isChecked && "font-bold text-foreground truncate max-w-[140px]")}>
                      {brand}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtle text-muted-foreground">
                    {count.toLocaleString("fa-IR")}
                  </span>
                </label>
              );
            })}

            {/* Show More Brands Toggle */}
            {availableBrands.length > 6 && !brandSearch && (
              <button
                type="button"
                onClick={() => setShowAllBrands((p) => !p)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline pt-1 block"
              >
                {showAllBrands ? "نمایش برندهای کمتر" : `مشاهده همه برندها (${availableBrands.length.toLocaleString("fa-IR")})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Price Slider Accordion */}
      <div className="border-b border-border/40 pb-4">
        <button
          type="button"
          onClick={() => setOpenSections((p) => ({ ...p, price: !p.price }))}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground hover:text-emerald-600 transition-colors"
        >
          <span>محدوده قیمت (تومان)</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>تا سقف:</span>
              <span className="font-mono font-bold text-foreground">
                {priceRange[1].toLocaleString("fa-IR")} تومان
              </span>
            </div>

            <input
              type="range"
              min="100000"
              max="5000000"
              step="50000"
              value={priceRange[1]}
              onChange={(e) => {
                setCurrentPage(1);
                setPriceRange([priceRange[0], parseInt(e.target.value, 10)]);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>۱۰۰,۰۰۰</span>
              <span>۵,۰۰۰,۰۰۰ تومان</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. In-Stock Switch */}
      <div className="pt-2">
        <label className="flex items-center justify-between text-xs font-bold text-foreground cursor-pointer select-none">
          <span>فقط کالاهای موجود در انبار</span>
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => {
              setCurrentPage(1);
              setOnlyAvailable(e.target.checked);
            }}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
          />
        </label>
      </div>
    </aside>
  );

  return (
    <div className="w-full space-y-6 md:space-y-8" dir="rtl">
      {/* 1. Compact Hero Banner (<200px) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-l from-stone-900 via-stone-850 to-stone-950 text-white overflow-hidden shadow-lg border border-white/10">
        <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            {/* Breadcrumb */}
            <nav aria-label="مسیر صفحه" className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                صفحه اصلی
              </Link>
              <span>/</span>
              <span className="text-emerald-400">فروشگاه بونیو</span>
            </nav>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              فروشگاه تخصصی محصولات و تغذیه حیوانات خانگی
            </h1>
            <p className="text-xs text-stone-300 leading-relaxed">
              تضمین کمترین قیمت در جعبه خرید (Buy Box)، تحویل فوری در تهران و اصالت ۴ ساعته کالا
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ضمانت اصالت ۱۰۰٪</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-stone-200">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>ارسال سریع تهران</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Mobile Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
            placeholder="جستجوی نام کالا، برند یا مشخصات..."
            className="w-full pe-10 ps-4 py-2.5 bg-surface-elevated text-xs text-foreground border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
          <Search className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute end-9 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-2xl bg-surface-elevated border border-border text-xs font-bold text-foreground flex items-center justify-center gap-2 shadow-xs"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>فیلترها</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Main Catalog Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sticky Sidebar (1 col) */}
        <div className="hidden lg:block lg:col-span-1 p-5 rounded-3xl bg-surface-elevated border border-border/80 shadow-xs sticky top-24">
          {FilterContent}
        </div>

        {/* Catalog Main Section (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Sorting Tabs */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 overflow-x-auto no-scrollbar gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground me-1" />
              <span className="text-xs font-bold text-muted-foreground">مرتب‌سازی:</span>
              {SORT_TABS.map((tab) => {
                const isActive = sortBy === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setSortBy(tab.id);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px]",
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Results Count */}
            <div className="text-xs text-muted-foreground shrink-0 ps-2">
              <span>{filteredProducts.length.toLocaleString("fa-IR")}</span>
              <span className="ms-1">کالا یافت شد</span>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              <span className="text-[11px] text-muted-foreground font-medium">فیلترهای اعمال‌شده:</span>

              {selectedSpecies.map((s) => {
                const opt = SPECIES_OPTIONS.find((o) => o.id === s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecies(s)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>{opt?.label || s}</span>
                    <X className="w-3 h-3" />
                  </button>
                );
              })}

              {selectedCategories.map((c) => {
                const opt = CATEGORY_OPTIONS.find((o) => o.id === c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>{opt?.label || c}</span>
                    <X className="w-3 h-3" />
                  </button>
                );
              })}

              {selectedBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBrand(b)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <span>{b}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <span>جستجو: {searchQuery}</span>
                  <X className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline ms-2"
              >
                پاک کردن همه
              </button>
            </div>
          )}

          {/* 4. Products Grid */}
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-4 bg-surface-elevated border border-border/80 space-y-3 animate-pulse"
                >
                  <div className="w-full aspect-square bg-muted/40 rounded-2xl" />
                  <div className="h-4 bg-muted/40 rounded-md w-3/4" />
                  <div className="h-3 bg-muted/30 rounded-md w-1/2" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-5 bg-muted/40 rounded-md w-1/3" />
                    <div className="h-8 bg-muted/40 rounded-xl w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            /* Empty Zero-Results State */
            <div className="p-12 text-center rounded-3xl bg-surface-elevated border border-border/80 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">کالایی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                لطفاً کلمات کلیدی دیگری را جستجو نمایید یا فیلترهای اعمال‌شده را حذف کنید تا همه محصولات نمایش داده شوند.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>حذف همه فیلترها</span>
              </button>
            </div>
          ) : (
            /* Clean Uniform Product Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedProducts.map((product) => {
                const buyBox = product.buyBoxOffer;
                const hasDiscount = Boolean(buyBox.discountedPriceToman && buyBox.discountedPriceToman < buyBox.priceToman);
                const discountPercent = hasDiscount
                  ? Math.round(((buyBox.priceToman - buyBox.discountedPriceToman!) / buyBox.priceToman) * 100)
                  : 0;
                const finalPrice = buyBox.discountedPriceToman || buyBox.priceToman;
                const isMultiVariant = Boolean(product.weightVariants && product.weightVariants.length > 1);

                return (
                  <div
                    key={product.id}
                    className="group rounded-3xl p-4 bg-surface-elevated border border-border/80 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative"
                  >
                    {/* Top: Badges & Wishlist */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-subtle mb-3">
                      <Image
                        src={product.imageSrc}
                        alt={product.titleFa}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-3 end-3 px-2 py-1 rounded-xl bg-rose-600 text-white font-mono font-black text-xs shadow-md">
                          {discountPercent.toLocaleString("fa-IR")}٪-
                        </span>
                      )}

                      {/* Store Badge */}
                      <span className="absolute bottom-3 start-3 px-2 py-0.5 rounded-lg bg-surface-elevated/90 backdrop-blur-xs text-[10px] text-muted-foreground font-bold border border-border/50">
                        {buyBox.storeNameFa}
                      </span>

                      {/* Wishlist toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setFavorites((prev) => ({ ...prev, [product.id]: !prev[product.id] }))
                        }
                        className="absolute top-3 start-3 p-2 rounded-xl bg-surface-elevated/80 backdrop-blur-xs text-muted-foreground hover:text-rose-600 transition-colors shadow-xs"
                        aria-label="نشان کردن محصول"
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            favorites[product.id] && "fill-rose-600 text-rose-600"
                          )}
                        />
                      </button>
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {product.brand}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-mono font-bold text-foreground">
                            {product.rating.toLocaleString("fa-IR")}
                          </span>
                        </div>
                      </div>

                      <Link href={`/shop/${product.slug || product.id}`}>
                        <h2 className="text-xs font-bold text-foreground line-clamp-2 hover:text-emerald-600 transition-colors leading-relaxed">
                          {product.titleFa}
                        </h2>
                      </Link>
                    </div>

                    {/* Bottom: Price & Unified CTA */}
                    <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-[10px] text-muted-foreground line-through font-mono">
                            {buyBox.priceToman.toLocaleString("fa-IR")}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-sm text-foreground">
                            {finalPrice.toLocaleString("fa-IR")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">تومان</span>
                        </div>
                      </div>

                      {/* Single Clear CTA (Item 9: Multiple weight variants link to detail page) */}
                      {isMultiVariant ? (
                        <Link
                          href={`/shop/${product.slug || product.id}`}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-emerald-600 hover:text-white border border-border text-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>انتخاب وزن</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding || !product.isAvailable}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {addedProductId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>افزوده شد</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>خرید</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Pagination / Load More Bar with Counter */}
          {!isLoading && filteredProducts.length > 0 && (
            <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                نمایش {paginatedProducts.length.toLocaleString("fa-IR")} از{" "}
                {filteredProducts.length.toLocaleString("fa-IR")} کالا
              </span>

              {canLoadMore && (
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-6 py-2.5 rounded-2xl bg-surface-elevated hover:bg-surface-subtle border border-border text-xs font-bold text-foreground shadow-xs transition-colors"
                >
                  نمایش کالاهای بیشتر
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Mobile Bottom Sheet Drawer for Filters */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-elevated rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm font-black text-foreground">فیلترهای کاتالوگ فروشگاه</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-xl bg-surface-subtle text-foreground hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2">{FilterContent}</div>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              مشاهده {filteredProducts.length.toLocaleString("fa-IR")} کالا
            </button>
          </div>
        </div>
      )}

      {/* 7. Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 end-6 z-50 p-3.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-3 duration-300"
        >
          <Check className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ms-2 p-1 hover:bg-emerald-600 rounded-lg text-emerald-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}
    </div>
  );
}
