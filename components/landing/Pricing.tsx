"use client";

import { Check, ArrowRight, Star } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { pricingTiers } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      {/* Subtle bg accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-indigo-100/40 blur-[140px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-100/30 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Agency Quality.
              <br />
              <span className="gradient-text-dark">SaaS Pricing.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              The exact same process that cost $5k&ndash;$20k per agent. Now start for free.
            </p>
          </div>
        </SectionWrapper>

        {/* Top row: Starter + Pro + Business */}
        <div className="grid md:grid-cols-3 gap-5 items-start mb-5">
          {pricingTiers.slice(0, 3).map((tier, index) => (
            <SectionWrapper key={tier.id} delay={0.1 * index}>
              <div
                className={clsx(
                  "relative rounded-2xl border p-8 transition-all duration-500",
                  tier.isPopular
                    ? "border-indigo-300 bg-gradient-to-b from-indigo-50 to-white shadow-xl shadow-indigo-100 md:-translate-y-4 ring-1 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                )}
              >
                {/* Popular badge */}
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full gradient-brand text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {tier.priceLabel}
                  </span>
                  {tier.price !== null && tier.price > 0 && (
                    <span className="text-slate-400 text-sm ml-1">/month</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={tier.cta.href}
                  className={clsx(
                    "group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300",
                    tier.isPopular
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  )}
                >
                  {tier.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </SectionWrapper>
          ))}
        </div>

        {/* Enterprise — full width banner */}
        {pricingTiers[3] && (
          <SectionWrapper delay={0.35}>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-8 lg:p-10 hover:border-slate-300 hover:shadow-lg transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* Left — info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {pricingTiers[3].name}
                    </h3>
                    <span className="px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                      Custom
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 max-w-lg">
                    {pricingTiers[3].description}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {pricingTiers[3].features.slice(0, 4).map((feature) => (
                      <span key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right — CTA */}
                <div className="flex-shrink-0">
                  <a
                    href={pricingTiers[3].cta.href}
                    className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all duration-300"
                  >
                    {pricingTiers[3].cta.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </SectionWrapper>
        )}
      </div>
    </section>
  );
}
