"use client";

import { Code2, Bot, DollarSign } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { problemCards } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Bot,
  DollarSign,
};

const accentMap: Record<string, { bg: string; text: string; glow: string }> = {
  red: { bg: "bg-red-500/10", text: "text-red-400", glow: "hover:shadow-red-500/10" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", glow: "hover:shadow-orange-500/10" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", glow: "hover:shadow-yellow-500/10" },
};

export function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-red-900/10 blur-[200px]" />

      <Container className="relative z-10">
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-[var(--font-heading)] tracking-tight">
              Stop Losing Customers to Voicemail
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              Every missed call is lost revenue. Traditional solutions are broken.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problemCards.map((card, index) => {
            const Icon = iconMap[card.icon];
            const accent = accentMap[card.accentColor];

            return (
              <SectionWrapper key={card.title} delay={0.1 * index}>
                <div
                  className={clsx(
                    "glass rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl",
                    accent.glow
                  )}
                >
                  <div
                    className={clsx(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                      accent.bg
                    )}
                  >
                    {Icon && <Icon className={clsx("w-7 h-7", accent.text)} />}
                  </div>
                  <h3 className={clsx("text-xl font-bold mb-3", accent.text)}>
                    {card.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </SectionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
