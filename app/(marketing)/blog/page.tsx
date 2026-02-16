"use client";

import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { blogPosts, blogCategories } from "@/lib/constants/blog-data";
import { blogListSchema } from "@/lib/seo/structured-data";
import { clsx } from "clsx";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featuredPosts = blogPosts.filter((p) => p.featured);
  const filteredPosts = activeCategory
    ? blogPosts.filter((p) => p.category.id === activeCategory)
    : blogPosts;

  const showFeatured = !activeCategory && featuredPosts.length > 0;
  const regularPosts = showFeatured
    ? filteredPosts.filter((p) => !p.featured)
    : filteredPosts;

  return (
    <>
      {/* ─── Blog List Structured Data ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema(blogPosts)),
        }}
      />

      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden gradient-hero">
        {/* Ambient glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-500/15 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[20%] w-[400px] h-[300px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-36 pb-20 lg:pt-44 lg:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-white/60 tracking-wide">
              VoiceAI Blog
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[0.95]">
            Learn. Build.
            <br />
            <span className="gradient-text">Convert More Calls.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/40 max-w-xl mx-auto leading-relaxed">
            Guides, strategies, and insights on voice AI that
            actually drives revenue for your business.
          </p>

          <div className="mt-8">
            <a
              href="/onboarding"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-900 font-semibold text-[15px] hover:bg-white/90 shadow-xl shadow-white/10 transition-all duration-300"
            >
              Build Your AI Agent Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── Blog Content ─── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={clsx(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border",
                activeCategory === null
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              All Posts
            </button>
            {blogCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border",
                  activeCategory === cat.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Featured posts — big horizontal cards */}
          {showFeatured && (
            <div className="mb-16">
              <div className="space-y-6">
                {featuredPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} featured />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {showFeatured && regularPosts.length > 0 && (
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeCategory
                  ? blogCategories.find((c) => c.id === activeCategory)?.name
                  : "Latest Articles"}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}

          {/* All posts — 3-column grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {regularPosts.length === 0 && !showFeatured && (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Ready to stop missing calls?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Build a custom AI phone agent in under 5 minutes. No credit card required.
          </p>
          <a
            href="/onboarding"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </section>
    </>
  );
}
