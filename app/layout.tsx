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

export const metadata: Metadata = {
  title: "Voice AI Platform — Build Pro Voice AI Agents in Minutes",
  description:
    "Create agency-grade voice AI agents for your business. No coding, no complexity. Powered by Claude AI, Retell AI & ElevenLabs. Start free.",
  openGraph: {
    title: "Voice AI Platform — Build Pro Voice AI Agents in Minutes",
    description:
      "Create agency-grade voice AI agents for your business. No coding, no complexity. Start free.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voice AI Platform — Build Pro Voice AI Agents in Minutes",
    description:
      "Create agency-grade voice AI agents for your business. No coding, no complexity. Start free.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
