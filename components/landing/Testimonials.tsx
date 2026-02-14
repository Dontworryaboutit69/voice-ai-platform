"use client";

import { Star, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { testimonials } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const accentBorders = [
  "border-t-indigo-500",
  "border-t-violet-500",
  "border-t-pink-500",
];

export function Testimonials() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container>
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Loved by <span className="gradient-text">Businesses</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Real results from real businesses using our platform.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, index) => (
            <SectionWrapper key={t.id} delay={0.1 * index}>
              <div
                className={clsx(
                  "relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg transition-all duration-300 border-t-4",
                  accentBorders[index % accentBorders.length]
                )}
              >
                {/* Video overlay for video testimonials */}
                {t.isVideo && (
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full gradient-brand flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                )}

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Metric badge */}
                {t.metric && (
                  <div className="inline-flex px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-6">
                    {t.metric}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {t.authorName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.authorRole}, {t.company}
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
