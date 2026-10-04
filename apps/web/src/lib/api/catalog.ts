/**
 * Production Catalog API Client
 * Fetches categories, brands, and products directly from the FastAPI database backend.
 */

import { CatalogProduct } from "@/types/catalog";
import { API_BASE } from "./client";

export interface CatalogQueryFilters {
  species?: string;
  category_slug?: string;
  brand?: string;
  search?: string;
}

export async function fetchCatalogProducts(filters: CatalogQueryFilters = {}): Promise<CatalogProduct[]> {
  try {
    const params = new URLSearchParams();
    if (filters.species) params.set("species", filters.species.toUpperCase());
    if (filters.category_slug) params.set("category_slug", filters.category_slug);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.search) params.set("search", filters.search);

    const res = await fetch(`${API_BASE}/catalog/products?${params.toString()}`, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[CatalogAPI] Fetch failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (err) {
    console.error("[CatalogAPI] Error fetching products:", err);
    return [];
  }
}

export function normalizeProduct(p: any): CatalogProduct {
  if (!p) return p;
  if (p.buyBoxOffer && p.titleFa) return p;

  return {
    id: p.id,
    slug: p.slug,
    titleFa: p.title_fa || p.titleFa || "محصول بونیو",
    brand: p.brand || "متفرقه",
    category: p.category_slug || p.category || "food",
    targetSpecies: p.target_species || p.targetSpecies || "DOG",
    isAvailable: (p.stock_quantity ?? 10) > 0,
    weightText: p.variants?.[0]?.title_fa || p.weightText || "بسته استاندارد",
    buyBoxOffer: {
      id: p.buy_box_offer?.id || p.buyBoxOffer?.id || undefined,
      sellerId: p.buy_box_offer?.seller_id || p.buyBoxOffer?.sellerId || "seller-1",
      storeNameFa: p.buy_box_offer?.store_name_fa || p.buyBoxOffer?.storeNameFa || "انبار مرکزی بونیو",
      priceToman: p.old_price_tomans || p.price_tomans || p.buyBoxOffer?.priceToman || 1000000,
      discountedPriceToman: p.discount_percent ? p.price_tomans : (p.buyBoxOffer?.discountedPriceToman || undefined),
      stockQuantity: p.stock_quantity || p.buyBoxOffer?.stockQuantity || 10,
      leadTimeHours: (p.lead_time_days || 0) * 24,
      isBuyBox: true,
    },
    otherOffersCount: (p.alternative_offers || p.otherOffersCount || []).length,
    rating: p.rating_avg || p.rating || 4.8,
    reviewsCount: p.rating_count || p.reviewsCount || 12,
    imageSrc: p.primary_image_url || p.imageSrc || "/icons/food.svg",
    descriptionFa: p.description_fa || p.descriptionFa,
    weightVariants: (p.variants || p.weightVariants || []).map((v: any) => ({
      id: v.id,
      weightKg: v.weight_grams ? v.weight_grams / 1000 : (v.weightKg || 1),
      labelFa: v.title_fa || v.labelFa || `${(v.weight_grams ? v.weight_grams / 1000 : 1).toLocaleString("fa-IR")} کیلوگرم`,
      priceToman: v.old_price_tomans || v.price_tomans || v.priceToman || 1000000,
      discountedPriceToman: v.discount_percent ? v.price_tomans : (v.discountedPriceToman || undefined),
    })),
  };
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/catalog/products/${encodeURIComponent(slug)}`, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return normalizeProduct(data);
  } catch (err) {
    console.error(`[CatalogAPI] Error fetching product ${slug}:`, err);
    return null;
  }
}

export async function fetchCatalogBrands(species?: string): Promise<string[]> {
  try {
    const params = new URLSearchParams();
    if (species) params.set("species", species.toUpperCase());

    const res = await fetch(`${API_BASE}/catalog/brands?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}
