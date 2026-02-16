import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/constants/blog-data";

const SITE_URL = "https://voiceaiplatform.com";

/* Slugs that deserve extra priority — pillar content & conversion pages */
const HIGH_PRIORITY_SLUGS = new Set([
  "voice-ai-that-learns-from-every-call",
  "static-voice-ai-is-obsolete",
  "self-learning-voice-ai",
  "what-is-an-ai-receptionist",
  "best-ai-answering-service-small-business",
  "how-to-set-up-ai-receptionist",
  "agency-to-saas-voice-ai-story",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  /* ── Static pages ── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/onboarding`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  /* ── Blog posts — pillar content gets 0.9, featured gets 0.8, rest 0.7 ── */
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: (HIGH_PRIORITY_SLUGS.has(post.slug) ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: HIGH_PRIORITY_SLUGS.has(post.slug) ? 0.9 : post.featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...blogPages];
}
