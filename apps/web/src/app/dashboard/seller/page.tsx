import { Metadata } from "next";
import { SellerDashboardView } from "@/components/seller/seller-dashboard-view";

export const metadata: Metadata = {
  title: "پنل فروشندگان و انبارداری | بونیو",
  description: "مدیریت موجودی انبار، به‌روزرسانی قیمت‌ها و ارسال سفارش‌های فروشگاه در بونیو",
};

export default function SellerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <SellerDashboardView />
    </div>
  );
}
