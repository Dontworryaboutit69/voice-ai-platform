"use client";

import { socialProofLogos } from "@/lib/constants/landing-data";

export function SocialProofBar() {
  const logos = [...socialProofLogos, ...socialProofLogos];

  return (
    <section className="relative py-16 bg-black overflow-hidden">
      {/* Top fade line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <p className="text-center text-[13px] font-medium text-white/30 uppercase tracking-[0.2em]">
          Trusted by businesses across 12+ industries
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="flex animate-marquee">
          {logos.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 mx-6"
            >
              <span className="text-[15px] font-semibold text-white/20 whitespace-nowrap tracking-wide">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
