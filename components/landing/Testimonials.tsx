"use client";

import { Star, Play, Quote } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { testimonials } from "@/lib/constants/landing-data";

export function Testimonials() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Ambient glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[160px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Loved by <span className="gradient-text">Businesses</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Real results from real businesses using our platform.
            </p>
          </div>
        </SectionWrapper>

        {/* Testimonial cards — staggered layout */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, index) => (
            <SectionWrapper key={t.id} delay={0.1 * index}>
              <div
                className={`relative rounded-2xl border border-white/8 bg-white/[0.02] p-8 transition-all duration-500 hover:border-white/15 hover:bg-white/[0.04] ${
                  index === 1 ? "md:translate-y-8" : ""
                }`}
              >
                {/* Video badge */}
                {t.isVideo && (
                  <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-white/60 ml-0.5" fill="currentColor" />
                  </div>
                )}

                {/* Quote icon */}
                <Quote className="w-8 h-8 text-white/8 mb-6" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-white/60 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Metric */}
                {t.metric && (
                  <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                    {t.metric}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {t.authorName}
                    </div>
                    <div className="text-xs text-white/30">
                      {t.authorRole}, {t.company}
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
