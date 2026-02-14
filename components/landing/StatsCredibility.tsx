"use client";

import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { platformStats } from "@/lib/constants/landing-data";

export function StatsCredibility() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden gradient-hero">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]" />

      <Container className="relative z-10">
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-[var(--font-heading)] tracking-tight">
              Built by the Team That Did This{" "}
              <span className="gradient-text-warm">60+ Times</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              We were the agency charging $5k–$20k per voice AI agent. Now you
              get the same platform, same expertise, same results.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {platformStats.map((stat, index) => (
            <SectionWrapper key={stat.label} delay={0.1 * index}>
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-colors duration-300">
                <AnimatedCounter
                  value={stat.value}
                  className="block text-4xl sm:text-5xl font-extrabold text-white font-[var(--font-heading)] mb-2"
                />
                <div className="text-base font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-400">{stat.description}</div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
