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
  AgentPersona,
  QuizStep,
  QuizResult,
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
    title: "Building From Scratch Is a Trap",
    description:
      "You\u2019ll spend months stitching together APIs, prompt-engineering voice flows, and debugging latency issues. Even with a dev team, you\u2019re looking at $10k\u2013$50k before a single call gets answered. That\u2019s time and money you don\u2019t have.",
    accentColor: "red",
  },
  {
    icon: "Bot",
    title: "Cookie-Cutter AI Fails Your Customers",
    description:
      "Generic AI tools give every business the same robotic script. No custom prompts for your industry. No voice options that match your brand. No learning from past calls. They handle one call at a time. Your customers hear the difference\u2014and they hang up.",
    accentColor: "orange",
  },
  {
    icon: "DollarSign",
    title: "Agencies Charge $5k\u2013$20k Per Agent",
    description:
      "We know because we were that agency. Custom voice AI agents sold for $5k\u2013$20k each, with ongoing retainers for tweaks. Great for us, terrible for scaling businesses. There had to be a better way.",
    accentColor: "yellow",
  },
];

export const features: Feature[] = [
  {
    icon: "Sparkles",
    title: "Custom Prompts, Not Templates",
    description:
      "Our fine-tuned AI builds a master prompt specifically for your business\u2014your services, your tone, your rules. Or grab a pre-built template from the marketplace and customize from there.",
    gradient: "from-indigo-600 to-violet-600",
  },
  {
    icon: "RefreshCw",
    title: "The First Self-Learning Voice AI",
    description:
      "Your agent converts at 85% the rate of a top human rep\u2014at 3% of the cost. And it gets smarter after every call. Just type what you want changed and it rewrites its own prompts autonomously.",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    icon: "Mic",
    title: "Thousands of Voices. Or Clone Your Own.",
    description:
      "Access voices from ElevenLabs, OpenAI, Deepgram, and Cartesia\u2014thousands of options across accents, genders, and tones. Or upload a clip and clone any voice you want.",
    gradient: "from-fuchsia-600 to-orange-500",
  },
];

export const steps: Step[] = [
  {
    number: 1,
    icon: "ClipboardList",
    title: "Describe Your Business",
    description:
      "Fill out a simple form or pick a template from the marketplace. Your industry, services, hours, and call handling preferences. Under 2 minutes.",
  },
  {
    number: 2,
    icon: "Sparkles",
    title: "AI Builds Your Agent",
    description:
      "Our fine-tuned AI generates a production-ready voice prompt custom-built for your exact business. Not a generic script\u2014a custom build.",
  },
  {
    number: 3,
    icon: "Phone",
    title: "Test It. Train It. Deploy.",
    description:
      "Call your agent. Type what you want changed\u2014\u201Cbe warmer,\u201D \u201Cask about insurance first.\u201D It rewrites itself in seconds. No Zoom calls. No back and forth.",
  },
  {
    number: 4,
    icon: "Rocket",
    title: "Go Live Instantly",
    description:
      "Pick a number, connect your calendar or CRM, and flip the switch. Handle 20 calls at once, 24/7. Done.",
  },
];

