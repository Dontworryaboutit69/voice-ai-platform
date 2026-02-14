"use client";

import { socialProofLogos } from "@/lib/constants/landing-data";

/* Each "logo" is styled with a distinctive font weight + letter-spacing
   to look like a real brand logo wall, even without actual logo images. */
const logoStyles = [
  "font-bold tracking-tight",
  "font-extrabold tracking-wider uppercase text-[13px]",
  "font-semibold italic tracking-wide",
  "font-black tracking-tighter",
  "font-bold tracking-[0.15em] uppercase text-[12px]",
  "font-extrabold tracking-tight",
  "font-semibold tracking-wider uppercase text-[13px]",
  "font-bold italic",
  "font-black tracking-[0.1em] uppercase text-[12px]",
  "font-extrabold tracking-tight",
];

export function SocialProofBar() {
  const logos = [...socialProofLogos, ...socialProofLogos];

  return (
    <section className="relative py-14 bg-white overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-10">
        <p className="text-center text-[13px] font-medium text-slate-400 uppercase tracking-[0.2em]">
          Trusted by 60+ businesses across 12 industries
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-marquee items-center">
          {logos.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 mx-8 sm:mx-12 flex items-center gap-2"
            >
              {/* Colored dot as "logo mark" */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  background: [
                    "#6366F1", "#10B981", "#EC4899", "#F59E0B", "#06B6D4",
                    "#8B5CF6", "#EF4444", "#14B8A6", "#F97316", "#3B82F6",
                  ][i % 10],
                  opacity: 0.6,
                }}
              />
              <span
                className={`text-[15px] text-slate-400 whitespace-nowrap ${logoStyles[i % logoStyles.length]}`}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}
