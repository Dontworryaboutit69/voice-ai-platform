"use client";

import { Sparkles, RefreshCw, Mic, BarChart3, Globe, Link2, Clock } from "lucide-react";
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
  { icon: Globe, label: "20 Concurrent Calls" },
  { icon: Link2, label: "CRM Auto-Sync" },
  { icon: Clock, label: "24/7 Availability" },
];

const cardStyles = [
  {
    bg: "from-indigo-600/20 via-indigo-600/5 to-transparent",
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    bg: "from-violet-600/20 via-violet-600/5 to-transparent",
    border: "border-violet-500/20 hover:border-violet-500/40",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    bg: "from-fuchsia-600/20 via-fuchsia-600/5 to-transparent",
    border: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-400",
  },
];

export function SolutionFeatures() {
  return (
    <section id="features" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/10 blur-[160px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-300 tracking-wide">
                The Platform
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Not a Template.
              <br />
              <span className="gradient-text">Built For Your Business.</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
              Every agent gets custom prompts, learns from real calls, and sounds exactly how you want.
              No cookie-cutter scripts. No technical skills required.
            </p>
          </div>
        </SectionWrapper>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            const style = cardStyles[index];

            return (
              <SectionWrapper key={feature.title} delay={0.12 * index}>
                <div
                  className={clsx(
                    "group relative rounded-2xl border p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl bg-gradient-to-b",
                    style.border,
                    style.bg
                  )}
                >
                  {/* Icon */}
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-8",
                      style.iconBg
                    )}
                  >
                    {Icon && <Icon className={clsx("w-6 h-6", style.iconColor)} />}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 leading-relaxed text-[15px]">
                    {feature.description}
                  </p>

                  {/* Bottom shine line */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </SectionWrapper>
            );
          })}
        </div>

        {/* Mini feature badges */}
        <SectionWrapper delay={0.4}>
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {miniFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/5 hover:border-white/15 transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-white/30" />
                <span className="text-sm font-medium text-white/50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
