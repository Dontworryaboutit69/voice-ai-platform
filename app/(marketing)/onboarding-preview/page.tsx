"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════
   ONBOARDING FORM MOCKUP — Premium Multi-Step Wizard

   This is a VISUAL MOCKUP only. No API calls, no state persistence.
   Purpose: Get the UX, layout, and flow right before building real form.
   ═══════════════════════════════════════════════════════════ */

const ACCENT = "#635BFF";
const ACCENT_LIGHT = "rgba(99,91,255,0.08)";
const ACCENT_GLOW = "rgba(99,91,255,0.25)";

const INDUSTRIES = [
  { id: "dental", label: "Dental", icon: "🦷" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "realestate", label: "Real Estate", icon: "🏠" },
  { id: "hvac", label: "HVAC", icon: "❄️" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "roofing", label: "Roofing", icon: "🏗️" },
  { id: "restaurant", label: "Restaurant", icon: "🍽️" },
  { id: "homeservices", label: "Home Services", icon: "🏡" },
  { id: "auto", label: "Auto", icon: "🚗" },
  { id: "salon", label: "Salon & Spa", icon: "💇" },
  { id: "insurance", label: "Insurance", icon: "🛡️" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "accounting", label: "Accounting", icon: "📊" },
  { id: "other", label: "Other", icon: "✦" },
];

const CALL_OBJECTIVES = [
  { id: "book", label: "Book appointments", desc: "Schedule meetings, consultations, or services directly into your calendar", icon: "📅" },
  { id: "qualify", label: "Qualify leads", desc: "Collect contact info, assess needs, and route hot leads to your team", icon: "🎯" },
  { id: "faq", label: "Answer FAQs", desc: "Handle common questions about pricing, hours, services, and policies", icon: "💬" },
  { id: "emergency", label: "Route emergencies", desc: "Detect urgent calls and immediately connect to on-call staff", icon: "🚨" },
  { id: "messages", label: "Take messages", desc: "Capture caller details and send organized summaries via email or SMS", icon: "📝" },
  { id: "intake", label: "Client intake", desc: "Run new client intake forms over the phone — collect all required info", icon: "📋" },
];

