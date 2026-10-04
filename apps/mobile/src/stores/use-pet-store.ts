import { create } from "zustand";

export interface MobilePet {
  id: string;
  name: string;
  species: "DOG" | "CAT";
  breed: string;
  birthDate: string;
  weightKg: number;
  qrCodeUrl?: string;
}

export interface MobileCareTask {
  id: string;
  title: string;
  time: string;
  category: "FOOD" | "MED" | "WALK" | "HYGIENE";
  completed: boolean;
}

interface PetState {
  pets: MobilePet[];
  activePetId: string;
  careTasks: MobileCareTask[];
  selectPet: (id: string) => void;
  toggleCareTask: (id: string) => void;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [
    {
      id: "pet-milo",
      name: "مایلو",
      species: "DOG",
      breed: "گلدن رتریور",
      birthDate: "۱۴۰۱/۰۴/۱۰",
      weightKg: 28.5,
      qrCodeUrl: "https://bonyo.ir/qr/pet-milo",
    },
    {
      id: "pet-luna",
      name: "لونا",
      species: "CAT",
      breed: "بریتیش شورت‌هیر",
      birthDate: "۱۴۰۲/۰۱/۱۵",
      weightKg: 4.2,
      qrCodeUrl: "https://bonyo.ir/qr/pet-luna",
    },
  ],
  activePetId: "pet-milo",
  careTasks: [
    {
      id: "task-1",
      title: "غذای خشک صبحگاهی (۸۰ گرم)",
      time: "۰۸:۳۰",
      category: "FOOD",
      completed: true,
    },
    {
      id: "task-2",
      title: "پیاده‌روی صبحگاهی و تخلیه انرژی",
      time: "۰۹:۱۵",
      category: "WALK",
      completed: true,
    },
    {
      id: "task-3",
      title: "قطره مکمل مفاصل و امگا۳",
      time: "۱۴:۰۰",
      category: "MED",
      completed: false,
    },
    {
      id: "task-4",
      title: "برس‌کشی موها و چکاپ گوش",
      time: "۱۹:۳۰",
      category: "HYGIENE",
      completed: false,
    },
    {
      id: "task-5",
      title: "کنسرو شبانه با مکمل فیبر",
      time: "۲۱:۰۰",
      category: "FOOD",
      completed: false,
    },
  ],

  selectPet: (id) => set({ activePetId: id }),

  toggleCareTask: (id) =>
    set((state) => ({
      careTasks: state.careTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
}));
