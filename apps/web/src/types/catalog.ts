import { PetSpecies } from "./pet";

export type ProductCategory = "food" | "treats" | "toys" | "health" | "hygiene" | "accessories" | "all";

export interface SellerOffer {
  id?: string;
  sellerId: string;
  storeNameFa: string;
  priceToman: number;
  discountedPriceToman?: number;
  stockQuantity: number;
  leadTimeHours: number;
  isBuyBox: boolean;
}

export interface ProductWeightVariant {
  id: string;
  weightKg: number;
  labelFa: string; // e.g. "۲ کیلوگرم", "۴ کیلوگرم", "۱۰ کیلوگرم"
  priceToman: number;
  discountedPriceToman?: number;
}

export interface CatalogProduct {
  id: string;
  titleFa: string;
  slug: string;
  brand: string;
  category: ProductCategory;
  targetSpecies: PetSpecies | "ALL";
  imageSrc: string;
  rating: number;
  reviewsCount: number;
  buyBoxOffer: SellerOffer;
  otherOffersCount: number;
  descriptionFa?: string;
  weightText?: string;
  isAvailable: boolean;
  weightVariants?: ProductWeightVariant[];
  primaryImageUrl?: string;
  sku?: string;
}

