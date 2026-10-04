"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Search,
  Filter,
  Stethoscope,
  GraduationCap,
  Home,
  Calendar,
  Phone,
  Clock,
  Star,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceLocationItem {
  id: string;
  name: string;
  category: "VET" | "TRAINER" | "BOARDING" | "EVENT";
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  isOpen24h?: boolean;
  hours: string;
  isVerified: boolean;
  distanceKm?: number;
}

// Preset centers to simulate geolocation and progressive radius testing
const PRESET_LOCATIONS = [
  { name: "ونک / میدان ملاصدرا (مرکز تجاری)", lat: 35.758, lng: 51.405 },
  { name: "سعادت‌آباد / بلوار فرهنگ (غرب)", lat: 35.783, lng: 51.378 },
  { name: "نیاوران / تجریش (شمال)", lat: 35.815, lng: 51.435 },
  { name: "شهران / کن (شمال غرب)", lat: 35.772, lng: 51.295 },
  { name: "دماوند / رودهن (فاصله بیش از ۲۵ کیلومتر - تست عدم نتیجه)", lat: 35.72, lng: 51.85 },
];

const SEED_LOCATIONS: ServiceLocationItem[] = [
  {
    id: "vet-1",
    name: "بیمارستان تخصصی دامپزشکی پایتخت",
    category: "VET",
    lat: 35.762,
    lng: 51.41,
    address: "تهران، میدان ونک، خیابان خدامی",
    phone: "021-88776655",
    rating: 4.9,
    reviewCount: 142,
    isOpen24h: true,
    hours: "شبانه‌روزی ۲۴ ساعته",
    isVerified: true,
  },
  {
    id: "vet-2",
    name: "کلینیک تخصصی حیوانات خانگی مهرگان",
    category: "VET",
    lat: 35.78,
    lng: 51.375,
    address: "تهران، سعادت‌آباد، خیابان سرو غربی",
    phone: "021-22334455",
    rating: 4.8,
    reviewCount: 96,
    hours: "۹:۰۰ الی ۲۲:۰۰",
    isVerified: true,
  },
  {
    id: "trainer-1",
    name: "آکادمی تربیت و رفتارشناسی سگ‌های بونیو",
    category: "TRAINER",
    lat: 35.768,
    lng: 51.392,
    address: "تهران، شهرک غرب، فاز ۳",
    phone: "09123334455",
    rating: 4.9,
    reviewCount: 68,
    hours: "۱۰:۰۰ الی ۱۹:۰۰",
    isVerified: true,
  },
  {
    id: "boarding-1",
    name: "پانسیون و ریزورت هتل حیوانات آرمانی",
    category: "BOARDING",
    lat: 35.805,
    lng: 51.42,
    address: "تهران، الهیه، خیابان فرشته",
    phone: "021-26201122",
    rating: 4.7,
    reviewCount: 54,
    hours: "پذیرش شبانه‌روزی با هماهنگی",
    isVerified: true,
  },
  {
    id: "event-1",
    name: "همایش آموزشی و دورهمی پاییزه سرپرستان پت",
    category: "EVENT",
    lat: 35.75,
    lng: 51.42,
    address: "تهران، بوستان آب و آتش، سالن آمفی‌تئاتر",
    phone: "021-88001100",
    rating: 5.0,
    reviewCount: 22,
    hours: "جمعه ۲۸ مهر • ۱۶:۰۰ الی ۱۹:۰۰",
    isVerified: true,
  },
];

