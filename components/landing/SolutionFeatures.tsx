"use client";

import { Sparkles, RefreshCw, Mic, BarChart3, Globe, Link2, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { features } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  RefreshCw,
  Mic,
};

const miniFeatures = [
  { icon: BarChart3, label: "Real-time Analytics" },
  { icon: Globe, label: "Multi-language" },
  { icon: Link2, label: "CRM Auto-Sync" },
  { icon: Clock, label: "24/7 Availability" },
];

export function SolutionFeatures() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-[120px]" />

      <Container className="relative z-10">
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="text-sm font-semibold text-indigo-600">
                The Platform
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Agency-Grade AI Agents,{" "}
              <span className="gradient-text">Zero Complexity</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 leading-relaxed">
              Same quality our agency delivered at $5k–$20k per agent. Now yours
              in minutes.
            </p>
          </div>
        </SectionWrapper>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <SectionWrapper key={feature.title} delay={0.1 * index}>
                <div
                  className={clsx(
                    "rounded-2xl p-8 text-white bg-gradient-to-br shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300",
                    feature.gradient
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                    {Icon && <Icon className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SectionWrapper>
            );
          })}
        </div>

        {/* Mini feature badges */}
        <SectionWrapper delay={0.3}>
          <div className="flex flex-wrap justify-center gap-4">
            {miniFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors duration-300"
              >
                <Icon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </Container>
    </section>
  );
}
