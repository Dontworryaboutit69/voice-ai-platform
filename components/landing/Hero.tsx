"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { VideoPlaceholder } from "@/components/ui/VideoPlaceholder";

function WaveformVisual() {
  const bars = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="glass rounded-2xl p-6 w-full max-w-sm mx-auto">
      {/* Mock header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium text-white/80">AI Agent Active</span>
      </div>
      <div className="text-xs text-white/40 mb-4 font-medium uppercase tracking-wider">
        Coastal Dental Group
      </div>

      {/* Waveform bars */}
      <div className="flex items-end justify-center gap-1 h-24">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full bg-gradient-to-t from-indigo-500 to-pink-500"
            animate={{
              height: ["30%", `${40 + Math.random() * 60}%`, "30%"],
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.08,
            }}
            style={{ minHeight: "12px" }}
          />
        ))}
      </div>

      {/* Mock stats */}
      <div className="flex items-center justify-between mt-6 text-xs text-white/50">
        <span>03:24 elapsed</span>
        <span className="text-green-400 font-medium">Natural tone</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden gradient-hero">
      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid" />

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-float" />
        <div
          className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px] animate-float-reverse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/15 blur-[120px] animate-float-slow"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px] animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Container className="relative z-10 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column — Text content */}
          <div>
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80">
                Trusted by 60+ businesses
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight font-[var(--font-heading)]"
            >
              <span className="text-white">Build Voice AI Agents</span>
              <br />
              <span className="gradient-text">That Actually Sound Human</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed"
            >
              We deployed 60+ agents at $5k–$20k each. Now our entire platform
              is yours — <span className="text-white font-semibold">for free</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <a
                href="/agents"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl gradient-brand text-white font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </motion.div>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400"
            >
              {["No coding required", "Test 100% free", "Live in 5 minutes"].map(
                (text) => (
                  <div key={text} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{text}</span>
                  </div>
                )
              )}
            </motion.div>
          </div>

          {/* Right column — Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <WaveformVisual />
          </motion.div>
        </div>

        {/* Hero video placeholder — below the fold on desktop, centered */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 lg:mt-28"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10">
            <VideoPlaceholder
              videoUrl={null}
              aspectRatio="16/9"
              label="See the platform in action"
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