export const comparisonRows: ComparisonRow[] = [
  { feature: "Time to Live", us: "Under 5 minutes", heyRosie: "1\u20132 hours", customBuild: "2\u20136 months" },
  { feature: "Starting Cost", us: "Free (then $39.99/mo)", heyRosie: "$49/month", customBuild: "$5k\u2013$20k" },
  { feature: "Concurrent Calls", us: "Up to 20 simultaneous", heyRosie: "1 at a time", customBuild: "Depends on build" },
  { feature: "Custom Prompts", us: "AI-generated per business", heyRosie: "Basic templates", customBuild: "Manual scripting" },
  { feature: "Voice Options", us: "1,000+ & voice cloning", heyRosie: "Limited selection", customBuild: "Build your own" },
  { feature: "Self-Learning AI", us: "Autonomous improvement", heyRosie: "No", customBuild: "Manual only" },
  { feature: "Conversion Rate", us: "85% of top human reps", heyRosie: "Unknown", customBuild: "Varies" },
  { feature: "Technical Skills", us: "Zero required", heyRosie: "None", customBuild: "Developer team" },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "We were missing 40% of after-hours calls. Now every single one gets answered by an AI that knows our services, our providers, and our booking system. Patients can\u2019t tell the difference\u2014and our staff finally has time to focus on who\u2019s actually in the office.",
    authorName: "Sarah Chen",
    authorRole: "Owner",
    company: "Coastal Dental Group",
    avatarUrl: null,
    metric: "100% call capture rate",
    rating: 5,
    date: "Jan 2025",
    avatarGradient: "from-violet-500 to-indigo-500",
  },
  {
    id: "2",
    quote:
      "I filled out the form, tested the agent, and had it answering calls the same afternoon. First week we booked 23 new jobs we would have missed. That\u2019s not a hypothetical\u2014those are real revenue-generating appointments.",
    authorName: "Marcus Rivera",
    authorRole: "Operations Manager",
    company: "ProClean Services",
    avatarUrl: null,
    metric: "23 bookings in week 1",
    rating: 5,
    date: "Feb 2025",
    avatarGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "3",
    quote:
      "We evaluated Hey Rosie, Smith.ai, and two other platforms. The voice quality here is in a completely different league, and the fact that the prompts are custom-built for our law firm\u2014not some generic template\u2014made the decision easy.",
    authorName: "Jennifer Walsh",
    authorRole: "Founding Partner",
    company: "Walsh & Associates Law",
    avatarUrl: null,
    metric: "3x more qualified leads",
    rating: 5,
    isVideo: true,
    date: "Dec 2024",
    avatarGradient: "from-pink-500 to-rose-500",
  },
  {
    id: "4",
    quote:
      "I\u2019m a doctor, not a tech person. I told the AI about my practice and it built an agent that handles insurance verification questions, knows every provider\u2019s specialty, and books into our exact availability windows. Took maybe 3 minutes to set up.",
    authorName: "Dr. Michael Torres",
    authorRole: "Practice Owner",
    company: "Summit Family Medicine",
    avatarUrl: null,
    rating: 5,
    date: "Jan 2025",
    avatarGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "5",
    quote:
      "We lose money every time a call goes to voicemail on weekends. Since going live, every Saturday and Sunday call gets booked. Revenue is up 35% this quarter and I haven\u2019t hired a single extra person.",
    authorName: "Tom Calhoun",
    authorRole: "Owner",
    company: "Metro HVAC Solutions",
    avatarUrl: null,
    metric: "35% revenue increase",
    rating: 5,
    date: "Nov 2024",
    avatarGradient: "from-amber-500 to-orange-500",
    isVideo: true,
  },
  {
    id: "6",
    quote:
      "The self-learning part is what blew my mind. After the first day of calls, I said \u2018be warmer with anxious callers\u2019 and it literally rewrote its own script. Next call was noticeably better. It\u2019s like having a receptionist that actually listens to feedback.",
    authorName: "Rachel Kim",
    authorRole: "CEO",
    company: "Brightside Therapy",
    avatarUrl: null,
    rating: 5,
    date: "Feb 2025",
    avatarGradient: "from-fuchsia-500 to-purple-500",
  },
  {
    id: "7",
    quote:
      "200+ calls a week, zero complaints. We used to have three people rotating phone duty. Now one AI agent handles everything and the team focuses on actual plumbing work.",
    authorName: "David Park",
    authorRole: "Director of Operations",
    company: "Pacific Plumbing Group",
    avatarUrl: null,
    metric: "200+ calls/week",
    rating: 5,
    date: "Dec 2024",
    avatarGradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "8",
    quote:
      "We were paying $4,500/month for a human answering service. Switched to this at $49/month. The AI is honestly faster and more accurate\u2014it never forgets a detail, never puts someone on hold. Saved us over $50k in the first year alone.",
    authorName: "Amanda Foster",
    authorRole: "Managing Partner",
    company: "Foster & Grant Legal",
    avatarUrl: null,
    metric: "$50k+ saved year 1",
    rating: 5,
    date: "Oct 2024",
    avatarGradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "9",
    quote:
      "We cloned our best receptionist\u2019s voice. Customers call in and think it\u2019s her. The brand consistency is perfect\u2014same warmth, same tone, same personality. That\u2019s what sold us over every other tool we tried.",
    authorName: "Luis Hernandez",
    authorRole: "Marketing Director",
    company: "Elite Auto Repair",
    avatarUrl: null,
    rating: 5,
    date: "Jan 2025",
    avatarGradient: "from-rose-500 to-pink-500",
  },
  {
    id: "10",
    quote:
      "Went live Friday at 3pm. By Monday morning we had 12 new property inquiries captured over the weekend that would have gone straight to voicemail. Paid for itself in 48 hours.",
    authorName: "Karen Mitchell",
    authorRole: "Owner",
    company: "Greenfield Property Management",
    avatarUrl: null,
    metric: "12 leads in 48 hours",
    rating: 5,
    date: "Nov 2024",
    avatarGradient: "from-teal-500 to-emerald-500",
  },
  {
    id: "11",
    quote:
      "Three locations, three different greetings, three different booking calendars\u2014one AI agent handles all of it. Each location has its own custom prompt that knows that specific office\u2019s hours, services, and providers. Replaced three part-time receptionists.",
    authorName: "Brian Nguyen",
    authorRole: "Franchise Owner",
    company: "Sunrise Chiropractic",
    avatarUrl: null,
    rating: 5,
    date: "Feb 2025",
    avatarGradient: "from-orange-500 to-amber-500",
  },
  {
    id: "12",
    quote:
      "Our elderly patients were our biggest concern. Would they hate talking to an AI? Turns out they love it. It\u2019s patient, never rushed, repeats things when asked. Some of them think it\u2019s a new hire we brought on.",
    authorName: "Patricia Owens",
    authorRole: "Office Manager",
    company: "Lakeview Senior Care",
    avatarUrl: null,
    rating: 5,
    date: "Dec 2024",
    avatarGradient: "from-purple-500 to-indigo-500",
  },
];

