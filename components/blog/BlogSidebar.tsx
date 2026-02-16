"use client";

import { ArrowRight } from "lucide-react";
import type { BlogCategory } from "@/lib/types/blog";
import { clsx } from "clsx";

export function BlogSidebar({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: BlogCategory[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}) {
  return (
    <aside className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={clsx(
              "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
              activeCategory === null
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                activeCategory === cat.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* CTA card */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Ready to try it?
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Build a custom AI phone agent in under 5 minutes. No credit card required.
        </p>
        <a
          href="/onboarding"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all duration-300"
        >
          Get Started Free
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </aside>
  );
}
