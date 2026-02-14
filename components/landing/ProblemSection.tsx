"use client";

import { Code2, Bot, DollarSign } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { problemCards } from "@/lib/constants/landing-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Bot,
  DollarSign,
};

const accentColors: Record<string, { border: string; icon: string; glow: string }> = {
  red: {
    border: "border-red-500/20",
    icon: "text-red-400",
    glow: "bg-red-500/5",
  },
  orange: {
    border: "border-orange-500/20",
    icon: "text-orange-400",
    glow: "bg-orange-500/5",
  },
  yellow: {
    border: "border-yellow-500/20",
    icon: "text-yellow-400",
    glow: "bg-yellow-500/5",
  },
};

export function ProblemSection() {
  return (
    <section className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Subtle warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-red-950/30 blur-[200px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-red-400/80 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              The Problem
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Stop Losing Customers
              <br />
              <span className="text-white/40">to Voicemail</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 leading-relaxed max-w-xl mx-auto">
              Every missed call is lost revenue. Traditional solutions are broken.
            </p>
          </div>
        </SectionWrapper>

        {/* Stacked rows — not a card grid */}
        <div className="space-y-4">
          {problemCards.map((card, index) => {
            const Icon = iconMap[card.icon];
            const accent = accentColors[card.accentColor];

            return (
              <SectionWrapper key={card.title} delay={0.1 * index}>
                <div
                  className={`group relative rounded-2xl border ${accent.border} ${accent.glow} p-8 sm:p-10 transition-all duration-500 hover:border-white/10`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        {Icon && <Icon className={`w-6 h-6 ${accent.icon}`} />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {card.title}
                      </h3>
                      <p className="text-white/40 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Decorative arrow */}
                    <div className="hidden sm:flex flex-shrink-0 w-10 h-10 items-center justify-center rounded-full bg-white/5 text-white/20 group-hover:text-white/40 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