export const platformStats: PlatformStat[] = [
  { value: "85%", label: "Conversion vs. Human", description: "At 3% of the cost" },
  { value: "20", label: "Concurrent Calls", description: "Handled simultaneously per agent" },
  { value: "1,000+", label: "Voice Options", description: "Plus custom voice cloning" },
  { value: "5 min", label: "From Form to Live", description: "No Zoom calls. No back & forth." },
];

export const integrations: Integration[] = [
  { id: "1", name: "Google Calendar", logoUrl: null, description: "Book directly into availability", status: "active", category: "calendar" },
  { id: "2", name: "GoHighLevel", logoUrl: null, description: "Sync leads and contacts to your CRM", status: "active", category: "crm" },
  { id: "3", name: "Calendly", logoUrl: null, description: "Schedule through your existing booking flow", status: "active", category: "calendar" },
  { id: "4", name: "Twilio", logoUrl: null, description: "Provision and manage phone numbers", status: "active", category: "phone" },
  { id: "5", name: "ElevenLabs", logoUrl: null, description: "Ultra-realistic voice synthesis", status: "active", category: "voice" },
  { id: "6", name: "Retell AI", logoUrl: null, description: "Real-time voice conversation engine", status: "active", category: "voice" },
  { id: "7", name: "Salesforce", logoUrl: null, description: "Enterprise CRM integration", status: "coming_soon", category: "crm" },
  { id: "8", name: "HubSpot", logoUrl: null, description: "Marketing & sales pipeline sync", status: "coming_soon", category: "crm" },
  { id: "9", name: "Zapier", logoUrl: null, description: "Connect to 5,000+ business tools", status: "coming_soon", category: "automation" },
];

