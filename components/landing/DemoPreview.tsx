"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Monitor, Sparkles } from "lucide-react";
import {
  DashboardScreenshot,
  PromptEditorScreenshot,
  AIManagerScreenshot,
  TestAgentScreenshot,
  CallHistoryScreenshot,
  VoicesScreenshot,
  BrowserFrame,
} from "@/components/landing/ProductShowcase";

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    description: "Real-time analytics, call volume trends, and agent performance at a glance.",
  },
  {
    id: "prompt",
    label: "Prompt Editor",
    icon: "📝",
    description: "Visual editor to customize your agent's greeting, call flow, and personality.",
  },
  {
    id: "test",
    label: "Test Agent",
    icon: "📞",
    description: "Chat with your AI agent in real-time before going live — tweak voice and model.",
  },
  {
    id: "ai-manager",
    label: "AI Manager",
    icon: "🤖",
    description: "AI analyzes every call and suggests prompt improvements automatically.",
  },
  {
    id: "calls",
    label: "Call History",
    icon: "📋",
    description: "Full call log with transcripts, scores, outcomes, and duration breakdowns.",
  },
  {
    id: "voices",
    label: "Voices",
    icon: "🎙",
    description: "1,000+ premium voices from ElevenLabs, OpenAI, Deepgram, and Cartesia.",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

function ScreenshotRenderer({ tabId, mode }: { tabId: TabId; mode: "dark" | "light" }) {
  const componentMap: Record<TabId, React.ReactNode> = {
    dashboard: <DashboardScreenshot mode={mode} />,
    prompt: <PromptEditorScreenshot mode={mode} />,
    test: <TestAgentScreenshot mode={mode} />,
    "ai-manager": <AIManagerScreenshot mode={mode} />,
    calls: <CallHistoryScreenshot mode={mode} />,
    voices: <VoicesScreenshot mode={mode} />,
  };
  return <>{componentMap[tabId]}</>;
}

export function DemoPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="demo" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[160px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6">
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-indigo-300 tracking-wide">
                Live Platform Preview
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              See It <span className="gradient-text">In Action</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Explore every feature of the platform before you sign up.
            </p>
          </div>
        </SectionWrapper>

        {/* Tab bar */}
        <SectionWrapper delay={0.1}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap justify-center gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Dark/Light toggle */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-white/10 bg-white/5">
              <button
                onClick={() => setThemeMode("dark")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  themeMode === "dark"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setThemeMode("light")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  themeMode === "light"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </SectionWrapper>

        {/* Active tab description */}
        <SectionWrapper delay={0.12}>
          <p className="text-center text-sm text-white/50 mb-6">
            <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5 text-indigo-400/60" />
            {activeTabData.description}
          </p>
        </SectionWrapper>

        {/* Product display — scaled up for readability */}
        <SectionWrapper delay={0.15}>
          <div className="relative max-w-6xl mx-auto">
            <BrowserFrame
              url={`voiceai.com/${activeTab === "ai-manager" ? "ai-manager" : activeTab}`}
              darkFrame={true}
              className="glow-purple"
            >
              {/*
                Scale trick: render the mini components at their natural size inside
                an overflow-hidden container, then CSS scale them up so everything
                is larger and more readable.
              */}
              <div className="relative overflow-hidden" style={{ height: "clamp(380px, 50vw, 560px)" }}>
                <div
                  className="absolute top-0 left-0 w-full origin-top-left transition-all duration-500"
                  style={{
                    transform: "scale(1.7)",
                    transformOrigin: "top left",
                    width: "58.82%", /* 100% / 1.7 to prevent horizontal overflow */
                  }}
                >
                  <ScreenshotRenderer tabId={activeTab} mode={themeMode} />
                </div>
              </div>
            </BrowserFrame>

            {/* Glow underneath */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />
          </div>
        </SectionWrapper>

        {/* Bottom hint */}
        <SectionWrapper delay={0.25}>
          <p className="mt-8 text-center text-sm text-white/25">
            Click any tab above to explore different sections of the platform.
          </p>
        </SectionWrapper>
      </div>
    </section>
  );
}
