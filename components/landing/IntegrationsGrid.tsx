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
import { Container } from "@/components/ui/Container";
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
    <section id="integrations" className="py-24 lg:py-32 bg-white">
      <Container>
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-[var(--font-heading)] tracking-tight">
              Connects to Your{" "}
              <span className="gradient-text">Favorite Tools</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Seamless integrations with the tools you already use.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {integrations.map((integration, index) => {
            const Icon = iconMap[integration.name] || Zap;
            const isComingSoon = integration.status === "coming_soon";

            return (
              <SectionWrapper key={integration.id} delay={0.05 * index}>
                <div
                  className={clsx(
                    "rounded-xl border p-6 text-center transition-all duration-300",
                    isComingSoon
                      ? "border-slate-100 bg-slate-50/50 opacity-60"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                  )}
                >
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center",
                      isComingSoon ? "bg-slate-100" : "bg-indigo-50"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-6 h-6",
                        isComingSoon ? "text-slate-400" : "text-indigo-600"
                      )}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {integration.description}
                  </p>
                  {isComingSoon && (
                    <span className="inline-block mt-3 px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  )}
                </div>
              </SectionWrapper>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
