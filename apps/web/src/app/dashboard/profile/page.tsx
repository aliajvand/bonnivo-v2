"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Phone,
  Shield,
  Bell,
  MapPin,
  LogOut,
  Heart,
  QrCode,
  ChevronLeft,
  Plus,
  Check,
  Smartphone,
  Laptop,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePet } from "@/context/pet-context";

interface SavedAddress {
  id: string;
  title: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  city: string;
  district: string;
  fullAddress: string;
  postalCode: string;
  isDefault: boolean;
}

const initialSavedAddresses: SavedAddress[] = [
  {
    id: "addr-1",
    title: "منزل (تهران)",
    recipientName: "امین محمدی",
    phoneNumber: "۰۹۱۲۳۴۵۶۷۸۹",
    province: "تهران",
    city: "تهران",
    district: "منطقه ۲ (سعادت‌آباد)",
    fullAddress: "بلوار سرو غربی، خیابان صدف، پلاک ۱۲، واحد ۴",
    postalCode: "۱۹۹۸۷۶۵۴۳۲",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "محل کار",
    recipientName: "امین محمدی",
    phoneNumber: "۰۹۱۲۳۴۵۶۷۸۹",
    province: "تهران",
    city: "تهران",
    district: "منطقه ۳ (ونک)",
    fullAddress: "میدان شیخ بهایی، برج صبا، طبقه ۶، واحد ۲۰",
    postalCode: "۱۹۹۵۴۳۲۱۰۱",
    isDefault: false,
  },
];

export default function ProfileHubPage() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { pets, activePet } = usePet();

  const [addresses, setAddresses] = useState<SavedAddress[]>(initialSavedAddresses);
  const [notifications, setNotifications] = useState({
    smsDailyCare: true,
    smsReorderPrompt: true,
    smsLostAlert: true,
    emailWeeklyReport: false,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(user?.fullName || "سرپرست حیوان خانگی");

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }))
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
      {/* 1. Header / User Identity Card */}
      <div className="glass-card rounded-4xl p-6 sm:p-10 border border-primary/20 relative overflow-hidden shadow-glass">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center p-2 shrink-0 shadow-xs relative">
              <span className="text-3xl sm:text-4xl">🐾</span>
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="px-3 py-1 text-lg font-bold rounded-xl bg-surface-subtle border border-primary/30 focus:outline-none"
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-bold"
                    >
                      تأیید
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
                    <span>{userName}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs font-medium text-muted hover:text-primary transition-colors"
                    >
                      (ویرایش نام)
                    </button>
                  </h1>
                )}
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  سرپرست رسمی بونیو
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted mt-2">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono">{user?.phoneNumber || "۰۹۱۲۳۴۵۶۷۸۹"}</span>
                </span>
                <span>•</span>
                <span>عضویت از پاییز ۱۴۰۴</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">احراز هویت پیامکی شده ✓</span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Logout or Login */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج از حساب</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <User className="w-4 h-4" />
                <span>ورود با شماره موبایل</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Registered Pets Quick Hub */}
      <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">پت‌های من در بونیو</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {pets.length} پت
            </span>
          </div>

          <Link
            href="/dashboard/pets"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
          >
            <span>مدیریت کامل پرونده‌ها</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href="/dashboard/pets"
              className="p-4 rounded-2xl bg-surface-subtle hover:bg-black/5 border border-border/60 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2 shrink-0">
                  <Image src={pet.avatarUrl} alt={pet.name} width={36} height={36} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {pet.name}
                  </h3>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {pet.breed} • {pet.weightKg ? `${pet.weightKg} کیلو` : "ثبت نشده"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-primary font-bold">
                <QrCode className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Delivery Addresses (تهران) */}
      <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">آدرس‌های تحویل سفارش</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-subtle hover:bg-black/5 text-foreground text-xs font-bold border border-border transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن آدرس جدید</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all ${
                addr.isDefault
                  ? "bg-primary/5 border-primary/40 shadow-xs"
                  : "bg-surface-subtle border-border/60 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{addr.title}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                      پیش‌فرض
                    </span>
                  )}
                </span>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefaultAddress(addr.id)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    انتخاب به‌عنوان پیش‌فرض
                  </button>
                )}
              </div>

              <p className="text-xs text-foreground/80 leading-relaxed mb-3">{addr.fullAddress}</p>

              <div className="flex items-center justify-between text-[11px] text-muted pt-3 border-t border-border/40">
                <span>گیرنده: {addr.recipientName}</span>
                <span>کد پستی: {addr.postalCode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Notification & Smart Alerts Preferences */}
      <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">تنظیمات اطلاع‌رسانی و پیامک‌ها</h2>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-border/50">
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground block">
                پیامک یادآوری تغذیه و مراقبت روزانه
              </span>
              <span className="text-[11px] text-muted">
                ارسال پیامک برای روتین‌های روزانه فعال پت (پیاده‌روی، قرص ضدانگل، آب تازه)
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsDailyCare}
              onChange={() => handleToggleNotification("smsDailyCare")}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-border/50">
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground block">
                هشدارهای هوشمند اتمام غذا (خرید مجدد سریع)
              </span>
              <span className="text-[11px] text-muted">
                محاسبه مصرف روزانه و ارسال پیامک یادآوری ۷ روز قبل از تمام شدن کیسه غذای خشک
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsReorderPrompt}
              onChange={() => handleToggleNotification("smsReorderPrompt")}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-border/50">
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground block">
                هشدارهای اضطراری اسکن قلاده هوشمند QR
              </span>
              <span className="text-[11px] text-muted">
                ارسال آنی پیامک و موقعیت جغرافیایی تقریبی در زمان اسکن پلاک قلاده گم‌شده
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsLostAlert}
              onChange={() => handleToggleNotification("smsLostAlert")}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
            />
          </div>
        </div>
      </div>

      {/* 5. Security & Active Sessions */}
      <div className="glass-card rounded-3xl p-6 border border-border/70 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">امنیت و نشست‌های فعال</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-foreground">نشست فعلی (مرورگر وب)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-muted block mt-0.5">تهران، ایران • Chrome / Next.js Client</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">هم‌اکنون فعال</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-border/50 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground">احراز هویت پیامکی دو مرحله‌ای</span>
              <span className="text-[11px] text-muted block mt-0.5">
                ورود ایمن بدون رمز عبور از طریق کد ۵ رقمی یکبار مصرف
              </span>
              <span className="text-[10px] text-primary font-bold block mt-1">فعال روی شماره {user?.phoneNumber || "همراه"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
