import { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "سبد خرید متصل به پت | بونیو",
  description: "بررسی اقلام سبد خرید، اتصال هوشمند هر کالا به پرونده پت و محاسبه هزینه ارسال",
};

export default function CartPage() {
  return (
    <div className="w-full min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <CartView />
    </div>
  );
}
