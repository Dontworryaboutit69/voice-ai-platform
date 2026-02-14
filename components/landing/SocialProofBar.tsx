import { socialProofLogos } from "@/lib/constants/landing-data";

export function SocialProofBar() {
  // Duplicate for seamless marquee
  const logos = [...socialProofLogos, ...socialProofLogos];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-8">
          Trusted by businesses across 12+ industries
        </p>
      </div>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-marquee">
          {logos.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <div className="px-6 py-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-sm font-semibold text-slate-400 whitespace-nowrap">
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
