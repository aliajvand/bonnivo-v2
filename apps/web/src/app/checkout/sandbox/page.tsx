"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

function SandboxContent() {
  const searchParams = useSearchParams();
  const authority = searchParams?.get("Authority") || searchParams?.get("authority") || "MOCK-AUTH-UNKNOWN";
  const amountStr = searchParams?.get("amount") || searchParams?.get("amount_tomans") || "0";
  const amount = parseInt(amountStr, 10) || 0;

  const handlePaySuccess = () => {
    window.location.href = `/checkout/callback?Authority=${authority}&Status=OK`;
  };

  const handlePayCancel = () => {
    window.location.href = `/checkout/callback?Authority=${authority}&Status=NOK`;
  };

  return (
    <div className="w-full max-w-md bg-white border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-foreground space-y-6" dir="rtl">
      {/* Shaparak / Gateway Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center p-2 text-amber-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base text-foreground">درگاه پرداخت اینترنتی شاپرک</h2>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">محیط شبیه‌ساز ایزوله (Sandbox)</p>
          </div>
        </div>
        <Image
          src="/icons/bonnivo-logo-mark.svg"
          alt="بونیو"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>

      {/* Transaction Details */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>پذیرنده اینترنتی:</span>
          <span className="font-bold text-foreground">بونیو کالا (Bonnivo Pet Ecosystem)</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>شناسه ارجاع (Authority):</span>
          <span className="font-mono font-bold text-foreground text-[11px]">{authority}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>مبلغ قابل پرداخت:</span>
          <span className="font-black text-emerald-600 text-sm">{amount.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-2xl p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <span>این درگاه آزمایشی است و هیچ تراکنش مالی واقعی انجام نمی‌شود. پس از کلیک، نتیجه مستقیماً به سرور مرکزی بونیو ارسال و وریفای خواهد شد.</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={handlePaySuccess}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>تأیید و پرداخت موفق (ارسال به سرور و اعتبارسنجی)</span>
        </button>

        <button
          type="button"
          onClick={handlePayCancel}
          className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>انصراف از پرداخت (بازگشت با وضعیت لغو شده)</span>
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSandboxPage() {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-muted">در حال بارگذاری درگاه...</div>}>
        <SandboxContent />
      </Suspense>
    </div>
  );
}
