"use client";

import { Shield, Lock, Eye, FileCheck, CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { securityFeatures } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Lock,
  Eye,
  FileCheck,
};

const cardAccents = [
  { iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400", borderHover: "hover:border-cyan-500/30", gradient: "from-cyan-500/20 via-transparent to-transparent" },
  { iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400", borderHover: "hover:border-indigo-500/30", gradient: "from-indigo-500/20 via-transparent to-transparent" },
  { iconBg: "bg-violet-500/10", iconColor: "text-violet-400", borderHover: "hover:border-violet-500/30", gradient: "from-violet-500/20 via-transparent to-transparent" },
  { iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", borderHover: "hover:border-emerald-500/30", gradient: "from-emerald-500/20 via-transparent to-transparent" },
];

export function SecurityCompliance() {
  return (
    <section id="security" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Ambient glows */}
      <div className="absolute top-[20%] left-[-5%] w-[500px] h-[400px] rounded-full bg-cyan-600/10 blur-[160px] animate-breathe" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[300px] rounded-full bg-indigo-600/10 blur-[140px] animate-breathe" style={{ animationDelay: "3s" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 mb-6">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300 tracking-wide">
                Security & Compliance
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Enterprise-Grade
              <br />
              <span className="text-white/40">From Day One</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
              Voice AI handles sensitive conversations. We built security
              and compliance into every layer&mdash;not bolted on as an afterthought.
            </p>
          </div>
        </SectionWrapper>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {securityFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            const accent = cardAccents[index] || cardAccents[0];

            return (
              <SectionWrapper key={feature.title} delay={0.1 * index}>
                <div
                  className={clsx(
                    "group relative rounded-2xl border border-white/10 p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl overflow-hidden",
                    accent.borderHover
                  )}
                >
                  {/* Subtle gradient overlay */}
                  <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", accent.gradient)} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-6", accent.iconBg)}>
                      {Icon && <Icon className={clsx("w-6 h-6", accent.iconColor)} />}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/40 leading-relaxed text-[15px]">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom shine */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </SectionWrapper>
            );
          })}
        </div>

        {/* Trust badges row */}
        <SectionWrapper delay={0.5}>
          <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-white/30">
            {[
              "SOC 2 Certified Infrastructure",
              "AES-256 Encryption",
              "TCPA & GDPR Compliant",
              "99.9% Uptime SLA",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400/60" />
                {item}
              </span>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
