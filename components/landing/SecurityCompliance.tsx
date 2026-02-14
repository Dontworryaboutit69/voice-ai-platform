"use client";

import { Shield, Lock, Eye, FileCheck } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { securityFeatures } from "@/lib/constants/landing-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Lock,
  Eye,
  FileCheck,
};

export function SecurityCompliance() {
  return (
    <section id="security" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Subtle cyan glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-cyan-900/10 blur-[180px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — Text */}
          <SectionWrapper>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-300 tracking-wide">
                  Security & Compliance
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Your Data Is
                <br />
                <span className="text-white/40">Safe With Us</span>
              </h2>
              <p className="text-lg text-white/40 leading-relaxed">
                Voice AI handles sensitive conversations. We take that seriously
                with enterprise-grade security, transparent policies, and full
                regulatory compliance.
              </p>
            </div>
          </SectionWrapper>

          {/* Right — Feature cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            {securityFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              return (
                <SectionWrapper key={feature.title} delay={0.1 * index}>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-white/15 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                      {Icon && (
                        <Icon className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-white/35 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </SectionWrapper>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
