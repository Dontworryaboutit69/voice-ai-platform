"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Check, Phone, Mic, Brain, Zap } from "lucide-react";

/* ─── Animated voice waveform bars ─── */
function VoiceWaveform() {
  const bars = [
    { h: 40, delay: 0 },
    { h: 65, delay: 0.1 },
    { h: 85, delay: 0.15 },
    { h: 55, delay: 0.2 },
    { h: 95, delay: 0.05 },
    { h: 70, delay: 0.25 },
    { h: 50, delay: 0.12 },
    { h: 80, delay: 0.08 },
    { h: 60, delay: 0.18 },
    { h: 90, delay: 0.22 },
    { h: 45, delay: 0.1 },
    { h: 75, delay: 0.15 },
    { h: 55, delay: 0.2 },
    { h: 85, delay: 0.05 },
    { h: 65, delay: 0.12 },
    { h: 40, delay: 0.25 },
    { h: 70, delay: 0.18 },
    { h: 95, delay: 0.08 },
    { h: 50, delay: 0.22 },
    { h: 80, delay: 0.1 },
  ];

  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 48 }}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: `linear-gradient(180deg, #8B5CF6, #635BFF)`,
          }}
          animate={{
            height: [`${bar.h * 0.3}%`, `${bar.h}%`, `${bar.h * 0.4}%`, `${bar.h * 0.9}%`, `${bar.h * 0.3}%`],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: bar.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating feature cards that orbit the hero ─── */
function FloatingCard({
  icon: Icon,
  title,
  subtitle,
  gradient,
  className,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`absolute hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-2xl ${className}`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: gradient }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-white leading-tight">{title}</div>
        <div className="text-[11px] text-white/40 leading-tight">{subtitle}</div>
      </div>
    </motion.div>
  );
}

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
            href="/onboarding"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-[15px] hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#demo"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-white/70 font-medium text-[15px] hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            <Play className="w-4 h-4" />
            Watch Demo
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

      {/* ─── Hero Visual: Voice AI Visualization ─── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-28"
      >
        {/* Central glass card with live waveform */}
        <div className="relative">
          <div
            className="rounded-2xl p-8 sm:p-10 border border-white/[0.08] backdrop-blur-xl"
            style={{
              background: "linear-gradient(135deg, rgba(99,91,255,0.08), rgba(139,92,246,0.04), rgba(217,70,239,0.03))",
            }}
          >
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400/90 tracking-wide">
                Agent Active — Listening
              </span>
            </div>

            {/* Waveform */}
            <VoiceWaveform />

            {/* Live conversation preview */}
            <div className="mt-6 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>AI</div>
                <div className="rounded-xl px-4 py-2.5 text-sm text-white/80 leading-relaxed" style={{ background: "rgba(99,91,255,0.1)", border: "1px solid rgba(99,91,255,0.15)" }}>
                  &ldquo;Hi, this is Dr. Smith&apos;s office! I&apos;d be happy to help you schedule an appointment. What day works best for you?&rdquo;
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="flex items-start gap-3 justify-end"
              >
                <div className="rounded-xl px-4 py-2.5 text-sm text-white/80 leading-relaxed" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  &ldquo;Do you have anything available this Thursday afternoon?&rdquo;
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 flex-shrink-0">👤</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>AI</div>
                <div className="rounded-xl px-4 py-2.5 text-sm text-white/80 leading-relaxed" style={{ background: "rgba(99,91,255,0.1)", border: "1px solid rgba(99,91,255,0.15)" }}>
                  &ldquo;Thursday at 2:30 PM is available! I&apos;ll book that for you and send a confirmation text. Is there anything else I can help with?&rdquo;
                </div>
              </motion.div>
            </div>

            {/* Bottom stats bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-6 sm:gap-10">
              {[
                { label: "Response Time", value: "0.8s" },
                { label: "Confidence", value: "97%" },
                { label: "Sentiment", value: "Positive" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xs text-white/30 mb-0.5">{stat.label}</div>
                  <div className="text-sm font-semibold text-white/80">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Accent glow behind the card */}
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-indigo-500/[0.07] blur-[60px]" />
          <div className="absolute -inset-10 -z-10 rounded-3xl bg-purple-500/[0.05] blur-[80px]" />
        </div>

        {/* Floating feature cards */}
        <FloatingCard
          icon={Brain}
          title="Self-Learning AI"
          subtitle="Improves every call"
          gradient="linear-gradient(135deg, #635BFF, #8B5CF6)"
          className="-left-12 top-[15%]"
          delay={1.2}
        />
        <FloatingCard
          icon={Mic}
          title="1,000+ Voices"
          subtitle="Sound exactly right"
          gradient="linear-gradient(135deg, #D946EF, #F0ABFC)"
          className="-right-12 top-[25%]"
          delay={1.4}
        />
        <FloatingCard
          icon={Phone}
          title="20 Concurrent Calls"
          subtitle="Handle any volume"
          gradient="linear-gradient(135deg, #10B981, #34D399)"
          className="-left-8 bottom-[15%]"
          delay={1.6}
        />
        <FloatingCard
          icon={Zap}
          title="Live in 5 Minutes"
          subtitle="No code required"
          gradient="linear-gradient(135deg, #F59E0B, #FB923C)"
          className="-right-8 bottom-[20%]"
          delay={1.8}
        />
      </motion.div>
    </section>
  );
}
