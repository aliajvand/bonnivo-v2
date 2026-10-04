import { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "تسویه‌حساب و انتخاب زمان تحویل | بونیو",
  description: "انتخاب بازه زمانی تحویل پیک تهران، آدرس و پرداخت اینترنتی امن شاپرک",
};

export default function CheckoutPage() {
  return (
    <div className="w-full min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <CheckoutView />
    </div>
  );
}
