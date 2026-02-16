"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Mic,
  Target,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  Globe,
  Clock,
  Briefcase,
  MessageSquare,
  Brain,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

/* ─── Step definitions ─── */
const STEPS = [
  { id: "business", label: "Your Business", icon: Building2 },
  { id: "objective", label: "Call Handling", icon: Target },
  { id: "personality", label: "Personality", icon: Mic },
  { id: "data", label: "Data Collection", icon: CheckCircle2 },
] as const;

const BUSINESS_TYPES = [
  { id: "dental", label: "Dental", emoji: "🦷" },
  { id: "medical", label: "Medical", emoji: "🏥" },
  { id: "legal", label: "Legal", emoji: "⚖️" },
  { id: "real-estate", label: "Real Estate", emoji: "🏠" },
  { id: "hvac", label: "HVAC", emoji: "❄️" },
  { id: "plumbing", label: "Plumbing", emoji: "🔧" },
  { id: "roofing", label: "Roofing", emoji: "🏗️" },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "home-services", label: "Home Services", emoji: "🏡" },
  { id: "auto", label: "Auto", emoji: "🚗" },
  { id: "salon", label: "Salon & Spa", emoji: "💇" },
  { id: "other", label: "Other", emoji: "🏢" },
];

const PERSONALITY_OPTIONS = [
  {
    id: "friendly",
    label: "Friendly & Warm",
    description: "Casual, approachable, and conversational. Perfect for service businesses.",
    icon: "😊",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "professional",
    label: "Professional & Polished",
    description: "Formal, confident, and precise. Ideal for law firms and medical offices.",
    icon: "💼",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "empathetic",
    label: "Warm & Empathetic",
    description: "Caring, patient, and understanding. Great for healthcare and therapy.",
    icon: "💙",
    gradient: "from-cyan-500 to-blue-500",
  },
];

