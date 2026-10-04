import { OwnerPassportManager } from "@/components/passport/owner-passport-manager";
import { PetOnboardingWizard } from "@/components/pet/pet-onboarding-wizard";

export const metadata = {
  title: "مدیریت پاسپورت QR و وضعیت گمشده | بونیو",
  description: "مدیریت پلاک هوشمند قلاده، چاپ تگ QR و اعلام وضعیت اضطراری گمشده برای پت در بونیو",
};

export default function PassportPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <OwnerPassportManager />
      <PetOnboardingWizard />
    </div>
  );
}
