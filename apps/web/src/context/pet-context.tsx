"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Pet, CareTask, PetSpecies } from "@/types/pet";
import { initialMockPets, initialMockCareTasks } from "@/data/mock-pets";

interface PetContextType {
  pets: Pet[];
  activePet: Pet | null;
  currentPet: Pet | null;
  activePetId: string | null;
  setActivePetId: (id: string) => void;
  selectPet: (id: string) => void;
  addPet: (newPetData: Omit<Pet, "id" | "qrPassportToken" | "createdAt" | "isLost">) => Pet;
  updatePet: (petId: string, updatedFields: Partial<Pet>) => void;
  deletePet: (petId: string) => void;
  tasks: CareTask[];
  activePetTasks: CareTask[];
  toggleTaskCompletion: (taskId: string) => void;
  addTask: (taskData: Omit<CareTask, "id">) => void;
  deleteTask: (taskId: string) => boolean;
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  dailyProgressPercentage: number;
  walkProgressMinutes: { completed: number; target: number };
  toggleLostStatus: (petId: string, alertMessage?: string) => void;
  getPetByQrToken: (token: string) => Pet | undefined;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(initialMockPets);
  const [activePetId, setActivePetId] = useState<string | null>("pet-milo");
  const [tasks, setTasks] = useState<CareTask[]>(initialMockCareTasks);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Active pet reference
  const activePet = useMemo(() => {
    if (!pets.length) return null;
    return pets.find((p) => p.id === activePetId) || pets[0];
  }, [pets, activePetId]);

  // Tasks belonging to the active pet
  const activePetTasks = useMemo(() => {
    if (!activePet) return [];
    return tasks.filter((t) => t.petId === activePet.id);
  }, [tasks, activePet]);

  // Daily progress calculation
  const dailyProgressPercentage = useMemo(() => {
    if (!activePetTasks.length) return 0;
    const completedCount = activePetTasks.filter((t) => t.isCompleted).length;
    return Math.round((completedCount / activePetTasks.length) * 100);
  }, [activePetTasks]);

  // Walk progress (for dogs specifically)
  const walkProgressMinutes = useMemo(() => {
    const walkTasks = activePetTasks.filter((t) => t.category === "WALK" && t.targetMetric === "MINUTES");
    const target = walkTasks.reduce((acc, t) => acc + (t.targetValue || 30), 0);
    const completed = walkTasks.reduce((acc, t) => acc + (t.isCompleted ? (t.targetValue || 30) : 0), 0);
    return { completed, target: target || 45 };
  }, [activePetTasks]);

  // Toggle task completion with optimistic update
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const willBeCompleted = !task.isCompleted;
          return {
            ...task,
            isCompleted: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined,
            currentValue: willBeCompleted ? task.targetValue : 0,
          };
        }
        return task;
      })
    );
  };

  // Add custom care task
  const addTask = (taskData: Omit<CareTask, "id">) => {
    const newTask: CareTask = {
      ...taskData,
      id: `task-custom-${Date.now()}`,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Delete task if not locked by provider
  const deleteTask = (taskId: string): boolean => {
    const target = tasks.find((t) => t.id === taskId);
    if (target?.isLocked) {
      return false; // cannot delete locked provider task
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    return true;
  };

  // Add a new pet and generate default species tasks
  const addPet = (newPetData: Omit<Pet, "id" | "qrPassportToken" | "createdAt" | "isLost">): Pet => {
    const newId = `pet-${Date.now()}`;
    const token = `bny_qr_${Math.random().toString(36).substring(2, 8)}`;
    
    // Choose appropriate avatar from local public SVGs
    let defaultAvatar = "/icons/dog.svg";
    if (newPetData.species === "CAT") defaultAvatar = "/icons/cat.svg";
    if (newPetData.species === "BIRD") defaultAvatar = "/icons/birds.svg";
    if (newPetData.species === "SMALL_PET") defaultAvatar = "/icons/small-pets.svg";

    const createdPet: Pet = {
      ...newPetData,
      id: newId,
      avatarUrl: newPetData.avatarUrl || defaultAvatar,
      qrPassportToken: token,
      isLost: false,
      createdAt: new Date().toISOString(),
    };

    setPets((prev) => [...prev, createdPet]);
    setActivePetId(newId);

    // Generate initial species-tailored routine tasks
    const newTasks: CareTask[] = generateDefaultTasksForSpecies(newId, newPetData.species, newPetData.name);
    setTasks((prev) => [...prev, ...newTasks]);

    return createdPet;
  };

  // Update pet details
  const updatePet = (petId: string, updatedFields: Partial<Pet>) => {
    setPets((prev) =>
      prev.map((pet) => (pet.id === petId ? { ...pet, ...updatedFields } : pet))
    );
  };

  // Delete pet safely
  const deletePet = (petId: string) => {
    setPets((prev) => {
      const remaining = prev.filter((p) => p.id !== petId);
      if (activePetId === petId) {
        setActivePetId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
    setTasks((prev) => prev.filter((t) => t.petId !== petId));
  };

  // Toggle Lost Pet status with custom alert message
  const toggleLostStatus = (petId: string, alertMessage?: string) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id === petId) {
          const newLostState = !pet.isLost;
          return {
            ...pet,
            isLost: newLostState,
            lostAlertMessage: newLostState
              ? alertMessage || `این حیوان دوست‌داشتنی گم شده است. لطفاً در صورت مشاهده سریعاً با سرپرست تماس بگیرید.`
              : undefined,
          };
        }
        return pet;
      })
    );
  };

  // Find pet by QR passport token
  const getPetByQrToken = (token: string) => {
    return pets.find((p) => p.qrPassportToken === token);
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        activePet,
        currentPet: activePet,
        activePetId,
        setActivePetId,
        selectPet: setActivePetId,
        addPet,
        updatePet,
        deletePet,
        tasks,
        activePetTasks,
        toggleTaskCompletion,
        addTask,
        deleteTask,
        isWizardOpen,
        setIsWizardOpen,
        dailyProgressPercentage,
        walkProgressMinutes,
        toggleLostStatus,
        getPetByQrToken,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePet must be used within a PetProvider");
  }
  return context;
}

