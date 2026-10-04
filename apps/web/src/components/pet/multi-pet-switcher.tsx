"use client";

import Image from "next/image";
import { Plus, Check, Heart, Sparkles } from "lucide-react";
import { usePet } from "@/context/pet-context";
import { cn } from "@/lib/utils";

export function MultiPetSwitcher() {
  const { pets, activePetId, setActivePetId, setIsWizardOpen } = usePet();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-foreground">پت‌های من</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {pets.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن پت جدید</span>
        </button>
      </div>

      {/* Horizontal Scroll of Pet Cards matching reference image */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1">
        {pets.map((pet) => {
          const isActive = pet.id === activePetId;
          const ageText = pet.estimatedAgeMonths
            ? `${Math.floor(pet.estimatedAgeMonths / 12)} سال`
            : "سن نامشخص";

          return (
            <button
              key={pet.id}
              onClick={() => setActivePetId(pet.id)}
              className={cn(
                "group shrink-0 flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl border transition-all duration-200 text-start select-none",
                isActive
                  ? "bg-white border-primary shadow-glass ring-2 ring-primary/20 scale-[1.02]"
                  : "bg-surface-subtle/70 hover:bg-white border-border/70 hover:border-border hover:shadow-xs"
              )}
            >
              {/* Pet Avatar with Species Icon */}
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center p-2 border transition-transform duration-200 group-hover:scale-105",
                  pet.species === "DOG" && "bg-amber-50 border-amber-200/60",
                  pet.species === "CAT" && "bg-purple-50 border-purple-200/60",
                  pet.species === "BIRD" && "bg-sky-50 border-sky-200/60",
                  pet.species === "SMALL_PET" && "bg-emerald-50 border-emerald-200/60"
                )}>
                  <Image
                    src={pet.avatarUrl}
                    alt={pet.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>

                {isActive && (
                  <span className="absolute -top-1 -start-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Pet Info */}
              <div className="flex flex-col pe-1">
                <span className={cn(
                  "text-xs sm:text-sm font-bold transition-colors line-clamp-1",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {pet.name}
                </span>
                <span className="text-[11px] text-muted line-clamp-1 mt-0.5">
                  {pet.breed} • {ageText}
                </span>
              </div>
            </button>
          );
        })}

        {/* Add Pet Pill Button */}
        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="shrink-0 flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/50 text-muted hover:text-primary transition-all duration-200 bg-transparent hover:bg-primary/5 select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center text-muted group-hover:text-primary">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap pe-1">
            ثبت پت جدید
          </span>
        </button>
      </div>
    </div>
  );
}
