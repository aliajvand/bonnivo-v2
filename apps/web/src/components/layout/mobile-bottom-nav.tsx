"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  HeartHandshake,
  CalendarCheck,
  User,
  ShieldCheck,
  Stethoscope,
  Calendar,
  Award,
  ClipboardList,
  Users,
  Activity,
  Ticket,
  MapPin,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { BonyoLogo } from "@/components/brand/bonyo-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface MobileTab {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemsCount } = useCart();
  const { currentRole } = useAuth();

  // Role-specific tab configuration (Customer = Exactly 6 items as requested)
  const tabs: MobileTab[] = (() => {
    switch (currentRole) {
      case "ADMIN":
        return [
          { title: "کلان", href: "/dashboard/admin", icon: ShieldCheck },
          { title: "سفارشات", href: "/dashboard/admin#orders", icon: ShoppingBag },
          { title: "کاربران", href: "/dashboard/admin#sellers", icon: Users },
          { title: "ممیزی", href: "/dashboard/admin#audit", icon: Activity },
          { title: "پروفایل", href: "/dashboard/profile", icon: User },
        ];
      case "VETERINARIAN":
        return [
          { title: "کلینیک", href: "/dashboard/vet", icon: Stethoscope },
          { title: "نوبت‌ها", href: "/dashboard/vet#appointments", icon: CalendarCheck },
          { title: "بیماران", href: "/dashboard/vet#patients", icon: Users },
          { title: "پرونده", href: "/dashboard/vet#records", icon: ClipboardList },
          { title: "پروفایل", href: "/dashboard/profile", icon: User },
        ];
      case "EVENT_ORGANIZER":
        return [
          { title: "میزکار", href: "/dashboard/organizer", icon: Calendar },
          { title: "رویدادها", href: "/dashboard/organizer#events", icon: ClipboardList },
          { title: "اسکن", href: "/dashboard/organizer#checkin", icon: Ticket },
          { title: "آمار", href: "/dashboard/organizer#metrics", icon: Activity },
          { title: "پروفایل", href: "/dashboard/profile", icon: User },
        ];
      case "TRAINER":
        return [
          { title: "میزکار", href: "/dashboard/trainer", icon: Award },
          { title: "جلسات", href: "/dashboard/trainer#sessions", icon: CalendarCheck },
          { title: "مراجعین", href: "/dashboard/trainer#clients", icon: Users },
          { title: "درآمد", href: "/dashboard/trainer#reviews", icon: Activity },
          { title: "پروفایل", href: "/dashboard/profile", icon: User },
        ];
      default:
        return [
          { title: "فروشگاه", href: "/shop", icon: ShoppingBag },
          { title: "دامپزشک", href: "/vets", icon: Stethoscope },
          { title: "مربی", href: "/trainers", icon: Award },
          { title: "پت من", href: "/dashboard/pets", icon: HeartHandshake },
          { title: "حساب کاربری", href: "/dashboard/profile", icon: User },
          { title: "ایونت", href: "/events", icon: Calendar },
        ];
    }
  })();

  const isCustomer = currentRole === "CUSTOMER";

  return (
    <>
      {/* Mobile Top Header (Brand, Theme Toggle, Cart - No role-switch control) */}
      <header className="sticky top-0 z-40 w-full px-3 py-2 md:hidden bg-surface-elevated/90 backdrop-blur-xl border-b border-border/60 flex items-center justify-between">
        <BonyoLogo variant="compact" size="sm" />

        <div className="flex items-center gap-1.5">
          <ThemeToggle />


          {isCustomer && (
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-foreground border border-border/50 transition-transform active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -start-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                  {itemsCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* Floating Rectangular Glass Dock with Active Circular Luminous Indicator */}
      <nav
        aria-label="ناوبری شناور موبایل"
        className="fixed bottom-3 inset-x-3 z-50 md:hidden pointer-events-none pb-safe"
      >
        <div className="max-w-sm mx-auto pointer-events-auto bg-surface-elevated/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-1.5 flex items-center justify-between shadow-2xl border border-border/80 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href.split("#")[0]));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.title}
                href={tab.href}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 select-none group",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                {/* Active Luminous Indicator: Soft halo + Circular Luminous Dot */}
                {isActive && (
                  <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/15 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}

                <div className="relative flex flex-col items-center">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive
                        ? "stroke-[2.5px] scale-110 -translate-y-0.5"
                        : "stroke-[1.75px] group-hover:scale-105"
                    )}
                  />

                  {tab.badge && (
                    <span className="absolute -top-1 -start-1 bg-emerald-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] tracking-tight transition-all duration-200 mt-0.5",
                    isActive ? "font-bold" : "font-medium"
                  )}
                >
                  {tab.title}
                </span>

                {/* Circular luminous glow dot that moves with active item */}
                {isActive && (
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
