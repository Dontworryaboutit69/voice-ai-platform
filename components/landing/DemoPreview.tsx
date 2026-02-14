"use client";

import { Play } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";

export function DemoPreview() {
  return (
    <section id="demo" className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[160px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              See It <span className="gradient-text">In Action</span>
            </h2>
            <p className="mt-6 text-lg text-white/40">
              Watch how a business goes from zero to a live AI agent in minutes.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 glow-purple">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 mx-12">
                  <div className="h-6 rounded-md bg-white/5 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-[11px] text-white/30">app.voiceai.com/builder</span>
                  </div>
                </div>
              </div>

              {/* Video content */}
              <VideoPlaceholder
                videoUrl={null}
                aspectRatio="16/9"
                label="Product demo coming soon"
              />
            </div>

            {/* Glow underneath */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
