"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Check, Heart } from "lucide-react";
import { mockCatalogProducts } from "@/data/mock-catalog";
import { useCart } from "@/context/cart-context";
import { usePet } from "@/context/pet-context";
import { CatalogProduct } from "@/types/catalog";

interface FeaturedProductsRowProps {
  products?: CatalogProduct[];
}

export function FeaturedProductsRow({ products }: FeaturedProductsRowProps) {
  const { addItem } = useCart();
  const { activePet } = usePet();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const displayProducts = products || mockCatalogProducts.slice(0, 4);

  const handleAddToCart = (product: CatalogProduct) => {
    addItem(product, undefined, activePet ? activePet.id : null);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2400);
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5" dir="rtl">
      {displayProducts.map((product) => {
        const isAdded = addedId === product.id;
        const isWished = !!wishlist[product.id];
        const offer = product.buyBoxOffer;
        const hasDiscount = Boolean(offer.discountedPriceToman && offer.discountedPriceToman < offer.priceToman);
        const discountPercent = hasDiscount
          ? Math.round(((offer.priceToman - (offer.discountedPriceToman || 0)) / offer.priceToman) * 100)
          : 0;

        return (
          <div
            key={product.id}
            className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-surface border border-border/80 p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-emerald-600/30"
          >
            {/* Top Area: Image & Metadata */}
            <div>
              {/* Product Image Link Container */}
              <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl bg-[#F7F8F6] dark:bg-stone-900/60 p-2 sm:p-3 mb-3 overflow-hidden flex items-center justify-center">
                <Link
                  href={`/shop/${product.slug}`}
                  className="w-full h-full flex items-center justify-center cursor-pointer select-none"
                  aria-label={product.titleFa}
                >
                  <Image
                    src={product.imageSrc}
                    alt={product.titleFa}
                    width={220}
                    height={220}
                    className="max-h-[90%] max-w-[90%] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
                  />
                </Link>

                {/* Brand Tag - Non-link span overlay to eliminate nested anchor hydration errors */}
                <span className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-full bg-white/95 dark:bg-stone-800/90 backdrop-blur-xs text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-black/5 shadow-2xs pointer-events-none">
                  {product.brand}
                </span>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(product.id, e)}
                  aria-label="افزودن به علاقه‌مندی‌ها"
                  className="absolute top-2.5 end-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-xs flex items-center justify-center text-stone-400 hover:text-rose-500 transition-colors shadow-2xs border border-black/5 cursor-pointer z-10"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>

                {/* Discount Badge */}
                {hasDiscount && (
                  <span className="absolute bottom-2.5 start-2.5 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                    {discountPercent.toLocaleString("fa-IR")}٪
                  </span>
                )}

                {/* Weight / Variant Badge */}
                {product.weightVariants && product.weightVariants.length > 0 && (
                  <span className="absolute bottom-2.5 end-2.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/50 dark:border-emerald-800/30">
                    {product.weightVariants[0].labelFa}
                  </span>
                )}
              </div>

              {/* Rating Link to PDP */}
              <Link
                href={`/shop/${product.slug}`}
                className="flex items-center gap-1 text-[11px] text-amber-500 font-medium mb-1.5 hover:opacity-80 transition-opacity"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span>{product.rating.toLocaleString("fa-IR")}</span>
                <span className="text-muted text-[10px]">({product.reviewsCount.toLocaleString("fa-IR")})</span>
              </Link>

              {/* Title Link to PDP */}
              <Link
                href={`/shop/${product.slug}`}
                className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors block mb-1.5"
              >
                {product.titleFa}
              </Link>

              {/* Buy Box Offer Seller Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-medium border border-emerald-200/50 dark:border-emerald-800/30">
                  ✓ {offer.storeNameFa}
                </span>
                <span className="text-[10px] text-stone-400">
                  {offer.stockQuantity > 0 ? "موجود در انبار" : "ناموجود"}
                </span>
              </div>
            </div>

            {/* Price Area & Add to Cart Button */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <Link
                href={`/shop/${product.slug}`}
                className="flex flex-col mb-3 block hover:opacity-90 transition-opacity"
              >
                {hasDiscount ? (
                  <>
                    <span className="text-[11px] text-muted line-through">
                      {offer.priceToman.toLocaleString("fa-IR")} تومان
                    </span>
                    <span className="text-sm sm:text-base font-black text-foreground">
                      {offer.discountedPriceToman?.toLocaleString("fa-IR")} <span className="text-xs font-normal text-muted">تومان</span>
                    </span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base font-black text-foreground">
                    {offer.priceToman.toLocaleString("fa-IR")} <span className="text-xs font-normal text-muted">تومان</span>
                  </span>
                )}
              </Link>

              {/* ONLY this button triggers add-to-cart with immediate feedback */}
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                disabled={offer.stockQuantity === 0}
                className={`w-full py-2.5 px-3 rounded-full text-xs font-bold transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white animate-pulse"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>محصول به سبد اضافه شد ✓</span>
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
  );
}
