/**
 * Production Catalog API Client
 * Fetches categories, brands, and products directly from the FastAPI database backend.
 */

import { CatalogProduct } from "@/types/catalog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

    const res = await fetch(`${API_BASE}/api/v1/catalog/products?${params.toString()}`, {
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
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[CatalogAPI] Error fetching products:", err);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/catalog/products/${encodeURIComponent(slug)}`, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`[CatalogAPI] Error fetching product ${slug}:`, err);
    return null;
  }
}

export async function fetchCatalogBrands(species?: string): Promise<string[]> {
  try {
    const params = new URLSearchParams();
    if (species) params.set("species", species.toUpperCase());

    const res = await fetch(`${API_BASE}/api/v1/catalog/brands?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}
