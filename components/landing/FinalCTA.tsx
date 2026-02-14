"use client";

import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 animate-gradient" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/10 blur-[100px] animate-float" />
        <div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/10 blur-[100px] animate-float-reverse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      <Container className="relative z-10">
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-[var(--font-heading)] tracking-tight leading-tight">
              Every Missed Call Is a Lost Customer
            </h2>
            <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Build your agent in 5 minutes. Test it free. No credit card
              required.
            </p>

            <div className="mt-10">
              <a
                href="/agents"
                className="group inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
              {[
                "No credit card required",
                "Setup in 5 minutes",
                "Cancel anytime",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-white/60 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </Container>
    </section>
  );
}
