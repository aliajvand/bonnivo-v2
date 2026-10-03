"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  Info,
  CheckCircle2,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  X,
  Search,
} from "lucide-react";
import { FeatureFlagGuard } from "@/components/common/feature-flag-guard";

interface AdoptionPet {
  id: string;
  publisher_id: string;
  pet_name: string;
  species: string;
  breed: string;
  age_months: number;
  sex: string;
  description: string;
  city: string;
  district?: number;
  health_status: string;
  vaccination_status: string;
  is_neutered: boolean;
  adoption_fee_tomans: number;
  status: string;
  photo_url?: string;
  created_at: string;
}

export default function AdoptionPortalPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<string>("ALL");
  const [selectedPet, setSelectedPet] = useState<AdoptionPet | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appForm, setAppForm] = useState({
    name: "",
    phone: "",
    experience: "1",
    hasOtherPets: false,
    housingType: "آپارتمان",
    motivation: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo initial listings
  const [listings, setListings] = useState<AdoptionPet[]>([
    {
      id: "adopt-1",
      publisher_id: "user-1",
      pet_name: "میشا",
      species: "CAT",
      breed: "DSH ایرانی حمایتی",
      age_months: 8,
      sex: "FEMALE",
      description: "میشا گربه بسیار آرام و مهربانی است که از آسیب خیابان نجات یافته و درمان کامل شده است.",
      city: "تهران",
      district: 2,
      health_status: "سلامت کامل، انگل‌تراپی انجام شده",
      vaccination_status: "واکسیناسیون ۲ دوز اولیه کامل",
      is_neutered: true,
      adoption_fee_tomans: 0,
      status: "AVAILABLE",
      photo_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop",
      created_at: new Date().toISOString(),
    },
    {
      id: "adopt-2",
      publisher_id: "user-2",
      pet_name: "تدی",
      species: "DOG",
      breed: "میکس تریر امدادی",
      age_months: 14,
      sex: "MALE",
      description: "تدی باهوش و بسیار خوش‌اخلاق است. به فرد یا خانواده‌ای متعهد و دارای شرایط واگذار می‌شود.",
      city: "تهران",
      district: 5,
      health_status: "چکاپ دوره‌ای کامل و شناسنامه‌دار",
      vaccination_status: "هاری و چندگانه سالانه تزریق شده",
      is_neutered: true,
      adoption_fee_tomans: 0,
      status: "AVAILABLE",
      photo_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop",
      created_at: new Date().toISOString(),
    },
    {
      id: "adopt-3",
      publisher_id: "user-3",
      pet_name: "سیمبا",
      species: "CAT",
      breed: "بریتیش مو کوتاه (واگذاری امدادی)",
      age_months: 18,
      sex: "MALE",
      description: "صاحب قبلی به دلیل مهاجرت واگذار کرده است. کاملاً خانگی و نیازمند سرپرست دلسوز.",
      city: "تهران",
      district: 1,
      health_status: "سالم با پرونده پزشکی معتبر در بیمارستان پایتخت",
      vaccination_status: "واکسیناسیون کامل",
      is_neutered: true,
      adoption_fee_tomans: 0,
      status: "AVAILABLE",
      photo_url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop",
      created_at: new Date().toISOString(),
    },
  ]);

  const filteredListings = listings.filter((item) => {
    if (selectedSpecies === "ALL") return true;
    return item.species === selectedSpecies;
  });

  const handleOpenApplication = (pet: AdoptionPet) => {
    setSelectedPet(pet);
    setIsApplying(true);
    setSubmitSuccess(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitSuccess(true);
    }, 600);
  };

  return (
    <FeatureFlagGuard
      moduleKey="adopt"
      moduleTitleFa="سامانه امداد و سرپرستی رایگان"
      descriptionFa="پلتفرم واگذاری اخلاقی حیوانات خانگی بونیو پس از تکمیل اعتبارسنجی احراز هویت سرپرستان و هماهنگی با پناهگاه‌های رسمی فعال خواهد شد."
    >
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-20" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/care"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              ← بازگشت به داشبورد
            </Link>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </span>
              <div>
                <h1 className="font-extrabold text-lg text-slate-900">مرکز واگذاری و امداد اخلاقی بونیو</h1>
                <p className="text-xs text-slate-500">پلتفرم نجات، توانبخشی و سرپرستی رایگان حیوانات خانگی</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            تضمین ۱۰۰٪ رایگان و غیرتجاری
          </div>
        </div>
      </header>

      {/* Ethical Charter Warning Banner */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-bold">منشور اخلاقی سرپرستی بونیو:</strong> خرید، فروش، توله‌کشی و هرگونه معامله
            تجاری حیوانات خانگی در اکوسیستم بونیو <span className="underline font-bold">اکیداً ممنوع</span> است.
            تمامی آگهی‌های این بخش رایگان بوده و متقاضیان پس از بررسی صلاحیت اخلاقی و محیطی توسط سرپرست قبلی انتخاب
            می‌شوند.
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "ALL", label: "همه فرشته‌ها" },
            { id: "CAT", label: "گربه‌ها" },
            { id: "DOG", label: "سگ‌ها" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpecies(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                selectedSpecies === tab.id
                  ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          نمایش {filteredListings.length} مورد آماده سرپرستی
        </div>
      </div>

      {/* Listings Grid */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all flex flex-col"
            >
              {/* Pet Photo */}
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                {pet.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pet.photo_url}
                    alt={pet.pet_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    بدون تصویر
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-800 shadow-sm">
                  {pet.species === "CAT" ? "گربه" : "سگ"} • {pet.breed}
                </div>
                <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  واگذاری رایگان (۰ تومان)
                </div>
              </div>

              {/* Pet Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-lg text-slate-900">{pet.pet_name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                      {pet.age_months} ماهه ({pet.sex === "FEMALE" ? "ماده" : "نر"})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {pet.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        {pet.city} {pet.district ? `(منطقه ${pet.district})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{pet.health_status}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{pet.vaccination_status}</span>
                    </div>
                    {pet.is_neutered && (
                      <div className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        عقیم شده ✓
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApplication(pet)}
                  className="w-full mt-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  درخواست سرپرستی و پر کردن فرم
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Application Drawer / Modal */}
      {isApplying && selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsApplying(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-900">درخواست شما با موفقیت ثبت شد!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  فرم سنجش صلاحیت سرپرستی برای سرپرست فعلی {selectedPet.pet_name} ارسال شد. پس از بررسی شرایط محیطی با
                  شما تماس گرفته خواهد شد.
                </p>
                <button
                  onClick={() => setIsApplying(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  متوجه شدم
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                    <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      فرم پذیرش سرپرستی {selectedPet.pet_name}
                    </h3>
                    <p className="text-xs text-slate-500">واگذاری ۱۰۰٪ رایگان و حمایتی</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نام و نام خانوادگی متقاضی</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: کیانوش محمدی"
                      value={appForm.name}
                      onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">شماره همراه تماس</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912..."
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-600 text-xs"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">سابقه نگهداری پت (سال)</label>
                      <input
                        type="number"
                        min="0"
                        value={appForm.experience}
                        onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">نوع محل سکونت</label>
                      <select
                        value={appForm.housingType}
                        onChange={(e) => setAppForm({ ...appForm, housingType: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-600 text-xs"
                      >
                        <option value="آپارتمان">آپارتمان</option>
                        <option value="خانه ویلایی">خانه ویلایی با حیاط</option>
                        <option value="باغ / فضای باز">باغ محصور</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      انگیزه و شرایط شما برای پذیرش سرپرستی
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="درباره فضای زندگی، حضور اعضای خانواده و تعهدات درمانی توضیح دهید..."
                      value={appForm.motivation}
                      onChange={(e) => setAppForm({ ...appForm, motivation: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-teal-600 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] leading-relaxed">
                    من متعهد می‌شوم که صلاحیت نگهداری این حیوان را داشته و از هرگونه خرید، فروش یا رهاسازی خودداری
                    نمایم.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition disabled:opacity-50"
                  >
                    {loading ? (
                      "در حال ارسال فرم..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ارسال رسمی درخواست سرپرستی
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </FeatureFlagGuard>
  );
}