const DATA_FIELDS = [
  { id: "name", label: "Customer Name", icon: User, default: true },
  { id: "phone", label: "Phone Number", icon: Phone, default: true },
  { id: "email", label: "Email Address", icon: Mail, default: true },
  { id: "service_requested", label: "Service Requested", icon: Briefcase, default: false },
  { id: "address", label: "Address", icon: MapPin, default: false },
  { id: "company", label: "Company Name", icon: Building2, default: false },
  { id: "preferred_contact_time", label: "Preferred Contact Time", icon: Clock, default: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    description: "",
    website: "",
    location: "",
    callObjective: "",
    personalityTone: "friendly",
  });
  const [selectedFields, setSelectedFields] = useState<string[]>(["name", "phone", "email"]);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dataCollectionFields: selectedFields }),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/agents/${data.agentId}/generating`);
      } else {
        alert("Failed to generate prompt: " + data.error);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      alert("Failed to generate prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const canProceed = () => {
    if (currentStep === 0) return formData.businessName && formData.businessType && formData.description && formData.location;
    if (currentStep === 1) return formData.callObjective;
    if (currentStep === 2) return formData.personalityTone;
    if (currentStep === 3) return selectedFields.length > 0;
    return true;
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 dot-grid-dark" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Logo / Back to home */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">VoiceAI</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-5">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide">
              AI-Powered Setup
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Build Your Voice AI Agent
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Tell us about your business and our AI will generate a custom voice agent
            in under 30 seconds. No coding required.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <div key={step.id} className="flex items-center gap-1">
                <button
                  onClick={() => i <= currentStep && setCurrentStep(i)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : isComplete
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer"
                        : "bg-white/5 text-slate-500 border border-white/5"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={clsx("w-6 h-px", isComplete ? "bg-emerald-500/30" : "bg-white/10")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-6 sm:p-10">
            {/* ─── Step 1: Business Info ─── */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Tell us about your business</h2>
                  <p className="text-sm text-slate-400">This helps our AI build a custom prompt tailored to your industry.</p>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Dr. Smith's Dental Office"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {/* Business Type — visual cards */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Industry <span className="text-indigo-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, businessType: type.id })}
                        className={clsx(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                          formData.businessType === type.id
                            ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                            : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                        )}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <span className={clsx("text-[11px] font-medium", formData.businessType === type.id ? "text-indigo-300" : "text-slate-400")}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Describe your services <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="We provide general dentistry, cosmetic dentistry, teeth whitening, and emergency dental services for families in the Bay Area..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                  />
                </div>

                {/* Location + Website row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Service Area <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="San Francisco, CA"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website <span className="text-slate-500 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://drsmith.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 2: Call Objective ─── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">How should your agent handle calls?</h2>
                  <p className="text-sm text-slate-400">Describe what your AI should do when someone calls. Be as specific as you like.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Call Objective <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    name="callObjective"
                    rows={5}
                    value={formData.callObjective}
                    onChange={handleChange}
                    placeholder="Answer questions about our services and pricing. Book appointments into our calendar. For new patients, collect their name, phone, email, and insurance info. For emergencies, transfer to the on-call dentist at (555) 123-4567..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                  />
                </div>

                {/* Quick suggestions */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Common objectives — click to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Book appointments into my calendar",
                      "Qualify leads and collect contact info",
                      "Answer FAQs about services and pricing",
                      "Route emergencies to on-call staff",
                      "Take messages and send summary emails",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            callObjective: formData.callObjective
                              ? formData.callObjective + ". " + suggestion
                              : suggestion,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-white/8 bg-white/3 text-xs text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-300 transition-all"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI preview hint */}
                <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-300">AI will expand this into a full prompt</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Our fine-tuned AI takes your description and generates a detailed, production-ready voice prompt with proper call flows, objection handling, and closing scripts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 3: Personality ─── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Choose your agent&apos;s personality</h2>
                  <p className="text-sm text-slate-400">This sets the tone and communication style for your voice agent.</p>
                </div>

                <div className="space-y-3">
                  {PERSONALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, personalityTone: opt.id })}
                      className={clsx(
                        "w-full flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 text-left",
                        formData.personalityTone === opt.id
                          ? "border-indigo-500/50 bg-indigo-500/8 ring-1 ring-indigo-500/30"
                          : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg flex-shrink-0",
                          opt.gradient
                        )}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <div className={clsx("text-sm font-semibold", formData.personalityTone === opt.id ? "text-white" : "text-slate-300")}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                      </div>
                      {formData.personalityTone === opt.id && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Voice preview hint */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">You can change this later</p>
                    <p className="text-xs text-slate-400 mt-1">
                      After setup, you can pick from 1,000+ voices and fine-tune the personality in your prompt editor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 4: Data Collection ─── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">What info should your agent collect?</h2>
                  <p className="text-sm text-slate-400">Select the data fields your agent should extract from each call.</p>
                </div>

                <div className="space-y-2">
                  {DATA_FIELDS.map((field) => {
                    const FieldIcon = field.icon;
                    const isSelected = selectedFields.includes(field.id);
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => toggleField(field.id)}
                        className={clsx(
                          "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/8"
                            : "border-white/8 bg-white/3 hover:border-white/15"
                        )}
                      >
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isSelected ? "bg-indigo-500/20" : "bg-white/5"
                          )}
                        >
                          <FieldIcon className={clsx("w-4 h-4", isSelected ? "text-indigo-400" : "text-slate-500")} />
                        </div>
                        <span className={clsx("text-sm font-medium", isSelected ? "text-white" : "text-slate-400")}>
                          {field.label}
                        </span>
                        <div className="ml-auto">
                          <div
                            className={clsx(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                              isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-white/20 bg-transparent"
                            )}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500">You can add custom fields later in your agent settings.</p>
              </div>
            )}

            {/* ─── Navigation Buttons ─── */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/8">
              {currentStep > 0 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                    canProceed()
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                      : "bg-white/5 text-slate-500 cursor-not-allowed"
                  )}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isGenerating || !canProceed()}
                  className={clsx(
                    "flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300",
                    canProceed() && !isGenerating
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                      : "bg-white/5 text-slate-500 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate My Agent
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>Takes under 30 seconds</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-violet-400" />
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
