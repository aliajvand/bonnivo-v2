"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { BonyoLogo } from "@/components/brand/bonyo-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
}

const PRIMARY_NAV: NavItem[] = [
  { title: "فروشگاه", href: "/shop" },
  { title: "دامپزشکی", href: "/vets" },
  { title: "مربیان", href: "/trainers" },
  { title: "پانسیون", href: "/boarding" },
  { title: "رویدادها", href: "/events" },
  { title: "پت‌های من", href: "/dashboard/pets" },
];

export function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemsCount } = useCart();
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Only extract first part of name if containing slash/English, display Persian only
  const persianDisplayName = user?.fullName
    ? user.fullName.split("/")[0].trim()
    : "حساب کاربری";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0c1512]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200 hidden md:block">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6" dir="rtl">
          
          {/* Right Section (RTL): Official Brand Logo & Clean Primary Navigation */}
          <div className="flex items-center gap-8 shrink-0">
            <BonyoLogo size="lg" />

            {/* Primary Navigation */}
            <nav className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 select-none",
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold"
                        : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50"
                    )}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section: Substantial Central Search Input */}
          <div className="flex-1 max-w-md lg:max-w-lg">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی غذا، مکمل، کلینیک، مربی، پانسیون یا رویداد..."
                className="w-full bg-[#F7F8F6] dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-900 focus:bg-white dark:focus:bg-stone-900 text-sm text-foreground placeholder:text-stone-400 rounded-xl ps-10 pe-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all duration-200"
              />
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </form>
          </div>

          {/* Left Section (RTL): Actions (Theme, Cart, Account) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label="سبد خرید"
              className="relative p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200/70 dark:hover:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-200 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -start-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-xs">
                  {itemsCount.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Trigger (Persian display only) */}
            {isAuthenticated ? (
              <Link
                href="/dashboard/profile"
                aria-label="حساب کاربری"
                className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200/70 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors text-xs sm:text-sm font-bold border border-stone-200/60 dark:border-stone-800/60"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {persianDisplayName.charAt(0) || "ک"}
                </div>
                <span>{persianDisplayName}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-all text-xs sm:text-sm font-bold shadow-xs active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>ورود به حساب</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
