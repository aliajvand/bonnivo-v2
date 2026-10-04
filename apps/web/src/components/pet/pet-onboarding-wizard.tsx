"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Check, ArrowLeft, ArrowRight, Sparkles, Upload, ShieldCheck, Heart } from "lucide-react";
import { usePet } from "@/context/pet-context";
import { PetSpecies, PetSex } from "@/types/pet";
import { cn } from "@/lib/utils";

interface SpeciesOption {
  species: PetSpecies;
  titleFa: string;
  subtitleFa: string;
  iconSrc: string;
  bgColor: string;
}

const speciesOptions: SpeciesOption[] = [
  {
    species: "DOG",
    titleFa: "سگ",
    subtitleFa: "نژادهای بزرگ، متوسط و کوچک",
    iconSrc: "/icons/dog.svg",
    bgColor: "bg-amber-50 text-amber-900 border-amber-200/80",
  },
  {
    species: "CAT",
    titleFa: "گربه",
    subtitleFa: "خانگی، حمایتی و نژاددار",
    iconSrc: "/icons/cat.svg",
    bgColor: "bg-purple-50 text-purple-900 border-purple-200/80",
  },
  {
    species: "BIRD",
    titleFa: "پرنده",
    subtitleFa: "طوطی‌سانان، قناری و سایر",
    iconSrc: "/icons/birds.svg",
    bgColor: "bg-sky-50 text-sky-900 border-sky-200/80",
  },
  {
    species: "SMALL_PET",
    titleFa: "حیوان کوچک",
    subtitleFa: "خرگوش، همستر و خوکچه هندی",
    iconSrc: "/icons/small-pets.svg",
    bgColor: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
  },
];

