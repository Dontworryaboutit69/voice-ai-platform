import { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionFeatures } from "@/components/landing/SolutionFeatures";
import { AgentShowcase } from "@/components/landing/AgentShowcase";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { QuizFunnel } from "@/components/landing/QuizFunnel";
import { Testimonials } from "@/components/landing/Testimonials";
import { StatsCredibility } from "@/components/landing/StatsCredibility";
import { IntegrationsGrid } from "@/components/landing/IntegrationsGrid";
import { SecurityCompliance } from "@/components/landing/SecurityCompliance";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { faqItems } from "@/lib/constants/landing-data";
import {
  organizationSchema,
  websiteSchema,
  softwareSchema,
  faqSchema,
  serviceSchema,
} from "@/lib/seo/structured-data";

const SITE_URL = "https://voiceaiplatform.com";

export const metadata: Metadata = {
  title:
    "VoiceAI — Build AI Phone Agents That Actually Sound Human | AI Receptionist Platform",
  description:
    "Build agency-grade AI phone agents in under 5 minutes. Self-learning AI receptionists that book appointments, qualify leads & answer calls 24/7. 1,000+ voices, real calendar integrations. Start free.",
  keywords:
    "ai receptionist, ai phone agent, voice ai platform, ai answering service, ai phone answering, virtual receptionist ai, ai call agent, automated phone system, ai appointment booking",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "VoiceAI — Build AI Phone Agents That Actually Sound Human",
    description:
      "Build agency-grade AI phone agents in under 5 minutes. Self-learning AI, 1,000+ voices, real integrations. Start free.",
    url: SITE_URL,
    siteName: "VoiceAI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceAI — Build AI Phone Agents That Actually Sound Human",
    description:
      "Build agency-grade AI phone agents in under 5 minutes. Self-learning AI, 1,000+ voices. Start free.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data — Organization, Website, Software, FAQ, Service */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(faqItems.map((f) => ({ question: f.question, answer: f.answer })))
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema()),
        }}
      />

      <Hero />
      <SocialProofBar />
      <ProblemSection />
      <SolutionFeatures />
      <AgentShowcase />
      <DemoPreview />
      <HowItWorks />
      <ComparisonTable />
      <QuizFunnel />
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
