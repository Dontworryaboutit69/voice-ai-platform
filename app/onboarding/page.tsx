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
  Briefcase,
  MessageSquare,
  Brain,
  Zap,
  PhoneForwarded,
  Shield,
  CalendarCheck,
  ClipboardList,
  HeadphonesIcon,
  UserCheck,
  ShieldAlert,
  Plus,
  X,
  ListChecks,
  GitBranch,
} from "lucide-react";
import { clsx } from "clsx";

/* --- Step definitions --- */
const STEPS = [
  { id: "business", label: "Your Business", icon: Building2 },
  { id: "goal", label: "Call Goal", icon: Target },
  { id: "transfer", label: "Transfers", icon: PhoneForwarded },
  { id: "salesprocess", label: "Sales Process", icon: GitBranch },
  { id: "objections", label: "Objections", icon: ShieldAlert },
  { id: "personality", label: "Personality", icon: Mic },
] as const;

const BUSINESS_TYPES = [
  { id: "dental", label: "Dental", emoji: "\u{1F9B7}" },
  { id: "medical", label: "Medical", emoji: "\u{1F3E5}" },
  { id: "legal", label: "Legal", emoji: "\u2696\uFE0F" },
  { id: "real-estate", label: "Real Estate", emoji: "\u{1F3E0}" },
  { id: "hvac", label: "HVAC", emoji: "\u2744\uFE0F" },
  { id: "plumbing", label: "Plumbing", emoji: "\u{1F527}" },
  { id: "roofing", label: "Roofing", emoji: "\u{1F3D7}\uFE0F" },
  { id: "restaurant", label: "Restaurant", emoji: "\u{1F37D}\uFE0F" },
  { id: "home-services", label: "Home Services", emoji: "\u{1F3E1}" },
  { id: "auto", label: "Auto", emoji: "\u{1F697}" },
  { id: "salon", label: "Salon & Spa", emoji: "\u{1F487}" },
  { id: "landscaping", label: "Landscaping", emoji: "\u{1F333}" },
  { id: "catering", label: "Catering", emoji: "\u{1F370}" },
  { id: "cleaning", label: "Cleaning", emoji: "\u2728" },
  { id: "pest-control", label: "Pest Control", emoji: "\u{1F41B}" },
  { id: "financial", label: "Financial", emoji: "\u{1F4B0}" },
  { id: "insurance", label: "Insurance", emoji: "\u{1F6E1}\uFE0F" },
  { id: "other", label: "Other", emoji: "\u{1F3E2}" },
];

const CALL_GOALS = [
  {
    id: "book_appointments",
    label: "Book Appointments",
    description: "Qualify callers and book them into your calendar.",
    icon: CalendarCheck,
  },
  {
    id: "collect_info",
    label: "Collect Info for Callback",
    description: "Gather caller details so your team can follow up.",
    icon: ClipboardList,
  },
  {
    id: "answer_and_route",
    label: "Answer Questions & Route",
    description: "Handle FAQs and transfer when needed.",
    icon: HeadphonesIcon,
  },
  {
    id: "screen_and_transfer",
    label: "Screen & Transfer",
    description: "Greet callers, ask basic questions, then transfer to your team.",
    icon: PhoneForwarded,
  },
];

const TRANSFER_TRIGGERS = [
  { id: "customer_requests", label: "Customer asks for a real person" },
  { id: "existing_customer", label: "Existing customer calling back" },
  { id: "cant_answer", label: "Question the AI can't answer" },
  { id: "emergency", label: "Urgent or emergency situation" },
];

