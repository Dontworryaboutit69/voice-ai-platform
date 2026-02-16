"use client";

import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import type { BlogPost } from "@/lib/types/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { clsx } from "clsx";

const categoryColors: Record<string, { bg: string; text: string; bgDark: string; textDark: string }> = {
  guides: { bg: "bg-indigo-500/10", text: "text-indigo-600", bgDark: "bg-indigo-500/20", textDark: "text-indigo-300" },
  industry: { bg: "bg-emerald-500/10", text: "text-emerald-600", bgDark: "bg-emerald-500/20", textDark: "text-emerald-300" },
  product: { bg: "bg-violet-500/10", text: "text-violet-600", bgDark: "bg-violet-500/20", textDark: "text-violet-300" },
  insights: { bg: "bg-amber-500/10", text: "text-amber-600", bgDark: "bg-amber-500/20", textDark: "text-amber-300" },
  comparisons: { bg: "bg-rose-500/10", text: "text-rose-600", bgDark: "bg-rose-500/20", textDark: "text-rose-300" },
};

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") continue;

    // ![alt text](url) — inline image
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      elements.push(
        <figure key={key++} className="my-10">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-xl shadow-lg"
          />
          {alt && (
            <figcaption className="mt-3 text-center text-sm text-slate-400 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      continue;
    }

    // ## Heading 2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-14 mb-5 tracking-tight"
        >
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // ### Heading 3
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={key++}
          className="text-xl sm:text-2xl font-bold text-slate-900 mt-10 mb-4"
        >
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Bullet lists
    if (line.startsWith("- ")) {
      const items: string[] = [line.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith("- ")) {
        i++;
        items.push(lines[i].slice(2));
      }
      elements.push(
        <ul key={key++} className="space-y-3 my-6 ml-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-600 leading-relaxed text-[17px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-3 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={key++}
        className="text-slate-600 leading-[1.85] mb-5 text-[17px]"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    );
  }

  return elements;
}

function formatInline(text: string): string {
  // Links: [text](url)
  let result = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-indigo-600 underline underline-offset-2 hover:text-indigo-800 transition-colors">$1</a>'
  );
  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  // Italic: *text*
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return result;
}

export function BlogPostContent({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const colors = categoryColors[post.category.id] || categoryColors.guides;
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* ─── Full-width cover hero ─── */}
      <div className="relative">
        <div className="relative overflow-hidden bg-slate-200 aspect-[21/9] min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pb-10 lg:pb-14">
            {/* Back */}
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </a>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={clsx("px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", colors.bgDark, colors.textDark)}>
                {post.category.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/50">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/50">
                <Clock className="w-3 h-3" />
                {post.readingTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ─── Author bar ─── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold", post.author.avatarGradient)}>
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{post.author.name}</div>
              <div className="text-xs text-slate-400">{post.author.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Article body ─── */}
      <article className="py-12 lg:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {renderContent(post.content)}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-14 pt-8 border-t border-slate-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 sm:p-10 text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[300px] h-[200px] rounded-full bg-indigo-100/50 blur-[80px]" />
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                Ready to build your AI agent?
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Custom prompts. Self-learning AI. 1,000+ voices. Start free&mdash;no credit card required.
              </p>
              <a
                href="/onboarding"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold text-[15px] hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* ─── Related posts ─── */}
      {relatedPosts.length > 0 && (
        <section className="py-16 lg:py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Related Articles
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
