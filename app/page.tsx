import { About } from "@/components/About";
import { ContactSection } from "@/components/ContactSection";
import { DonationSection } from "@/components/DonationSection";
import { Hero } from "@/components/Hero";
import { ImpactCounter } from "@/components/ImpactCounter";
import { ProvisionSection } from "@/components/ProvisionSection";
import { StickyDonate } from "@/components/StickyDonate";
import { getPublicImpactSafe } from "@/lib/impact";

// Re-render at most every 30s; the counter also polls /api/impact while open.
export const revalidate = 30;

export default async function Home() {
  const impact = await getPublicImpactSafe();
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
