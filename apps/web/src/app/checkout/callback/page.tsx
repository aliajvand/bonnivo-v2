"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { verifyServerPayment, PaymentVerifyResult } from "@/lib/api/checkout";
import { useCart } from "@/context/cart-context";

function CheckoutCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const authority = searchParams?.get("Authority") || searchParams?.get("authority");
  const status = searchParams?.get("Status") || searchParams?.get("status");

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyResult, setVerifyResult] = useState<PaymentVerifyResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function executeVerification() {
      if (!authority || !status) {
        setIsVerifying(false);
        setErrorMessage("اطلاعات بازگشت از درگاه پرداخت نامعتبر یا ناقص است.");
        return;
      }

      if (status.toUpperCase() !== "OK") {
        setIsVerifying(false);
        setErrorMessage("تراکنش توسط کاربر لغو شد یا درگاه بانکی پرداخت را تایید نکرد.");
        return;
      }

      try {
        const res = await verifyServerPayment(authority, status);
        if (isMounted) {
          if (res.success && res.data) {
            setVerifyResult(res.data);
            clearCart();
            // Automatically redirect to success page after 2 seconds
            setTimeout(() => {
              router.push(`/checkout/success?order_id=${res.data?.order_id}&ref_id=${res.data?.payment_ref_id}`);
            }, 1800);
          } else {
            setErrorMessage(res.error || "خطای اعتبارسنجی پرداخت در سرور مرکزی.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "خطای ناشناخته در ارتباط با سرور تایید پرداخت.");
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [authority, status, clearCart, router]);

  return (
    <div className="w-full max-w-md bg-white border border-[#c3c4c7] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
      {/* Loading State */}
      {isVerifying && (
        <div className="space-y-4 py-8">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <h2 className="text-base font-bold text-foreground">در حال استعلام و اعتبارسنجی قطعی از شاپرک...</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            لطفاً صفحه را نبندید و دکمه بازگشت مرورگر را نزنید. تراکنش شما در حال تایید با سامانه بانکی است.
          </p>
        </div>
      )}

      {/* Success State */}
      {!isVerifying && verifyResult && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-black text-emerald-700">پرداخت با موفقیت تایید شد!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {verifyResult.message || "سفارش شما در سامانه بونیو ثبت قطعی شد و مراحل ارسال با پیک اختصاصی آغاز گردید."}
          </p>

          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-xs space-y-2 font-mono text-neutral-700">
            <div className="flex justify-between">
              <span className="font-sans text-neutral-500">شماره سفارش:</span>
              <span className="font-bold">{verifyResult.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-neutral-500">کد پیگیری بانکی:</span>
              <span className="font-bold text-emerald-700">{verifyResult.payment_ref_id}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2">
              <span className="font-sans text-neutral-500">مبلغ پرداختی:</span>
              <span className="font-bold font-sans">
                {verifyResult.total_amount_tomans.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/checkout/success?order_id=${verifyResult.order_id}&ref_id=${verifyResult.payment_ref_id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              <span>مشاهده فاکتور و رهگیری سفارش</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Failed State */}
      {!isVerifying && errorMessage && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-black text-rose-700">پرداخت انجام نشد</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>

          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 text-right">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
            <span>اقلام سبد خرید شما کاملاً دست‌نخورده محفوظ مانده است. می‌توانید مجدداً اقدام فرمایید.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/cart"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-2xl transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>بازگشت به سبد خرید</span>
            </Link>
            <Link
              href="/checkout"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition-colors"
            >
              <span>تلاش مجدد تسویه‌حساب</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#2c3338] dir-rtl">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white border border-[#c3c4c7] rounded-3xl p-8 shadow-xl text-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-foreground">در حال بارگذاری اطلاعات درگاه...</h2>
          </div>
        }
      >
        <CheckoutCallbackContent />
      </Suspense>
    </div>
  );
}
