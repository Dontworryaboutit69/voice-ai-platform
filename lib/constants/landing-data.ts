import type {
  NavLink,
  PricingTier,
  Testimonial,
  FAQItem,
  Integration,
  PlatformStat,
  ProblemCard,
  Feature,
  Step,
  ComparisonRow,
  SecurityFeature,
  FooterColumn,
} from "@/lib/types/landing";

export const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const problemCards: ProblemCard[] = [
  {
    icon: "Code2",
    title: "DIY Is a Black Hole",
    description:
      "Months of development, $10k\u2013$50k in costs, constant debugging. Your time is worth more than this.",
    accentColor: "red",
  },
  {
    icon: "Bot",
    title: "Basic AI Sounds Robotic",
    description:
      "Pay $49+/month for limited features, robotic voices, and zero customization. Your customers deserve better.",
    accentColor: "orange",
  },
  {
    icon: "DollarSign",
    title: "Agencies Burn Cash",
    description:
      "$5k\u2013$20k per agent, slow turnaround, ongoing maintenance fees. Not scalable for growing businesses.",
    accentColor: "yellow",
  },
];

export const features: Feature[] = [
  {
    icon: "Sparkles",
    title: "Claude AI\u2013Powered Generation",
    description:
      "Best-in-class AI generates production-ready prompts from your business details in seconds.",
    gradient: "from-indigo-600 to-violet-600",
  },
  {
    icon: "RefreshCw",
    title: "Self-Improving System",
    description:
      "Give feedback during testing and watch your agent improve automatically. It learns from every interaction.",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    icon: "Mic",
    title: "Premium Voice Cloning",
    description:
      "Upload audio to clone any voice, or choose from 100+ ultra-realistic voices. Your agent, your brand.",
    gradient: "from-fuchsia-600 to-orange-500",
  },
];

export const steps: Step[] = [
  {
    number: 1,
    icon: "ClipboardList",
    title: "Describe Your Business",
    description: "2-minute form. Tell us who you are and what you need.",
  },
  {
    number: 2,
    icon: "Sparkles",
    title: "AI Builds Your Agent",
    description: "Claude generates production-ready prompts in seconds.",
  },
  {
    number: 3,
    icon: "Phone",
    title: "Test For Free",
    description: "Call your agent. Give feedback. Watch it improve.",
  },
  {
    number: 4,
    icon: "Rocket",
    title: "Go Live",
    description: "Buy a number, activate, and track every call.",
  },
];

export const comparisonRows: ComparisonRow[] = [
  { feature: "Time to Live", us: "5 minutes", heyRosie: "1\u20132 hours", customBuild: "2\u20136 months" },
  { feature: "Starting Cost", us: "$0 (Free)", heyRosie: "$49/month", customBuild: "$10k\u2013$50k" },
  { feature: "Customization", us: "Fully Custom", heyRosie: "Limited", customBuild: "Full (if you code)" },
  { feature: "Voice Cloning", us: "Included", heyRosie: "No", customBuild: "Extra cost" },
  { feature: "Self-Improving AI", us: "Yes", heyRosie: "No", customBuild: "Manual only" },
  { feature: "Full Analytics", us: "Built-in", heyRosie: "Basic", customBuild: "Build yourself" },
  { feature: "Technical Skills", us: "Zero", heyRosie: "None", customBuild: "High" },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "We went from missing 40% of after-hours calls to capturing every single one. The AI sounds so natural our customers don\u2019t even realize it.",
    authorName: "Sarah Chen",
    authorRole: "Owner",
    company: "Coastal Dental Group",
    avatarUrl: null,
    metric: "100% call capture rate",
    rating: 5,
  },
  {
    id: "2",
    quote:
      "Setup took literally 5 minutes. We were handling calls the same day. The ROI was immediate\u2014we booked 23 new appointments in the first week.",
    authorName: "Marcus Rivera",
    authorRole: "Operations Manager",
    company: "ProClean Services",
    avatarUrl: null,
    metric: "23 bookings in week 1",
    rating: 5,
  },
  {
    id: "3",
    quote:
      "We tried Hey Rosie and two other platforms before this. Nothing comes close to the voice quality and customization. This is the real deal.",
    authorName: "Jennifer Walsh",
    authorRole: "Founder",
    company: "Walsh & Associates Law",
    avatarUrl: null,
    metric: "3x more conversions",
    rating: 5,
    isVideo: true,
  },
];

export const platformStats: PlatformStat[] = [
  { value: "60+", label: "Agents Deployed", description: "Across 12+ industries" },
  { value: "$750k+", label: "Revenue Generated", description: "By our voice AI agents" },
  { value: "5 min", label: "Average Setup", description: "From zero to live agent" },
  { value: "99.7%", label: "Uptime", description: "Enterprise-grade reliability" },
];

