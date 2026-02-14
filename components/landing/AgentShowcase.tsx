"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Headphones, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { agentPersonas } from "@/lib/constants/landing-data";
import type { AgentPersona } from "@/lib/types/landing";
import { clsx } from "clsx";

const accentMap: Record<string, { border: string; bg: string; text: string; glow: string; ring: string }> = {
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    glow: "shadow-violet-500/20",
    ring: "ring-violet-500/20",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    ring: "ring-emerald-500/20",
  },
  pink: {
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    glow: "shadow-pink-500/20",
    ring: "ring-pink-500/20",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/20",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    ring: "ring-cyan-500/20",
  },
  fuchsia: {
    border: "border-fuchsia-500/30",
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/20",
    ring: "ring-fuchsia-500/20",
  },
};

function AudioPlayer({ agent }: { agent: AgentPersona }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const accent = accentMap[agent.accentColor];

  const togglePlay = () => {
    if (!agent.audioUrl) {
      // Demo mode — simulate playback
      setIsPlaying(!isPlaying);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={clsx("rounded-xl border p-4 transition-all duration-300", accent.border, accent.bg)}>
      {agent.audioUrl && (
        <audio
          ref={audioRef}
          src={agent.audioUrl}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            setProgress((audio.currentTime / audio.duration) * 100);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
        />
      )}

      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          onClick={togglePlay}
          className={clsx(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
            isPlaying
              ? "bg-white/20 scale-95"
              : "bg-white/10 hover:bg-white/20 hover:scale-105"
          )}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>

        {/* Waveform visualization */}
        <div className="flex-1 flex items-center gap-[2px] h-8">
          {Array.from({ length: 32 }).map((_, i) => {
            const height = Math.sin(i * 0.5 + 1) * 0.5 + 0.3 + Math.random() * 0.2;
            const isActive = agent.audioUrl ? (i / 32) * 100 <= progress : isPlaying;
            return (
              <div
                key={i}
                className={clsx(
                  "flex-1 rounded-full transition-all duration-200",
                  isActive ? "bg-white/60" : "bg-white/15"
                )}
                style={{
                  height: `${height * 100}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Volume icon */}
        <Volume2 className={clsx("w-4 h-4 flex-shrink-0", isPlaying ? "text-white/60" : "text-white/20")} />
      </div>

      <p className="text-[11px] text-white/30 mt-2.5 flex items-center gap-1.5">
        <Headphones className="w-3 h-3" />
        {agent.audioUrl ? agent.audioLabel : `${agent.audioLabel} — audio coming soon`}
      </p>
    </div>
  );
}

function AgentCard({ agent, isSelected, onClick }: { agent: AgentPersona; isSelected: boolean; onClick: () => void }) {
  const accent = accentMap[agent.accentColor];

  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        "relative w-full text-left rounded-2xl border p-6 transition-all duration-500 cursor-pointer",
        isSelected
          ? `${accent.border} bg-gradient-to-b from-white/10 to-white/5 shadow-lg ${accent.glow}`
          : "border-white/10 bg-white/5 hover:border-white/15 hover:bg-white/10"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={clsx(
            "flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg transition-all duration-300",
            agent.avatarGradient,
            isSelected && `ring-2 ${accent.ring}`
          )}
        >
          {agent.avatarEmoji}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white">{agent.name}</h3>
          <p className={clsx("text-sm font-medium", accent.text)}>{agent.role}</p>
        </div>
      </div>

      {/* Industry badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
        <span className="text-[11px] font-medium text-white/40">{agent.industry}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-white/40 leading-relaxed mb-4">{agent.description}</p>

      {/* Stat */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-xs text-white/30">{agent.stats.label}</span>
        <span className={clsx("text-sm font-bold", accent.text)}>{agent.stats.value}</span>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className={clsx("absolute top-3 right-3 w-2 h-2 rounded-full", accent.text.replace("text-", "bg-"))}
          layoutId="agent-indicator"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

export function AgentShowcase() {
  const [selectedId, setSelectedId] = useState(agentPersonas[0].id);
  const selectedAgent = agentPersonas.find((a) => a.id === selectedId) || agentPersonas[0];
  const accent = accentMap[selectedAgent.accentColor];

  return (
    <section id="agents" className="relative py-28 lg:py-36 bg-black overflow-hidden">
      {/* Gradient line top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Ambient glow — shifts color based on selection */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[200px] transition-colors duration-1000 opacity-20"
        style={{
          background: selectedAgent.accentColor === "violet" ? "#8b5cf6"
            : selectedAgent.accentColor === "emerald" ? "#10b981"
            : selectedAgent.accentColor === "pink" ? "#ec4899"
            : selectedAgent.accentColor === "amber" ? "#f59e0b"
            : selectedAgent.accentColor === "cyan" ? "#06b6d4"
            : "#d946ef",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <Volume2 className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-medium text-white/40 tracking-wide">
                Meet the Agents
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              AI Agents That
              <br />
              <span className="gradient-text">Sound Human</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
              Pre-built personas for every industry. Each one handles calls with natural
              conversation, real empathy, and zero robotic vibes.
            </p>
          </div>
        </SectionWrapper>

        {/* Two-column layout: cards grid + featured preview */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Agent cards grid */}
          <div className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-4">
              {agentPersonas.map((agent, index) => (
                <SectionWrapper key={agent.id} delay={0.06 * index}>
                  <AgentCard
                    agent={agent}
                    isSelected={selectedId === agent.id}
                    onClick={() => setSelectedId(agent.id)}
                  />
                </SectionWrapper>
              ))}
            </div>
          </div>

          {/* Right: Featured agent detail + audio */}
          <div className="lg:col-span-2">
            <SectionWrapper delay={0.2}>
              <div className="sticky top-32">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedAgent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                    className={clsx(
                      "rounded-2xl border p-8 bg-gradient-to-b from-white/10 to-white/5",
                      accent.border
                    )}
                  >
                    {/* Large avatar */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div
                        className={clsx(
                          "w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-5xl shadow-2xl mb-5 ring-2",
                          selectedAgent.avatarGradient,
                          accent.ring
                        )}
                      >
                        {selectedAgent.avatarEmoji}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {selectedAgent.name}
                      </h3>
                      <p className={clsx("text-sm font-medium mb-2", accent.text)}>
                        {selectedAgent.role}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-[11px] font-medium text-white/40">
                          {selectedAgent.industry}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/50 leading-relaxed text-center mb-6">
                      {selectedAgent.description}
                    </p>

                    {/* Stat highlight */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                      <span className={clsx("text-3xl font-extrabold", accent.text)}>
                        {selectedAgent.stats.value}
                      </span>
                      <span className="text-sm text-white/30">
                        {selectedAgent.stats.label}
                      </span>
                    </div>

                    {/* Audio player */}
                    <AudioPlayer agent={selectedAgent} />

                    {/* CTA */}
                    <a
                      href="/agents"
                      className="group flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/10"
                    >
                      Build an Agent Like {selectedAgent.name}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </motion.div>
                </AnimatePresence>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
