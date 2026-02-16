"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { quizSteps, quizResult } from "@/lib/constants/landing-data";
import { clsx } from "clsx";

const accentColors: Record<string, { border: string; bg: string; text: string; ring: string; glow: string }> = {
  red: { border: "border-red-500/60", bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/30", glow: "shadow-red-500/20" },
  orange: { border: "border-orange-500/60", bg: "bg-orange-500/10", text: "text-orange-400", ring: "ring-orange-500/30", glow: "shadow-orange-500/20" },
  yellow: { border: "border-amber-500/60", bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/30", glow: "shadow-amber-500/20" },
  emerald: { border: "border-emerald-500/60", bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", glow: "shadow-emerald-500/20" },
  blue: { border: "border-blue-500/60", bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/30", glow: "shadow-blue-500/20" },
  amber: { border: "border-amber-500/60", bg: "bg-amber-500/10", text: "text-amber-400", ring: "ring-amber-500/30", glow: "shadow-amber-500/20" },
  violet: { border: "border-violet-500/60", bg: "bg-violet-500/10", text: "text-violet-400", ring: "ring-violet-500/30", glow: "shadow-violet-500/20" },
  slate: { border: "border-white/30", bg: "bg-white/10", text: "text-white/70", ring: "ring-white/20", glow: "shadow-white/10" },
};

export function QuizFunnel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState(1);

  const step = quizSteps[currentStep];
  const progress = ((currentStep + (isComplete ? 1 : 0)) / quizSteps.length) * 100;

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [step.id]: optionId };
    setAnswers(newAnswers);
    setDirection(1);

    setTimeout(() => {
      if (currentStep < quizSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
    }, 400);
  };

  const handleBack = () => {
    setDirection(-1);
    if (isComplete) {
      setIsComplete(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <section className="relative py-28 lg:py-36 overflow-hidden gradient-section-dark">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/15 blur-[160px] animate-breathe" />
      <div className="absolute bottom-[-5%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[140px] animate-breathe" style={{ animationDelay: "2s" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 mb-6">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300 tracking-wide">
                60-Second Quiz
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              Get Your Custom{" "}
              <br />
              <span className="gradient-text">AI Agent Blueprint</span>
            </h2>
            <p className="mt-5 text-lg text-white/40 max-w-xl mx-auto">
              3 questions. 60 seconds. We&apos;ll pre-configure an agent built specifically for your business.
            </p>
          </div>
        </SectionWrapper>

        {/* Glass card container */}
        <SectionWrapper delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 lg:p-10">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-white/40">
                  {isComplete ? "Complete!" : `Step ${currentStep + 1} of ${quizSteps.length}`}
                </span>
                <span className="text-xs font-medium text-white/40">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Quiz content */}
            <div className="relative min-h-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                {!isComplete ? (
                  <motion.div
                    key={step.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    {/* Question */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {step.question}
                      </h3>
                      <p className="text-sm text-white/40">{step.subtitle}</p>
                    </div>

                    {/* Options grid */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {step.options.map((option) => {
                        const colors = accentColors[option.accentColor] || accentColors.slate;
                        const isSelected = answers[step.id] === option.id;

                        return (
                          <motion.button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={clsx(
                              "relative text-left rounded-xl border p-5 transition-all duration-300 cursor-pointer group",
                              isSelected
                                ? `${colors.border} ${colors.bg} ring-1 ${colors.ring} shadow-lg ${colors.glow}`
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Selected check */}
                            {isSelected && (
                              <motion.div
                                className="absolute top-3 right-3"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <CheckCircle2 className={clsx("w-5 h-5", colors.text)} />
                              </motion.div>
                            )}

                            <div className="flex items-start gap-4">
                              <div
                                className={clsx(
                                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
                                  isSelected ? colors.bg : "bg-white/5 group-hover:bg-white/10"
                                )}
                              >
                                {option.emoji}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-base font-bold text-white mb-0.5">
                                  {option.title}
                                </h4>
                                <p className="text-sm text-white/40 leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Back button */}
                    {currentStep > 0 && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Result screen */
                  <motion.div
                    key="result"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-center"
                  >
                    {/* Success animation */}
                    <motion.div
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>

                    <motion.h3
                      className="text-2xl sm:text-3xl font-bold text-white mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {quizResult.headline}
                    </motion.h3>

                    <motion.p
                      className="text-white/40 mb-6 max-w-lg mx-auto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {quizResult.description}
                    </motion.p>

                    {/* Discount badge */}
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {quizResult.discount}
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <a
                        href={quizResult.cta.href}
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-[15px] hover:bg-white/90 shadow-xl shadow-white/10 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        {quizResult.cta.label}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </motion.div>

                    {/* Back link */}
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <button
                        onClick={handleBack}
                        className="text-sm text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                      >
                        &larr; Retake quiz
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
