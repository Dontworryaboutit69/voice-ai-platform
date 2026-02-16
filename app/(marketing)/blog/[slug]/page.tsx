import { notFound } from "next/navigation";
import { Metadata } from "next";
import { blogPosts } from "@/lib/constants/blog-data";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import {
  articleSchema,
  breadcrumbSchema,
  pillarArticleSchema,
  howToSchema,
} from "@/lib/seo/structured-data";

const SITE_URL = "https://voiceaiplatform.com";

/* Pillar content slugs get enhanced schema with speakable + about */
const PILLAR_SLUGS = new Set([
  "voice-ai-that-learns-from-every-call",
  "static-voice-ai-is-obsolete",
  "self-learning-voice-ai",
  "what-is-an-ai-receptionist",
  "best-ai-answering-service-small-business",
]);

/* HowTo schema slug */
const HOWTO_SLUG = "how-to-set-up-ai-receptionist";

/* ─── Static params for build-time generation ─── */
export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

/* ─── Dynamic metadata for SEO ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.tags.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: canonicalUrl,
      siteName: "VoiceAI",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      section: post.category.name,
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

/* ─── Page component ─── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category.id === post.category.id && p.id !== post.id)
    .slice(0, 3);

  const isPillar = PILLAR_SLUGS.has(post.slug);
  const isHowTo = post.slug === HOWTO_SLUG;

  return (
    <>
      {/* JSON-LD Structured Data — pillar posts get enhanced schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            isPillar ? pillarArticleSchema(post) : articleSchema(post)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(post)),
        }}
      />
      {/* HowTo schema for setup guide */}
      {isHowTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema(post)),
          }}
        />
      )}
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
