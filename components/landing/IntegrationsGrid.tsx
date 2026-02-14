"use client";

import {
  Calendar,
  BarChart3,
  Mic,
  Zap,
  Building2,
  CalendarDays,
  PhoneCall,
  Waves,
} from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { integrations } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Google Calendar": Calendar,
  GoHighLevel: BarChart3,
  Calendly: CalendarDays,
  Twilio: PhoneCall,
  ElevenLabs: Waves,
  "Retell AI": Mic,
  Salesforce: Building2,
  HubSpot: BarChart3,
  Zapier: Zap,
};

/* Each integration has brand-accurate colors */
const brandStyles: Record<string, { bg: string; iconColor: string; border: string; letter: string; letterBg: string }> = {
  "Google Calendar": {
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-200",
    letter: "G",
    letterBg: "bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400",
  },
  GoHighLevel: {
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    border: "border-orange-200",
    letter: "GHL",
    letterBg: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  Calendly: {
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
    border: "border-blue-200",
    letter: "C",
    letterBg: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  Twilio: {
    bg: "bg-red-50",
    iconColor: "text-red-600",
    border: "border-red-200",
    letter: "T",
    letterBg: "bg-gradient-to-br from-red-500 to-red-600",
  },
  ElevenLabs: {
    bg: "bg-slate-50",
    iconColor: "text-slate-800",
    border: "border-slate-300",
    letter: "XI",
    letterBg: "bg-gradient-to-br from-slate-700 to-slate-900",
  },
  "Retell AI": {
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-200",
    letter: "R",
    letterBg: "bg-gradient-to-br from-violet-500 to-violet-700",
  },
  Salesforce: {
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    border: "border-sky-200",
    letter: "SF",
    letterBg: "bg-gradient-to-br from-sky-400 to-sky-600",
  },
  HubSpot: {
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-200",
    letter: "HS",
    letterBg: "bg-gradient-to-br from-orange-400 to-orange-600",
  },
  Zapier: {
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-200",
    letter: "Z",
    letterBg: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
};

const defaultBrand = {
  bg: "bg-slate-50",
  iconColor: "text-slate-500",
  border: "border-slate-200",
  letter: "?",
  letterBg: "bg-slate-400",
};

export function IntegrationsGrid() {
  return (
    <section id="integrations" className="relative py-28 lg:py-36 bg-slate-50 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Connects to Your
              <br />
              <span className="gradient-text-dark">Favorite Tools</span>
            </h2>
            <p className="mt-6 text-lg text-slate-500">
              Seamless integrations with the tools you already use.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {integrations.map((integration, index) => {
            const Icon = iconMap[integration.name] || Zap;
            const brand = brandStyles[integration.name] || defaultBrand;
            const isComingSoon = integration.status === "coming_soon";

            return (
              <SectionWrapper key={integration.id} delay={0.06 * index}>
                <div
                  className={clsx(
                    "group relative rounded-2xl border p-6 text-center transition-all duration-300 bg-white",
                    isComingSoon
                      ? "border-slate-200 opacity-60"
                      : `${brand.border} hover:shadow-xl hover:-translate-y-1`
                  )}
                >
                  {/* Brand logo mark */}
                  <div
                    className={clsx(
                      "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-transform duration-300",
                      !isComingSoon && "group-hover:scale-110",
                      isComingSoon ? "bg-slate-200" : brand.letterBg
                    )}
                  >
                    <span className="text-white font-extrabold text-sm tracking-tight">
                      {brand.letter}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    {integration.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    {integration.description}
                  </p>

                  {/* Status badge */}
                  {isComingSoon ? (
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  )}
                </div>
              </SectionWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
