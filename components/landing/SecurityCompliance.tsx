"use client";

import { Shield, Lock, Eye, FileCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
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
    <section id="security" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-[150px]" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <SectionWrapper>
            <div>
              <div className="inline-flex px-4 py-1.5 rounded-full glass text-sm font-semibold text-cyan-300 mb-6">
                Security & Compliance
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-[var(--font-heading)] tracking-tight mb-4">
                Your Data Is Safe With Us
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Voice AI handles sensitive conversations. We take that seriously
                with enterprise-grade security, transparent policies, and full
                regulatory compliance.
              </p>
            </div>
          </SectionWrapper>

          {/* Right — Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              return (
                <SectionWrapper key={feature.title} delay={0.1 * index}>
                  <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                      {Icon && (
                        <Icon className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </SectionWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
