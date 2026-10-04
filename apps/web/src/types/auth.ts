export type AppUserRole = "CUSTOMER" | "ADMIN" | "VETERINARIAN" | "EVENT_ORGANIZER" | "TRAINER" | "SELLER";

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  role?: AppUserRole;
  email?: string;
  clinicName?: string;
  organizerName?: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export type AuthModalStep = "PHONE_ENTRY" | "OTP_VERIFY" | "SUCCESS";
