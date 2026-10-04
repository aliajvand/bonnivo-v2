import { TodayCareDashboard } from "@/components/care/today-care-dashboard";
import { PetOnboardingWizard } from "@/components/pet/pet-onboarding-wizard";
import { BonyoCopilotDrawer } from "@/components/care/bonyo-copilot-drawer";
import { PawPointsWidget } from "@/components/dashboard/paw-points-widget";

export const metadata = {
  title: "برنامه مراقبت امروز | بونیو",
  description: "داشبورد مدیریت وظایف روزانه، ورزش، پیاده‌روی و برنامه غذایی پت در بونیو",
};

export default function CarePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
      <PawPointsWidget />
      <TodayCareDashboard />
      <PetOnboardingWizard />
      <BonyoCopilotDrawer />
    </div>
  );
}
