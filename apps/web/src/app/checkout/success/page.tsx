import { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccessView } from "@/components/checkout/checkout-success-view";

export const metadata: Metadata = {
  title: "تأیید سفارش | بونیو",
  description: "سفارش شما با موفقیت ثبت شد و به برنامه مراقبت پت اضافه گردید",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="w-full min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="w-full max-w-xl mx-auto py-16 text-center text-xs text-muted-foreground">
            در حال بارگذاری جزئیات سفارش...
          </div>
        }
      >
        <CheckoutSuccessView />
      </Suspense>
    </div>
  );
}
