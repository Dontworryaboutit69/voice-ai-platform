export interface NavLink {
  label: string;
  href: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number | null;
  priceLabel: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  isPopular: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string;
  avatarUrl: string | null;
  metric?: string;
  rating: number;
  isVideo?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Integration {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string;
  status: "active" | "coming_soon";
  category: "crm" | "calendar" | "phone" | "voice" | "automation";
}

export interface PlatformStat {
  value: string;
  label: string;
  description: string;
}

export interface ProblemCard {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string;
  heyRosie: string;
  customBuild: string;
}

export interface SecurityFeature {
  icon: string;
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