export const securityFeatures: SecurityFeature[] = [
  { icon: "Shield", title: "SOC 2 Infrastructure", description: "Your data runs on SOC 2 certified infrastructure with continuous security monitoring and auditing." },
  { icon: "Lock", title: "AES-256 Encryption", description: "Every call, transcript, and piece of customer data is encrypted in transit and at rest. No exceptions." },
  { icon: "Eye", title: "Full Recording Control", description: "You decide what gets recorded, how long it\u2019s stored, and when it\u2019s deleted. Complete data sovereignty." },
  { icon: "FileCheck", title: "TCPA & GDPR Compliant", description: "Built-in compliance tools for voice AI regulations. Consent management, opt-out handling, and audit trails." },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    description: "Build and test your agent. No credit card needed.",
    features: [
      "1 custom AI agent",
      "50 test calls included",
      "Self-learning feedback loop",
      "Basic call analytics",
      "5 premium voice options",
      "Marketplace templates",
    ],
    cta: { label: "Get Started Free", href: "/agents" },
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 39.99,
    priceLabel: "$39.99",
    description: "Go live. The same quality agencies charge thousands for.",
    features: [
      "1 AI agent",
      "Unlimited live calls",
      "1,000+ voices & voice cloning",
      "Full analytics dashboard",
      "CRM & calendar integrations",
      "Custom phone number",
      "Self-learning AI",
      "Priority support",
    ],
    cta: { label: "Start Pro", href: "/agents" },
    isPopular: true,
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    priceLabel: "$99",
    description: "Multiple agents. Handle 20+ concurrent calls.",
    features: [
      "Multiple AI agents",
      "Unlimited calls",
      "20 concurrent call handling",
      "Advanced voice cloning suite",
      "Full analytics & reporting",
      "All integrations included",
      "Custom phone numbers",
      "Dedicated support",
    ],
    cta: { label: "Start Business", href: "/agents" },
    isPopular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    priceLabel: "Custom",
    description: "Custom-built by our team. White-label ready.",
    features: [
      "Unlimited agents & calls",
      "Custom concurrency limits",
      "Dedicated account manager",
      "SLA guarantee (99.9%+)",
      "API & webhook access",
      "White-label deployment",
      "Custom integrations",
      "Hands-on onboarding",
    ],
    cta: { label: "Contact Sales", href: "/agents" },
    isPopular: false,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "How is this different from other voice AI tools?",
    answer:
      "Three things no one else offers: First, every agent gets a custom prompt built specifically for your business\u2014not a generic template. Second, our agents are self-learning\u2014they autonomously rewrite their own prompts based on your feedback and call history. Third, they convert at 85% the rate of a top human rep at a fraction of the cost. This is literally the same process agencies charge $5k\u2013$20k for, without the Zoom calls and back-and-forth.",
  },
  {
    id: "2",
    question: "What does \u2018self-learning\u2019 actually mean?",
    answer:
      "After calls, you can give feedback in plain English like \u2018be more empathetic with nervous callers\u2019 or \u2018always ask about insurance before booking.\u2019 The AI analyzes your current prompt against the call history and rewrites itself to improve. Every version is tracked so you can roll back anytime. It\u2019s like having an employee who actually gets better from feedback.",
  },
  {
    id: "3",
    question: "How many voices can I choose from?",
    answer:
      "Over 1,000 voices across five premium providers\u2014ElevenLabs, OpenAI, Deepgram, Cartesia, and Retell\u2019s native voices. Different accents, genders, ages, and tones. Pro and Enterprise users can also clone any voice by uploading a short audio sample to perfectly match your brand.",
  },
  {
    id: "4",
    question: "I\u2019m not technical. Can I really set this up myself?",
    answer:
      "That\u2019s the whole point. Two paths: fill out a simple form about your business and our AI builds your agent in about 30 seconds, or pick a pre-built template from the marketplace and add your basic info. Test it by calling it directly, type what you want changed in plain English, and go live. No coding. No Zoom calls. No developer required.",
  },
  {
    id: "5",
    question: "What can the AI agent actually do on a call?",
    answer:
      "Everything a great receptionist can: answer questions about your business, book appointments into your real calendar, qualify leads, handle objections, route urgent calls, collect caller information, and even follow up. Each agent is prompted with your specific services, hours, providers, and booking rules.",
  },
  {
    id: "6",
    question: "What integrations do you support?",
    answer:
      "Live today: Google Calendar, Calendly, GoHighLevel CRM, and Twilio for phone numbers. The agent books directly into your real availability\u2014no double bookings. Salesforce, HubSpot, and Zapier are coming soon. Enterprise customers can request custom integrations.",
  },
  {
    id: "7",
    question: "How much does it cost compared to hiring or an answering service?",
    answer:
      "A human receptionist costs $3,000\u2013$5,000/month and handles one call at a time. An answering service runs $1,000\u2013$4,500/month. Agencies charge $5,000\u2013$20,000 per custom AI agent. Our Pro plan starts at $39.99/month, converts at 85% of a top human rep, handles 20 calls simultaneously, works 24/7, and gets smarter over time.",
  },
  {
    id: "8",
    question: "What happens to my call recordings and data?",
    answer:
      "You have complete control. Recordings are AES-256 encrypted and stored securely. You can review, download, or delete them anytime. Set automatic retention policies. We never share your data with third parties and our infrastructure is SOC 2 certified.",
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

export const agentPersonas: AgentPersona[] = [
  {
    id: "receptionist",
    name: "Ava",
    role: "Front Desk Receptionist",
    industry: "Medical & Dental",
    description:
      "Answers calls, books into your real calendar, handles insurance verification questions, and knows every provider\u2019s specialty and availability.",
    avatarGradient: "from-violet-500 to-indigo-600",
    avatarEmoji: "\ud83d\udc69\u200d\u2695\ufe0f",
    accentColor: "violet",
    audioUrl: null,
    audioLabel: "Listen to Ava handle a booking call",
    stats: { label: "Calls Handled", value: "2,400+" },
  },
  {
    id: "sales",
    name: "Marcus",
    role: "Inbound Sales Agent",
    industry: "Home Services",
    description:
      "Qualifies leads with your exact criteria, provides service estimates, schedules consultations, and captures every detail for your CRM.",
    avatarGradient: "from-emerald-500 to-teal-600",
    avatarEmoji: "\ud83d\udc68\u200d\ud83d\udcbc",
    accentColor: "emerald",
    audioUrl: null,
    audioLabel: "Listen to Marcus qualify a lead",
    stats: { label: "Leads Converted", value: "380+" },
  },
  {
    id: "support",
    name: "Sophie",
    role: "Customer Support Agent",
    industry: "SaaS & Tech",
    description:
      "Walks callers through troubleshooting, resolves common issues from your knowledge base, escalates when needed, and logs everything.",
    avatarGradient: "from-pink-500 to-rose-600",
    avatarEmoji: "\ud83d\udc69\u200d\ud83d\udcbb",
    accentColor: "pink",
    audioUrl: null,
    audioLabel: "Listen to Sophie resolve a support issue",
    stats: { label: "Issues Resolved", value: "1,800+" },
  },
  {
    id: "concierge",
    name: "James",
    role: "Concierge & Booking",
    industry: "Hospitality & Real Estate",
    description:
      "Handles reservations, answers detailed property questions, checks availability in real time, and gives personalized recommendations.",
    avatarGradient: "from-amber-500 to-orange-600",
    avatarEmoji: "\ud83c\udfe2",
    accentColor: "amber",
    audioUrl: null,
    audioLabel: "Listen to James handle a reservation",
    stats: { label: "Bookings Made", value: "920+" },
  },
  {
    id: "intake",
    name: "Elena",
    role: "Legal Intake Specialist",
    industry: "Law & Professional",
    description:
      "Conducts structured intake calls, gathers case details using your firm\u2019s criteria, assesses urgency, and books attorney consultations.",
    avatarGradient: "from-cyan-500 to-blue-600",
    avatarEmoji: "\u2696\ufe0f",
    accentColor: "cyan",
    audioUrl: null,
    audioLabel: "Listen to Elena conduct an intake call",
    stats: { label: "Cases Opened", value: "540+" },
  },
  {
    id: "afterhours",
    name: "Riley",
    role: "After-Hours Agent",
    industry: "Any Business",
    description:
      "Your 24/7 safety net. Captures leads, books appointments, handles emergencies by your rules, and sends you a full summary every morning.",
    avatarGradient: "from-fuchsia-500 to-purple-600",
    avatarEmoji: "\ud83c\udf19",
    accentColor: "fuchsia",
    audioUrl: null,
    audioLabel: "Listen to Riley handle an after-hours call",
    stats: { label: "After-Hours Calls", value: "3,100+" },
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

export const quizSteps: QuizStep[] = [
  {
    id: "pain",
    question: "What\u2019s costing you the most right now?",
    subtitle: "Pick the one that hits hardest",
    options: [
      {
        id: "missed",
        emoji: "\ud83d\udcf5",
        title: "Missed Calls = Lost Money",
        description: "After-hours and busy times mean leads go to voicemail and never call back",
        accentColor: "red",
      },
      {
        id: "cost",
        emoji: "\ud83d\udcb8",
        title: "Receptionist Costs Are Insane",
        description: "Paying $3k\u2013$5k/month for someone who can only handle one call at a time",
        accentColor: "orange",
      },
      {
        id: "quality",
        emoji: "\ud83e\udd16",
        title: "Current AI Sounds Terrible",
        description: "Tried other tools but the robotic voice and generic scripts drive customers away",
        accentColor: "yellow",
      },
      {
        id: "scale",
        emoji: "\ud83d\udcc8",
        title: "Growing Faster Than I Can Hire",
        description: "Call volume is up but I can\u2019t keep adding staff to answer phones",
        accentColor: "emerald",
      },
    ],
  },
  {
    id: "industry",
    question: "What type of business do you run?",
    subtitle: "Your agent will be custom-built for your industry",
    options: [
      {
        id: "medical",
        emoji: "\ud83c\udfe5",
        title: "Healthcare",
        description: "Medical, dental, therapy, veterinary, senior care",
        accentColor: "blue",
      },
      {
        id: "home",
        emoji: "\ud83d\udd27",
        title: "Home Services",
        description: "HVAC, plumbing, electrical, cleaning, roofing",
        accentColor: "amber",
      },
      {
        id: "legal",
        emoji: "\u2696\ufe0f",
        title: "Professional Services",
        description: "Law, accounting, consulting, real estate, finance",
        accentColor: "violet",
      },
      {
        id: "other",
        emoji: "\ud83c\udfe2",
        title: "Other Industry",
        description: "Retail, hospitality, SaaS, auto, or something else",
        accentColor: "slate",
      },
    ],
  },
  {
    id: "volume",
    question: "How many calls does your business get daily?",
    subtitle: "This helps us recommend the right plan for your volume",
    options: [
      {
        id: "low",
        emoji: "\ud83d\udcde",
        title: "Under 10",
        description: "Lower volume but every single call is high-value",
        accentColor: "emerald",
      },
      {
        id: "medium",
        emoji: "\ud83d\udcf1",
        title: "10\u201350",
        description: "Steady flow and we\u2019re starting to miss some",
        accentColor: "blue",
      },
      {
        id: "high",
        emoji: "\ud83d\udd25",
        title: "50\u2013200",
        description: "High volume\u2014phones are ringing off the hook",
        accentColor: "orange",
      },
      {
        id: "enterprise",
        emoji: "\ud83c\udfd7\ufe0f",
        title: "200+",
        description: "Enterprise scale across multiple locations or lines",
        accentColor: "violet",
      },
    ],
  },
];

export const quizResult: QuizResult = {
  headline: "Your Custom AI Agent Is Ready to Build",
  description:
    "Based on your answers, we\u2019ll generate a voice AI agent built specifically for your business\u2014not a template. Start free, no credit card required.",
  discount: "\ud83c\udf89 Limited offer: First month of Pro free when you sign up today",
  cta: { label: "Build My Custom Agent \u2014 Free", href: "/agents" },
};
