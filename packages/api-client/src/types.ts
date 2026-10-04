export type UserRole = "PET_PARENT" | "SELLER" | "ADMIN";
export type PetSpecies = "DOG" | "CAT" | "BIRD" | "SMALL_PET" | "OTHER";
export type PetSex = "MALE" | "FEMALE" | "UNKNOWN";
export type TaskCategory = "WALK" | "FOOD" | "MEDICATION" | "HYGIENE" | "WATER";
export type OrderStatus = "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface User {
  id: string;
  phoneNumber: string;
  fullName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  sex: PetSex;
  birthDate?: string;
  estimatedAgeMonths?: number;
  weightKg?: number;
  isNeutered: boolean;
  avatarUrl?: string;
  qrPassportToken: string;
  isLost: boolean;
  lostAlertMessage?: string;
  createdAt: string;
}

export interface CareTask {
  id: string;
  petId: string;
  title: string;
  species: PetSpecies;
  category: TaskCategory;
  targetMetric?: string;
  targetValue?: number;
  currentValue?: number;
  scheduledTime?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CanonicalProduct {
  id: string;
  slug: string;
  titleFa: string;
  brand?: string;
  targetSpecies: PetSpecies;
  descriptionFa?: string;
  imageGallery: string[];
  buyBoxOffer?: SellerOffer;
}

export interface SellerOffer {
  id: string;
  sellerId: string;
  storeName: string;
  priceTomans: number;
  stockQuantity: number;
  isBuyBoxWinner: boolean;
}

export interface CartItemInput {
  productId: string;
  offerId: string;
  quantity: number;
  assignedPetId?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: string;
}
