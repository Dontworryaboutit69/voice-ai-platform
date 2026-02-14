"use client";

import { Check, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { pricingTiers } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-slate-50">
      <Container>
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Simple, Transparent{" "}
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {pricingTiers.map((tier, index) => (
            <SectionWrapper key={tier.id} delay={0.1 * index}>
              <div
                className={clsx(
                  "relative rounded-2xl border p-8 transition-all duration-300",
                  tier.isPopular
                    ? "border-indigo-200 bg-white shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-100 scale-[1.02] lg:scale-105"
                    : "border-slate-200 bg-white hover:shadow-lg"
                )}
              >
                {/* Popular badge */}
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full gradient-brand text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-slate-900 font-[var(--font-heading)]">
                    {tier.priceLabel}
                  </span>
                  {tier.price !== null && (
                    <span className="text-slate-500 text-sm ml-1">/month</span>
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
                    "group flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                    tier.isPopular
                      ? "gradient-brand text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {tier.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
