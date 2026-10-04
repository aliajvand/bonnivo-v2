"use client";

import React, { useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingBag,
  Clock,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronRight,
  Activity,
  Calendar,
  Building,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminProductManagement } from "./admin-product-management";
import { AdminReviewsManagement } from "./admin-reviews-management";
import { AdminFeatureFlagsManagement } from "./admin-feature-flags-management";

interface PendingSeller {
  id: string;
  storeName: string;
  applicantPhone: string;
  nationalId: string;
  shebaNumber: string;
  city: string;
  appliedDate: string;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
}

interface DisputeClaim {
  id: string;
  orderId: string;
  customerName: string;
  storeName: string;
  amountTomans: number;
  reason: string;
  timeRemainingHours: number;
  status: "PENDING" | "REFUNDED" | "REJECTED";
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: "COMPLETED" | "PROCESSING" | "SHIPPED" | "DISPUTED";
  date: string;
  items: number;
}

interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  level: "INFO" | "WARNING" | "CRITICAL";
}

export function AdminPanelView() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "sellers" | "disputes" | "reviews" | "audit" | "flags"
  >("overview");
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "1Y">("30D");

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (
        hash === "overview" ||
        hash === "products" ||
        hash === "sellers" ||
        hash === "disputes" ||
        hash === "reviews" ||
        hash === "audit" ||
        hash === "flags"
      ) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const [sellers, setSellers] = useState<PendingSeller[]>([
    {
      id: "s-1",
      storeName: "پت‌شاپ نیاوران",
      applicantPhone: "09121112233",
      nationalId: "0012345678",
      shebaNumber: "IR1200000000000000000001",
      city: "تهران",
      appliedDate: "۱۴۰۳/۰۷/۱۰",
      status: "UNDER_REVIEW",
    },
    {
      id: "s-2",
      storeName: "پت‌استور سعادت‌آباد",
      applicantPhone: "09124445566",
      nationalId: "0012345679",
      shebaNumber: "IR1200000000000000000002",
      city: "تهران",
      appliedDate: "۱۴۰۳/۰۷/۱۱",
      status: "UNDER_REVIEW",
    },
    {
      id: "s-3",
      storeName: "کلینیک و پت‌شاپ مهرگان",
      applicantPhone: "09358889900",
      nationalId: "0012345680",
      shebaNumber: "IR1200000000000000000003",
      city: "اصفهان",
      appliedDate: "۱۴۰۳/۰۷/۱۲",
      status: "UNDER_REVIEW",
    },
  ]);

  const [disputes, setDisputes] = useState<DisputeClaim[]>([
    {
      id: "disp-1",
      orderId: "BNV-7102",
      customerName: "سارا محمدی",
      storeName: "پت‌شاپ طلایی",
      amountTomans: 485000,
      reason: "پارگی جزئی بسته‌بندی در هنگام تحویل پیک (ضمانت سلامت ۴ ساعته بونیو)",
      timeRemainingHours: 2.5,
      status: "PENDING",
    },
    {
      id: "disp-2",
      orderId: "BNV-7189",
      customerName: "کامران بهرامی",
      storeName: "رویال کنین لند",
      amountTomans: 1250000,
      reason: "مغایرت طعم غذای خشک گربه با سفارش ثبت‌شده در فاکتور",
      timeRemainingHours: 1.2,
      status: "PENDING",
    },
  ]);

  const recentOrders: RecentOrder[] = [
    { id: "BNV-9821", customer: "علی پوریا", amount: 1420000, status: "COMPLETED", date: "۱۰ دقیقه پیش", items: 3 },
    { id: "BNV-9820", customer: "فاطمه رضایی", amount: 690000, status: "PROCESSING", date: "۲۵ دقیقه پیش", items: 1 },
    { id: "BNV-9819", customer: "مهرداد نادری", amount: 2850000, status: "SHIPPED", date: "۱ ساعت پیش", items: 4 },
    { id: "BNV-9818", customer: "سحر اسدی", amount: 540000, status: "DISPUTED", date: "۲ ساعت پیش", items: 2 },
    { id: "BNV-9817", customer: "نیما فرهمند", amount: 1980000, status: "COMPLETED", date: "۳ ساعت پیش", items: 2 },
  ];

  const auditLogs: AuditLogItem[] = [
    { id: "log-1", action: "تأیید فروشنده جدید", actor: "ادمین سیستم", target: "پت شاپ آریا (s-4)", timestamp: "۵ دقیقه پیش", level: "INFO" },
    { id: "log-2", action: "بازگشت وجه سفارش ضمانتی", actor: "سیستم خودکار", target: "سفارش BNV-7098", timestamp: "۲۲ دقیقه پیش", level: "WARNING" },
    { id: "log-3", action: "به‌روزرسانی کارمزد بازارچه", actor: "مدیر مالی", target: "تنظیمات کارمزد فروشگاه", timestamp: "۱ ساعت پیش", level: "INFO" },
    { id: "log-4", action: "تغییر سطح دسترسی کاربر", actor: "مدیر کلان", target: "دسترسی دامپزشک v-102", timestamp: "۳ ساعت پیش", level: "CRITICAL" },
  ];

  const handleSellerAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: action } : s))
    );
  };

  const handleResolveDispute = (id: string, action: "REFUNDED" | "REJECTED") => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: action } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Header with Metis-Inspired Ergonomics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-elevated/70 dark:bg-slate-900/60 p-5 rounded-3xl border border-border/80 backdrop-blur-xl shadow-glass">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              داشبورد کلان مدیریت و عملیات بونیو
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            آمار ۳۰ روز گذشته اکوسیستم • آخرین به‌روزرسانی: ۲ دقیقه پیش
          </p>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-surface-subtle p-1 rounded-2xl border border-border/60">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              نمای کلان
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "products"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              کاتالوگ و کالاها
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={cn(
                "relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "sellers"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              احراز فروشندگان
              {sellers.filter((s) => s.status === "UNDER_REVIEW").length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-mono">
                  {sellers.filter((s) => s.status === "UNDER_REVIEW").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("disputes")}
              className={cn(
                "relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "disputes"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ضمانت ۴ ساعته
              {disputes.filter((d) => d.status === "PENDING").length > 0 && (
                <span className="ms-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-mono">
                  {disputes.filter((d) => d.status === "PENDING").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "reviews"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              نظرات خریداران
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "audit"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              لاگ ممیزی
            </button>
            <button
              onClick={() => setActiveTab("flags")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "flags"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              پرچم‌های ویژگی
            </button>
          </div>

          <button
            type="button"
            className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
            title="خروجی گزارش CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metis-Style 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL USERS */}
        <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">کاربران فعال پلتفرم</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-foreground font-mono">۱۲,۴۲۶</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+۱۲.۵٪ نسبت به ماه قبل</span>
            </div>
          </div>
        </div>

        {/* KPI 2: REVENUE */}
        <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">گردش مالی ناخالص (GMV)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground font-mono">۳,۸۴۲,۵۰۰</span>
              <span className="text-xs text-muted-foreground">تومان</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+۱۸.۲٪ رشد فروش</span>
            </div>
          </div>
        </div>

        {/* KPI 3: ORDERS */}
        <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">سفارشات تحویل‌شده</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-foreground font-mono">۱,۸۵۲</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+۵.۴٪ تکمیل موفق</span>
            </div>
          </div>
        </div>

        {/* KPI 4: AVG DISPUTE RESOLUTION TIME */}
        <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">میانگین حل ضمانت بونیو</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground font-mono">۱.۸</span>
              <span className="text-xs text-muted-foreground">ساعت</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>سریع‌تر از سقف ۴ ساعته</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): Revenue Overview Chart & Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Overview Container */}
            <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-base font-bold text-foreground">نمودار تحلیلی درآمد و تراکنش‌ها</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">تفکیک فروش کالا، رزرو خدمات و اشتراک‌ها</p>
                </div>
                <div className="flex bg-surface-subtle p-1 rounded-xl border border-border/50 text-xs font-mono">
                  {(["7D", "30D", "90D", "1Y"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all",
                        timeRange === r
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metis Multi-Line SVG Chart Visualization */}
              <div className="relative h-56 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                  <line x1="0" y1="190" x2="600" y2="190" stroke="currentColor" className="text-border/70" />

                  {/* Gradient Area for Primary Line */}
                  <defs>
                    <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 0 140 Q 60 70 120 100 T 240 60 T 360 110 T 480 80 T 600 40 L 600 190 L 0 190 Z"
                    fill="url(#revenueGrad)"
                  />
                  {/* Main Line: Sales */}
                  <path
                    d="M 0 140 Q 60 70 120 100 T 240 60 T 360 110 T 480 80 T 600 40"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Secondary Line: Bookings */}
                  <path
                    d="M 0 160 Q 60 140 120 150 T 240 120 T 360 140 T 480 130 T 600 110"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mt-2">
                  <span>فروردین</span>
                  <span>خرداد</span>
                  <span>مرداد</span>
                  <span>مهر</span>
                  <span>آذر</span>
                  <span>اسفند</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="font-medium text-foreground">فروش کالا و سفارشات بازارچه</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground">رزرو خدمات دامپزشکی، مربیگری و رویداد</span>
                </div>
              </div>
            </div>

            {/* Split Metrics: User Growth & Order Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Growth (Last 7 Days) */}
              <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-1">رشد کاربران جدید (۷ روز اخیر)</h3>
                <p className="text-[11px] text-muted-foreground mb-4">ثبت‌نام سرپرستان پت و اصناف</p>
                <div className="flex items-end justify-between h-32 pt-4 px-2 gap-2">
                  {[45, 52, 28, 65, 84, 92, 58].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full bg-blue-500/80 hover:bg-blue-600 rounded-t-lg transition-all"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        روز {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Donut Breakdown */}
              <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">توزیع وضعیت سفارشات</h3>
                  <p className="text-[11px] text-muted-foreground mb-3">نرخ موفقیت در چرخه فروش</p>
                </div>
                <div className="flex items-center justify-around py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-surface-subtle" strokeWidth="4" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="65 100" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-65" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-85" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-95" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xs font-black font-mono">۹۵٪</span>
                      <span className="text-[9px] text-muted-foreground">تکمیل</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>تکمیل‌شده (۶۵٪)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>در حال پردازش (۲۰٪)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>ارسال پیک (۱۰٪)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>ضمانت و مرجوعی (۵٪)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">آخرین سفارشات ثبت‌شده</h3>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer font-bold">مشاهده همه</span>
              </div>
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground pb-2">
                    <th className="text-start py-2.5 font-bold">شناسه سفارش</th>
                    <th className="text-start py-2.5 font-bold">مشتری</th>
                    <th className="text-start py-2.5 font-bold">مبلغ (تومان)</th>
                    <th className="text-start py-2.5 font-bold">وضعیت</th>
                    <th className="text-start py-2.5 font-bold">زمان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{ord.id}</td>
                      <td className="py-3 font-medium text-foreground">{ord.customer}</td>
                      <td className="py-3 font-mono font-bold text-foreground">{ord.amount.toLocaleString("fa-IR")}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            ord.status === "COMPLETED" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                            ord.status === "PROCESSING" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                            ord.status === "SHIPPED" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                            ord.status === "DISPUTED" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          )}
                        >
                          {ord.status === "COMPLETED" && "تکمیل شده"}
                          {ord.status === "PROCESSING" && "پردازش"}
                          {ord.status === "SHIPPED" && "ارسال شده"}
                          {ord.status === "DISPUTED" && "اعتراض ضمانت"}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{ord.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (1/3): Operational Feed & Quick Actions */}
          <div className="space-y-6">
            {/* Operational Alert Box */}
            <div className="bg-gradient-to-br from-blue-600/10 via-emerald-600/5 to-transparent p-5 rounded-3xl border border-blue-500/20 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">وضعیت سلامت اکوسیستم</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                تمام سرویس‌های درگاه بانکی، ارسال پیامک احراز هویت و پایگاه داده در وضعیت سبز (Operational) هستند.
              </p>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>آپ‌تایم: ۹۹.۹۸٪</span>
                <span>پاسخ‌دهی: ۴۵ms</span>
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="bg-surface-elevated p-5 rounded-3xl border border-border/70 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">رویدادهای امنیتی و ممیزی اخیر</h3>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-surface-subtle border border-border/50 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>توسط: {log.actor}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{log.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Tab */}
      {activeTab === "sellers" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">درخواست‌های احراز هویت فروشگاه‌ها و پت‌شاپ‌ها</h2>
              <p className="text-xs text-muted-foreground">بررسی صحت کد ملی، شماره شبا و جواز فعالیت جهت ورود به بازارچه</p>
            </div>
            <span className="text-xs font-bold text-muted-foreground bg-surface-subtle px-3 py-1 rounded-full border">
              {sellers.length} متقاضی در صف
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sellers.map((seller) => (
              <div key={seller.id} className="p-5 rounded-2xl bg-surface-subtle border border-border/60 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{seller.storeName}</h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        seller.status === "UNDER_REVIEW" && "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                        seller.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                        seller.status === "REJECTED" && "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      )}
                    >
                      {seller.status === "UNDER_REVIEW" && "در انتظار بررسی"}
                      {seller.status === "APPROVED" && "تأیید شد"}
                      {seller.status === "REJECTED" && "رد شد"}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <p>تلفن: {seller.applicantPhone}</p>
                    <p>کد ملی: {seller.nationalId}</p>
                    <p className="truncate">شبا: {seller.shebaNumber}</p>
                    <p>شهر: {seller.city}</p>
                    <p>تاریخ تقاضا: {seller.appliedDate}</p>
                  </div>
                </div>

                {seller.status === "UNDER_REVIEW" ? (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleSellerAction(seller.id, "APPROVED")}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تأیید مدارک
                    </button>
                    <button
                      onClick={() => handleSellerAction(seller.id, "REJECTED")}
                      className="py-1.5 px-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1 border border-rose-500/30"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      رد
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic text-center">عملیات ثبت گردید</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disputes Tab (4-Hour Guarantee) */}
      {activeTab === "disputes" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">مدیریت ضمانت بازگشت وجه ۴ ساعته بونیو</h2>
              <p className="text-xs text-muted-foreground">بررسی دعاوی آسیب فیزیکی، بسته‌بندی یا مغایرت قبل از تسویه با فروشنده</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 px-3 py-1 rounded-full font-bold border border-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>پاسخگویی فوری الزامی است</span>
            </div>
          </div>

          <div className="space-y-3">
            {disputes.map((claim) => (
              <div key={claim.id} className="p-4 rounded-2xl bg-surface-subtle border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{claim.orderId}</span>
                    <span className="text-xs font-bold text-foreground">• {claim.customerName}</span>
                    <span className="text-xs text-muted-foreground">(فروشگاه: {claim.storeName})</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{claim.reason}</p>
                  <div className="flex items-center gap-3 text-xs font-mono pt-1">
                    <span className="font-bold text-foreground">مبلغ: {claim.amountTomans.toLocaleString("fa-IR")} تومان</span>
                    <span className="text-rose-600 font-bold">مهلت اقدام: {claim.timeRemainingHours} ساعت باقی‌مانده</span>
                  </div>
                </div>

                {claim.status === "PENDING" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveDispute(claim.id, "REFUNDED")}
                      className="py-1.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      استرداد وجه به کیف‌پول مشتری
                    </button>
                    <button
                      onClick={() => handleResolveDispute(claim.id, "REJECTED")}
                      className="py-1.5 px-3 rounded-xl bg-surface-elevated text-muted-foreground text-xs font-bold hover:text-foreground transition-colors border border-border/60"
                    >
                      عدم پذیرش ادعا
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {claim.status === "REFUNDED" ? "استرداد وجه انجام شد" : "ادعا رد شد"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="bg-surface-elevated p-6 rounded-3xl border border-border/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">لاگ‌های ممیزی و امنیت پلتفرم (Audit Trail)</h2>
              <p className="text-xs text-muted-foreground">ثبت تغییرات ساختاری، سطوح دسترسی، مالی و عملیاتی با شناسه غیرقابل جعل</p>
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      log.level === "INFO" && "bg-blue-500",
                      log.level === "WARNING" && "bg-amber-500",
                      log.level === "CRITICAL" && "bg-rose-500"
                    )}
                  />
                  <div>
                    <div className="text-xs font-bold text-foreground">{log.action}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      عامل: <span className="font-medium text-foreground">{log.actor}</span> | هدف: <span className="font-mono text-blue-600">{log.target}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products & Catalog Tab */}
      {activeTab === "products" && <AdminProductManagement />}

      {/* Verified Reviews Moderation Tab */}
      {activeTab === "reviews" && <AdminReviewsManagement />}

      {/* Feature Flags Management Tab */}
      {activeTab === "flags" && <AdminFeatureFlagsManagement />}
    </div>
  );
}
