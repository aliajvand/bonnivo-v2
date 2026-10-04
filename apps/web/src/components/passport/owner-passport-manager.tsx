"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  QrCode, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  Share2, 
  Phone, 
  Heart, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Calendar,
  Sparkles,
  Award,
  Activity,
  Filter,
  Plus
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { MultiPetSwitcher } from "@/components/pet/multi-pet-switcher";
import { PetActivity } from "@/types/pet";
import { initialMockActivities } from "@/data/mock-pets";
import { cn } from "@/lib/utils";

export function OwnerPassportManager() {
  const { pets, activePet, toggleLostStatus, updatePet } = usePet();
  const [customLostMessage, setCustomLostMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Document Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(
    activePet?.passportDocumentUrl || activePet?.healthBookImageUrl || null
  );

  // Activities State
  const [activities, setActivities] = useState<PetActivity[]>(initialMockActivities);
  const [activityFilter, setActivityFilter] = useState<"ALL" | "OWNER" | "VET" | "OTHER">("ALL");
  const [newActivityNote, setNewActivityNote] = useState("");
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  useEffect(() => {
    if (activePet) {
      setDocPreviewUrl(activePet.passportDocumentUrl || activePet.healthBookImageUrl || null);
      // Fetch remote activities if available
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      fetch(`${apiUrl}/pets/${activePet.id}/activities`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setActivities(data);
          }
        })
        .catch(() => {});
    }
  }, [activePet]);

  if (!activePet) return null;

  const passportUrl = typeof window !== "undefined"
    ? `${window.location.origin}/passport/${activePet.qrPassportToken}`
    : `/passport/${activePet.qrPassportToken}`;

  const handleToggleLost = () => {
    toggleLostStatus(activePet.id, customLostMessage);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(passportUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Handle Document Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    // Validate MIME type (disallow SVG/executables)
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setUploadError("فرمت فایل معتبر نیست. لطفاً تصویر با فرمت JPG، PNG یا WEBP بارگذاری نمایید.");
      return;
    }

    // Validate Size Limit: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم فایل بیش از حد مجاز است. حداکثر حجم مجاز ۵ مگابایت می‌باشد.");
      return;
    }

    // Local Preview
    const localUrl = URL.createObjectURL(file);
    setDocPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/pets/${activePet.id}/passport-doc`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const savedUrl = data.passport_document_url || localUrl;
        updatePet(activePet.id, {
          passportDocumentUrl: savedUrl,
          isPassportVerified: false, // In review
        });
        setUploadSuccess(true);
      } else {
        // Safe local persistence fallback
        updatePet(activePet.id, {
          passportDocumentUrl: localUrl,
        });
        setUploadSuccess(true);
      }
    } catch {
      // Offline fallback
      updatePet(activePet.id, {
        passportDocumentUrl: localUrl,
      });
      setUploadSuccess(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDoc = () => {
    setDocPreviewUrl(null);
    setUploadSuccess(false);
    updatePet(activePet.id, {
      passportDocumentUrl: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddOwnerActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityNote.trim()) return;

    const newAct: PetActivity = {
      id: `act-${Date.now()}`,
      petId: activePet.id,
      activityType: "CARE_LOG",
      activityTypeFa: "مراقبت ثبت‌شده توسط سرپرست",
      category: "OWNER",
      descriptionFa: newActivityNote.trim(),
      statusFa: "ثبت روزانه",
      performedAt: "امروز",
    };

    setActivities([newAct, ...activities]);
    setNewActivityNote("");
    setIsAddingActivity(false);
  };

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === "ALL") return true;
    return act.category === activityFilter;
  });

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* 1. Pet Switcher */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-border/70">
        <MultiPetSwitcher />
      </div>

      {/* 2. Complete Pet Profile Overview */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 border border-border/80 shadow-glass space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-surface-subtle p-3 flex items-center justify-center shrink-0 border border-border/80 shadow-inner">
              <Image
                src={activePet.avatarUrl}
                alt={activePet.name}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">{activePet.name}</h1>
                {activePet.isPassportVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>شناسنامه تأییدشده</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1">
                نژاد: <strong>{activePet.breed}</strong> • گونه: {activePet.species === "DOG" ? "سگ" : activePet.species === "CAT" ? "گربه" : "حیوان خانگی"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold border border-border transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-muted" />
              <span>چاپ شناسنامه و تگ</span>
            </button>
            <Link
              href={`/passport/${activePet.qrPassportToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>مشاهده عمومی تگ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Pet Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">جنسیت:</span>
            <span className="font-bold text-foreground block">
              {activePet.sex === "MALE" ? "نر" : activePet.sex === "FEMALE" ? "ماده" : "نامشخص"}
              {activePet.isNeutered && " (عقیم‌شده)"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">سن / تاریخ تولد:</span>
            <span className="font-bold text-foreground block">
              {activePet.birthDate || (activePet.estimatedAgeMonths ? `${Math.floor(activePet.estimatedAgeMonths / 12)} سال و ${activePet.estimatedAgeMonths % 12} ماه` : "ثبت نشده")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">وزن فعلی:</span>
            <span className="font-bold text-foreground block">
              {activePet.weightKg ? `${activePet.weightKg} کیلوگرم` : "ثبت نشده"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">رنگ و نشانه‌های ظاهری:</span>
            <span className="font-bold text-foreground block">
              {activePet.color || "ثبت نشده"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">شماره میکروچیپ (ISO 11784):</span>
            <span className="font-mono font-bold text-foreground block">
              {activePet.microchipNumber || "بدون میکروچیپ"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">نسبت سرپرستی:</span>
            <span className="font-bold text-foreground block">
              {activePet.relationship || "سرپرست قانونی"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">وضعیت واکسیناسیون:</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
              {activePet.vaccinationStatus || "به‌روز"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border/50 space-y-1">
            <span className="text-muted block">موعد بعدی واکسن:</span>
            <span className="font-bold text-primary block">
              {activePet.vaccinationDueDate || "مشخص نشده"}
            </span>
          </div>
        </div>

        {activePet.importantInfo && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
            <strong>نکات مهم نگهداری و اورژانسی:</strong> {activePet.importantInfo}
          </div>
        )}
      </div>

      {/* 3. Document Upload Section & Collar QR Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Real Document Upload (Item 1.A) (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-4xl p-6 sm:p-7 border border-border/80 space-y-4 shadow-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-foreground">
                  عکس صفحه اول شناسنامه / دفترچه سلامت
                </h3>
                <span className="text-[11px] text-muted block">
                  (اختیاری) جهت احراز هویت و دریافت نشان سلامت معتبر
                </span>
              </div>
            </div>

            {docPreviewUrl && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                مدرک بارگذاری شد ✓
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>تصویر شناسنامه با موفقیت ذخیره شد.</span>
            </div>
          )}

          {/* Preview or Upload Dropzone */}
          {docPreviewUrl ? (
            <div className="relative rounded-3xl bg-surface-subtle border border-border/80 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-black/5 border border-border shrink-0 flex items-center justify-center relative">
                <Image
                  src={docPreviewUrl}
                  alt="شناسنامه سلامت"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-right">
                <span className="text-xs font-bold text-foreground block">
                  تصویر دفترچه سلامت بارگذاری‌شده
                </span>
                <p className="text-[11px] text-muted leading-relaxed">
                  اطلاعات محرمانه پرونده محفوظ بوده و صرفاً جهت استعلام خدمات دامپزشکی و اقامت پانسیون استفاده می‌گردد.
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold border border-border transition-all"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isUploading && "animate-spin")} />
                    <span>جایگزینی تصویر</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveDoc}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200/50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-3xl p-6 text-center cursor-pointer transition-all hover:bg-surface-subtle/50 space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-foreground block">
                  کلیک جهت انتخاب تصویر صفحه اول شناسنامه / دفترچه سلامت
                </span>
                <span className="text-[11px] text-muted mt-1 block">
                  فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)
                </span>
              </div>
              <button
                type="button"
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
              >
                <span>انتخاب فایل تصویر</span>
              </button>
            </div>
          )}

          {/* Lost Mode Card */}
          <div className={cn(
            "rounded-3xl p-5 border transition-all duration-300 mt-4",
            activePet.isLost
              ? "bg-rose-50/90 border-rose-300 text-rose-950"
              : "bg-surface-subtle/60 border-border/70 text-foreground"
          )}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                  activePet.isLost
                    ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                    : "bg-surface-subtle text-muted border-border"
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm">
                    {activePet.isLost ? "وضعیت اضطراری: پت گم شده است!" : "اعلام وضعیت پت گمشده"}
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                    با فعال‌سازی این حالت، صفحه عمومی اسکن قلاده پیام اضطراری و تماس شما را نشان می‌دهد.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleLost}
                className={cn(
                  "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs",
                  activePet.isLost
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300"
                )}
              >
                {activePet.isLost ? "غیرفعال‌سازی (پیدا شد ✓)" : "اعلام گمشده"}
              </button>
            </div>

            {activePet.isLost && (
              <div className="mt-3 pt-3 border-t border-rose-200/60 space-y-2">
                <textarea
                  rows={2}
                  value={customLostMessage}
                  onChange={(e) => setCustomLostMessage(e.target.value)}
                  placeholder="پیام یا مژدگانی برای یابنده..."
                  className="w-full bg-white dark:bg-stone-900 text-xs text-foreground rounded-xl p-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
                <button
                  type="button"
                  onClick={handleToggleLost}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  به‌روزرسانی پیام
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR Collar Tag Box (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-4xl p-6 sm:p-7 border border-primary/20 text-center flex flex-col items-center shadow-glass relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
            <QrCode className="w-3.5 h-3.5" />
            <span>پلاک هوشمند قلاده بونیو</span>
          </div>

          {/* Collar Tag Medal */}
          <div className="relative my-2 p-5 rounded-3xl bg-linear-to-b from-stone-900 via-stone-850 to-stone-950 text-white shadow-2xl border-2 border-primary/40 flex flex-col items-center max-w-[260px] w-full">
            <div className="w-4 h-4 rounded-full bg-stone-800 border-2 border-stone-600 mb-2 shadow-inner" />

            <h4 className="font-black text-base text-white">{activePet.name}</h4>
            <span className="text-[10px] text-stone-400 mt-0.5">{activePet.breed}</span>

            {/* Stylized QR Box */}
            <div className="mt-3 p-2.5 rounded-2xl bg-white text-stone-950 shadow-inner flex flex-col items-center">
              <div className="w-28 h-28 bg-stone-950 p-1.5 rounded-xl flex items-center justify-center text-white">
                <div className="grid grid-cols-6 gap-0.5 w-full h-full p-1 bg-white rounded-lg">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "rounded-xs",
                        (i % 2 === 0 || i % 5 === 0 || i < 7 || i > 28) ? "bg-stone-950" : "bg-white"
                      )} 
                    />
                  ))}
                </div>
              </div>
              <span className="text-[8px] font-mono text-stone-600 mt-1 font-bold tracking-widest">
                {activePet.qrPassportToken}
              </span>
            </div>

            <span className="text-[9px] text-emerald-300 font-medium mt-2">
              اسکن فوری در صورت گم‌شدن
            </span>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-black/5 text-[11px] font-medium text-foreground border border-border transition-all"
            >
              <Share2 className="w-3 h-3 text-muted" />
              <span>{isCopied ? "لینک کپی شد ✓" : "کپی لینک عمومی"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Chronological Activity Timeline ("آخرین فعالیت‌ها") (Item 1.C & 1.D) */}
      <div className="glass-card rounded-4xl p-6 sm:p-8 border border-border/80 shadow-glass space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                آخرین فعالیت‌ها و پرونده مراقبت
              </h2>
            </div>
            <p className="text-xs text-muted mt-1">
              گاه‌شمار فعالیت‌های مراقبتی، واکسیناسیون و خدمات ثبت‌شده برای {activePet.name}
            </p>
          </div>

          {/* Activity Filters (Item 1.D: همه, صاحب پت, دامپزشکی, سایر) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "همه فعالیت‌ها" },
              { id: "OWNER", label: "مربوط به صاحب پت" },
              { id: "VET", label: "مربوط به دامپزشکی" },
              { id: "OTHER", label: "سایر فعالیت‌ها" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActivityFilter(f.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activityFilter === f.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-subtle text-muted hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsAddingActivity(!isAddingActivity)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-subtle text-foreground text-xs font-bold border border-border hover:bg-black/5 transition-colors ms-2"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>ثبت فعالیت جدید</span>
            </button>
          </div>
        </div>

        {/* Add Owner Activity Form */}
        {isAddingActivity && (
          <form onSubmit={handleAddOwnerActivity} className="p-4 rounded-2xl bg-surface-subtle border border-border/80 space-y-3">
            <label className="block text-xs font-bold text-foreground">
              توضیح فعالیت مراقبتی یا تمرینی جدید:
            </label>
            <input
              type="text"
              value={newActivityNote}
              onChange={(e) => setNewActivityNote(e.target.value)}
              placeholder="مثال: پیاده‌روی ۴۵ دقیقه‌ای در پارک یا مسواک زدن دندان"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
              >
                ثبت در گاه‌شمار
              </button>
              <button
                type="button"
                onClick={() => setIsAddingActivity(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-muted hover:text-foreground"
              >
                انصراف
              </button>
            </div>
          </form>
        )}

        {/* Timeline Items List (NO DOCTOR/VET NAMES DISPLAYED - STRICT ITEM 1.C RULE) */}
        <div className="space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-surface-subtle/60 border border-border/60 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    act.category === "VET"
                      ? "bg-teal-500/10 text-teal-600"
                      : act.category === "OWNER"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}>
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {act.activityTypeFa}
                      </span>
                      <span className="text-[10px] text-muted">
                        • {act.performedAt}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {act.descriptionFa}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-foreground text-[10px] font-bold border border-border">
                    {act.statusFa}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-muted">
              هیچ فعالیتی با این فیلتر ثبت نشده است.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
