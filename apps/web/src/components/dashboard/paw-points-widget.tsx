"use client";

import React, { useState } from "react";
import { Award, Sparkles, Flame, Gift, ArrowRight, CheckCircle2, Ticket } from "lucide-react";

export function PawPointsWidget() {
  const [points, setPoints] = useState(350);
  const [streakDays, setStreakDays] = useState(14);
  const [claimed7Days, setClaimed7Days] = useState(true);
  const [claimed30Days, setClaimed30Days] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);

  const handleClaim30 = () => {
    if (!claimed30Days) {
      setPoints((prev) => prev + 250);
      setClaimed30Days(true);
    }
  };

  const handleRedeem = (cost: number, discountTomans: number) => {
    if (points >= cost) {
      setPoints((prev) => prev - cost);
      const code = `PAW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setVoucherCode(code);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-emerald-500/10 border border-amber-500/20 rounded-3xl p-5 shadow-sm text-slate-800" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">باشگاه پاو پوینت بونیو</h3>
            <p className="text-xs text-slate-500">پاداش‌های مراقبت پیوسته و کدهای تخفیف خرید</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm border border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>{points.toLocaleString("fa-IR")} امتیاز</span>
        </div>
      </div>

      {/* Streak Tracker */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/60 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold text-slate-700">استریک مراقبت روزانه: {streakDays} روز متوالی</span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold">مرحله بعدی: ۳۰ روز</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min((streakDays / 30) * 100, 100)}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">استریک ۷ روزه</div>
              <div className="text-[10px] text-emerald-600">+۵۰ پاو پوینت</div>
            </div>
            <span className="text-xs font-bold text-emerald-600">دریافت شد ✓</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">استریک ۳۰ روزه</div>
              <div className="text-[10px] text-amber-600">+۲۵۰ پاو پوینت طلایی</div>
            </div>
            {claimed30Days ? (
              <span className="text-xs font-bold text-emerald-600">دریافت شد ✓</span>
            ) : (
              <button
                onClick={handleClaim30}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-sm transition"
              >
                دریافت جایزه
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Convert to store discount */}
      <div className="flex items-center justify-between bg-teal-900 text-white p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-teal-300" />
          <span className="text-xs font-bold">تبدیل امتیازها به بن تخفیف سبد خرید</span>
        </div>
        <button
          onClick={() => setShowVoucherModal(true)}
          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1"
        >
          تبدیل امتیاز
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative border border-slate-100 text-slate-800">
            <h4 className="font-extrabold text-base mb-1">تبدیل پاو پوینت به بن تخفیف</h4>
            <p className="text-xs text-slate-500 mb-4">موجودی فعلی شما: {points} پاو پوینت</p>

            {voucherCode ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-xs font-bold text-emerald-900">بن تخفیف شما آماده استفاده است!</div>
                <div className="font-mono font-extrabold text-lg text-emerald-700 bg-white p-2 rounded-xl border border-emerald-200 tracking-wider">
                  {voucherCode}
                </div>
                <p className="text-[11px] text-slate-500">کد را در مرحله تسویه‌حساب فروشگاه وارد کنید.</p>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4">
                <button
                  onClick={() => handleRedeem(100, 50000)}
                  disabled={points < 100}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-teal-600 bg-slate-50 hover:bg-teal-50/50 flex items-center justify-between text-xs font-bold transition disabled:opacity-40"
                >
                  <span>۱۰۰ امتیاز = ۵۰,۰۰۰ تومان تخفیف</span>
                  <span className="text-teal-700">تبدیل →</span>
                </button>

                <button
                  onClick={() => handleRedeem(200, 120000)}
                  disabled={points < 200}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-teal-600 bg-slate-50 hover:bg-teal-50/50 flex items-center justify-between text-xs font-bold transition disabled:opacity-40"
                >
                  <span>۲۰۰ امتیاز = ۱۲۰,۰۰۰ تومان تخفیف</span>
                  <span className="text-teal-700">تبدیل →</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowVoucherModal(false);
                setVoucherCode(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
