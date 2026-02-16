import { ArrowRight } from "lucide-react";

export function BlogHeader() {
  return (
    <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-white border-b border-slate-100">
      <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full bg-indigo-100/30 blur-[140px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-violet-100/20 blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-600 tracking-wide">
            VoiceAI Blog
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
          Insights & Guides for
          <br />
          <span className="gradient-text-dark">Voice AI Success</span>
        </h1>

        <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
          Learn how to build, deploy, and scale AI agents that answer calls,
          book appointments, and convert leads&mdash;24/7.
        </p>

        <div className="mt-8">
          <a
            href="/onboarding"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all duration-300"
          >
            Build Your AI Agent Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
