"use client";

import { Sparkles, RefreshCw, Mic, Check, BarChart3, Globe, Link2, Clock } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { clsx } from "clsx";
import {
  PromptEditorScreenshot,
  AIManagerScreenshot,
  VoicesScreenshot,
  BrowserFrame,
} from "@/components/landing/ProductShowcase";

/* ─── Core feature data with bullet points ─── */
const coreFeatures = [
  {
    badge: "Custom Prompts",
    badgeIcon: Sparkles,
    title: "Built For Your Business.",
    titleAccent: "Not a Template.",
    description:
      "Our fine-tuned AI builds a master prompt specifically for your business — your services, your tone, your rules. Or grab a pre-built template from the marketplace and customize from there.",
    bullets: [
      "AI generates your entire prompt from a simple form",
      "Edit any section — greeting, call flow, personality, closing",
      "Visual prompt editor with live syntax highlighting",
      "Template marketplace with 50+ industry presets",
    ],
    accentColor: "#635BFF",
    screenshot: <PromptEditorScreenshot mode="dark" />,
    url: "voiceai.com/prompt-editor",
  },
  {
    badge: "Self-Learning AI",
    badgeIcon: RefreshCw,
    title: "Gets Smarter",
    titleAccent: "After Every Call.",
    description:
      "Your agent converts at 85% the rate of a top human rep — at 3% of the cost. It analyzes every conversation and autonomously rewrites its own prompts to improve.",
    bullets: [
      "AI Manager analyzes calls and suggests prompt improvements",
      "One-click accept or reject each optimization",
      "Agent Health Score tracks performance over time",
      "Autonomous learning — no manual prompt tweaking needed",
    ],
    accentColor: "#8B5CF6",
    screenshot: <AIManagerScreenshot mode="dark" />,
    url: "voiceai.com/ai-manager",
  },
  {
    badge: "Voice Library",
    badgeIcon: Mic,
    title: "Thousands of Voices.",
    titleAccent: "Or Clone Your Own.",
    description:
      "Access voices from ElevenLabs, OpenAI, Deepgram, and Cartesia — thousands of options across accents, genders, and tones. Or upload a clip and clone any voice you want.",
    bullets: [
      "1,000+ premium voices from 4 top providers",
      "Filter by accent, tone, gender, and style",
      "Clone any voice with a 30-second audio clip",
      "Preview voices with your actual prompt before going live",
    ],
    accentColor: "#D946EF",
    screenshot: <VoicesScreenshot mode="dark" />,
    url: "voiceai.com/voices",
  },
];

const miniFeatures = [
  { icon: BarChart3, label: "Real-time Analytics" },
  { icon: Globe, label: "20 Concurrent Calls" },
  { icon: Link2, label: "CRM Auto-Sync" },
  { icon: Clock, label: "24/7 Availability" },
];

export function SolutionFeatures() {
  return (
    <section id="features" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/10 blur-[160px]" />
      <div className="absolute bottom-1/3 right-0 w-[600px] h-[400px] rounded-full bg-purple-600/8 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <SectionWrapper>
          <div className="max-w-2xl mx-auto text-center mb-28">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-300 tracking-wide">
                The Platform
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Not a Template.
              <br />
              <span className="gradient-text">Built For Your Business.</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
              Every agent gets custom prompts, learns from real calls, and sounds exactly how you want.
            </p>
          </div>
        </SectionWrapper>

        {/* Alternating feature rows — text left / image right, then flip */}
        <div className="space-y-36 lg:space-y-48">
          {coreFeatures.map((feature, index) => {
            const isReversed = index % 2 === 1;
            const BadgeIcon = feature.badgeIcon;

            return (
              <SectionWrapper key={feature.badge} delay={0.1}>
                <div
                  className={clsx(
                    "flex flex-col gap-10 lg:gap-20 items-center",
                    isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                  )}
                >
                  {/* ── Text side — narrower ── */}
                  <div className="w-full lg:w-[38%] lg:flex-shrink-0">
                    {/* Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
                      style={{
                        background: `${feature.accentColor}12`,
                        border: `1px solid ${feature.accentColor}30`,
                      }}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" style={{ color: feature.accentColor }} />
                      <span
                        className="text-xs font-semibold tracking-wide"
                        style={{ color: feature.accentColor }}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-[1.1] mb-5">
                      {feature.titleAccent}{" "}
                      <span className="gradient-text">{feature.title}</span>
                    </h3>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-white/45 leading-relaxed mb-8">
                      {feature.description}
                    </p>

                    {/* Bullet points */}
                    <ul className="space-y-3">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${feature.accentColor}18` }}
                          >
                            <Check className="w-3 h-3" style={{ color: feature.accentColor }} />
                          </div>
                          <span className="text-sm sm:text-[15px] text-white/60 leading-relaxed">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ── Image side — larger, scaled up ── */}
                  <div className="w-full lg:w-[62%]">
                    <div className="relative">
                      <BrowserFrame url={feature.url} darkFrame={true}>
                        {/* Scale the mini components up so they're readable */}
                        <div className="relative overflow-hidden" style={{ height: "clamp(280px, 32vw, 440px)" }}>
                          <div
                            className="absolute top-0 left-0 origin-top-left"
                            style={{
                              transform: "scale(1.55)",
                              transformOrigin: "top left",
                              width: "64.5%", /* 100% / 1.55 */
                            }}
                          >
                            {feature.screenshot}
                          </div>
                        </div>
                      </BrowserFrame>

                      {/* Accent glow behind the screenshot */}
                      <div
                        className="absolute -inset-6 -z-10 rounded-3xl blur-[60px] opacity-20"
                        style={{ background: feature.accentColor }}
                      />
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            );
          })}
        </div>

        {/* Mini feature badges */}
        <SectionWrapper delay={0.3}>
          <div className="mt-28 flex flex-wrap justify-center gap-3">
            {miniFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-white/15 transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-white/30" />
                <span className="text-sm font-medium text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
