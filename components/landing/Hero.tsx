"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Check } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden gradient-hero">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-500/20 blur-[160px] animate-breathe" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] animate-breathe" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/8 blur-[120px] animate-breathe" style={{ animationDelay: "4s" }} />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-32 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white/60 tracking-wide">
              Trusted by 60+ businesses
            </span>
          </div>
        </motion.div>

        {/* Headline — the showpiece */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]"
        >
          <span className="text-white">The First Voice AI</span>
          <br />
          <span className="gradient-text">That Learns on Its Own</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Converts at 85% of a top human rep at 3% of the cost. Custom prompts.
          Thousands of voices. Self-improving from every call. The same quality agencies
          charge <span className="text-white/80 font-normal">$5k&ndash;$20k</span> for&mdash;start free.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <a
            href="/agents"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#agents"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-white/70 font-medium text-[15px] hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            Meet the Agents
          </a>
        </motion.div>

        {/* Value props */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/40"
        >
          {["85% human conversion rate", "20 concurrent calls", "Live in 5 minutes"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400/70" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Hero product visual — floating browser mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24"
      >
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
                <span className="text-[11px] text-white/30">voiceai.com/builder</span>
              </div>
            </div>
          </div>

          {/* Video / Product placeholder */}
          <div className="aspect-[16/9] bg-gradient-to-b from-indigo-950/50 to-black flex items-center justify-center relative">
            <div className="absolute inset-0 dot-grid opacity-50" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                <Play className="w-6 h-6 text-white/60 ml-0.5" />
              </div>
              <span className="text-sm text-white/30 font-medium">See the platform in action</span>
            </div>
          </div>
        </div>

        {/* Glow underneath */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />
      </motion.div>
    </section>
  );
}
