"use client";

import { ClipboardList, Sparkles, Phone, Rocket, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { steps } from "@/lib/constants/landing-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Sparkles,
  Phone,
  Rocket,
};

const stepColors = [
  { bg: "bg-indigo-600", ring: "ring-indigo-100" },
  { bg: "bg-violet-600", ring: "ring-violet-100" },
  { bg: "bg-fuchsia-600", ring: "ring-fuchsia-100" },
  { bg: "bg-emerald-600", ring: "ring-emerald-100" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50">
      <Container>
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              From Zero to Live in{" "}
              <span className="gradient-text">4 Steps</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              No technical knowledge required. Seriously.
            </p>
          </div>
        </SectionWrapper>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-0.5 bg-gradient-to-r from-indigo-300 via-violet-300 to-emerald-300" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon];
              const color = stepColors[index];

              return (
                <SectionWrapper key={step.number} delay={0.12 * index}>
                  <div className="relative text-center">
                    {/* Number circle */}
                    <div className="relative mx-auto mb-8">
                      <div
                        className={`w-16 h-16 rounded-full ${color.bg} flex items-center justify-center text-white text-xl font-bold shadow-lg ring-4 ${color.ring} relative z-10 mx-auto`}
                      >
                        {step.number}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      {Icon && (
                        <Icon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
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
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl gradient-brand text-white font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              Start Step 1 Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </SectionWrapper>
      </Container>
    </section>
  );
}
