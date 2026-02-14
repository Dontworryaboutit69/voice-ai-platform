"use client";

import {
  Calendar,
  BarChart3,
  Phone,
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

export function IntegrationsGrid() {
  return (
    <section id="integrations" className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Connects to Your
              <br />
              <span className="gradient-text">Favorite Tools</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Seamless integrations with the tools you already use.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {integrations.map((integration, index) => {
            const Icon = iconMap[integration.name] || Zap;
            const isComingSoon = integration.status === "coming_soon";

            return (
              <SectionWrapper key={integration.id} delay={0.05 * index}>
                <div
                  className={clsx(
                    "relative rounded-xl border p-6 text-center transition-all duration-300",
                    isComingSoon
                      ? "border-white/5 bg-white/5 opacity-50"
                      : "border-white/10 bg-white/5 hover:border-white/15 hover:bg-white/10"
                  )}
                >
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center",
                      isComingSoon ? "bg-white/5" : "bg-white/5"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-5 h-5",
                        isComingSoon ? "text-white/20" : "text-white/50"
                      )}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-white/70 mb-0.5">
                    {integration.name}
                  </h3>
                  <p className="text-[11px] text-white/30">
                    {integration.description}
                  </p>
                  {isComingSoon && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-[9px] font-semibold uppercase tracking-wider">
                      Coming Soon
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
