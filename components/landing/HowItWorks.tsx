"use client";

import { ClipboardList, Sparkles, Phone, Rocket, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { steps } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Sparkles,
  Phone,
  Rocket,
};

const stepStyles = [
  {
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-600",
    iconBg: "bg-indigo-500",
    ring: "ring-indigo-100",
    shadow: "shadow-indigo-500/20",
  },
  {
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-600",
    iconBg: "bg-violet-500",
    ring: "ring-violet-100",
    shadow: "shadow-violet-500/20",
  },
  {
    gradient: "from-fuchsia-500 to-pink-500",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    text: "text-fuchsia-600",
    iconBg: "bg-fuchsia-500",
    ring: "ring-fuchsia-100",
    shadow: "shadow-fuchsia-500/20",
  },
  {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    iconBg: "bg-emerald-500",
    ring: "ring-emerald-100",
    shadow: "shadow-emerald-500/20",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 bg-slate-50 overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid-light" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 mb-6">
              <Rocket className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 tracking-wide">
                How It Works
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              From Blank Form to
              <br />
              <span className="gradient-text-dark">Live AI Agent</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              No developers. No prompt engineering. Just describe your business and go.
            </p>
          </div>
        </SectionWrapper>

        {/* Steps — horizontal cards on desktop, vertical on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            const style = stepStyles[index];

            return (
              <SectionWrapper key={step.number} delay={0.12 * index} className="h-full">
                <div
                  className={clsx(
                    "group relative rounded-2xl border bg-white p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 text-center h-full",
                    style.border
                  )}
                >
                  {/* Step number */}
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ring-4 transition-all duration-300 group-hover:scale-110",
                      style.iconBg,
                      style.ring,
                      style.shadow
                    )}
                  >
                    <span className="text-lg font-bold text-white">{step.number}</span>
                  </div>

                  {/* Icon */}
                  {Icon && (
                    <div className={clsx("inline-flex p-2 rounded-lg mb-4", style.bg)}>
                      <Icon className={clsx("w-5 h-5", style.text)} />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connector arrow (hidden on last, shown on lg) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>
              </SectionWrapper>
            );
          })}
        </div>

        {/* CTA */}
        <SectionWrapper delay={0.5}>
          <div className="mt-16 text-center">
            <a
              href="/agents"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold text-[15px] hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-900/20"
            >
              Build My Agent Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
