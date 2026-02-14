"use client";

import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Accordion } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/constants/landing-data";

export function FAQ() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-white">
      <Container size="narrow">
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Everything you need to know before getting started.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <Accordion items={faqItems} />
        </SectionWrapper>
      </Container>
    </section>
  );
}
