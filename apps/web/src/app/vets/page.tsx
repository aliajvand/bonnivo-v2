"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClinicSummary } from "@/types/vet";
import { fetchClinics } from "@/lib/api/vets";

const TEHRAN_DISTRICTS = [
  "همه مناطق تهران",
  "منطقه ۱ - ولنجک / نیاوران",
  "منطقه ۲ - سعادت‌آباد / شهرک غرب",
  "منطقه ۳ - ظفر / میرداماد",
  "منطقه ۵ - پونک / صادقیه",
  "منطقه ۶ - یوسف‌آباد / امیرآباد",
];

const SERVICE_TAGS = [
  "همه خدمات",
  "جراحی تخصصی",
  "بخش اورژانس ۲۴ ساعته",
  "واکسیناسیون",
  "سونوگرافی و رادیولوژی",
  "دندانپزشکی",
  "گرومینگ و اصلاح",
  "پانسیون",
];

export default function VetsDirectoryPage() {
  const [clinics, setClinics] = useState<ClinicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("همه مناطق تهران");
  const [selectedService, setSelectedService] = useState("همه خدمات");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const districtParam =
        selectedDistrict !== "همه مناطق تهران"
          ? selectedDistrict.split(" - ")[0].trim()
          : undefined;
      const serviceParam =
        selectedService !== "همه خدمات" ? selectedService : undefined;

      const data = await fetchClinics({
        district: districtParam,
        service: serviceParam,
        emergencyOnly,
        query: searchQuery || undefined,
      });
      setClinics(data);
      setLoading(false);
    }
    loadData();
  }, [selectedDistrict, selectedService, emergencyOnly, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-10 text-white shadow-xl mb-8 border border-teal-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <span>🩺</span>
              <span>شبکه سلامت و کلینیک‌های معتمد بونیو</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              رزرو نوبت دامپزشکی و خدمات بالینی تهران
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              جستجو و نوبت‌دهی آنلاین در برترین بیمارستان‌ها و کلینیک‌های تخصصی حیوانات خانگی با پرونده سلامت یکپارچه و تاییدیه رسمی WSAVA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/40 transition-all active:scale-95 border border-teal-400/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>نوبت‌ها و پرونده‌های من</span>
            </Link>

            <Link
              href="/dashboard/care"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 px-4 py-3 text-sm font-semibold text-slate-200 transition-all border border-slate-700"
            >
              <span>داشبورد مراقبت پت</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl mb-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام بیمارستان، کلینیک یا خیابان..."
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-3.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
            >
              {TEHRAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 24h Emergency Filter Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 px-2">
            <span className="text-sm font-medium text-slate-300">
              فقط مراکز اورژانس شبانه‌روزی (۲۴ ساعته)
            </span>
            <button
              type="button"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                emergencyOnly ? "bg-red-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emergencyOnly ? "-translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Service Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">تخصص و خدمت:</span>
          {SERVICE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedService(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedService === tag
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clinics Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-400">در حال جستجوی کلینیک‌های فعال تهران...</p>
        </div>
      ) : clinics.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">کلینیکی با این مشخصات یافت نشد</h3>
          <p className="text-sm">لطفاً فیلتر منطقه یا خدمات را تغییر داده و مجدداً تلاش فرمایید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg hover:border-teal-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="p-6">
                {/* Header Badge & Rating */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-white group-hover:text-teal-300 transition-colors">
                      {clinic.name}
                    </h3>
                    <p className="text-xs text-teal-400 font-medium mt-0.5">{clinic.district}</p>
                  </div>
                  {clinic.isEmergency24h && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"></span>
                      اورژانس ۲۴ ساعته
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  📍 {clinic.address}
                </p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <span>★</span>
                    <span>{clinic.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{clinic.reviewsCount} نظر مراجعین</span>
                  <span>•</span>
                  <span className="text-slate-300 font-mono" dir="ltr">
                    {clinic.phoneNumber}
                  </span>
                </div>

                {/* Services List */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {clinic.services.slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 text-[11px]"
                    >
                      {srv}
                    </span>
                  ))}
                  {clinic.services.length > 3 && (
                    <span className="rounded-lg bg-slate-800/50 text-slate-400 px-2 py-1 text-[11px]">
                      +{clinic.services.length - 3} خدمت دیگر
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80">
                <Link
                  href={`/vets/${clinic.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/40 py-2.5 text-sm font-bold transition-all shadow-sm group-hover:bg-teal-600 group-hover:text-white"
                >
                  <span>مشاهده پزشکان و رزرو شیفت</span>
                  <span>←</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
