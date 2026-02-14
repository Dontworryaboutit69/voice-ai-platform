"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { platformStats } from "@/lib/constants/landing-data";

export function StatsCredibility() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-black">
      {/* Gradient line top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full bg-indigo-600/10 blur-[160px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[140px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Built by the Team
              <br />
              <span className="gradient-text-warm">That Did This 60+ Times</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              We were the agency charging $5k–$20k per voice AI agent. Now you
              get the same platform, same expertise, same results.
            </p>
          </div>
        </SectionWrapper>

        {/* Stats — clean, not boxy */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {platformStats.map((stat, index) => (
            <SectionWrapper key={stat.label} delay={0.1 * index}>
              <div className="bg-black p-8 lg:p-10 text-center hover:bg-white/[0.02] transition-colors duration-300">
                <AnimatedCounter
                  value={stat.value}
                  className="block text-4xl sm:text-5xl font-extrabold text-white mb-2"
                />
                <div className="text-sm font-semibold text-white/70 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-white/30">{stat.description}</div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