export function PetOnboardingWizard() {
  const { isWizardOpen, setIsWizardOpen, addPet } = usePet();

  // Wizard Step (1: Species, 2: Basic Info, 3: Diet & Health)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [species, setSpecies] = useState<PetSpecies>("DOG");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<PetSex>("MALE");
  const [estimatedAgeMonths, setEstimatedAgeMonths] = useState<number>(12);
  const [weightKg, setWeightKg] = useState<number>(10);
  const [isNeutered, setIsNeutered] = useState<boolean>(true);
  const [dailyFoodGrams, setDailyFoodGrams] = useState<number>(250);
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [allergies, setAllergies] = useState("");

  if (!isWizardOpen) return null;

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!name.trim()) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save and Complete
      addPet({
        name: name.trim(),
        species,
        breed: breed.trim() || (species === "DOG" ? "میکس / نامشخص" : "خانگی"),
        sex,
        estimatedAgeMonths,
        weightKg,
        isNeutered,
        avatarUrl: `/icons/${species === "DOG" ? "dog" : species === "CAT" ? "cat" : species === "BIRD" ? "birds" : "small-pets"}.svg`,
        dailyFoodGrams,
        dietaryPreferences,
        allergies,
      });

      setIsWizardOpen(false);
      resetForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setBreed("");
    setSex("MALE");
    setEstimatedAgeMonths(12);
    setWeightKg(10);
    setIsNeutered(true);
    setDailyFoodGrams(250);
    setDietaryPreferences("");
    setAllergies("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg glass-card rounded-3xl md:rounded-4xl p-6 sm:p-8 border border-white/80 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        dir="rtl"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                شناسنامه و پرونده پت جدید
              </h2>
              <span className="text-[11px] text-muted">
                مرحله {currentStep} از ۳ • شخصی‌سازی برنامه مراقبت و خرید
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsWizardOpen(false);
              resetForm();
            }}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-black/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2 my-5">
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", currentStep >= 1 ? "bg-primary" : "bg-border")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", currentStep >= 2 ? "bg-primary" : "bg-border")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", currentStep >= 3 ? "bg-primary" : "bg-border")} />
        </div>

        {/* Step 1: Species Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-start-2 duration-200">
            <div className="text-center sm:text-start">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                پت دوست‌داشتنی شما از چه گونه‌ای است؟
              </h3>
              <p className="text-xs text-muted mt-0.5">
                برنامه وظایف روزانه و تغذیه دقیقاً بر اساس گونه تنظیم خواهد شد.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {speciesOptions.map((opt) => {
                const isSelected = species === opt.species;
                return (
                  <button
                    key={opt.species}
                    type="button"
                    onClick={() => setSpecies(opt.species)}
                    className={cn(
                      "group p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-200 select-none",
                      isSelected
                        ? "bg-white border-primary shadow-glass ring-2 ring-primary/25 scale-[1.02]"
                        : "bg-surface-subtle hover:bg-white border-border/80 hover:border-border"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center p-3 border mb-2.5 transition-transform duration-200 group-hover:scale-110",
                      opt.bgColor
                    )}>
                      <Image
                        src={opt.iconSrc}
                        alt={opt.titleFa}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      {opt.titleFa}
                    </span>
                    <span className="text-[10px] text-muted mt-0.5">
                      {opt.subtitleFa}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Basic Identity Information */}
        {currentStep === 2 && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-start-2 duration-200">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                نام پت *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: میلو، تدی، فندق، لونا..."
                className="w-full bg-surface-subtle focus:bg-white text-sm text-foreground rounded-2xl px-4 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  نژاد
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="مثلاً: گلدن رتریور، DSH..."
                  className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-2xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  جنسیت
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-subtle rounded-2xl border border-border/80">
                  <button
                    type="button"
                    onClick={() => setSex("MALE")}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl transition-all",
                      sex === "MALE" ? "bg-white text-primary shadow-xs" : "text-muted hover:text-foreground"
                    )}
                  >
                    نر
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex("FEMALE")}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-xl transition-all",
                      sex === "FEMALE" ? "bg-white text-primary shadow-xs" : "text-muted hover:text-foreground"
                    )}
                  >
                    ماده
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  سن تخمینی (ماه)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={estimatedAgeMonths}
                  onChange={(e) => setEstimatedAgeMonths(Number(e.target.value))}
                  className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-2xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  وزن کنونی (کیلوگرم)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="120"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-2xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Neutered / Spayed Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-border/60">
              <span className="text-xs font-medium text-foreground">
                وضعیت عقیم‌سازی
              </span>
              <button
                type="button"
                onClick={() => setIsNeutered(!isNeutered)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all",
                  isNeutered
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200 text-stone-700"
                )}
              >
                {isNeutered ? "عقیم شده است ✓" : "عقیم نشده است"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Nutrition & Care Foundation */}
        {currentStep === 3 && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-start-2 duration-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-foreground">
                  مصرف روزانه غذا (گرم)
                </label>
                <span className="text-[10px] text-terracotta font-medium">
                  پایه تخمین پیامک اتمام غذا
                </span>
              </div>
              <input
                type="number"
                step="5"
                min="10"
                max="2000"
                value={dailyFoodGrams}
                onChange={(e) => setDailyFoodGrams(Number(e.target.value))}
                placeholder="مثلاً ۳۰۰ گرم در روز"
                className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-2xl px-3.5 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[10px] text-muted mt-1">
                بر اساس این مقدار، ۷ روز قبل از تمام شدن کیسه غذای خریداری‌شده، پیامک یادآور ارسال می‌شود.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                ترجیحات غذایی یا حساسیت‌ها (اختیاری)
              </label>
              <textarea
                rows={2}
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                placeholder="مثلاً: فقط مرغ و برنج بدون غلات، حساس به گوشت قرمز..."
                className="w-full bg-surface-subtle focus:bg-white text-xs text-foreground rounded-2xl px-3.5 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Health Book Upload Teaser */}
            <div className="p-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  آپلود عکس صفحه اول شناسنامه / دفترچه سلامت
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  جهت آرشیو و یادآوری دوره‌ای واکسیناسیون (اختیاری)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
          {/* Skip / Dismiss Button */}
          <button
            type="button"
            onClick={() => {
              setIsWizardOpen(false);
              resetForm();
            }}
            className="text-xs text-muted hover:text-foreground font-medium transition-colors px-2 py-2"
          >
            رد شدن و رفتن به فروشگاه
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold transition-all flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>مرحله قبل</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 2 && !name.trim()}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>{currentStep === 3 ? "تکمیل و ساخت شناسنامه ✓" : "مرحله بعد"}</span>
              {currentStep < 3 && <ArrowLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
