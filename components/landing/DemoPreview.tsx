"use client";

import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";

export function DemoPreview() {
  return (
    <section id="demo" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />

      <Container className="relative z-10">
        <SectionWrapper>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-[var(--font-heading)] tracking-tight">
              See It In Action
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Watch how a business goes from zero to a live AI agent in minutes.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper delay={0.2}>
          {/* Browser frame */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/10">
              {/* Browser chrome */}
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-xs text-slate-400 text-center max-w-md mx-auto">
                    app.voiceai.com/builder
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
          </div>
        </SectionWrapper>
      </Container>
    </section>
  );
}
