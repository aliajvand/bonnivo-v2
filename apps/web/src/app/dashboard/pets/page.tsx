"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  QrCode,
  ShieldCheck,
  Heart,
  Calendar,
  Scale,
  Scissors,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertCircle,
  Activity,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { MultiPetSwitcher } from "@/components/pet/multi-pet-switcher";
import { PetOnboardingWizard } from "@/components/pet/pet-onboarding-wizard";
import { Pet } from "@/types/pet";

export default function PetsHubPage() {
  const { pets, activePet, setIsWizardOpen, updatePet, deletePet } = usePet();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form fields for editing
  const [editFormData, setEditFormData] = useState<Partial<Pet>>({});

  const handleOpenEdit = () => {
    if (!activePet) return;
    setEditFormData({
      name: activePet.name,
      breed: activePet.breed,
      weightKg: activePet.weightKg || undefined,
      dailyFoodGrams: activePet.dailyFoodGrams || undefined,
      dietaryPreferences: activePet.dietaryPreferences || "",
      allergies: activePet.allergies || "",
      isNeutered: activePet.isNeutered,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePet) return;
    updatePet(activePet.id, editFormData);
    setIsEditModalOpen(false);
  };

  const handleDeleteActivePet = () => {
    if (!activePet) return;
    deletePet(activePet.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
      {/* 1. Header & Switcher */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-border/70">
        <MultiPetSwitcher />
      </div>

      {/* 2. Active Pet Detailed Profile Card */}
      {activePet ? (
        <div className="space-y-6">
          <div className="glass-card rounded-4xl p-6 sm:p-10 border border-primary/20 relative overflow-hidden shadow-glass">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/50">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center p-3 shrink-0 shadow-xs">
                  <Image
                    src={activePet.avatarUrl}
                    alt={activePet.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                      {activePet.name}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      شناسنامه فعال ✓
                    </span>
                    {activePet.isLost && (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold animate-pulse">
                        هشدار مفقودی فعال
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-muted mt-1">
                    نژاد {activePet.breed} • جنسیت: {activePet.sex === "MALE" ? "نر" : "ماده"} • وضعیت عقیم‌سازی:{" "}
                    {activePet.isNeutered ? "عقیم شده" : "عقیم نشده"}
                  </p>
                </div>
              </div>

              {/* Actions & QR Passport Fast Access */}
              <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleOpenEdit}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground text-xs sm:text-sm font-bold border border-border transition-all"
                >
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span>ویرایش مشخصات</span>
                </button>

                <Link
                  href="/dashboard/passport"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs sm:text-sm font-bold border border-primary/20 transition-all"
                >
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>پاسپورت هوشمند QR</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50">
                <span className="text-[11px] text-muted block mb-1">سن پت</span>
                <span className="text-base sm:text-lg font-black text-foreground">
                  {activePet.estimatedAgeMonths
                    ? `${Math.floor(activePet.estimatedAgeMonths / 12)} سال و ${activePet.estimatedAgeMonths % 12} ماه`
                    : "ثبت نشده"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50">
                <span className="text-[11px] text-muted block mb-1">وزن فعلی</span>
                <span className="text-base sm:text-lg font-black text-foreground">
                  {activePet.weightKg ? `${activePet.weightKg} کیلوگرم` : "ثبت نشده"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50">
                <span className="text-[11px] text-muted block mb-1">مصرف روزانه غذا</span>
                <span className="text-base sm:text-lg font-black text-primary">
                  {activePet.dailyFoodGrams ? `${activePet.dailyFoodGrams} گرم / روز` : "ثبت نشده"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50">
                <span className="text-[11px] text-muted block mb-1">وضعیت سلامت</span>
                <span className="text-base sm:text-lg font-black text-emerald-600">عالی و منظم</span>
              </div>
            </div>

            {/* Dietary & Allergies Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePet.dietaryPreferences && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950">
                  <span className="font-bold block mb-0.5">یادداشت غذایی و رژیم:</span>
                  <span>{activePet.dietaryPreferences}</span>
                </div>
              )}
              {activePet.allergies && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-xs text-rose-950">
                  <span className="font-bold block mb-0.5">حساسیت‌ها و آلرژی دارویی/غذایی:</span>
                  <span>{activePet.allergies}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Health & Weight Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Management Widget */}
            <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">مدیریت و پایش وزن</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  محدوده نرمال
                </span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                وزن متناسب با نژاد {activePet.breed} بین {activePet.weightKg ? (activePet.weightKg * 0.9).toFixed(1) : 4} تا{" "}
                {activePet.weightKg ? (activePet.weightKg * 1.1).toFixed(1) : 6} کیلوگرم توصیه می‌شود.
              </p>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted block">آخرین وزن ثبت‌شده</span>
                  <span className="text-lg font-black text-foreground">
                    {activePet.weightKg ? `${activePet.weightKg} کیلوگرم` : "در انتظار ثبت"}
                  </span>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                >
                  به‌روزرسانی وزن
                </button>
              </div>
            </div>

            {/* Health Milestones Card */}
            <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">رویدادهای پزشکی و واکسیناسیون</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  پرونده سلامت الکترونیک
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-foreground">واکسن هاری (Rabies)</span>
                  </div>
                  <span className="text-muted text-[11px]">تزریق شده • معتبر تا ۱۴۰۵</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-foreground">قرص ضدانگل دوره‌ای</span>
                  </div>
                  <span className="text-muted text-[11px]">مصرف شده • نوبت بعدی ۲ ماه دیگر</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-foreground">چکاپ سالیانه دندان‌پزشکی</span>
                  </div>
                  <span className="text-amber-800 font-bold text-[11px]">در نوبت ویزیت</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Danger Zone (Delete Pet Profile) */}
          <div className="p-5 rounded-3xl bg-rose-50/50 border border-rose-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-rose-950">حذف یا واگذاری پرونده {activePet.name}</h3>
              <p className="text-xs text-rose-800/80 mt-0.5">
                با حذف پرونده، تمامی اطلاعات مراقبتی، روتین‌های روزانه و پاسپورت این پت از سیستم حذف خواهد شد.
              </p>
            </div>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف پرونده</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-4xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-foreground">هیچ پتی در حساب شما ثبت نشده است</h2>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            برای بهره‌مندی از خدمات اختصاصی، سبد خرید متصل به پت و قلاده هوشمند، اولین پت خود را اضافه کنید.
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت اولین پت من</span>
          </button>
        </div>
      )}

      {/* Edit Pet Modal */}
      {isEditModalOpen && activePet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-4xl max-w-lg w-full p-6 sm:p-8 border border-border/80 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black text-foreground">ویرایش اطلاعات {activePet.name}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">نام پت</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">نژاد</label>
                  <input
                    type="text"
                    required
                    value={editFormData.breed || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">وزن فعلی (کیلوگرم)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editFormData.weightKg || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, weightKg: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">مصرف روزانه غذا (گرم)</label>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    value={editFormData.dailyFoodGrams || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dailyFoodGrams: parseInt(e.target.value, 10) || undefined })
                    }
                    className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">ترجیحات غذایی یا برند مورد علاقه</label>
                <input
                  type="text"
                  value={editFormData.dietaryPreferences || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, dietaryPreferences: e.target.value })}
                  placeholder="مثال: غذای خشک هیلز با مرغ، بدون گندم"
                  className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">حساسیت‌ها و آلرژی‌ها</label>
                <input
                  type="text"
                  value={editFormData.allergies || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                  placeholder="مثال: حساسیت به گوشت گاو یا پروتئین شیر"
                  className="w-full h-11 px-3.5 rounded-2xl bg-surface-subtle border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="neuteredCheck"
                  checked={editFormData.isNeutered || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isNeutered: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
                />
                <label htmlFor="neuteredCheck" className="text-xs font-bold text-foreground cursor-pointer">
                  این حیوان عقیم شده است (Neutered / Spayed)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && activePet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-4xl max-w-md w-full p-6 sm:p-8 border border-rose-200 shadow-2xl relative space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-foreground">حذف پرونده {activePet.name}؟</h3>
              <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                آیا از حذف پرونده این پت اطمینان دارید؟ اطلاعات روتین‌های روزانه، سوابق وزن و دسترسی‌های QR پاک خواهند شد.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-5 py-2.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold transition-colors"
              >
                انصراف و بازگشت
              </button>
              <button
                onClick={handleDeleteActivePet}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all"
              >
                بله، پرونده حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      <PetOnboardingWizard />
    </div>
  );
}
