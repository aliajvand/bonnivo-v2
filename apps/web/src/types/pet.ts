export type PetSpecies = "DOG" | "CAT" | "BIRD" | "SMALL_PET" | "OTHER";
export type PetSex = "MALE" | "FEMALE" | "UNKNOWN";
export type TaskCategory = "WALK" | "FOOD" | "MEDICATION" | "HYGIENE" | "WATER";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  sex: PetSex;
  birthDate?: string;
  estimatedAgeMonths?: number;
  weightKg?: number;
  color?: string;
  microchipNumber?: string;
  isNeutered: boolean;
  avatarUrl: string;
  qrPassportToken: string;
  isLost: boolean;
  lostAlertMessage?: string;
  dailyFoodGrams?: number;
  dietaryPreferences?: string;
  allergies?: string;
  healthBookImageUrl?: string;
  passportDocumentUrl?: string;
  isPassportVerified?: boolean;
  vaccinationStatus?: string;
  vaccinationDueDate?: string;
  emergencyContactPhone?: string;
  relationship?: string;
  importantInfo?: string;
  createdAt: string;
}

export interface PetActivity {
  id: string;
  petId: string;
  activityType: "VACCINATION" | "VET_VISIT" | "BOARDING" | "EXERCISE" | "CARE_LOG" | "EVENT" | "OTHER";
  activityTypeFa: string;
  category: "OWNER" | "VET" | "OTHER";
  descriptionFa: string;
  statusFa: string;
  performedAt: string;
}

export interface CareTask {
  id: string;
  petId: string;
  title: string;
  species: PetSpecies;
  category: TaskCategory;
  targetMetric?: "MINUTES" | "GRAMS" | "TIMES";
  targetValue?: number;
  currentValue?: number;
  scheduledTime?: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  creatorRole?: "OWNER" | "VET" | "SYSTEM";
  isLocked?: boolean;
  date?: string; // YYYY-MM-DD
}

export interface PetDailyCareSummary {
  petId: string;
  date: string;
  tasks: CareTask[];
  walkProgressPercentage?: number;
  overallProgressPercentage: number;
}

