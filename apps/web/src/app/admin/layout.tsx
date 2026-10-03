"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldAlert,
  MessageSquare,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { adminGetMe, adminLogout, AdminUser } from "@/lib/api/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If path is /admin/login, render children cleanly without admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await adminGetMe();
        if (!user) {
          // If not authenticated, redirect to /admin/login
          router.push("/admin/login");
        } else {
          setAdminUser(user);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "پیشخوان", href: "/admin", icon: LayoutDashboard },
    { label: "محصولات و کاتالوگ", href: "/admin#products", icon: Package },
    { label: "تایید فروشندگان", href: "/admin#sellers", icon: Users },
    { label: "حل اختلاف و مرجوعی ۴ ساعته", href: "/admin#disputes", icon: ShieldAlert },
    { label: "نظرات کاربران", href: "/admin#reviews", icon: MessageSquare },
    { label: "لاگ‌های ممیزی سیستم", href: "/admin#audit", icon: FileText },
    { label: "تنظیمات و فیچرفلگ‌ها", href: "/admin#flags", icon: Sliders },
  ];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[#50575e]">
          <div className="w-5 h-5 border-2 border-[#2271b1] border-t-transparent rounded-full animate-spin" />
          <span>در حال بررسی دسترسی مدیریت...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex flex-col font-sans antialiased text-[#3c434a] dir-rtl">
      {/* 1. Classic WordPress Top Admin Bar (#1d2327) */}
      <header className="sticky top-0 z-40 bg-[#1d2327] text-[#c3c4c7] h-9 px-4 flex items-center justify-between text-xs select-none shadow-xs border-b border-[#2c3338]">
        {/* Right side (RTL start): Brand & Quick Links */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-white hover:text-white"
            title="منو"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2 font-bold text-white hover:text-emerald-400 transition-colors">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-[#1d2327] font-black flex items-center justify-center text-[10px]">
              B
            </span>
            <span>مدیریت بونیو</span>
          </Link>

          <span className="text-[#50575e]">|</span>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-[#c3c4c7] hover:text-white transition-colors"
            title="مشاهده وب‌سایت در برگه جدید"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مشاهده سایت</span>
          </Link>
        </div>

        {/* Left side (RTL end): User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#c3c4c7]">
            <UserIcon className="w-3.5 h-3.5" />
            <span className="font-medium text-white">{adminUser?.full_name || adminUser?.username || "مدیر ارشد"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[#c3c4c7] hover:text-red-400 transition-colors"
            title="خروج از حساب مدیریت"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Dark WordPress Collapsible Right Sidebar (#1d2327) */}
        <aside
          className={`bg-[#1d2327] text-[#c3c4c7] shrink-0 border-l border-[#2c3338] transition-all duration-200 z-30 flex flex-col justify-between ${
            isSidebarCollapsed ? "w-14" : "w-56"
          } hidden md:flex`}
        >
          <nav className="py-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors border-r-4 ${
                    pathname === item.href || (item.href !== "/admin" && typeof window !== "undefined" && window.location.hash === item.href.replace("/admin", ""))
                      ? "bg-[#2271b1] text-white border-white"
                      : "text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white border-transparent"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Collapse Toggle Button */}
          <div className="p-2 border-t border-[#2c3338]">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-[#a7aaad] hover:text-white hover:bg-[#2c3338] rounded transition-colors"
              title={isSidebarCollapsed ? "گسترش منو" : "جمع کردن منو"}
            >
              {isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {!isSidebarCollapsed && <span>جمع کردن منو</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
            <div className="w-64 bg-[#1d2327] text-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#2c3338] mb-4">
                  <span className="font-bold text-sm">منوی مدیریت</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-xs rounded hover:bg-[#2c3338]"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#2c3338]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-[#2c3338] rounded"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از پنل</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* 3. Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
