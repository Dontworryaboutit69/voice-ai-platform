"use client";

import { useState } from "react";
import { Star, Play, Quote, ChevronDown, ChevronUp } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { testimonials } from "@/lib/constants/landing-data";
import { clsx } from "clsx";
import type { Testimonial } from "@/lib/types/landing";

const TRUNCATE_LENGTH = 140;

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = t.quote.length > TRUNCATE_LENGTH;
  const displayQuote = expanded || !isLong ? t.quote : t.quote.slice(0, TRUNCATE_LENGTH).trimEnd() + "...";

  const initials = t.authorName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <SectionWrapper delay={0.05 * (index % 6)} className="h-auto">
      <div
        className={clsx(
          "group relative rounded-2xl border bg-white p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5",
          t.isVideo
            ? "border-indigo-200 ring-1 ring-indigo-100"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        {/* Video badge */}
        {t.isVideo && (
          <div className="mb-4 relative rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 h-32 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 group-hover:shadow-xl">
              <Play className="w-5 h-5 text-indigo-600 ml-0.5" fill="currentColor" />
            </div>
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-indigo-400">
              Video Review
            </span>
          </div>
        )}

        {/* Header: Avatar + Name + Stars */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={clsx(
              "flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm",
              t.avatarGradient || "from-indigo-500 to-purple-500"
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {t.authorName}
              </h4>
              {t.date && (
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                  {t.date}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {t.authorRole}, {t.company}
            </p>
            {/* Stars */}
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 text-amber-400"
                  fill="currentColor"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quote */}
        <p className="text-sm text-slate-600 leading-relaxed">
          &ldquo;{displayQuote}&rdquo;
        </p>

        {/* Read more / less */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}

        {/* Metric badge */}
        {t.metric && (
          <div className="mt-3 inline-flex px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            {t.metric}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export function Testimonials() {
  // Split testimonials into columns for masonry layout
  const cols = [[], [], [], []] as Testimonial[][];
  testimonials.forEach((t, i) => {
    cols[i % 4].push(t);
  });

  return (
    <section className="relative py-28 lg:py-36 bg-slate-50 overflow-hidden">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid-light" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 mb-6">
              <Quote className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 tracking-wide">
                Customer Reviews
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Businesses That
              <br />
              <span className="gradient-text-dark">Switched &amp; Never Looked Back</span>
            </h2>
            <p className="mt-5 text-lg text-slate-500">
              From dental offices to law firms, these are their actual results.
            </p>
          </div>
        </SectionWrapper>

        {/* Masonry wall — 4 cols on desktop, 2 on tablet, 1 on mobile */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:balance]">
          {testimonials.map((t, index) => (
            <div key={t.id} className="break-inside-avoid mb-4">
              <TestimonialCard t={t} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <SectionWrapper delay={0.3}>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {testimonials.slice(0, 5).map((t, i) => (
                  <div
                    key={t.id}
                    className={clsx(
                      "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[9px] font-bold border-2 border-white",
                      t.avatarGradient || "from-indigo-500 to-purple-500"
                    )}
                  >
                    {t.authorName.split(" ").map((n) => n[0]).join("")}
                  </div>
                ))}
              </div>
              <span className="text-slate-500 font-medium">
                Join {testimonials.length * 5}+ happy businesses
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
              ))}
              <span className="ml-1 text-slate-500 font-medium">4.9/5 average rating</span>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
