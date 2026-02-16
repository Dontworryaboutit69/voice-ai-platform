"use client";

import { clsx } from "clsx";

/* ─── Micro design‑token palettes (matches design‑preview exactly) ─── */
const dark = {
  bg: "#111318",
  sidebar: "#0F1117",
  surface: "#1A1C24",
  border: "rgba(255,255,255,0.06)",
  text: "#F1F1F3",
  textSec: "#8B8D98",
  textMuted: "rgba(255,255,255,0.3)",
  accent: "#635BFF",
  accentGlow: "rgba(99,91,255,0.12)",
  green: "#34D399",
  greenBg: "rgba(16,185,129,0.12)",
  orange: "#FB923C",
  orangeBg: "rgba(251,146,60,0.12)",
  red: "#F87171",
  redBg: "rgba(248,113,113,0.12)",
  blue: "#60A5FA",
  blueBg: "rgba(96,165,250,0.12)",
  chartBar: "rgba(255,255,255,0.06)",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.08)",
};

const light = {
  bg: "#F6F6F9",
  sidebar: "#FAFBFC",
  surface: "#FFFFFF",
  border: "#E8EBF0",
  text: "#0F1117",
  textSec: "#8B8D98",
  textMuted: "#B4B6BE",
  accent: "#635BFF",
  accentGlow: "rgba(99,91,255,0.08)",
  green: "#059669",
  greenBg: "rgba(16,185,129,0.08)",
  orange: "#EA580C",
  orangeBg: "rgba(234,88,12,0.08)",
  red: "#DC2626",
  redBg: "rgba(220,38,38,0.08)",
  blue: "#2563EB",
  blueBg: "rgba(37,99,235,0.08)",
  chartBar: "#EEEEF4",
  inputBg: "#FFFFFF",
  inputBorder: "#E8EBF0",
};

type Theme = typeof dark;

/* ─── Gradient definitions ─── */
const gradients = {
  green: "linear-gradient(135deg, #10B981, #34D399)",
  greenLight: "linear-gradient(135deg, #059669, #10B981)",
  blue: "linear-gradient(135deg, #3B82F6, #60A5FA)",
  blueLight: "linear-gradient(135deg, #2563EB, #3B82F6)",
  orange: "linear-gradient(135deg, #F59E0B, #FB923C)",
  orangeLight: "linear-gradient(135deg, #EA580C, #F59E0B)",
  purple: "linear-gradient(135deg, #635BFF, #8B5CF6)",
  purpleWide: "linear-gradient(135deg, #635BFF, #A78BFA)",
  indigo: "linear-gradient(135deg, #4F46E5, #635BFF)",
  red: "linear-gradient(135deg, #EF4444, #F87171)",
  fuchsia: "linear-gradient(135deg, #D946EF, #F0ABFC)",
  emeraldTeal: "linear-gradient(135deg, #10B981, #14B8A6)",
  sunset: "linear-gradient(135deg, #F59E0B, #EF4444)",
};