export const integrations: Integration[] = [
  { id: "1", name: "Google Calendar", logoUrl: null, description: "Book appointments directly", status: "active", category: "calendar" },
  { id: "2", name: "GoHighLevel", logoUrl: null, description: "Full CRM sync", status: "active", category: "crm" },
  { id: "3", name: "Calendly", logoUrl: null, description: "Schedule meetings seamlessly", status: "active", category: "calendar" },
  { id: "4", name: "Twilio", logoUrl: null, description: "Phone number provisioning", status: "active", category: "phone" },
  { id: "5", name: "ElevenLabs", logoUrl: null, description: "Premium voice synthesis", status: "active", category: "voice" },
  { id: "6", name: "Retell AI", logoUrl: null, description: "Real-time voice infrastructure", status: "active", category: "voice" },
  { id: "7", name: "Salesforce", logoUrl: null, description: "Enterprise CRM integration", status: "coming_soon", category: "crm" },
  { id: "8", name: "HubSpot", logoUrl: null, description: "Marketing & sales sync", status: "coming_soon", category: "crm" },
  { id: "9", name: "Zapier", logoUrl: null, description: "Connect 5,000+ apps", status: "coming_soon", category: "automation" },
];

export const securityFeatures: SecurityFeature[] = [
  { icon: "Shield", title: "SOC 2 Compliant", description: "Data hosted on SOC 2 certified infrastructure with continuous monitoring." },
  { icon: "Lock", title: "End-to-End Encryption", description: "All voice data encrypted in transit and at rest using AES-256." },
  { icon: "Eye", title: "Transparent Recording", description: "Full control over call recording, data retention, and deletion policies." },
  { icon: "FileCheck", title: "TCPA & GDPR Ready", description: "Built-in compliance tools for voice AI regulations worldwide." },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "$0",
    description: "Perfect for testing and getting started",
    features: [
      "1 AI agent",
      "50 test calls",
      "Basic analytics",
      "Community support",
      "5 voice options",
    ],
    cta: { label: "Start Free", href: "/agents" },
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    priceLabel: "$49",
    description: "Everything you need to go live",
    features: [
      "5 AI agents",
      "Unlimited calls",
      "Full analytics dashboard",
      "Priority support",
      "100+ voices & cloning",
      "CRM integrations",
      "Custom phone numbers",
    ],
    cta: { label: "Start Pro Trial", href: "/agents" },
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceLabel: "Custom",
    description: "For teams with advanced needs",
    features: [
      "Unlimited agents",
      "Unlimited calls",
      "Custom voice cloning",
      "Dedicated account manager",
      "SLA guarantee",
      "API access",
      "White-label option",
      "Custom integrations",
    ],
    cta: { label: "Contact Sales", href: "/agents" },
    isPopular: false,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "How does the AI agent actually work?",
    answer:
      "Our platform uses Claude AI to generate a custom conversational prompt based on your business details. This prompt powers a real-time voice agent through Retell AI, with premium voices from ElevenLabs. The result is a natural-sounding AI that can handle calls, book appointments, answer questions, and more\u2014all customized to your business.",
  },
  {
    id: "2",
    question: "What happens to recorded calls?",
    answer:
      "You have full control over your data. Call recordings are encrypted and stored securely. You can review, download, or delete recordings at any time. We never share your call data with third parties, and you can configure automatic deletion policies to match your compliance requirements.",
  },
  {
    id: "3",
    question: "Can I customize my agent\u2019s voice?",
    answer:
      "Absolutely. Choose from 100+ realistic voices across different accents, genders, and tones. Pro and Enterprise users can also clone any voice by uploading a short audio sample\u2014perfect for maintaining brand consistency.",
  },
  {
    id: "4",
    question: "How is this different from a basic chatbot?",
    answer:
      "Unlike text chatbots, our agents handle real phone calls with natural-sounding voices. They can understand context, handle interruptions, book appointments, transfer calls, and adapt their responses based on the conversation\u2014just like a real receptionist.",
  },
  {
    id: "5",
    question: "Do I need any technical skills?",
    answer:
      "Zero. Fill out a simple form about your business, and our AI builds your agent automatically. You can test it immediately and provide feedback in plain English to improve it. No coding, no technical setup, no API knowledge required.",
  },
  {
    id: "6",
    question: "What integrations do you support?",
    answer:
      "We currently integrate with Google Calendar, GoHighLevel, Calendly, and Twilio for phone numbers. Salesforce, HubSpot, and Zapier integrations are coming soon. Enterprise customers can request custom integrations.",
  },
  {
    id: "7",
    question: "Is there a free trial?",
    answer:
      "Yes! Our Starter plan is completely free\u2014no credit card required. You get 1 agent and 50 test calls to try everything out. When you\u2019re ready to go live, upgrade to Pro for $49/month.",
  },
  {
    id: "8",
    question: "How quickly can I go live?",
    answer:
      "Most users go from zero to a live, working agent in under 5 minutes. Fill out the form, test your agent, buy a phone number, and you\u2019re live. It\u2019s that simple.",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Templates", href: "/marketplace" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Security", href: "#security" },
    ],
  },
];

export const socialProofLogos = [
  "Coastal Dental",
  "ProClean Services",
  "Walsh & Associates",
  "Summit Roofing",
  "Pacific Plumbing",
  "Metro HVAC",
  "Elite Auto Repair",
  "Greenfield Law",
  "Sunrise Medical",
  "Atlas Construction",
];
