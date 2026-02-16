"use client";

import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/types/blog";
import { BlogCover } from "@/components/blog/BlogCover";
import { clsx } from "clsx";

const categoryColors: Record<string, { bg: string; text: string }> = {
  guides: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  industry: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  product: { bg: "bg-violet-500/10", text: "text-violet-600" },
  insights: { bg: "bg-amber-500/10", text: "text-amber-600" },
  comparisons: { bg: "bg-rose-500/10", text: "text-rose-600" },
};

export function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  const colors = categoryColors[post.category.id] || categoryColors.guides;
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (featured) {
    return (
      <a
        href={`/blog/${post.slug}`}
        className="group block rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-2xl transition-all duration-500"
      >
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          {/* Cover image */}
          <BlogCover
            cover={post.coverImage}
            alt={post.title}
            size="lg"
            className="md:aspect-auto md:min-h-[320px]"
          />

          {/* Content */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className={clsx("px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", colors.bg, colors.text)}>
                {post.category.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {post.readingTime} min read
              </span>
            </div>

            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
              {post.title}
            </h3>

            <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className={clsx("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold", post.author.avatarGradient)}>
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{post.author.name}</div>
                  <div className="text-xs text-slate-400">{formattedDate}</div>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-2.5 transition-all duration-300">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-xl transition-all duration-500"
    >
      {/* Cover image */}
      <BlogCover cover={post.coverImage} alt={post.title} size="sm" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={clsx("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide", colors.bg, colors.text)}>
            {post.category.name}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {post.readingTime} min
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className={clsx("w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold", post.author.avatarGradient)}>
              {post.author.name.charAt(0)}
            </div>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-300" />
        </div>
      </div>
    </a>
  );
}
