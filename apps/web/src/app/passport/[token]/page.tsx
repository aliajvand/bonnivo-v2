"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  AlertTriangle, 
  Phone, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { usePet } from "@/context/pet-context";
import { SightingLocationModal } from "@/components/passport/sighting-location-modal";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicPassportScanPage({ params }: PageProps) {
  const { token } = use(params);
  const { getPetByQrToken, pets } = usePet();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Find pet by token or fallback to Milo as realistic sample
  const pet = getPetByQrToken(token) || pets[0];

  return (
    <div className="min-h-screen bg-stone-900/95 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6" dir="rtl">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-5 my-auto">
        
        {/* Top Brand Logo */}
        <div className="flex items-center justify-center gap-2 text-center pb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center p-1 border border-primary/40">
            <span className="font-bold text-emerald-400 text-sm">ب</span>
          </div>
          <span className="font-bold text-lg text-white">پاسپورت هوشمند بونیو</span>
        </div>

        {/* 1. LOST PET ALERT BANNER (If Active) */}
        {pet.isLost ? (
          <div className="rounded-3xl p-5 bg-rose-600/90 border-2 border-rose-400 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] font-black tracking-wider uppercase">
                  وضعیت اضطراری
                </span>
                <h1 className="text-xl font-black mt-0.5">
                  این حیوان خانگی گم شده است!
                </h1>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/15">
              {pet.lostAlertMessage || "سرپرست این پت در جستجوی اوست. لطفاً اگر این حیوان را یافته‌اید یا دیده‌اید، سریعاً از طریق دکمه زیر تماس بگیرید."}
            </p>
          </div>
        ) : (
          <div className="rounded-3xl p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-white">پت دارای شناسنامه و سرپرست معتبر</span>
              این پلاک جهت مواقع اضطراری روی قلاده پت نصب شده است.
            </div>
          </div>
        )}

        {/* 2. PET EMERGENCY IDENTITY CARD */}
        <div className="rounded-4xl p-6 sm:p-7 bg-stone-850 border border-white/15 shadow-2xl space-y-6">
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center p-3 border shrink-0 shadow-md",
              pet.species === "DOG" && "bg-amber-500/10 border-amber-400/30",
              pet.species === "CAT" && "bg-purple-500/10 border-purple-400/30",
              pet.species === "BIRD" && "bg-sky-500/10 border-sky-400/30",
              pet.species === "SMALL_PET" && "bg-emerald-500/10 border-emerald-400/30"
            )}>
              <Image
                src={pet.avatarUrl}
                alt={pet.name}
                width={52}
                height={52}
                className="object-contain"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {pet.name}
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                گونه: {pet.species === "DOG" ? "سگ" : pet.species === "CAT" ? "گربه" : "حیوان خانگی"} • نژاد: {pet.breed}
              </p>
              <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300 border border-white/10 font-mono">
                کد رهگیری: {token}
              </span>
            </div>
          </div>

          {/* Medical Alert Badge (Owner-Approved) */}
          <div className="p-3.5 rounded-2xl bg-stone-900 border border-white/10 text-xs space-y-1">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نکات ضروری و تغذیه:</span>
            </span>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              {pet.dietaryPreferences || "پت آرام و مهربان، بدون سابقه پرخاشگری"}
            </p>
          </div>

          {/* Emergency Call Action Button */}
          <div className="space-y-2.5 pt-1">
            <a
              href="tel:09120000000"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5 fill-stone-950" />
              <span>تماس فوری با سرپرست پت</span>
            </a>

            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>اعلام محل یافتن / ارسال نقشه و موقعیت به سرپرست</span>
            </button>
          </div>

        </div>

        {/* Interactive Map Sighting Location Modal */}
        <SightingLocationModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          token={token}
          petName={pet.name}
          petAvatar={pet.avatarUrl}
        />

        {/* 3. Privacy Guarantee Footer */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 text-stone-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>اطلاعات تماس محافظت‌شده توسط بونیو • بدون افشای آدرس منزل</span>
          </div>

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-white transition-colors"
            >
              <span>ورود به سایت بونیو</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
