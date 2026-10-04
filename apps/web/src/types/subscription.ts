export type SubscriptionFrequency = "EVERY_2_WEEKS" | "MONTHLY" | "EVERY_2_MONTHS";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface PetFoodSubscriptionItem {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  productId: string;
  productTitleFa: string;
  weightVariantText: string;
  packageWeightKg: number;
  dailyConsumptionGrams: number;
  unitPriceToman: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  daysDuration: number;
  nextDeliveryDate: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface CreateSubscriptionPayload {
  petId: string;
  productId: string;
  productTitleFa: string;
  weightVariantText: string;
  packageWeightKg: number;
  dailyConsumptionGrams: number;
  unitPriceToman: number;
  frequency: SubscriptionFrequency;
  deliveryAddress: string;
}
