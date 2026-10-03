import { Metadata } from "next";
import { AdminPanelView } from "@/components/admin/admin-panel-view";

export const metadata: Metadata = {
  title: "پیشخوان مدیریت | بونیو",
  description: "پنل متمرکز مدیریت کاتالوگ، فروشندگان، حل اختلاف و لاگ‌های ممیزی سیستم بونیو",
};

export default function AdminDashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AdminPanelView />
    </div>
  );
}