/* ─── Shared Mini Sidebar ─── */
function MiniSidebar({ t, active }: { t: Theme; active: string }) {
  const navItems = [
    { icon: "📊", label: "Dashboard" },
    { icon: "📞", label: "Test Agent" },
    { icon: "📝", label: "Prompt Editor" },
    { icon: "📚", label: "Knowledge" },
    { icon: "🎙", label: "Voices" },
    { icon: "📋", label: "Call History" },
    { icon: "🤖", label: "AI Manager" },
  ];
  return (
    <div className="flex flex-col py-2 gap-0.5" style={{ width: 120, minWidth: 120, borderRight: `1px solid ${t.border}`, background: t.sidebar }}>
      {/* Agent switcher */}
      <div className="mx-2 mb-2 p-1.5 rounded" style={{ background: t.accentGlow, border: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ background: gradients.purple }} />
          <div>
            <div className="text-[6px] font-semibold" style={{ color: t.text }}>Dr. Smith</div>
            <div className="text-[5px]" style={{ color: t.textMuted }}>Active</div>
          </div>
        </div>
      </div>
      {navItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 mx-1.5 px-1.5 py-1 rounded text-[6px]"
          style={{
            background: item.label === active ? t.accentGlow : "transparent",
            color: item.label === active ? t.text : t.textSec,
            fontWeight: item.label === active ? 600 : 400,
          }}
        >
          <span className="text-[7px]">{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ─── Mini Top Bar ─── */
function MiniTopBar({ t, title, subtitle }: { t: Theme; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${t.border}`, background: t === dark ? "#16181F" : "#FFFFFF" }}>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-semibold" style={{ color: t.text }}>{title}</span>
        {subtitle && <span className="text-[6px]" style={{ color: t.textMuted }}>{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="px-1.5 py-0.5 rounded text-[5px] font-semibold text-white" style={{ background: gradients.purple }}>🚀 Deploy</div>
        <div className="w-4 h-4 rounded-full" style={{ background: t.accentGlow }} />
      </div>
    </div>
  );
}

/* ─── Stat Card with thick gradient top bar + sparkline (matches mockup exactly) ─── */
function MiniStatCard({ t, label, value, change, color, sparkId, mode }: { t: Theme; label: string; value: string; change: string; color: string; sparkId: string; mode: "dark" | "light" }) {
  return (
    <div className="rounded-lg flex-1 overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      {/* Thick gradient accent bar — very visible */}
      <div className="h-[4px]" style={{ background: color }} />
      <div className="p-2">
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-[5px]" style={{ color: t.textSec }}>{label}</div>
          <span className="text-[4.5px] font-semibold px-1 py-[1px] rounded-full" style={{ background: `${color}${mode === "dark" ? "22" : "18"}`, color }}>{change}</span>
        </div>
        <div className="text-[10px] font-bold" style={{ color: t.text }}>{value}</div>
        {/* Sparkline SVG with gradient fill — matches real mockup */}
        <svg className="w-full mt-1" viewBox="0 0 100 20" preserveAspectRatio="none" style={{ height: 10 }}>
          <defs>
            <linearGradient id={sparkId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={mode === "dark" ? "0.25" : "0.2"} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,16 Q15,13 25,11 T50,7 T75,4 T100,2 V20 H0 Z" fill={`url(#${sparkId})`} />
          <path d="M0,16 Q15,13 25,11 T50,7 T75,4 T100,2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   DASHBOARD SCREENSHOT — the hero product visual
   ──────────────────────────────────────────────────────────────────── */
export function DashboardScreenshot({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;
  const chartBarHeights = [40, 65, 55, 80, 70, 90, 60, 75, 85, 50, 95, 72];

  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="Dashboard" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="Dashboard" subtitle="Last 30 days" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            {/* Stat row with vivid color bars + sparklines */}
            <div className="flex gap-2 mb-3">
              <MiniStatCard t={t} mode={mode} label="Total Calls" value="2,847" change="+12.5%" color="#635BFF" sparkId={`sp-calls-${mode}`} />
              <MiniStatCard t={t} mode={mode} label="Success Rate" value="94.2%" change="+3.1%" color="#10B981" sparkId={`sp-rate-${mode}`} />
              <MiniStatCard t={t} mode={mode} label="Avg Duration" value="3:42" change="-0:15" color="#F59E0B" sparkId={`sp-dur-${mode}`} />
              <MiniStatCard t={t} mode={mode} label="AI Score" value="8.7/10" change="+0.4" color="#8B5CF6" sparkId={`sp-score-${mode}`} />
            </div>
            {/* Chart area */}
            <div className="rounded-lg p-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[7px] font-semibold" style={{ color: t.text }}>Call Volume</span>
                <div className="flex gap-1">
                  {["7D", "30D", "90D"].map((p, i) => (
                    <span key={p} className="text-[5px] px-1.5 py-0.5 rounded" style={{ background: i === 1 ? t.accentGlow : "transparent", color: i === 1 ? t.accent : t.textMuted }}>{p}</span>
                  ))}
                </div>
              </div>
              {/* SVG gradient defs for chart bars */}
              <svg style={{ position: "absolute", width: 0, height: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#635BFF" />
                  </linearGradient>
                  <linearGradient id="chartGradFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF666" />
                    <stop offset="100%" stopColor="#635BFF44" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex items-end gap-1" style={{ height: 80 }}>
                {chartBarHeights.map((h, i) => {
                  const isHighlight = i === chartBarHeights.length - 3;
                  const isLast = i === chartBarHeights.length - 1;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{
                        height: `${h}%`,
                        background: isHighlight
                          ? gradients.purple
                          : isLast
                            ? "linear-gradient(180deg, rgba(139,92,246,0.4), rgba(99,91,255,0.25))"
                            : t.chartBar,
                      }}
                    />
                  );
                })}
              </div>
            </div>
            {/* Recent calls mini table */}
            <div className="mt-2 rounded-lg overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between px-2 py-1.5" style={{ borderBottom: `1px solid ${t.border}` }}>
                <span className="text-[7px] font-semibold" style={{ color: t.text }}>Recent Calls</span>
                <span className="text-[5px] font-medium" style={{ color: "#635BFF" }}>View all →</span>
              </div>
              {[
                { caller: "Dr. Smith Office", time: "2m ago", status: "completed", color: "#10B981", initial: "D" },
                { caller: "Johnson Plumbing", time: "15m ago", status: "completed", color: "#10B981", initial: "J" },
                { caller: "Apex Dental", time: "1h ago", status: "missed", color: "#EF4444", initial: "A" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1" style={{ borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] font-semibold" style={{ background: t.accentGlow, color: t.textSec }}>{row.initial}</div>
                    <div>
                      <span className="text-[6px] block" style={{ color: t.text }}>{row.caller}</span>
                      <span className="text-[4.5px]" style={{ color: t.textMuted }}>{row.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full" style={{ background: row.color }} />
                    <span className="text-[5px] font-medium" style={{ color: row.color }}>{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   PROMPT EDITOR SCREENSHOT — for "Custom Prompts" feature card
   Shows a FULL, rich prompt with multiple sections visible
   ──────────────────────────────────────────────────────────────────── */
export function PromptEditorScreenshot({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;

  const sections = [
    { label: "GREETING", active: false },
    { label: "CALL_FLOW", active: true },
    { label: "PERSONALITY", active: false },
    { label: "OBJECTIONS", active: false },
    { label: "CLOSING", active: false },
    { label: "KNOWLEDGE", active: false },
    { label: "TRANSFER", active: false },
  ];

  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="Prompt Editor" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="Prompt Editor" subtitle="Dr. Smith Dental" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            <div className="flex gap-2 h-full">
              {/* Section nav — taller with more sections */}
              <div className="flex flex-col gap-0.5" style={{ width: 72 }}>
                <div className="text-[4.5px] font-bold uppercase tracking-wider mb-1 px-1.5" style={{ color: t.textMuted }}>Sections</div>
                {sections.map((s) => (
                  <div key={s.label} className="px-1.5 py-1 rounded text-[5px] font-medium" style={{ background: s.active ? t.accentGlow : "transparent", color: s.active ? t.accent : t.textSec, border: s.active ? `1px solid ${t.accent}33` : "1px solid transparent" }}>{s.label}</div>
                ))}
                {/* Stats at bottom */}
                <div className="mt-auto pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
                  <div className="text-[4.5px] mb-1" style={{ color: t.textMuted }}>Prompt Stats</div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[4.5px]" style={{ color: t.textSec }}>Tokens</span>
                    <span className="text-[5px] font-semibold" style={{ color: t.accent }}>2,847</span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[4.5px]" style={{ color: t.textSec }}>Score</span>
                    <span className="text-[5px] font-semibold" style={{ color: "#10B981" }}>94/100</span>
                  </div>
                </div>
              </div>
              {/* Editor — showing a FULL prompt */}
              <div className="flex-1 rounded-lg overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {/* Gradient header bar */}
                <div className="h-[3px]" style={{ background: gradients.indigo }} />
                {/* Toolbar */}
                <div className="flex items-center justify-between px-2 py-1" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="text-[6px] font-bold" style={{ color: "#635BFF" }}>CALL_FLOW</div>
                    <span className="text-[4px] px-1 py-0.5 rounded-full" style={{ background: t.accentGlow, color: t.accent }}>Auto-generated</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="px-1 py-0.5 rounded text-[4.5px]" style={{ background: t.accentGlow, color: t.accent }}>↩ Undo</div>
                    <div className="px-1 py-0.5 rounded text-[4.5px]" style={{ color: t.textMuted }}>↪ Redo</div>
                  </div>
                </div>
                {/* Full prompt content with line numbers */}
                <div className="p-2.5">
                  <div className="space-y-0.5">
                    {[
                      { num: 1, text: "## CALL FLOW INSTRUCTIONS", color: "#635BFF", bold: true },
                      { num: 2, text: "", color: t.textMuted as string, bold: false },
                      { num: 3, text: "1. Answer warmly: \"Thank you for calling", color: t.text, bold: false },
                      { num: 4, text: "   Dr. Smith's Dental Office! This is Sarah,", color: t.text, bold: false },
                      { num: 5, text: "   your AI assistant. How can I help today?\"", color: t.text, bold: false },
                      { num: 6, text: "", color: t.textMuted as string, bold: false },
                      { num: 7, text: "2. Ask for caller's full name and confirm", color: t.text, bold: false },
                      { num: 8, text: "   they are an existing or new patient.", color: t.text, bold: false },
                      { num: 9, text: "", color: t.textMuted as string, bold: false },
                      { num: 10, text: "3. Identify purpose of call:", color: t.text, bold: false },
                      { num: 11, text: "   → Scheduling: Check Google Calendar for", color: "#8B5CF6", bold: false },
                      { num: 12, text: "     next available slots this week", color: "#8B5CF6", bold: false },
                      { num: 13, text: "   → Emergency: Transfer to on-call dentist", color: "#EF4444", bold: false },
                      { num: 14, text: "   → Billing: Collect info, create message", color: "#F59E0B", bold: false },
                      { num: 15, text: "   → General: Answer from knowledge base", color: "#10B981", bold: false },
                      { num: 16, text: "", color: t.textMuted as string, bold: false },
                      { num: 17, text: "4. For appointments, confirm:", color: t.text, bold: false },
                      { num: 18, text: "   - Date and time selected", color: t.textSec, bold: false },
                      { num: 19, text: "   - Service type (cleaning, exam, etc.)", color: t.textSec, bold: false },
                      { num: 20, text: "   - Insurance information on file", color: t.textSec, bold: false },
                      { num: 21, text: "", color: t.textMuted as string, bold: false },
                      { num: 22, text: "5. Send confirmation SMS with details.", color: t.text, bold: false },
                      { num: 23, text: "   Include office address: 123 Main St.", color: t.textSec, bold: false },
                    ].map((line) => (
                      <div key={line.num} className="flex gap-1.5">
                        <span className="text-[4.5px] w-3 text-right flex-shrink-0" style={{ color: t.textMuted }}>{line.num}</span>
                        <span className="text-[5.5px] leading-relaxed" style={{ color: line.color, fontWeight: line.bold ? 700 : 400 }}>{line.text || "\u00A0"}</span>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons */}
                  <div className="mt-3 flex gap-1.5 items-center">
                    <div className="px-2 py-0.5 rounded text-[5px] font-semibold text-white" style={{ background: gradients.purple }}>💾 Save Changes</div>
                    <div className="px-2 py-0.5 rounded text-[5px]" style={{ background: t.accentGlow, color: t.accent }}>👁 Preview</div>
                    <div className="px-2 py-0.5 rounded text-[5px]" style={{ color: t.textMuted }}>🤖 AI Rewrite</div>
                    <span className="ml-auto text-[4px]" style={{ color: "#10B981" }}>✓ Saved 2m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   AI MANAGER SCREENSHOT — for "Self-Learning AI" feature card
   ──────────────────────────────────────────────────────────────────── */
export function AIManagerScreenshot({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;
  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="AI Manager" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="AI Manager" subtitle="5 suggestions" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            {/* Header with gradient */}
            <div className="rounded-lg p-2 mb-2" style={{ background: "linear-gradient(135deg, rgba(99,91,255,0.15), rgba(139,92,246,0.08))" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-bold" style={{ color: t.text }}>Optimization Queue</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[5px] font-semibold" style={{ background: `#F59E0B${mode === "dark" ? "22" : "18"}`, color: "#F59E0B" }}>5 pending</span>
                </div>
                <div className="px-2 py-0.5 rounded text-[5px] font-semibold text-white flex items-center gap-0.5" style={{ background: "#635BFF" }}>⚡ Run Analysis</div>
              </div>
            </div>
            {/* Suggestion cards with gradient left accent */}
            {[
              { title: "Improve greeting warmth", impact: "High", confidence: "92%", section: "GREETING", color: "#10B981" },
              { title: "Add objection handling for pricing", impact: "High", confidence: "89%", section: "OBJECTIONS", color: "#10B981" },
              { title: "Ask about insurance earlier in flow", impact: "Medium", confidence: "85%", section: "CALL_FLOW", color: "#F59E0B" },
              { title: "Refine closing — offer follow-up SMS", impact: "High", confidence: "88%", section: "CLOSING", color: "#10B981" },
              { title: "Handle 'Can I speak to a person?' better", impact: "Low", confidence: "78%", section: "TRANSFER", color: "#3B82F6" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg mb-1.5 overflow-hidden flex" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="w-[3px]" style={{ background: s.color }} />
                <div className="flex-1 flex items-center justify-between p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[5px] px-1 py-0.5 rounded font-medium" style={{ background: `#635BFF${mode === "dark" ? "1A" : "12"}`, color: "#635BFF" }}>{s.section}</span>
                    <span className="text-[6px] font-semibold" style={{ color: t.text }}>{s.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[5px] px-1 py-0.5 rounded-full font-semibold" style={{ background: `${s.color}${mode === "dark" ? "22" : "18"}`, color: s.color }}>{s.impact}</span>
                    <span className="text-[5px]" style={{ color: t.textMuted }}>{s.confidence}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Agent health with gradient ring + improvement history */}
            <div className="mt-2 rounded-lg p-2 flex items-center gap-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#635BFF" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  <circle cx="18" cy="18" r="14" fill="none" stroke={t.chartBar} strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="url(#healthGrad)" strokeWidth="3" strokeDasharray="79" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold" style={{ color: "#635BFF" }}>87</div>
              </div>
              <div className="flex-1">
                <div className="text-[6px] font-semibold" style={{ color: t.text }}>Agent Health Score</div>
                <div className="text-[5px] mb-1" style={{ color: t.textSec }}>Based on 847 calls analyzed</div>
                {/* Mini improvement chart */}
                <div className="flex items-end gap-0.5" style={{ height: 14 }}>
                  {[45, 52, 58, 63, 70, 74, 79, 82, 85, 87].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${v}%`, background: i === 9 ? gradients.purple : t.chartBar }} />
                  ))}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[4px]" style={{ color: t.textMuted }}>Week 1</span>
                  <span className="text-[4px]" style={{ color: t.textMuted }}>Now</span>
                </div>
              </div>
            </div>
            {/* Recently applied optimizations */}
            <div className="mt-2 rounded-lg p-2" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="text-[5.5px] font-semibold mb-1.5" style={{ color: t.text }}>Recently Applied</div>
              {[
                { text: "Added empathy for nervous callers", time: "2h ago", change: "+4%" },
                { text: "Shortened hold time messaging", time: "1d ago", change: "+2%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1" style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}>
                  <div className="flex items-center gap-1">
                    <span className="text-[5px]" style={{ color: "#10B981" }}>✓</span>
                    <span className="text-[5px]" style={{ color: t.textSec }}>{item.text}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[4.5px] font-semibold" style={{ color: "#10B981" }}>{item.change}</span>
                    <span className="text-[4px]" style={{ color: t.textMuted }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   VOICES SCREENSHOT — for "Voice Options" feature card
   ──────────────────────────────────────────────────────────────────── */
export function VoicesScreenshot({ mode = "dark" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;
  const voices = [
    { name: "11labs-Cimo", style: "Warm & Professional", provider: "ElevenLabs", bars: [60, 80, 45, 70, 55, 65, 75, 50], grad: gradients.purple },
    { name: "11labs-Adrian", style: "Confident & Clear", provider: "ElevenLabs", bars: [75, 55, 90, 60, 70, 80, 45, 65], grad: gradients.blue },
    { name: "openai-Alloy", style: "Friendly & Natural", provider: "OpenAI", bars: [50, 70, 65, 85, 45, 60, 75, 55], grad: gradients.fuchsia },
    { name: "deepgram-Nova", style: "Soft & Reassuring", provider: "Deepgram", bars: [65, 45, 75, 50, 80, 70, 55, 85], grad: gradients.emeraldTeal },
    { name: "cartesia-Mia", style: "Upbeat & Energetic", provider: "Cartesia", bars: [70, 55, 85, 65, 45, 80, 60, 75], grad: gradients.orange },
    { name: "11labs-Aria", style: "Calm & Authoritative", provider: "ElevenLabs", bars: [55, 75, 60, 80, 50, 70, 85, 45], grad: gradients.indigo },
  ];
  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="Voices" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="Voice Library" subtitle="1,000+ voices" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            {/* Filter bar */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 rounded-md px-2 py-1 text-[5px]" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textMuted }}>🔍 Search voices...</div>
              <div className="flex gap-0.5">
                {["All", "ElevenLabs", "OpenAI", "Deepgram"].map((f, i) => (
                  <span key={f} className="text-[4.5px] px-1.5 py-0.5 rounded font-medium" style={{ background: i === 0 ? t.accentGlow : "transparent", color: i === 0 ? t.accent : t.textMuted }}>{f}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {voices.map((v, i) => (
                <div key={i} className="rounded-lg overflow-hidden" style={{ background: t.surface, border: `1px solid ${i === 0 ? t.accent + "44" : t.border}` }}>
                  <div className="h-[2px]" style={{ background: v.grad }} />
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[6px] text-white" style={{ background: v.grad }}>▶</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="text-[6px] font-semibold" style={{ color: t.text }}>{v.name}</div>
                          {i === 0 && <span className="text-[4px] px-1 py-0.5 rounded-full font-semibold text-white" style={{ background: gradients.green }}>Active</span>}
                        </div>
                        <div className="text-[4.5px]" style={{ color: t.textMuted }}>{v.style} · {v.provider}</div>
                      </div>
                    </div>
                    {/* Mini waveform with gradient bars */}
                    <div className="flex items-center gap-px" style={{ height: 14 }}>
                      {v.bars.map((h, j) => (
                        <div key={j} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: v.grad, opacity: 0.8 }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Clone your own voice section */}
            <div className="mt-2 rounded-lg p-2 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${t.accent}12, ${t.accent}06)`, border: `1px solid ${t.accent}22` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px]" style={{ background: t.accentGlow }}>🎤</div>
              <div className="flex-1">
                <div className="text-[6px] font-semibold" style={{ color: t.text }}>Clone Your Own Voice</div>
                <div className="text-[4.5px]" style={{ color: t.textSec }}>Upload a 30-second clip to create a custom voice clone</div>
              </div>
              <div className="px-1.5 py-0.5 rounded text-[5px] font-semibold text-white" style={{ background: gradients.purple }}>Upload</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   TEST AGENT SCREENSHOT — for How It Works step 3
   ──────────────────────────────────────────────────────────────────── */
export function TestAgentScreenshot({ mode = "light" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;
  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="Test Agent" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="Test Agent" subtitle="Live conversation" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            <div className="flex gap-2 h-full">
              {/* Chat area */}
              <div className="flex-1 rounded-lg flex flex-col" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                {/* Status bar */}
                <div className="flex items-center gap-1.5 px-2 py-1" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[5px] font-medium" style={{ color: "#10B981" }}>Agent Active</span>
                  <span className="ml-auto text-[4.5px]" style={{ color: t.textMuted }}>Response: 0.8s avg</span>
                </div>
                <div className="flex-1 p-2 space-y-1.5">
                  {/* AI greeting */}
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] text-white flex-shrink-0" style={{ background: gradients.purple }}>AI</div>
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px]" style={{ background: "linear-gradient(135deg, rgba(99,91,255,0.12), rgba(139,92,246,0.06))", color: t.text }}>
                      Hi! Thank you for calling Dr. Smith&apos;s Dental Office. This is Sarah, how can I help you today?
                    </div>
                  </div>
                  {/* User */}
                  <div className="flex gap-1 justify-end">
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px] text-white" style={{ background: gradients.purple }}>
                      I&apos;d like to book a cleaning appointment for next week
                    </div>
                  </div>
                  {/* AI reply */}
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] text-white flex-shrink-0" style={{ background: gradients.purple }}>AI</div>
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px]" style={{ background: "linear-gradient(135deg, rgba(99,91,255,0.12), rgba(139,92,246,0.06))", color: t.text }}>
                      I&apos;d love to help! Let me check our availability. Are you a current patient with us, or would this be your first visit?
                    </div>
                  </div>
                  {/* User */}
                  <div className="flex gap-1 justify-end">
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px] text-white" style={{ background: gradients.purple }}>
                      I&apos;m a current patient. Last name is Johnson.
                    </div>
                  </div>
                  {/* AI with booking */}
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] text-white flex-shrink-0" style={{ background: gradients.purple }}>AI</div>
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px]" style={{ background: "linear-gradient(135deg, rgba(99,91,255,0.12), rgba(139,92,246,0.06))", color: t.text }}>
                      Great, I found your file! I have openings on Tuesday at 10am or Thursday at 2:30pm. Which works better for you?
                    </div>
                  </div>
                  {/* User */}
                  <div className="flex gap-1 justify-end">
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px] text-white" style={{ background: gradients.purple }}>
                      Thursday at 2:30 works perfectly
                    </div>
                  </div>
                  {/* AI confirmation */}
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[5px] text-white flex-shrink-0" style={{ background: gradients.purple }}>AI</div>
                    <div className="rounded-lg px-2 py-1 max-w-[75%] text-[5.5px]" style={{ background: "linear-gradient(135deg, rgba(99,91,255,0.12), rgba(139,92,246,0.06))", color: t.text }}>
                      You&apos;re all set! Thursday at 2:30 PM for a dental cleaning. I&apos;ll send you a confirmation text. Anything else I can help with?
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="px-2 py-1.5" style={{ borderTop: `1px solid ${t.border}` }}>
                  <div className="rounded-md px-2 py-1 text-[5px]" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textMuted }}>
                    Type a message...
                  </div>
                </div>
              </div>
              {/* Config panel */}
              <div className="rounded-lg overflow-hidden flex flex-col" style={{ width: 85, background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="h-[2px]" style={{ background: gradients.purple }} />
                <div className="p-2 flex-1">
                  <div className="text-[5.5px] font-semibold mb-2" style={{ color: t.text }}>Test Config</div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="text-[4.5px] mb-0.5" style={{ color: t.textMuted }}>Voice</div>
                      <div className="text-[5px] px-1 py-0.5 rounded" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>11labs-Cimo</div>
                    </div>
                    <div>
                      <div className="text-[4.5px] mb-0.5" style={{ color: t.textMuted }}>Model</div>
                      <div className="text-[5px] px-1 py-0.5 rounded" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>gpt-5.2</div>
                    </div>
                    <div>
                      <div className="text-[4.5px] mb-0.5" style={{ color: t.textMuted }}>Mode</div>
                      <div className="flex gap-0.5">
                        <span className="text-[4.5px] px-1 py-0.5 rounded text-white" style={{ background: gradients.purple }}>Normal</span>
                        <span className="text-[4.5px] px-1 py-0.5 rounded" style={{ background: t.inputBg, color: t.textMuted }}>Train</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[4.5px] mb-0.5" style={{ color: t.textMuted }}>Temperature</div>
                      <div className="h-1 rounded-full" style={{ background: t.chartBar }}>
                        <div className="h-1 rounded-full w-[70%]" style={{ background: gradients.purple }} />
                      </div>
                      <div className="text-[4px] text-right mt-0.5" style={{ color: t.textMuted }}>0.7</div>
                    </div>
                  </div>
                  {/* Live metrics */}
                  <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
                    <div className="text-[5px] font-semibold mb-1.5" style={{ color: t.text }}>Live Stats</div>
                    {[
                      { label: "Confidence", value: "97%", color: "#10B981" },
                      { label: "Sentiment", value: "Positive", color: "#3B82F6" },
                      { label: "Latency", value: "0.8s", color: "#F59E0B" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between py-0.5">
                        <span className="text-[4.5px]" style={{ color: t.textMuted }}>{s.label}</span>
                        <span className="text-[5px] font-semibold" style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   CALL HISTORY SCREENSHOT — for How It Works step 4 / Demo
   ──────────────────────────────────────────────────────────────────── */
export function CallHistoryScreenshot({ mode = "light" }: { mode?: "dark" | "light" }) {
  const t = mode === "dark" ? dark : light;
  return (
    <div className="rounded-lg overflow-hidden select-none" style={{ background: t.bg, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
      <div className="flex" style={{ minHeight: 320 }}>
        <MiniSidebar t={t} active="Call History" />
        <div className="flex-1 flex flex-col">
          <MiniTopBar t={t} title="Call History" subtitle="1,247 calls" />
          <div className="flex-1 p-3" style={{ background: t.bg }}>
            {/* Stats row with vivid color bars */}
            <div className="flex gap-1.5 mb-2">
              {[
                { label: "Total Calls", value: "1,247", color: "#635BFF" },
                { label: "Total Minutes", value: "4,892", color: "#3B82F6" },
                { label: "Avg Duration", value: "3:55", color: "#F59E0B" },
                { label: "Success Rate", value: "92%", color: "#10B981" },
              ].map((s, i) => (
                <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="h-[3px]" style={{ background: s.color }} />
                  <div className="p-1.5">
                    <div className="text-[4.5px]" style={{ color: t.textMuted }}>{s.label}</div>
                    <div className="text-[8px] font-bold" style={{ color: s.color }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Filter/search bar */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 rounded-md px-2 py-1 text-[5px]" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textMuted }}>🔍 Search calls...</div>
              <div className="flex gap-0.5">
                {["All", "Booked", "Qualified", "Missed"].map((f, i) => (
                  <span key={f} className="text-[4.5px] px-1.5 py-0.5 rounded font-medium" style={{ background: i === 0 ? t.accentGlow : "transparent", color: i === 0 ? t.accent : t.textMuted }}>{f}</span>
                ))}
              </div>
            </div>
            {/* Table */}
            <div className="rounded-lg overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex px-2 py-1" style={{ borderBottom: `1px solid ${t.border}` }}>
                {["Caller", "Time", "Duration", "Outcome", "Score"].map((h, i) => (
                  <div key={i} className="text-[5px] font-medium" style={{ color: t.textMuted, flex: i === 0 ? 2 : 1, textAlign: i > 0 ? "center" : "left" }}>{h}</div>
                ))}
              </div>
              {[
                { name: "John Davis", time: "2m ago", dur: "4:23", outcome: "Booked", score: "95", color: "#10B981" },
                { name: "Sarah Mitchell", time: "18m ago", dur: "2:15", outcome: "Qualified", score: "88", color: "#3B82F6" },
                { name: "Mike Roberts", time: "45m ago", dur: "1:45", outcome: "Follow-up", score: "72", color: "#F59E0B" },
                { name: "Lisa Kim", time: "1h ago", dur: "5:10", outcome: "Booked", score: "97", color: "#10B981" },
                { name: "Tom Anderson", time: "1.5h ago", dur: "3:02", outcome: "Booked", score: "91", color: "#10B981" },
                { name: "Amy Chen", time: "2h ago", dur: "1:22", outcome: "Missed", score: "—", color: "#EF4444" },
                { name: "David Park", time: "2.5h ago", dur: "6:15", outcome: "Qualified", score: "84", color: "#3B82F6" },
                { name: "Rachel Lee", time: "3h ago", dur: "4:45", outcome: "Booked", score: "93", color: "#10B981" },
              ].map((r, i) => (
                <div key={i} className="flex items-center px-2 py-1" style={{ borderBottom: i < 7 ? `1px solid ${t.border}` : "none" }}>
                  <div className="flex items-center gap-1" style={{ flex: 2 }}>
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[4px] font-semibold" style={{ background: t.accentGlow, color: t.textSec }}>{r.name[0]}</div>
                    <div>
                      <span className="text-[5.5px] block" style={{ color: t.text }}>{r.name}</span>
                      <span className="text-[4px]" style={{ color: t.textMuted }}>{r.time}</span>
                    </div>
                  </div>
                  <div className="text-[5px] text-center" style={{ flex: 1, color: t.textSec }}>{r.time}</div>
                  <div className="text-[5px] text-center" style={{ flex: 1, color: t.textSec }}>{r.dur}</div>
                  <div className="text-center" style={{ flex: 1 }}>
                    <span className="text-[4.5px] px-1 py-0.5 rounded-full font-semibold" style={{ background: `${r.color}${mode === "dark" ? "20" : "15"}`, color: r.color }}>{r.outcome}</span>
                  </div>
                  <div className="text-[5.5px] text-center font-bold" style={{ flex: 1, color: r.color }}>{r.score}</div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[5px]" style={{ color: t.textMuted }}>Showing 1-8 of 1,247 calls</span>
              <div className="flex gap-0.5">
                {["←", "1", "2", "3", "...", "156", "→"].map((p, i) => (
                  <span key={i} className="text-[5px] px-1 py-0.5 rounded" style={{ background: i === 1 ? t.accentGlow : "transparent", color: i === 1 ? t.accent : t.textMuted }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   BROWSER FRAME WRAPPER — gives screenshots a professional frame
   ──────────────────────────────────────────────────────────────────── */
export function BrowserFrame({ children, url = "voiceai.com/dashboard", darkFrame = true, className }: { children: React.ReactNode; url?: string; darkFrame?: boolean; className?: string }) {
  return (
    <div className={clsx("rounded-xl overflow-hidden shadow-2xl", className)} style={{ border: darkFrame ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: darkFrame ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderBottom: darkFrame ? "1px solid rgba(255,255,255,0.06)" : "1px solid #E2E8F0" }}>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: darkFrame ? "rgba(255,255,255,0.1)" : "#FCA5A5" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: darkFrame ? "rgba(255,255,255,0.1)" : "#FCD34D" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: darkFrame ? "rgba(255,255,255,0.1)" : "#6EE7B7" }} />
        </div>
        <div className="flex-1 mx-6">
          <div className="h-5 rounded-md max-w-[200px] mx-auto flex items-center justify-center" style={{ background: darkFrame ? "rgba(255,255,255,0.04)" : "#F1F5F9" }}>
            <span className="text-[9px]" style={{ color: darkFrame ? "rgba(255,255,255,0.3)" : "#94A3B8" }}>{url}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
