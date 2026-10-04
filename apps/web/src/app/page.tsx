import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeroIslandBanner } from "@/components/home/hero-island-banner";
import { WhyBonnivoSection } from "@/components/home/why-bonnivo-section";
import { FeaturedProductsRow } from "@/components/home/featured-products-row";
import { PersonalizedProductsSection } from "@/components/home/personalized-products-section";
import { LocalEcosystemSection } from "@/components/home/local-ecosystem-section";
import { CityEventBanner } from "@/components/home/city-event-banner";
import { LatestEventsSection } from "@/components/home/latest-events-section";
import { BestTrainersSection } from "@/components/home/best-trainers-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { PartnerBrandsSection } from "@/components/home/partner-brands-section";
import { PetOnboardingWizard } from "@/components/pet/pet-onboarding-wizard";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 md:gap-14 pb-14">
      
      {/* 1. Hero Section with 3D Island Hotspots & 6-Service Dock */}
      <HeroIslandBanner />

      {/* 2. Four Compact BONNIVO Service/Benefit Cards (Why Bonnivo) */}
      <WhyBonnivoSection />

      {/* 3. Featured Products / Bestselling Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              محصولات برگزیده با تضمین کمترین قیمت
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-light">
              رقابت بهترین پت‌شاپ‌های منتخب در جعبه خرید (Buy Box)
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            <span>مشاهده همه محصولات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Interactive Product Grid */}
        <FeaturedProductsRow />
      </section>

      {/* 6. Personalized Recommendations for the Pet */}
      <PersonalizedProductsSection />

      {/* 7. Local Trusted Veterinary / Boarding Section */}
      <LocalEcosystemSection />

      {/* 8. Small Local Event + Trainer Promo Banner */}
      <CityEventBanner />

      {/* 9. Latest Events */}
      <LatestEventsSection />

      {/* 10. Best Trainers */}
      <BestTrainersSection />

      {/* 11. Reviews / Social Proof / Loyalty */}
      <SocialProofSection />

      {/* 12. Partner Brands (Moved to Bottom per spec) */}
      <PartnerBrandsSection />

      {/* Global Pet Onboarding Wizard Modal */}
      <PetOnboardingWizard />

    </div>
  );
}
