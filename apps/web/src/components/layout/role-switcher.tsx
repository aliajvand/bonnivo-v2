"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { AppUserRole } from "@/types/auth";
import {
  ShieldCheck,
  Stethoscope,
  Calendar,
  Award,
  User,
  Store,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: AppUserRole;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  homeUrl: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "CUSTOMER",
    label: "کاربر عادی / سرپرست پت",
    badge: "مشتری",
    icon: User,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    description: "خرید، نوبت‌دهی، پرونده سلامت و مراقبت روزانه",
    homeUrl: "/",
  },
  {
    role: "ADMIN",
    label: "مدیر ارشد پلتفرم",
    badge: "مدیریت کلان",
    icon: ShieldCheck,
    color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    description: "تحلیل کلان، نظارت سفارشات، کاربران و ممیزی سیستم",
    homeUrl: "/dashboard/admin",
  },
  {
    role: "VETERINARIAN",
    label: "دامپزشک و کلینیک",
    badge: "دامپزشکی",
    icon: Stethoscope,
    color: "text-teal-600 bg-teal-500/10 border-teal-500/20",
    description: "ویزیت، نوبت‌های پزشکی و پرونده بالینی بیماران",
    homeUrl: "/dashboard/vet",
  },
  {
    role: "EVENT_ORGANIZER",
    label: "برگزارکننده رویدادها",
    badge: "رویداد",
    icon: Calendar,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    description: "مدیریت همایش‌ها، بلیت‌فروشی و چک‌این ورودی",
    homeUrl: "/dashboard/organizer",
  },
  {
    role: "TRAINER",
    label: "مربی و رفتارشناس",
    badge: "مربیگری",
    icon: Award,
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    description: "جلسات آموزشی، ارزیابی رفتاری و رزرو کلاس‌ها",
    homeUrl: "/dashboard/trainer",
  },
];

export function RoleSwitcher({ className }: { className?: string }) {
  const { currentRole, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption =
    ROLE_OPTIONS.find((opt) => opt.role === currentRole) || ROLE_OPTIONS[0];
  const Icon = activeOption.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="تغییر نقش کاربری"
        className={cn(
          "inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 active:scale-95",
          activeOption.color,
          "border border-border/60 hover:border-border"
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="font-bold">{activeOption.badge}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-64 rounded-2xl bg-surface-elevated/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-border/50 mb-1">
            <span className="text-[11px] font-bold text-muted-foreground">
              شبیه‌سازی نقش و دسترسی
            </span>
          </div>

          <div className="space-y-0.5">
            {ROLE_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              const isSelected = opt.role === currentRole;

              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => {
                    switchRole(opt.role);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-xl text-start transition-colors duration-150",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-surface-subtle text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border",
                        opt.color
                      )}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs leading-none font-bold">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {opt.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ms-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
