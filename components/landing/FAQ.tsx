"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Accordion } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/constants/landing-data";

export function FAQ() {
  return (
    <section id="faq" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Frequently Asked
              <br />
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Everything you need to know before getting started.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <Accordion items={faqItems} />
        </SectionWrapper>
      </div>
    </section>
  );
}