const PERSONALITY_OPTIONS = [
  {
    id: "friendly",
    label: "Friendly & Warm",
    description: "Casual, approachable, and conversational. Perfect for service businesses.",
    icon: "\u{1F60A}",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "professional",
    label: "Professional & Polished",
    description: "Confident and precise, but still personable. Ideal for law firms and medical offices.",
    icon: "\u{1F4BC}",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "empathetic",
    label: "Warm & Empathetic",
    description: "Caring, patient, and understanding. Great for healthcare and therapy.",
    icon: "\u{1F499}",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "energetic",
    label: "Energetic & Upbeat",
    description: "High-energy, enthusiastic, and fun. Great for restaurants, events, and catering.",
    icon: "\u26A1",
    gradient: "from-yellow-500 to-orange-500",
  },
];

const DATA_FIELDS = [
  { id: "name", label: "Full Name", icon: User, default: true },
  { id: "phone", label: "Phone Number", icon: Phone, default: true },
  { id: "email", label: "Email Address", icon: Mail, default: true },
  { id: "address", label: "Address", icon: MapPin, default: false },
  { id: "service_requested", label: "Service Requested", icon: Briefcase, default: false },
  { id: "company", label: "Company Name", icon: Building2, default: false },
  { id: "insurance", label: "Insurance Info", icon: Shield, default: false },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Business
    businessName: "",
    businessType: "",
    description: "",
    website: "",
    location: "",
    agentName: "",
    ownerName: "",
    // Step 2: Goal
    callGoal: "",
    // Step 3: Transfers
    transferEnabled: false,
    transferNumber: "",
    transferPersonName: "",
    transferTriggers: [] as string[],
    // Step 4: Sales Process
    qualificationQuestions: "",
    qualificationCriteria: "",
    callFlowDescription: "",
    // Step 5: Objections
    objections: [] as { objection: string; response: string }[],
    // Step 6: Personality
    personalityTone: "friendly",
    personalityNotes: "",
  });

  const [selectedFields, setSelectedFields] = useState<string[]>(["name", "phone", "email"]);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const toggleTransferTrigger = (triggerId: string) => {
    setFormData((prev) => ({
      ...prev,
      transferTriggers: prev.transferTriggers.includes(triggerId)
        ? prev.transferTriggers.filter((id) => id !== triggerId)
        : [...prev.transferTriggers, triggerId],
    }));
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dataCollectionFields: selectedFields,
          objections: formData.objections.filter(o => o.objection.trim()),
        }),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/agents/${data.agentId}/generating`);
      } else {
        alert("Failed to generate agent: " + data.error);
      }
    } catch (error) {
      console.error("Error generating agent:", error);
      alert("Failed to generate agent. Please try again.");
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
    const stepId = currentStepDef?.id;
    if (stepId === "business")
      return formData.businessName && formData.businessType && formData.description && formData.location;
    if (stepId === "goal") return formData.callGoal;
    if (stepId === "transfer") return true; // transfers are optional
    if (stepId === "salesprocess") return true; // sales process is optional but encouraged
    if (stepId === "objections") return true; // objections are optional
    if (stepId === "personality") return formData.personalityTone;
    return true;
  };

  // Determine if transfer step should be shown based on goal
  const shouldShowTransferStep = formData.callGoal === "answer_and_route" || formData.callGoal === "screen_and_transfer";

  // Compute effective step index (skip transfer step if not relevant)
  const effectiveSteps = STEPS.filter((step) => {
    if (step.id === "transfer" && !shouldShowTransferStep) return false;
    return true;
  });

  const currentStepDef = effectiveSteps[currentStep];
  const totalSteps = effectiveSteps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // --- Input class helper ---
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

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
          <a
            href="/"
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
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
            Tell us about your business and we&apos;ll generate a custom voice agent ready to handle your inbound calls.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {effectiveSteps.map((step, i) => {
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
                {i < effectiveSteps.length - 1 && (
                  <div
                    className={clsx(
                      "w-6 h-px",
                      isComplete ? "bg-emerald-500/30" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="p-6 sm:p-10">
            {/* =========== STEP: BUSINESS =========== */}
            {currentStepDef?.id === "business" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Tell us about your business
                  </h2>
                  <p className="text-sm text-slate-400">
                    This helps our AI build a voice agent tailored to your industry. If you have a website, we&apos;ll pull details from it automatically.
                  </p>
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
                    placeholder="Sherm's Catering"
                    className={inputClass}
                  />
                </div>

                {/* Industry tiles */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Industry <span className="text-indigo-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, businessType: type.id })
                        }
                        className={clsx(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                          formData.businessType === type.id
                            ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                            : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                        )}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <span
                          className={clsx(
                            "text-[11px] font-medium",
                            formData.businessType === type.id
                              ? "text-indigo-300"
                              : "text-slate-400"
                          )}
                        >
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What does your business do? <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="We do full kitchen and bathroom remodels, ADUs, and room additions in the greater Orlando area. We specialize in high-end custom work..."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                {/* Website + Service Area */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourbusiness.com"
                        className={clsx(inputClass, "pl-10")}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      We&apos;ll pull business details from your site to improve the agent.
                    </p>
                  </div>
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
                        placeholder="Orlando, FL (40 mile radius)"
                        className={clsx(inputClass, "pl-10")}
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Name + Owner Name */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      AI Agent Name
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        name="agentName"
                        value={formData.agentName}
                        onChange={handleChange}
                        placeholder="Ashley (or leave blank and we'll pick one)"
                        className={clsx(inputClass, "pl-10")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name / Owner Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Used for transfers & callbacks"
                        className={clsx(inputClass, "pl-10")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========== STEP: CALL GOAL =========== */}
            {currentStepDef?.id === "goal" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    What should your agent do?
                  </h2>
                  <p className="text-sm text-slate-400">
                    Pick the primary goal for inbound calls. You can refine the flow after testing.
                  </p>
                </div>

                <div className="space-y-3">
                  {CALL_GOALS.map((goal) => {
                    const GoalIcon = goal.icon;
                    const isSelected = formData.callGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, callGoal: goal.id })
                        }
                        className={clsx(
                          "w-full flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 text-left",
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/8 ring-1 ring-indigo-500/30"
                            : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                        )}
                      >
                        <div
                          className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            isSelected
                              ? "bg-indigo-500/20"
                              : "bg-white/5"
                          )}
                        >
                          <GoalIcon
                            className={clsx(
                              "w-5 h-5",
                              isSelected ? "text-indigo-400" : "text-slate-500"
                            )}
                          />
                        </div>
                        <div>
                          <div
                            className={clsx(
                              "text-sm font-semibold",
                              isSelected ? "text-white" : "text-slate-300"
                            )}
                          >
                            {goal.label}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {goal.description}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 ml-auto mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-300">
                      AI builds the full call flow for you
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Based on your goal and business type, we&apos;ll generate the complete conversation script with qualification, scheduling, and closing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =========== STEP: TRANSFERS =========== */}
            {currentStepDef?.id === "transfer" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Call transfers
                  </h2>
                  <p className="text-sm text-slate-400">
                    Set up when and where the AI should transfer calls to a live person.
                  </p>
                </div>

                {/* Enable/disable */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, transferEnabled: !formData.transferEnabled })
                  }
                  className={clsx(
                    "w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-200 text-left",
                    formData.transferEnabled
                      ? "border-indigo-500/50 bg-indigo-500/8 ring-1 ring-indigo-500/30"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                  )}
                >
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      formData.transferEnabled ? "bg-indigo-500/20" : "bg-white/5"
                    )}
                  >
                    <PhoneForwarded
                      className={clsx(
                        "w-5 h-5",
                        formData.transferEnabled
                          ? "text-indigo-400"
                          : "text-slate-500"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      className={clsx(
                        "text-sm font-semibold",
                        formData.transferEnabled ? "text-white" : "text-slate-300"
                      )}
                    >
                      Enable live transfers
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      AI will attempt to transfer to a live person when triggered.
                    </div>
                  </div>
                  <div
                    className={clsx(
                      "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                      formData.transferEnabled ? "bg-indigo-500" : "bg-white/10"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                        formData.transferEnabled ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </div>
                </button>

                {formData.transferEnabled && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Transfer to */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Transfer to (name)
                        </label>
                        <input
                          type="text"
                          name="transferPersonName"
                          value={formData.transferPersonName}
                          onChange={handleChange}
                          placeholder="e.g. Miles, Renee, Front Desk"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Transfer phone number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            name="transferNumber"
                            value={formData.transferNumber}
                            onChange={handleChange}
                            placeholder="(555) 123-4567"
                            className={clsx(inputClass, "pl-10")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* When to transfer */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        When should the AI transfer?
                      </label>
                      <div className="space-y-2">
                        {TRANSFER_TRIGGERS.map((trigger) => {
                          const isSelected = formData.transferTriggers.includes(trigger.id);
                          return (
                            <button
                              key={trigger.id}
                              type="button"
                              onClick={() => toggleTransferTrigger(trigger.id)}
                              className={clsx(
                                "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left",
                                isSelected
                                  ? "border-indigo-500/50 bg-indigo-500/8"
                                  : "border-white/8 bg-white/3 hover:border-white/15"
                              )}
                            >
                              <div
                                className={clsx(
                                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-white/20 bg-transparent"
                                )}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={clsx(
                                  "text-sm font-medium",
                                  isSelected ? "text-white" : "text-slate-400"
                                )}
                              >
                                {trigger.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          If the transfer fails
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          The AI will automatically take the caller&apos;s name and number for a callback instead of dropping the call.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========== STEP: SALES PROCESS =========== */}
            {currentStepDef?.id === "salesprocess" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Your sales process
                  </h2>
                  <p className="text-sm text-slate-400">
                    This is the most important step. The more detail you give here, the better your agent will perform. Think about what your best salesperson does on a perfect call.
                  </p>
                </div>

                {/* Question 1: Qualification Questions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    What questions do you ask before you can help someone?
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    These become your agent&apos;s qualification questions. Example: &quot;How much funding do they need, monthly revenue, time in business, credit score&quot;
                  </p>
                  <textarea
                    name="qualificationQuestions"
                    rows={3}
                    value={formData.qualificationQuestions}
                    onChange={handleChange}
                    placeholder="e.g. How much capital they need, how long they've been in business, monthly revenue, credit score range, what they need the funding for"
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                {/* Question 2: What makes someone qualified */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    What makes someone qualified vs. not qualified?
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Set clear thresholds so your agent knows when to move forward vs. redirect. Example: &quot;$15k+ monthly revenue and 6+ months in business = qualified&quot;
                  </p>
                  <textarea
                    name="qualificationCriteria"
                    rows={3}
                    value={formData.qualificationCriteria}
                    onChange={handleChange}
                    placeholder="e.g. Qualified: $15k+ monthly revenue, 6+ months in business, 550+ credit score. Not qualified: under 6 months in business → send to partner program. Personal loans → we don't do those."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                {/* Question 3: Ideal call flow */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Describe your ideal call from start to finish
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Walk us through what happens on a perfect call. What do you say first? What do you ask? What happens at the end?
                  </p>
                  <textarea
                    name="callFlowDescription"
                    rows={4}
                    value={formData.callFlowDescription}
                    onChange={handleChange}
                    placeholder="e.g. First we find out what they need (funding, credit repair, etc). Then we qualify them — ask about revenue, time in business, credit score. If they qualify, we try to transfer them to a specialist right away. If no one's available, we book a consultation and send them the application. If they don't qualify, we send them to our partner program."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                {/* Info to collect - simplified checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What contact info should your agent collect?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DATA_FIELDS.map((field) => {
                      const isSelected = selectedFields.includes(field.id);
                      const isRequired = field.id === "name" || field.id === "phone";
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => !isRequired && toggleField(field.id)}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                            isSelected
                              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                              : "border-white/10 bg-white/3 text-slate-400 hover:border-white/20",
                            isRequired && "cursor-default"
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {field.label}
                          {isRequired && (
                            <span className="text-[9px] text-indigo-400/60">req</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-300">
                      The more detail, the better the agent
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Even a few sentences about your process helps our AI build qualification logic, decision gates, and industry-specific call flows instead of a generic script.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =========== STEP: OBJECTIONS =========== */}
            {currentStepDef?.id === "objections" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Common objections callers have
                  </h2>
                  <p className="text-sm text-slate-400">
                    What pushback does your team hear on calls? Add common objections and how you&apos;d want the AI to respond. The AI Sales Manager will find new ones from live calls later.
                  </p>
                </div>

                {/* Existing objections */}
                <div className="space-y-4">
                  {formData.objections.map((obj, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Objection {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              objections: prev.objections.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          What the caller says
                        </label>
                        <input
                          type="text"
                          value={obj.objection}
                          onChange={(e) => {
                            const updated = [...formData.objections];
                            updated[idx] = { ...updated[idx], objection: e.target.value };
                            setFormData({ ...formData, objections: updated });
                          }}
                          placeholder={
                            idx === 0
                              ? '"How much does it cost?"'
                              : idx === 1
                                ? '"I need to think about it"'
                                : '"Can I get a free estimate?"'
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          How the AI should respond
                        </label>
                        <textarea
                          rows={2}
                          value={obj.response}
                          onChange={(e) => {
                            const updated = [...formData.objections];
                            updated[idx] = { ...updated[idx], response: e.target.value };
                            setFormData({ ...formData, objections: updated });
                          }}
                          placeholder={
                            idx === 0
                              ? '"Great question! Pricing depends on the scope of the project. Let me get some details so we can put together an accurate estimate for you."'
                              : idx === 1
                                ? '"Totally understand — no pressure at all. How about I get your info and we can send over some details to help you decide?"'
                                : '"Absolutely, estimates are always free. Let me grab a few details so we can get that set up for you."'
                          }
                          className={clsx(inputClass, "resize-none")}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add objection button */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      objections: [...prev.objections, { objection: "", response: "" }],
                    }))
                  }
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/15 bg-white/3 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-200 text-sm font-medium text-slate-400 hover:text-indigo-300"
                >
                  <Plus className="w-4 h-4" />
                  Add an objection
                </button>

                {formData.objections.length === 0 && (
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-300">
                        No objections? No problem.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        You can skip this step. The AI Sales Manager will identify common objections from real calls and suggest them later.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========== STEP: PERSONALITY =========== */}
            {currentStepDef?.id === "personality" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Choose your agent&apos;s personality
                  </h2>
                  <p className="text-sm text-slate-400">
                    This sets the tone for how your agent speaks. You can fine-tune it after testing.
                  </p>
                </div>

                <div className="space-y-3">
                  {PERSONALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, personalityTone: opt.id })
                      }
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
                        <div
                          className={clsx(
                            "text-sm font-semibold",
                            formData.personalityTone === opt.id
                              ? "text-white"
                              : "text-slate-300"
                          )}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {opt.description}
                        </div>
                      </div>
                      {formData.personalityTone === opt.id && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Free text field for personality notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Anything else about how the AI should sound?{" "}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="personalityNotes"
                    rows={2}
                    value={formData.personalityNotes}
                    onChange={handleChange}
                    placeholder="e.g. Fun and bubbly, not too direct. Or: Should feel like talking to a helpful friend."
                    className={clsx(inputClass, "resize-none")}
                  />
                </div>

                <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      You can change all of this later
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      After setup, you can pick from 1,000+ voices, edit the prompt directly, and fine-tune everything.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- Navigation --- */}
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

              {currentStep < totalSteps - 1 ? (
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
            <span>Generates in under 60 seconds</span>
          </div>
          <span className="hidden sm:inline">&middot;</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <span className="hidden sm:inline">&middot;</span>
          <div className="flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-violet-400" />
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
