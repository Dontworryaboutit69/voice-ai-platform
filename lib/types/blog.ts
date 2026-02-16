export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown-style content (supports ![alt](url) for images)
  author: BlogAuthor;
  publishedAt: string; // ISO date
  updatedAt?: string;
  category: BlogCategory;
  tags: string[];
  featured?: boolean;
  readingTime: number; // minutes
  metaTitle: string; // SEO title
  metaDescription: string; // SEO description
  coverImage: string; // URL to cover photo
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatarGradient: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}
