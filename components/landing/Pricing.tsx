"use client";

import { Check, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { pricingTiers } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {pricingTiers.map((tier, index) => (
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
                    <span className="px-4 py-1 rounded-full gradient-brand text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25">
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
      </div>
    </section>
  );
}
