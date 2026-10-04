"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PetFoodSubscriptionItem, SubscriptionFrequency } from "@/types/subscription";
import {
  fetchMySubscriptions,
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/lib/api/subscriptions";
import { usePet } from "@/context/pet-context";

const POPULAR_FOODS = [
  {
    id: "royal-canin-golden-retriever",
    title: "غذای خشک سگ بالغ گلدن رتریور رویال کنین",
    weightVariant: "۱۲ کیلوگرم",
    weightKg: 12.0,
    priceToman: 4650000,
    defaultDailyGrams: 350,
  },
  {
    id: "pro-plan-sterilised-cat",
    title: "غذای خشک گربه عقیم‌شده پروپلن مدل سالمون",
    weightVariant: "۳ کیلوگرم",
    weightKg: 3.0,
    priceToman: 1980000,
    defaultDailyGrams: 55,
  },
  {
    id: "reflex-plus-mini-dog",
    title: "غذای خشک سگ نژاد کوچک رفلکس پلاس با گوشت بره",
    weightVariant: "۳ کیلوگرم",
    weightKg: 3.0,
    priceToman: 1450000,
    defaultDailyGrams: 80,
  },
];

export default function SubscriptionsDashboardPage() {
  const { pets, activePet } = usePet();
  const [subscriptions, setSubscriptions] = useState<PetFoodSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New subscription form
  const [selectedPetId, setSelectedPetId] = useState(activePet?.id || "");
  const [selectedFoodId, setSelectedFoodId] = useState(POPULAR_FOODS[0].id);
  const [dailyGrams, setDailyGrams] = useState(POPULAR_FOODS[0].defaultDailyGrams);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("MONTHLY");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین، کوچه دوم، پلاک ۸"
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchMySubscriptions();
      setSubscriptions(data);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (activePet && !selectedPetId) {
      setSelectedPetId(activePet.id);
    }
  }, [activePet, selectedPetId]);

  const selectedFood = POPULAR_FOODS.find((f) => f.id === selectedFoodId) || POPULAR_FOODS[0];
  const calculatedDays = Math.max(
    7,
    Math.round((selectedFood.weightKg * 1000) / Math.max(1, dailyGrams))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !deliveryAddress.trim()) return;

    setSubmitting(true);
    try {
      const newSub = await createSubscription({
        petId: selectedPetId,
        productId: selectedFood.id,
        productTitleFa: selectedFood.title,
        weightVariantText: selectedFood.weightVariant,
        packageWeightKg: selectedFood.weightKg,
        dailyConsumptionGrams: dailyGrams,
        unitPriceToman: selectedFood.priceToman,
        frequency,
        deliveryAddress: deliveryAddress.trim(),
      });
      setSubscriptions((prev) => [newSub, ...prev]);
      setIsModalOpen(false);
    } catch {
      // Ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handlePause = async (id: string) => {
    const ok = await pauseSubscription(id);
    if (ok) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "PAUSED" as const } : s))
      );
    }
  };

  const handleResume = async (id: string) => {
    const ok = await resumeSubscription(id);
    if (ok) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "ACTIVE" as const } : s))
      );
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("آیا از لغو اشتراک شارژ خودکار اطمینان دارید؟")) return;
    const ok = await cancelSubscription(id);
    if (ok) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "CANCELLED" as const } : s))
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-10 text-white shadow-xl mb-8 border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span>🔄</span>
              <span>موتور شارژ خودکار دوره‌ای (Auto-Replenish)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              اشتراک‌های دوره‌ای غذای حیوان خانگی
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              ارسال خودکار غذا و مکمل بر اساس الگوریتم هوشمند مصرف روزانه، بدون نگرانی از اتمام غذای پت، با تخفیف دائمی ۸٪ ویژه مشترکین.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400/30"
          >
            <span>+ فعال‌سازی اشتراک جدید</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-slate-400">در حال دریافت وضعیت اشتراک‌های دوره‌ای...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-bold text-white mb-2">هنوز اشتراک شارژ خودکاری فعال نکرده‌اید</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            با فعال‌سازی شارژ خودکار، غذای تازه پت شما پیش از اتمام به صورت دوره‌ای تحویل داده می‌شود.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
          >
            افزودن اولین اشتراک خودکار
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-emerald-500/40 transition-all"
            >
              {/* Product & Pet Info */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-lg text-white">{sub.productTitleFa}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : sub.status === "PAUSED"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {sub.status === "ACTIVE"
                      ? "فعال و در جریان"
                      : sub.status === "PAUSED"
                      ? "متوقف موقت"
                      : "لغو شده"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>🐾 برای پت: <strong className="text-slate-200">{sub.petName}</strong></span>
                  <span>•</span>
                  <span>وزن بسته: <strong className="text-slate-200">{sub.weightVariantText}</strong></span>
                  <span>•</span>
                  <span>
                    مصرف روزانه: <strong className="text-emerald-400">{sub.dailyConsumptionGrams} گرم</strong>
                  </span>
                  <span>•</span>
                  <span>
                    دوره مصرف بسته: <strong className="text-slate-200">{sub.daysDuration} روز</strong>
                  </span>
                </div>

                {/* Progress bar of food consumption */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>تحویل بعدی: <strong className="text-teal-300 font-bold">{sub.nextDeliveryDate}</strong></span>
                    <span>چرخه: {sub.frequency === "MONTHLY" ? "ماهیانه" : sub.frequency === "EVERY_2_WEEKS" ? "هر ۲ هفته" : "هر ۲ ماه"}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        sub.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-600"
                      }`}
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400">📍 آدرس ارسال: {sub.deliveryAddress}</p>
              </div>

              {/* Price & Action Controls */}
              <div className="flex flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] text-slate-400 block">مبلغ هر دوره با ۸٪ تخفیف:</span>
                  <span className="text-lg font-extrabold text-white">
                    {sub.unitPriceToman.toLocaleString("fa-IR")} تومان
                  </span>
                  <span className="block text-[10px] text-emerald-400 mt-0.5">✓ ارسال اکسپرس رایگان</span>
                </div>

                <div className="flex items-center gap-2">
                  {sub.status === "ACTIVE" && (
                    <button
                      onClick={() => handlePause(sub.id)}
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-4 py-2 text-xs font-bold transition-all active:scale-95"
                    >
                      توقف موقت
                    </button>
                  )}

                  {sub.status === "PAUSED" && (
                    <button
                      onClick={() => handleResume(sub.id)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-4 py-2 text-xs font-bold transition-all active:scale-95"
                    >
                      فعال‌سازی مجدد
                    </button>
                  )}

                  {sub.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white px-3.5 py-2 text-xs font-semibold transition-all active:scale-95"
                    >
                      لغو اشتراک
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-extrabold text-lg text-white">فعال‌سازی شارژ خودکار دوره‌ای</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Pet selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">حیوان خانگی:</label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.breed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Food package selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">بسته غذای خشک:</label>
                <select
                  value={selectedFoodId}
                  onChange={(e) => {
                    const f = POPULAR_FOODS.find((item) => item.id === e.target.value);
                    setSelectedFoodId(e.target.value);
                    if (f) setDailyGrams(f.defaultDailyGrams);
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {POPULAR_FOODS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.weightVariant}) - {f.priceToman.toLocaleString("fa-IR")} تومان
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily consumption */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مصرف روزانه (گرم):</label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={dailyGrams}
                    onChange={(e) => setDailyGrams(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">بازه تحویل:</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as SubscriptionFrequency)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MONTHLY">ماهیانه (توصیه‌شده)</option>
                    <option value="EVERY_2_WEEKS">هر ۲ هفته یک‌بار</option>
                    <option value="EVERY_2_MONTHS">هر ۲ ماه یک‌بار</option>
                  </select>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">آدرس تحویل دوره‌ای:</label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Calculation review */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>محاسبه اتمام بسته:</span>
                  <span className="font-bold text-white">{calculatedDays} روز پس از تحویل</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>تخفیف ویژه اشتراک دائمی:</span>
                  <span className="font-bold text-emerald-400">۸٪ تخفیف سیستمی</span>
                </div>
                <div className="flex justify-between text-white font-extrabold pt-2 border-t border-emerald-500/20 text-sm">
                  <span>مبلغ پرداختی هر دوره:</span>
                  <span>{selectedFood.priceToman.toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50 text-sm"
              >
                {submitting ? "در حال ثبت اشتراک..." : "تأیید و شروع اشتراک دوره‌ای"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
