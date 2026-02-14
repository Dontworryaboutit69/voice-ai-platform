"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Accordion } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/constants/landing-data";

export function FAQ() {
  return (
    <section id="faq" className="relative py-28 lg:py-36 overflow-hidden bg-slate-50">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Got Questions?
              <br />
              <span className="gradient-text-dark">We&apos;ve Got Answers</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Everything you need to know about our self-learning voice AI platform.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <Accordion items={faqItems} variant="light" />
        </SectionWrapper>
      </div>
    </section>
  );
}