// Haversine Distance Calculator (km)
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function DiscoverPage() {
  const [userLat, setUserLat] = useState<number>(35.758);
  const [userLng, setUserLng] = useState<number>(51.405);
  const [userLocationLabel, setUserLocationLabel] = useState<string>(
    "ونک / میدان ملاصدرا (مرکز تجاری)"
  );
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "VET" | "TRAINER" | "BOARDING" | "EVENT"
  >("ALL");
  const [activeItem, setActiveItem] = useState<ServiceLocationItem | null>(null);

  // Progressive Radius Calculation (5km -> 10km -> 20km -> 0 results)
  const discoveryResult = useMemo(() => {
    // 1. Calculate distance for all locations
    const withDistances = SEED_LOCATIONS.map((loc) => ({
      ...loc,
      distanceKm: calculateHaversineDistance(userLat, userLng, loc.lat, loc.lng),
    })).filter((loc) => {
      if (selectedCategory === "ALL") return true;
      return loc.category === selectedCategory;
    });

    // 2. Step 1: 5 KM
    const within5km = withDistances.filter((loc) => (loc.distanceKm || 0) <= 5.0);
    if (within5km.length > 0) {
      return {
        radiusKm: 5,
        statusType: "FOUND_5KM",
        statusMessage: "نتایج تا ۵ کیلومتری شما",
        items: within5km.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)),
      };
    }

    // 3. Step 2: 10 KM
    const within10km = withDistances.filter((loc) => (loc.distanceKm || 0) <= 10.0);
    if (within10km.length > 0) {
      return {
        radiusKm: 10,
        statusType: "FOUND_10KM",
        statusMessage: "نتیجه‌ای در ۵ کیلومتر پیدا نشد؛ جستجو تا ۱۰ کیلومتر گسترش یافت",
        items: within10km.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)),
      };
    }

    // 4. Step 3: 20 KM
    const within20km = withDistances.filter((loc) => (loc.distanceKm || 0) <= 20.0);
    if (within20km.length > 0) {
      return {
        radiusKm: 20,
        statusType: "FOUND_20KM",
        statusMessage: "نتیجه‌ای تا ۱۰ کیلومتر پیدا نشد؛ جستجو تا ۲۰ کیلومتر گسترش یافت",
        items: within20km.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)),
      };
    }

    // 5. Zero Results beyond 20 KM
    return {
      radiusKm: 20,
      statusType: "ZERO_RESULTS",
      statusMessage: "هیچ مرکزی تا شعاع ۲۰ کیلومتری شما یافت نشد",
      items: [],
    };
  }, [userLat, userLng, selectedCategory]);

  const handleUseBrowserGps = () => {
    if (!navigator.geolocation) {
      alert("مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setUserLocationLabel("موقعیت فعلی مرورگر (GPS)");
        setIsDetectingLocation(false);
      },
      () => {
        setIsDetectingLocation(false);
        alert("دسترسی به مکان‌یابی رد شد. می‌توانید از منوی انتخاب شهر استفاده فرمایید.");
      }
    );
  };

  const handleSelectPresetLocation = (loc: (typeof PRESET_LOCATIONS)[0]) => {
    setUserLat(loc.lat);
    setUserLng(loc.lng);
    setUserLocationLabel(loc.name);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 p-6 md:p-8 rounded-4xl text-white border border-teal-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
            <MapPin className="w-3.5 h-3.5" />
            <span>سامانه کاوش و مکان‌یابی هوشمند بونیو</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black">
            دامپزشکی‌ها، مربیان، پانسیون‌ها و رویدادهای اطراف شما
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            جستجوی پلکانی هوشمند بر اساس فاصله دقیق هوایی با ضمانت کیفیت، پزشکان دارای تاییدیه رسمی و پرونده پزشکی یکپارچه
          </p>
        </div>
      </div>

      {/* Location Bar & Progressive Radius Status */}
      <div className="space-y-3">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-elevated p-4 rounded-3xl border border-border/80 shadow-sm">
          {/* Preset Selector */}
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-muted-foreground shrink-0">موقعیت مبدأ:</span>
            <select
              value={userLocationLabel}
              onChange={(e) => {
                const target = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
                if (target) handleSelectPresetLocation(target);
              }}
              className="text-xs font-bold bg-surface-subtle border border-border/70 rounded-xl py-1.5 px-3 text-foreground flex-1 focus:outline-hidden"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Auto Button */}
          <button
            type="button"
            onClick={handleUseBrowserGps}
            disabled={isDetectingLocation}
            className="py-2 px-4 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border/70 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className={cn("w-3.5 h-3.5 text-blue-600", isDetectingLocation && "animate-spin")} />
            <span>{isDetectingLocation ? "در حال دریافت GPS..." : "موقعیت من (GPS)"}</span>
          </button>
        </div>

        {/* Mandatory Progressive Radius Banner (Section 18) */}
        <div
          className={cn(
            "p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all border",
            discoveryResult.statusType === "FOUND_5KM" &&
              "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
            discoveryResult.statusType === "FOUND_10KM" &&
              "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
            discoveryResult.statusType === "FOUND_20KM" &&
              "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
            discoveryResult.statusType === "ZERO_RESULTS" &&
              "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          )}
        >
          <div className="flex items-center gap-2">
            {discoveryResult.statusType === "ZERO_RESULTS" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{discoveryResult.statusMessage}</span>
          </div>

          <span className="font-mono text-[11px] bg-surface-elevated/80 px-2 py-0.5 rounded-full border border-current">
            شعاع جستجو: {discoveryResult.radiusKm} کیلومتر
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={cn(
            "py-1.5 px-4 rounded-2xl text-xs font-bold transition-all border",
            selectedCategory === "ALL"
              ? "bg-foreground text-background border-foreground shadow-sm"
              : "bg-surface-elevated text-muted-foreground border-border/70 hover:text-foreground"
          )}
        >
          همه خدمات
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("VET")}
          className={cn(
            "py-1.5 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5",
            selectedCategory === "VET"
              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
              : "bg-surface-elevated text-muted-foreground border-border/70 hover:text-foreground"
          )}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>دامپزشکی و بیمارستان‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("TRAINER")}
          className={cn(
            "py-1.5 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5",
            selectedCategory === "TRAINER"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-surface-elevated text-muted-foreground border-border/70 hover:text-foreground"
          )}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>مربیان و رفتارشناسان</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("BOARDING")}
          className={cn(
            "py-1.5 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5",
            selectedCategory === "BOARDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-surface-elevated text-muted-foreground border-border/70 hover:text-foreground"
          )}
        >
          <Home className="w-3.5 h-3.5" />
          <span>پانسیون و نگهداری</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("EVENT")}
          className={cn(
            "py-1.5 px-4 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5",
            selectedCategory === "EVENT"
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-surface-elevated text-muted-foreground border-border/70 hover:text-foreground"
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>رویدادها و دورهمی‌ها</span>
        </button>
      </div>

      {/* Main Grid: Interactive Map + Synchronized Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-surface-elevated p-4 rounded-4xl border border-border/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-foreground">نقشه تعاملی مراکز بونیو (Tehran Geo-Grid)</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              مختصات: {userLat.toFixed(3)}, {userLng.toFixed(3)}
            </span>
          </div>

          {/* Interactive SVG Radar Map */}
          <div className="relative w-full h-80 my-2 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center select-none">
            {/* Radar Grid Circles representing 5km, 10km, 20km */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
              <defs>
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
              </defs>
              <rect width="400" height="300" fill="url(#radarGlow)" />
              {/* Concentric distance rings */}
              <circle cx="200" cy="150" r="45" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              <text x="205" y="112" fill="#10b981" fontSize="9" fontFamily="monospace">
                5 KM
              </text>

              <circle cx="200" cy="150" r="90" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
              <text x="205" y="68" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                10 KM
              </text>

              <circle cx="200" cy="150" r="140" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
              <text x="205" y="20" fill="#ef4444" fontSize="9" fontFamily="monospace">
                20 KM
              </text>

              {/* Crosshair */}
              <line x1="200" y1="0" x2="200" y2="300" stroke="#334155" strokeWidth="1" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#334155" strokeWidth="1" />
            </svg>

            {/* Center User Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
              <span className="text-[9px] text-blue-300 font-bold mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded-sm">
                موقعیت شما
              </span>
            </div>

            {/* Synchronized Service Location Markers */}
            {discoveryResult.items.map((item, idx) => {
              // Project relative offset around center
              const offsetX = (item.lng - userLng) * 1400;
              const offsetY = (userLat - item.lat) * 1400;
              const isSelected = activeItem?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                  }}
                  className={cn(
                    "absolute z-30 transition-all p-1.5 rounded-2xl border flex items-center gap-1 shadow-xl hover:scale-110",
                    item.category === "VET" && "bg-teal-600 text-white border-teal-400",
                    item.category === "TRAINER" && "bg-blue-600 text-white border-blue-400",
                    item.category === "BOARDING" && "bg-amber-600 text-white border-amber-400",
                    item.category === "EVENT" && "bg-purple-600 text-white border-purple-400",
                    isSelected && "ring-4 ring-white scale-125 z-40"
                  )}
                  title={`${item.name} (${item.distanceKm} کیلومتر)`}
                >
                  {item.category === "VET" && <Stethoscope className="w-3.5 h-3.5" />}
                  {item.category === "TRAINER" && <GraduationCap className="w-3.5 h-3.5" />}
                  {item.category === "BOARDING" && <Home className="w-3.5 h-3.5" />}
                  {item.category === "EVENT" && <Calendar className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-bold font-mono px-1">{item.distanceKm}km</span>
                </button>
              );
            })}
          </div>

          {/* Active Marker Preview Dock */}
          {activeItem ? (
            <div className="mt-2 p-3 rounded-2xl bg-surface-subtle border border-border/70 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-foreground">{activeItem.name}</span>
                <p className="text-[11px] text-muted-foreground">{activeItem.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {activeItem.distanceKm} کیلومتر
                </span>
                <Link
                  href={activeItem.category === "VET" ? `/vets` : `/dashboard/care`}
                  className="py-1 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  رزرو نوبت
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground text-center py-2">
              روی هر یک از نشانگرهای نقشه کلیک کنید تا مشخصات مرکز فعال گردد.
            </div>
          )}
        </div>

        {/* Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {discoveryResult.items.length === 0 ? (
            <div className="p-8 rounded-4xl bg-surface-elevated border border-border/80 shadow-sm text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">مرکزی در این محدوده یافت نشد</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                سیاست امنیتی بونیو جستجو را نهایتاً تا سقف ۲۰ کیلومتر مجاز می‌داند. لطفاً موقعیت جغرافیایی دیگری انتخاب فرمایید.
              </p>
              <button
                type="button"
                onClick={() => handleSelectPresetLocation(PRESET_LOCATIONS[0])}
                className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                تغییر به میدان ونک (مرکز)
              </button>
            </div>
          ) : (
            discoveryResult.items.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={cn(
                    "p-5 rounded-3xl bg-surface-elevated border transition-all cursor-pointer space-y-2.5 shadow-sm",
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5"
                      : "border-border/80 hover:border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold text-white",
                            item.category === "VET" && "bg-teal-600",
                            item.category === "TRAINER" && "bg-blue-600",
                            item.category === "BOARDING" && "bg-amber-600",
                            item.category === "EVENT" && "bg-purple-600"
                          )}
                        >
                          {item.category === "VET" && "دامپزشکی"}
                          {item.category === "TRAINER" && "مربیگری"}
                          {item.category === "BOARDING" && "پانسیون"}
                          {item.category === "EVENT" && "رویداد"}
                        </span>
                        {item.isOpen24h && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            ۲۴ ساعته
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-foreground mt-1.5">{item.name}</h3>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {item.distanceKm} km
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">{item.address}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-[10px]">({item.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{item.hours}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
