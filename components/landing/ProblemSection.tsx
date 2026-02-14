"use client";

import { Code2, Bot, DollarSign, X } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { problemCards } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Bot,
  DollarSign,
};

const cardAccents = [
  {
    gradient: "from-red-500 to-orange-500",
    border: "border-red-200",
    iconBg: "bg-red-500",
    tag: "bg-red-100 text-red-600",
    number: "text-red-500/10",
  },
  {
    gradient: "from-orange-500 to-amber-500",
    border: "border-orange-200",
    iconBg: "bg-orange-500",
    tag: "bg-orange-100 text-orange-600",
    number: "text-orange-500/10",
  },
  {
    gradient: "from-amber-500 to-yellow-500",
    border: "border-amber-200",
    iconBg: "bg-amber-500",
    tag: "bg-amber-100 text-amber-600",
    number: "text-amber-500/10",
  },
];

const tagLabels = ["DIY Approach", "Basic AI Tools", "Expensive Agencies"];

const painPoints = [
  { emphasis: "80%", desc: "of callers won\u2019t leave a voicemail" },
  { emphasis: "$5k\u2013$20k", desc: "what agencies charge per AI agent" },
  { emphasis: "0", desc: "generic tools that actually learn" },
];

export function ProblemSection() {
  return (
    <section className="relative py-28 lg:py-36 bg-white overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid-light" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-200 bg-red-50 mb-6">
              <X className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-600 tracking-wide">
                The Problem
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              The Old Way of Handling
              <br />
              <span className="gradient-text-dark">Calls Is Broken</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
              Every option has a catch. Until now.
            </p>
          </div>
        </SectionWrapper>

        {/* Stats ribbon */}
        <SectionWrapper delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-16">
            {painPoints.map((point) => (
              <div key={point.emphasis} className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-red-500">
                  {point.emphasis}
                </span>
                <span className="text-sm text-slate-500 max-w-[140px] leading-tight">
                  {point.desc}
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* Problem cards — bold, colorful on white */}
        <div className="grid md:grid-cols-3 gap-6">
          {problemCards.map((card, index) => {
            const Icon = iconMap[card.icon];
            const accent = cardAccents[index];

            return (
              <SectionWrapper key={card.title} delay={0.15 * index} className="h-full">
                <div
                  className={clsx(
                    "group relative h-full rounded-2xl border p-8 lg:p-10 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden flex flex-col",
                    accent.border
                  )}
                >
                  {/* Large background number */}
                  <span
                    className={clsx(
                      "absolute top-4 right-6 text-[120px] font-extrabold leading-none select-none pointer-events-none",
                      accent.number
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Icon */}
                  <div
                    className={clsx(
                      "relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                      accent.iconBg
                    )}
                  >
                    {Icon && <Icon className="w-7 h-7 text-white" />}
                  </div>

                  {/* Tag */}
                  <div
                    className={clsx(
                      "inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4",
                      accent.tag
                    )}
                  >
                    {tagLabels[index]}
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-bold text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="relative text-slate-500 leading-relaxed flex-1">
                    {card.description}
                  </p>

                  {/* Bottom gradient line */}
                  <div
                    className={clsx(
                      "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      accent.gradient
                    )}
                  />
                </div>
              </SectionWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
