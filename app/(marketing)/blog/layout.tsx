import { Metadata } from "next";

const SITE_URL = "https://voiceaiplatform.com";

export const metadata: Metadata = {
  title: "Voice AI Blog — Guides, Strategies & Insights | VoiceAI",
  description:
    "Learn how to build, deploy, and optimize AI phone agents. Guides on AI receptionists, answering services, voice AI for small business, and more.",
  keywords:
    "voice ai blog, ai receptionist guide, ai answering service, ai phone agent, small business automation",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Voice AI Blog — Guides, Strategies & Insights",
    description:
      "Learn how to build, deploy, and optimize AI phone agents. Expert guides on voice AI for business.",
    url: `${SITE_URL}/blog`,
    siteName: "VoiceAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice AI Blog — Guides, Strategies & Insights",
    description:
      "Learn how to build, deploy, and optimize AI phone agents for your business.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
