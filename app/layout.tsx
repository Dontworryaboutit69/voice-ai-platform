import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://voiceaiplatform.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "VoiceAI — Build AI Phone Agents That Actually Sound Human",
    template: "%s | VoiceAI",
  },
  description:
    "Build agency-grade voice AI agents for your business. No coding, no complexity. Powered by Claude AI, Retell AI & ElevenLabs. Start free.",
  applicationName: "VoiceAI",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "VoiceAI",
  publisher: "VoiceAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "VoiceAI — Build AI Phone Agents That Actually Sound Human",
    description:
      "Create agency-grade voice AI agents for your business. No coding, no complexity. Start free.",
    type: "website",
    url: SITE_URL,
    siteName: "VoiceAI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceAI — Build AI Phone Agents That Actually Sound Human",
    description:
      "Create agency-grade voice AI agents for your business. No coding, no complexity. Start free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add when available:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* LLM discovery — helps AI search engines find structured info about your site */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM full reference" />
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
