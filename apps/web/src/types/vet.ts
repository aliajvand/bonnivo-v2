export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface ClinicSummary {
  id: string;
  name: string;
  slug: string;
  district: string;
  address: string;
  phoneNumber: string;
  rating: number;
  reviewsCount: number;
  isEmergency24h: boolean;
  services: string[];
  imageUrl: string;
}

export interface Veterinarian {
  id: string;
  clinicId: string;
  fullName: string;
  medicalLicenseNumber: string;
  speciality: string;
  avatarUrl: string;
  bio: string;
  consultationFeeToman: number;
  isActive: boolean;
}

export interface ClinicDetail extends ClinicSummary {
  veterinarians: Veterinarian[];
}

export interface TimeslotItem {
  time: string;
  isAvailable: boolean;
}

export interface BookAppointmentPayload {
  petId: string;
  clinicId: string;
  vetId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeslot: string;
  reasonForVisit: string;
  notes?: string;
}

export interface AppointmentItem {
  id: string;
  petId: string;
  petName: string;
  clinicId: string;
  clinicName: string;
  vetId: string;
  vetName: string;
  vetSpeciality: string;
  appointmentDate: string;
  timeslot: string;
  status: AppointmentStatus;
  reasonForVisit: string;
  totalFeeToman: number;
  isPaid: boolean;
  createdAt: string;
}

export interface PrescriptionItem {
  drug_name: string;
  dosage: string;
  instructions: string;
  duration_days?: number;
}

export interface MedicalRecordItem {
  id: string;
  petId: string;
  petName: string;
  vetId: string;
  vetName: string;
  vetSpeciality: string;
  appointmentId?: string;
  visitDate: string;
  diagnosis: string;
  prescriptions: PrescriptionItem[];
  vaccineAdministered?: string;
  vaccineNextDueDate?: string;
  allergiesNoted?: string;
  weightKg?: number;
  vetSignatureLicense: string;
  createdAt: string;
}

export interface ServiceBookingPayload {
  petId: string;
  serviceType: "GROOMING" | "WASH_AND_SPA" | "BOARDING" | "DAY_CARE";
  bookingDate: string;
  preferredTime: string;
  durationDays?: number;
  pickupRequired?: boolean;
  deliveryAddress?: string;
  specialCareNotes?: string;
}

export interface ServiceBookingResult {
  bookingId: string;
  petId: string;
  petName: string;
  serviceType: string;
  bookingDate: string;
  status: string;
  vaccineVerified: boolean;
  lastVaccineDate?: string;
  totalFeeToman: number;
  message: string;
}
