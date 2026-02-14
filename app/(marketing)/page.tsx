import { Hero } from "@/components/landing/Hero";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionFeatures } from "@/components/landing/SolutionFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { Testimonials } from "@/components/landing/Testimonials";
import { StatsCredibility } from "@/components/landing/StatsCredibility";
import { IntegrationsGrid } from "@/components/landing/IntegrationsGrid";
import { SecurityCompliance } from "@/components/landing/SecurityCompliance";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofBar />
      <ProblemSection />
      <SolutionFeatures />
      <HowItWorks />
      <DemoPreview />
      <ComparisonTable />
      <Testimonials />
      <StatsCredibility />
      <IntegrationsGrid />
      <SecurityCompliance />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
