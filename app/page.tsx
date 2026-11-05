import { About } from "@/components/About";
import { ContactSection } from "@/components/ContactSection";
import { DonationSection } from "@/components/DonationSection";
import { Hero } from "@/components/Hero";
import { ImpactCounter } from "@/components/ImpactCounter";
import { ProvisionSection } from "@/components/ProvisionSection";
import { StickyDonate } from "@/components/StickyDonate";
import { DEFAULT_MEAL_COST_KOBO } from "@/lib/config";
import type { PublicImpact } from "@/lib/impact-types";

// Live totals are wired to Neon in a later step; until then they show as loading.
const impact: PublicImpact = {
  historicalRaisedLabel: "₦400,000+",
  historicalStudentsLabel: "300+",
  mealCostKobo: DEFAULT_MEAL_COST_KOBO,
  current: null,
};

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <DonationSection mealCostKobo={impact.mealCostKobo} />
        <ImpactCounter initial={impact} />
        <About />
        <ProvisionSection />
      </main>
      <ContactSection />
      <StickyDonate />
    </>
  );
}
