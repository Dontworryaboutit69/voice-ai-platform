"use client";

import { ClipboardList, Sparkles, Phone, Rocket, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { steps } from "@/lib/constants/landing-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Sparkles,
  Phone,
  Rocket,
};

const stepAccents = [
  { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", line: "from-indigo-500/50" },
  { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", line: "from-violet-500/50" },
  { color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", line: "from-fuchsia-500/50" },
  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", line: "from-emerald-500/50" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Gradient line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              From Zero to Live
              <br />
              <span className="gradient-text">in 4 Steps</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              No technical knowledge required. Seriously.
            </p>
          </div>
        </SectionWrapper>

        {/* Steps — vertical layout on all sizes, connected by line */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-violet-500/20 to-emerald-500/30" />

          <div className="space-y-2">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon];
              const accent = stepAccents[index];

              return (
                <SectionWrapper key={step.number} delay={0.12 * index}>
                  <div className="relative flex gap-6 sm:gap-8 group">
                    {/* Step number node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${accent.bg} border ${accent.border} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                      >
                        <span className={`text-lg sm:text-xl font-bold ${accent.color}`}>
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-12 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        {Icon && <Icon className={`w-4 h-4 ${accent.color} opacity-60`} />}
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-white/40 leading-relaxed max-w-md">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </SectionWrapper>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <SectionWrapper delay={0.5}>
          <div className="mt-16 text-center">
            <a
              href="/agents"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10"
            >
              Start Step 1 Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
