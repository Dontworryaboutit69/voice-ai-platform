import type { BlogPost } from "@/lib/types/blog";

const SITE_URL = "https://voiceaiplatform.com";
const SITE_NAME = "VoiceAI";
const LOGO_URL = `${SITE_URL}/logo.png`;

/* ── Organization schema (sitewide) ── */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "Build agency-grade voice AI phone agents in minutes. Self-learning AI, 1,000+ voices, real calendar integrations. No coding required.",
    sameAs: [
      // Add social profiles when ready
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

/* ── WebSite schema with search action ── */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Build voice AI phone agents for your business. Custom prompts, self-learning AI, 1,000+ voices. Start free.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };
}

/* ── Article schema for blog posts ── */
export function articleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category.name,
    wordCount: post.content.split(/\s+/).length,
  };
}

/* ── BreadcrumbList for blog posts ── */
export function breadcrumbSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

/* ── FAQ schema ── */
export function faqSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/* ── SoftwareApplication schema for the product ── */
export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VoiceAI Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Build agency-grade voice AI phone agents for your business in under 5 minutes. Self-learning AI, 1,000+ premium voices, real calendar and CRM integrations. No coding required.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "1 AI agent, 10 minutes/month, 100+ voices",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "39.99",
        priceCurrency: "USD",
        description: "3 AI agents, 500 minutes/month, 1,000+ voices, self-learning AI, voice cloning",
      },
      {
        "@type": "Offer",
        name: "Business",
        price: "99.00",
        priceCurrency: "USD",
        description: "10 AI agents, 2,000 minutes/month, priority support, advanced analytics",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "60",
      bestRating: "5",
    },
  };
}

/* ── HowTo schema for setup/tutorial posts ── */
export function howToSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage,
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Describe Your Business",
        text: "Visit VoiceAI and click Get Started Free. Fill out a simple form about your business — what you do, your services, hours, and how you want calls handled. No technical knowledge needed, just plain English.",
        url: `${SITE_URL}/onboarding`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "AI Builds Your Custom Prompt",
        text: "VoiceAI's fine-tuned AI takes your business description and generates a production-quality master prompt specifically engineered for your business type, services, and call handling preferences.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Test and Refine",
        text: "Call your agent immediately to test it. If anything needs adjustment, describe the change in plain English and the AI rewrites its own prompt automatically.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Deploy and Go Live",
        text: "Connect your phone number and your AI receptionist starts answering calls immediately — 24/7, handling 20 concurrent calls. The self-learning engine begins improving from your very first call.",
      },
    ],
    tool: [
      {
        "@type": "HowToTool",
        name: "VoiceAI Platform",
      },
    ],
    supply: [
      {
        "@type": "HowToSupply",
        name: "Business phone number",
      },
    ],
  };
}

/* ── Enhanced article schema with speakable for pillar content ── */
export function pillarArticleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category.name,
    wordCount: post.content.split(/\\s+/).length,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".post-excerpt", ".post-content p:first-of-type"],
    },
    about: [
      {
        "@type": "Thing",
        name: "Self-learning voice AI",
        description: "AI phone agents that autonomously learn from every conversation and improve themselves over time",
      },
      {
        "@type": "Thing",
        name: "Voice AI platform",
        description: "A platform for building and deploying AI-powered phone agents for businesses",
      },
    ],
    mentions: [
      {
        "@type": "SoftwareApplication",
        name: "VoiceAI",
        applicationCategory: "BusinessApplication",
        url: SITE_URL,
      },
    ],
  };
}

/* ── ItemList schema for blog index page ── */
export function blogListSchema(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "VoiceAI Blog",
    description: "Guides, insights, and strategies for voice AI and AI phone agents",
    numberOfItems: posts.length,
    itemListElement: posts.slice(0, 10).map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };
}

/* ── LocalBusiness schema (for local SEO signals) ── */
export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "VoiceAI - AI Phone Agent Platform",
    serviceType: "AI Receptionist & Voice AI Agent Builder",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    description:
      "AI-powered phone answering service that books appointments, qualifies leads, and handles customer calls 24/7. Converts at 85% the rate of top human agents at 3% of the cost.",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "VoiceAI Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Receptionist Agent",
            description: "Custom AI phone agent that answers calls, books appointments, and qualifies leads 24/7",
          },
        },
      ],
    },
  };
}