const PERSONALITY_OPTIONS = [
  {
    id: "friendly",
    label: "Friendly & Warm",
    desc: "Casual, approachable, and conversational. Like a front-desk person everyone loves.",
    example: '"Hey! Thanks for calling. How can I help you today?"',
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    id: "professional",
    label: "Professional & Polished",
    desc: "Formal, confident, and precise. Instills trust in high-stakes industries.",
    example: '"Good afternoon, thank you for calling. How may I assist you?"',
    color: "#635BFF",
    bg: ACCENT_LIGHT,
    border: ACCENT_GLOW,
  },
  {
    id: "empathetic",
    label: "Warm & Empathetic",
    desc: "Caring, patient, understanding. Makes callers feel heard and safe.",
    example: '"I completely understand. Let me make sure we get this taken care of for you."',
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
];

const DATA_FIELDS = [
  { id: "name", label: "Caller Name", default: true, icon: "👤" },
  { id: "phone", label: "Phone Number", default: true, icon: "📱" },
  { id: "email", label: "Email Address", default: true, icon: "✉️" },
  { id: "service", label: "Service Requested", default: false, icon: "🔧" },
  { id: "address", label: "Address", default: false, icon: "📍" },
  { id: "company", label: "Company Name", default: false, icon: "🏢" },
  { id: "time", label: "Preferred Contact Time", default: false, icon: "🕐" },
  { id: "insurance", label: "Insurance Info", default: false, icon: "🛡️" },
  { id: "referral", label: "How They Found You", default: false, icon: "📣" },
  { id: "urgency", label: "Urgency Level", default: false, icon: "⚡" },
];

const STEPS = [
  { label: "Business", shortLabel: "Business" },
  { label: "Call Handling", shortLabel: "Calls" },
  { label: "Personality", shortLabel: "Tone" },
  { label: "Data Collection", shortLabel: "Data" },
  { label: "Review", shortLabel: "Review" },
];

export default function OnboardingPreview() {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState<string | null>("dental");
  const [objectives, setObjectives] = useState<Set<string>>(new Set(["book", "qualify"]));
  const [personality, setPersonality] = useState<string>("professional");
  const [dataFields, setDataFields] = useState<Set<string>>(new Set(["name", "phone", "email"]));
  const [hours, setHours] = useState<string>("after");

  const toggleObjective = (id: string) => {
    const next = new Set(objectives);
    next.has(id) ? next.delete(id) : next.add(id);
    setObjectives(next);
  };

  const toggleField = (id: string) => {
    const next = new Set(dataFields);
    next.has(id) ? next.delete(id) : next.add(id);
    setDataFields(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08090D" }}>
      {/* ─── Ambient background ─── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(99,91,255,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* ─── Header ─── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "#10B981" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 }}>Setup takes under 2 minutes</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#F1F1F3", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
            Build your AI phone agent
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto" }}>
            Tell us about your business and we&apos;ll generate a custom agent that handles calls exactly how you want.
          </p>
        </div>

        {/* ─── Progress Steps ─── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 48 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setStep(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: i === step ? ACCENT_LIGHT : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: i < step ? ACCENT : i === step ? ACCENT : "rgba(255,255,255,0.06)",
                  color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "all 0.2s",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: i === step ? "#F1F1F3" : i < step ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                }}>
                  {s.shortLabel}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{ width: 24, height: 1, background: i < step ? ACCENT : "rgba(255,255,255,0.08)" }} />
              )}
            </div>
          ))}
        </div>

        {/* ─── STEP 0: BUSINESS INFO ─── */}
        {step === 0 && (
          <StepContainer>
            <StepHeader
              number="01"
              title="Tell us about your business"
              subtitle="We'll use this to customize your agent's knowledge and conversation style."
            />

            <FieldGroup label="Business Name" required>
              <TextInput placeholder="e.g., Bright Smile Dental" defaultValue="Bright Smile Dental" />
            </FieldGroup>

            <FieldGroup label="Industry" required>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    style={{
                      padding: "14px 8px", borderRadius: 12, border: `1.5px solid ${industry === ind.id ? ACCENT : "rgba(255,255,255,0.08)"}`,
                      background: industry === ind.id ? ACCENT_LIGHT : "rgba(255,255,255,0.02)",
                      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{ind.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: industry === ind.id ? "#F1F1F3" : "rgba(255,255,255,0.45)" }}>{ind.label}</span>
                  </button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Describe what your business does" required>
              <TextArea placeholder="e.g., We're a family dental practice offering cleanings, fillings, crowns, and cosmetic dentistry. We serve patients of all ages and accept most insurance plans." rows={3} />
            </FieldGroup>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FieldGroup label="Service Area" required>
                <TextInput placeholder="e.g., Orlando, FL metro area" />
              </FieldGroup>
              <FieldGroup label="Website" optional>
                <TextInput placeholder="e.g., brightsmile.com" />
              </FieldGroup>
            </div>
          </StepContainer>
        )}

        {/* ─── STEP 1: CALL HANDLING ─── */}
        {step === 1 && (
          <StepContainer>
            <StepHeader
              number="02"
              title="How should your agent handle calls?"
              subtitle="Select all that apply. Your agent will prioritize these in the order shown."
            />

            <FieldGroup label="Call Objectives" required hint="Select at least one">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {CALL_OBJECTIVES.map((obj) => {
                  const active = objectives.has(obj.id);
                  return (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      style={{
                        padding: "18px 20px", borderRadius: 14, textAlign: "left",
                        border: `1.5px solid ${active ? ACCENT : "rgba(255,255,255,0.08)"}`,
                        background: active ? ACCENT_LIGHT : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 0.15s", position: "relative",
                      }}
                    >
                      {active && (
                        <div style={{ position: "absolute", top: 10, right: 12, width: 20, height: 20, borderRadius: 999, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{obj.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: active ? "#F1F1F3" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{obj.label}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{obj.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FieldGroup>

            <FieldGroup label="When should your agent answer?" required>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { id: "always", label: "Every call", desc: "24/7 — AI answers all calls", icon: "🔄" },
                  { id: "after", label: "After hours only", desc: "AI picks up when you can't", icon: "🌙" },
                  { id: "overflow", label: "Overflow", desc: "AI answers if no one picks up", icon: "📲" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setHours(opt.id)}
                    style={{
                      padding: "18px 16px", borderRadius: 14, textAlign: "center",
                      border: `1.5px solid ${hours === opt.id ? ACCENT : "rgba(255,255,255,0.08)"}`,
                      background: hours === opt.id ? ACCENT_LIGHT : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: hours === opt.id ? "#F1F1F3" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Any specific instructions?" optional hint="Things your agent should always say, avoid, or handle specially">
              <TextArea placeholder='e.g., "Always ask if they have insurance before booking. Never quote prices over the phone — tell them to come in for a free consultation."' rows={3} />
            </FieldGroup>
          </StepContainer>
        )}

        {/* ─── STEP 2: PERSONALITY ─── */}
        {step === 2 && (
          <StepContainer>
            <StepHeader
              number="03"
              title="Choose your agent's personality"
              subtitle="This shapes how your agent sounds on every call. You can fine-tune later."
            />

            <FieldGroup label="Communication Style" required>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PERSONALITY_OPTIONS.map((opt) => {
                  const active = personality === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPersonality(opt.id)}
                      style={{
                        padding: "24px", borderRadius: 16, textAlign: "left",
                        border: `1.5px solid ${active ? opt.border : "rgba(255,255,255,0.08)"}`,
                        background: active ? opt.bg : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 0.15s", position: "relative",
                      }}
                    >
                      {active && (
                        <div style={{ position: "absolute", top: 16, right: 16, width: 24, height: 24, borderRadius: 999, background: opt.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>
                        </div>
                      )}
                      <div style={{ fontSize: 17, fontWeight: 700, color: active ? "#F1F1F3" : "rgba(255,255,255,0.6)", marginBottom: 6 }}>{opt.label}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 14 }}>{opt.desc}</div>
                      <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 6 }}>Example</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontStyle: "italic", lineHeight: 1.5 }}>{opt.example}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FieldGroup>

            <FieldGroup label="Agent Name" optional hint="Give your agent a name callers will hear">
              <TextInput placeholder="e.g., Sarah, Alex, or leave blank for default" />
            </FieldGroup>
          </StepContainer>
        )}

        {/* ─── STEP 3: DATA COLLECTION ─── */}
        {step === 3 && (
          <StepContainer>
            <StepHeader
              number="04"
              title="What should your agent collect?"
              subtitle="Select the information your agent should gather from every caller."
            />

            <FieldGroup label="Data Fields" required hint="Select at least one">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {DATA_FIELDS.map((field) => {
                  const active = dataFields.has(field.id);
                  return (
                    <button
                      key={field.id}
                      onClick={() => toggleField(field.id)}
                      style={{
                        padding: "14px 18px", borderRadius: 12, textAlign: "left",
                        border: `1.5px solid ${active ? ACCENT : "rgba(255,255,255,0.08)"}`,
                        background: active ? ACCENT_LIGHT : "rgba(255,255,255,0.02)",
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 12,
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${active ? ACCENT : "rgba(255,255,255,0.15)"}`,
                        background: active ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s", flexShrink: 0,
                      }}>
                        {active && <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#F1F1F3" : "rgba(255,255,255,0.5)" }}>{field.icon}  {field.label}</span>
                    </button>
                  );
                })}
              </div>
            </FieldGroup>

            <div style={{ padding: "20px 24px", borderRadius: 14, background: "rgba(99,91,255,0.06)", border: "1px solid rgba(99,91,255,0.12)", marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>💡</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F1F3", marginBottom: 4 }}>Pro tip</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                    Less is more. The fewer fields your agent collects, the more natural the conversation feels. You can always add more fields later from your dashboard.
                  </div>
                </div>
              </div>
            </div>
          </StepContainer>
        )}

        {/* ─── STEP 4: REVIEW ─── */}
        {step === 4 && (
          <StepContainer>
            <StepHeader
              number="05"
              title="Review & Generate"
              subtitle="Here's what we'll use to build your custom AI phone agent."
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ReviewCard
                label="Business"
                onEdit={() => setStep(0)}
                items={[
                  { key: "Name", value: "Bright Smile Dental" },
                  { key: "Industry", value: "Dental" },
                  { key: "Area", value: "Orlando, FL" },
                ]}
              />
              <ReviewCard
                label="Call Handling"
                onEdit={() => setStep(1)}
                items={[
                  { key: "Objectives", value: Array.from(objectives).map(o => CALL_OBJECTIVES.find(c => c.id === o)?.label).join(", ") },
                  { key: "Availability", value: hours === "always" ? "Every call (24/7)" : hours === "after" ? "After hours only" : "Overflow" },
                ]}
              />
              <ReviewCard
                label="Personality"
                onEdit={() => setStep(2)}
                items={[
                  { key: "Style", value: PERSONALITY_OPTIONS.find(p => p.id === personality)?.label || "" },
                ]}
              />
              <ReviewCard
                label="Data Collection"
                onEdit={() => setStep(3)}
                items={[
                  { key: "Fields", value: Array.from(dataFields).map(f => DATA_FIELDS.find(d => d.id === f)?.label).join(", ") },
                ]}
              />
            </div>

            {/* Generate button */}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <button style={{
                padding: "18px 48px", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
                color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
                boxShadow: `0 8px 32px ${ACCENT_GLOW}, 0 2px 8px rgba(0,0,0,0.3)`,
                transition: "all 0.2s",
              }}>
                Generate My AI Agent →
              </button>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 12 }}>
                Takes about 15 seconds · Free to try · No credit card required
              </p>
            </div>
          </StepContainer>
        )}

        {/* ─── Navigation ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            style={{
              padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600,
              cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.3 : 1,
              transition: "all 0.15s",
            }}
            disabled={step === 0}
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 999, background: i === step ? ACCENT : i < step ? "rgba(99,91,255,0.4)" : "rgba(255,255,255,0.08)", transition: "all 0.3s" }} />
            ))}
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep(Math.min(4, step + 1))}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none",
                background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: `0 4px 16px ${ACCENT_GLOW}`,
              }}
            >
              Continue →
            </button>
          ) : (
            <div style={{ width: 120 }} />
          )}
        </div>

      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   REUSABLE FORM COMPONENTS
   ═══════════════════════════════════════════ */

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: "36px 32px",
    }}>
      {children}
    </div>
  );
}

function StepHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: ACCENT, marginBottom: 8, display: "block" }}>Step {number}</span>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#F1F1F3", letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function FieldGroup({ label, required, optional, hint, children }: {
  label: string; required?: boolean; optional?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#F1F1F3" }}>{label}</label>
        {required && <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, padding: "1px 6px", borderRadius: 4, background: ACCENT_LIGHT }}>Required</span>}
        {optional && <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)" }}>Optional</span>}
        {hint && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ placeholder, defaultValue }: { placeholder: string; defaultValue?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        width: "100%", padding: "14px 18px", borderRadius: 12,
        background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)",
        color: "#F1F1F3", fontSize: 14, outline: "none", transition: "border 0.15s",
        boxSizing: "border-box",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
    />
  );
}

function TextArea({ placeholder, rows = 3 }: { placeholder: string; rows?: number }) {
  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", padding: "14px 18px", borderRadius: 12, resize: "vertical" as const,
        background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)",
        color: "#F1F1F3", fontSize: 14, outline: "none", transition: "border 0.15s",
        fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
    />
  );
}

function ReviewCard({ label, onEdit, items }: { label: string; onEdit: () => void; items: { key: string; value: string }[] }) {
  return (
    <div style={{ padding: "20px 24px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#F1F1F3" }}>{label}</span>
        <button onClick={onEdit} style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>Edit</button>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < items.length - 1 ? 8 : 0 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", minWidth: 80 }}>{item.key}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
