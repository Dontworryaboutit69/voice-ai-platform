"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { platformStats } from "@/lib/constants/landing-data";

export function StatsCredibility() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden gradient-stats-bg">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              We Used to Charge
              <br />
              <span className="text-white/80">$5k&ndash;$20k for This</span>
            </h2>
            <p className="mt-6 text-xl text-white/70">
              We built custom voice AI agents for businesses&mdash;the discovery calls,
              the revisions, $5k&ndash;$20k per build. Now you skip all of that and build it yourself in 5 minutes.
            </p>
          </div>
        </SectionWrapper>

        {/* Stats grid — clean white cards on gradient */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platformStats.map((stat, index) => (
            <SectionWrapper key={stat.label} delay={0.1 * index}>
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-8 text-center hover:bg-white/20 transition-all duration-300">
                <AnimatedCounter
                  value={stat.value}
                  className="block text-4xl sm:text-5xl font-extrabold text-white mb-2"
                />
                <div className="text-sm font-semibold text-white/90 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-white/60">{stat.description}</div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