// Helper to generate species-tailored routine tasks
function generateDefaultTasksForSpecies(petId: string, species: PetSpecies, petName: string): CareTask[] {
  if (species === "DOG") {
    return [
      {
        id: `task-${petId}-walk`,
        petId,
        title: `پیاده‌روی روزانه ${petName}`,
        species: "DOG",
        category: "WALK",
        targetMetric: "MINUTES",
        targetValue: 40,
        currentValue: 0,
        scheduledTime: "۰۸:۳۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-food`,
        petId,
        title: `وعده غذای اصلی ${petName}`,
        species: "DOG",
        category: "FOOD",
        targetMetric: "GRAMS",
        targetValue: 250,
        currentValue: 0,
        scheduledTime: "۱۹:۰۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-water`,
        petId,
        title: "بررسی و تعویض آب تازه",
        species: "DOG",
        category: "WATER",
        scheduledTime: "۱۲:۰۰",
        isCompleted: false,
      },
    ];
  }

  if (species === "CAT") {
    return [
      {
        id: `task-${petId}-litter`,
        petId,
        title: "بررسی و تمیز کردن خاک گربه",
        species: "CAT",
        category: "HYGIENE",
        scheduledTime: "۰۹:۰۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-food`,
        petId,
        title: `وعده غذای مرطوب ${petName}`,
        species: "CAT",
        category: "FOOD",
        targetMetric: "GRAMS",
        targetValue: 85,
        currentValue: 0,
        scheduledTime: "۱۳:۳۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-play`,
        petId,
        title: `بازی و تحرک روزانه ${petName}`,
        species: "CAT",
        category: "WALK",
        targetMetric: "MINUTES",
        targetValue: 20,
        currentValue: 0,
        scheduledTime: "۲۱:۰۰",
        isCompleted: false,
      },
    ];
  }

  if (species === "BIRD") {
    return [
      {
        id: `task-${petId}-clean`,
        petId,
        title: "نظافت سینی کف قفس",
        species: "BIRD",
        category: "HYGIENE",
        scheduledTime: "۱۰:۰۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-seed`,
        petId,
        title: "شارژ دانه تازه و آب‌خوری",
        species: "BIRD",
        category: "FOOD",
        scheduledTime: "۰۸:۰۰",
        isCompleted: false,
      },
      {
        id: `task-${petId}-treat`,
        petId,
        title: "تکه میوه تازه (سیب یا هویج)",
        species: "BIRD",
        category: "FOOD",
        scheduledTime: "۱۶:۰۰",
        isCompleted: false,
      },
    ];
  }

  // Small pets (Hamster, Rabbit, etc.)
  return [
    {
      id: `task-${petId}-hay`,
      petId,
      title: "شارژ یونجه تازه و پلت",
      species: "SMALL_PET",
      category: "FOOD",
      scheduledTime: "۰۹:۰۰",
      isCompleted: false,
    },
    {
      id: `task-${petId}-water`,
      petId,
      title: "بررسی سر ساچمه‌ای آبخوری",
      species: "SMALL_PET",
      category: "WATER",
      scheduledTime: "۱۱:۰۰",
      isCompleted: false,
    },
    {
      id: `task-${petId}-bedding`,
      petId,
      title: "بررسی خشکی پوشال و بستر",
      species: "SMALL_PET",
      category: "HYGIENE",
      scheduledTime: "۱۸:۰۰",
      isCompleted: false,
    },
  ];
}
