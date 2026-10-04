import { create } from "zustand";

export type MobileUserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "VETERINARIAN"
  | "EVENT_ORGANIZER"
  | "TRAINER";

interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  roles: MobileUserRole[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  currentRole: MobileUserRole;
  token: string | null;
  switchRole: (role: MobileUserRole) => void;
  login: (phone: string, token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: {
    id: "u-qa-customer",
    fullName: "سارا محمدی",
    phone: "09121234567",
    roles: ["CUSTOMER", "ADMIN", "VETERINARIAN", "EVENT_ORGANIZER", "TRAINER"],
  },
  currentRole: "CUSTOMER",
  token: "dev-mock-jwt-mobile",

  switchRole: (role) => set({ currentRole: role }),

  login: (phone, token, user) =>
    set({
      isAuthenticated: true,
      token,
      user,
      currentRole: user.roles[0] || "CUSTOMER",
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      currentRole: "CUSTOMER",
    }),
}));
