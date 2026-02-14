"use client";

import { Check, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { pricingTiers } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Subtle glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[180px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Simple, Transparent
              <br />
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {pricingTiers.map((tier, index) => (
            <SectionWrapper key={tier.id} delay={0.1 * index}>
              <div
                className={clsx(
                  "relative rounded-2xl border p-8 transition-all duration-500",
                  tier.isPopular
                    ? "border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-indigo-500/5 to-transparent glow-indigo md:-translate-y-4"
                    : "border-white/10 bg-white/5 hover:border-white/15"
                )}
              >
                {/* Popular badge */}
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full gradient-brand text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-white/30 mt-1">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">
                    {tier.priceLabel}
                  </span>
                  {tier.price !== null && (
                    <span className="text-white/30 text-sm ml-1">/month</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/50">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={tier.cta.href}
                  className={clsx(
                    "group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300",
                    tier.isPopular
                      ? "bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-white/10"
                      : "bg-white/10 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  )}
                >
                  {tier.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
