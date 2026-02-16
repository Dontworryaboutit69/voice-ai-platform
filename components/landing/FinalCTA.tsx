"use client";

import { ArrowRight, Check } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export function FinalCTA() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-black">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Breathing orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-500/15 blur-[160px] animate-breathe" />
        <div
          className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[140px] animate-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Stop Paying Agency Prices
              <br />
              <span className="text-white/40">for What Takes 5 Minutes to Build</span>
            </h2>
            <p className="mt-6 text-xl text-white/40 max-w-xl mx-auto leading-relaxed">
              Custom prompts. Self-learning AI. Thousands of voices. The same quality
              that used to cost $5k&ndash;$20k&mdash;free to start.
            </p>

            <div className="mt-10">
              <a
                href="/onboarding"
                className="group inline-flex items-center gap-3 px-10 py-4.5 rounded-xl bg-white text-slate-900 font-bold text-lg shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Trust pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/30">
              {[
                "No credit card required",
                "Custom-built in 5 minutes",
                "Self-learning from day one",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400/60" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
