"use client";

import { useState } from "react";

// ─── Types ───
type Mode = "light" | "dark";
type PageId = "dashboard" | "test" | "prompt" | "knowledge" | "voices" | "calls" | "ai-manager" | "scoreboard" | "integrations" | "marketplace" | "settings";

interface ThemeTokens {
  sidebarBg: string; sidebarBorder: string; sidebarGroupLabel: string; sidebarText: string;
  sidebarTextActive: string; sidebarActiveBg: string; sidebarHoverBg: string; sidebarAccent: string;
  sidebarSwitcherBg: string; sidebarSwitcherBorder: string; sidebarSwitcherText: string;
  sidebarSwitcherMuted: string; sidebarUserMuted: string;
  contentBg: string; contentSurface: string; contentBorder: string;
  topBarBg: string; topBarBorder: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  cardBg: string; cardBorder: string; cardShadow: string; cardAccentOpacity: string;
  chartBarInactive: string; toggleBg: string; toggleActiveBg: string;
  badgeBg: string; badgeText: string; badgeBorder: string;
  avatarBg: string; avatarText: string; statusDot: string;
  dropdownBg: string; dropdownBorder: string; dropdownHover: string;
  inputBg: string; inputBorder: string; inputText: string; inputPlaceholder: string;
  codeBg: string; codeBorder: string; codeText: string;
  tableDivider: string; tableRowHover: string;
  tagBg: string; tagText: string;
}

function getTheme(mode: Mode): ThemeTokens {
  if (mode === "dark") return {
    sidebarBg: "#0F1117", sidebarBorder: "rgba(255,255,255,0.06)", sidebarGroupLabel: "rgba(255,255,255,0.2)",
    sidebarText: "rgba(255,255,255,0.45)", sidebarTextActive: "#FFFFFF", sidebarActiveBg: "rgba(99,91,255,0.12)",
    sidebarHoverBg: "rgba(255,255,255,0.04)", sidebarAccent: "#635BFF",
    sidebarSwitcherBg: "rgba(255,255,255,0.04)", sidebarSwitcherBorder: "rgba(255,255,255,0.06)",
    sidebarSwitcherText: "#FFFFFF", sidebarSwitcherMuted: "rgba(255,255,255,0.25)", sidebarUserMuted: "rgba(255,255,255,0.25)",
    contentBg: "#111318", contentSurface: "#1A1C24", contentBorder: "rgba(255,255,255,0.06)",
    topBarBg: "#16181F", topBarBorder: "rgba(255,255,255,0.06)",
    textPrimary: "#F1F1F3", textSecondary: "#8B8D98", textMuted: "rgba(255,255,255,0.3)",
    cardBg: "#1A1C24", cardBorder: "rgba(255,255,255,0.06)", cardShadow: "none", cardAccentOpacity: "0.08",
    chartBarInactive: "rgba(255,255,255,0.06)", toggleBg: "rgba(255,255,255,0.06)", toggleActiveBg: "rgba(255,255,255,0.1)",
    badgeBg: "rgba(16,185,129,0.12)", badgeText: "#34D399", badgeBorder: "rgba(16,185,129,0.2)",
    avatarBg: "rgba(255,255,255,0.08)", avatarText: "rgba(255,255,255,0.6)", statusDot: "#34D399",
    dropdownBg: "#1A1C24", dropdownBorder: "rgba(255,255,255,0.08)", dropdownHover: "rgba(255,255,255,0.04)",
    inputBg: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.08)", inputText: "#F1F1F3", inputPlaceholder: "rgba(255,255,255,0.25)",
    codeBg: "#0D0F14", codeBorder: "rgba(255,255,255,0.06)", codeText: "#A5B4FC",
    tableDivider: "rgba(255,255,255,0.04)", tableRowHover: "rgba(255,255,255,0.02)",
    tagBg: "rgba(99,91,255,0.12)", tagText: "#A5B4FC",
  };
  return {
    sidebarBg: "#FAFBFC", sidebarBorder: "#E8EBF0", sidebarGroupLabel: "#9CA3AF",
    sidebarText: "#6B7280", sidebarTextActive: "#0F1117", sidebarActiveBg: "rgba(99,91,255,0.08)",
    sidebarHoverBg: "rgba(0,0,0,0.03)", sidebarAccent: "#635BFF",
    sidebarSwitcherBg: "#FFFFFF", sidebarSwitcherBorder: "#E8EBF0",
    sidebarSwitcherText: "#0F1117", sidebarSwitcherMuted: "#9CA3AF", sidebarUserMuted: "#9CA3AF",
    contentBg: "#F6F6F9", contentSurface: "#FFFFFF", contentBorder: "#E8EBF0",
    topBarBg: "#FFFFFF", topBarBorder: "#E8EBF0",
    textPrimary: "#0F1117", textSecondary: "#8B8D98", textMuted: "#B4B6BE",
    cardBg: "#FFFFFF", cardBorder: "#E8EBF0", cardShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", cardAccentOpacity: "0.06",
    chartBarInactive: "#EEEEF4", toggleBg: "#F1F1F5", toggleActiveBg: "#FFFFFF",
    badgeBg: "rgba(16,185,129,0.08)", badgeText: "#059669", badgeBorder: "rgba(16,185,129,0.15)",
    avatarBg: "#F1F1F5", avatarText: "#6B7280", statusDot: "#10B981",
    dropdownBg: "#FFFFFF", dropdownBorder: "#E8EBF0", dropdownHover: "#F6F6F9",
    inputBg: "#FFFFFF", inputBorder: "#E8EBF0", inputText: "#0F1117", inputPlaceholder: "#B4B6BE",
    codeBg: "#F8F9FC", codeBorder: "#E8EBF0", codeText: "#4F46E5",
    tableDivider: "#F1F1F5", tableRowHover: "#F8F9FC",
    tagBg: "rgba(99,91,255,0.06)", tagText: "#635BFF",
  };
}

// ═══════════════════════════════════════════════════════════════
// INNER PAGES
// ═══════════════════════════════════════════════════════════════

// ─── Dashboard Page ───
function DashboardContent({ t, mode, agentName }: { t: ThemeTokens; mode: Mode; agentName: string }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.statusDot }} />
          <span className="text-xs font-medium" style={{ color: t.badgeText }}>Agent Active</span>
        </div>
        <span className="text-xs" style={{ color: t.textMuted }}>Last call: 2 minutes ago</span>
      </div>
      <div className="grid grid-cols-4 gap-5 mb-6">
        {[
          { label: "Total Calls", value: "2,847", change: "+12.5%", color: "#635BFF" },
          { label: "Success Rate", value: "94.2%", change: "+3.1%", color: "#10B981" },
          { label: "Avg Duration", value: "3:42", change: "-0:15", color: "#F59E0B" },
          { label: "AI Score", value: "8.7/10", change: "+0.4", color: "#8B5CF6" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1" style={{ background: stat.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: t.textSecondary }}>{stat.label}</p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${stat.color}${mode === "dark" ? "14" : "0F"}`, color: stat.color }}>{stat.change}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: t.textPrimary }}>{stat.value}</p>
              <svg className="w-full h-8 mt-3" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs><linearGradient id={`g-${stat.label}-${mode}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={stat.color} stopOpacity={mode==="dark"?"0.2":"0.15"}/><stop offset="100%" stopColor={stat.color} stopOpacity="0"/></linearGradient></defs>
                <path d="M0,25 Q15,20 25,18 T50,12 T75,8 T100,5 V30 H0 Z" fill={`url(#g-${stat.label}-${mode})`}/>
                <path d="M0,25 Q15,20 25,18 T50,12 T75,8 T100,5" fill="none" stroke={stat.color} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-2xl p-6" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="flex items-center justify-between mb-5">
            <div><p className="text-sm font-bold" style={{ color: t.textPrimary }}>Call Volume</p><p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>Calls handled over time</p></div>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
              {["Week","Month","Year"].map((l,i)=>(<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background:i===0?t.toggleActiveBg:"transparent", color:i===0?t.textPrimary:t.textSecondary, boxShadow:i===0&&mode==="light"?"0 1px 2px rgba(0,0,0,0.06)":"none" }}>{l}</button>))}
            </div>
          </div>
          <div className="h-48 flex items-end gap-3 px-2">
            {[40,65,45,80,60,90,75,85,70,95,80,88].map((h,i)=>(<div key={i} className="flex-1"><div className="w-full rounded-xl" style={{ height:`${h*1.8}px`, background:i===11?"linear-gradient(180deg,#635BFF,#8B5CF6)":t.chartBarInactive, boxShadow:i===11?"0 4px 12px rgba(99,91,255,0.25)":"none" }}/></div>))}
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-bold" style={{ color: t.textPrimary }}>Recent Calls</p><button className="text-xs font-medium" style={{ color: t.sidebarAccent }}>View all →</button></div>
          <div className="space-y-3">
            {[{n:"Dr. Smith Office",t:"2m ago",s:"completed",i:"D"},{n:"Johnson Plumbing",t:"15m ago",s:"completed",i:"J"},{n:"Apex Dental",t:"1h ago",s:"missed",i:"A"},{n:"Sarah Mitchell",t:"2h ago",s:"completed",i:"S"},{n:"Rivera HVAC",t:"3h ago",s:"completed",i:"R"}].map((c)=>(
              <div key={c.n} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background:t.avatarBg, color:t.avatarText }}>{c.i}</div><div><p className="text-sm font-medium" style={{ color:t.textPrimary }}>{c.n}</p><p className="text-[11px]" style={{ color:t.textSecondary }}>{c.t}</p></div></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background:c.s==="completed"?"#10B981":"#EF4444" }}/><span className="text-[11px] font-medium" style={{ color:c.s==="completed"?"#10B981":"#EF4444" }}>{c.s}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Prompt Editor Page ───
function PromptContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [activeVersion, setActiveVersion] = useState(0);
  const sections = [
    { num: 1, title: "Role & Objective", body: "You are Ava, a friendly and professional AI voice receptionist for Bright Smiles Dental. Your primary goal is to provide an exceptional caller experience — answering questions, booking appointments, and routing urgent calls to the right team member. You represent the practice with warmth and professionalism at all times." },
    { num: 2, title: "Personality & Tone", body: "Speak with warmth, confidence, and empathy. Be conversational but professional — never robotic or stiff. Use the caller's name once they provide it. Mirror the caller's energy: match a cheerful caller's enthusiasm, and be calm and reassuring with anxious or frustrated callers. Keep responses concise — ideally under two sentences per turn." },
    { num: 3, title: "Call Flow", body: "Begin each call by saying: \"Thank you for calling Bright Smiles Dental, this is Ava. How can I help you today?\" Ask for the caller's name early in the conversation. Determine the reason for the call: scheduling, rescheduling, cancellations, general questions, or emergencies. For scheduling, check availability using the calendar tool and confirm the date, time, and provider. For emergencies, immediately transfer to the on-call dentist at the emergency line." },
    { num: 4, title: "Constraints", body: "Never provide medical or dental advice — instead, offer to connect the caller with a provider. Never share other patients' information or appointment details. Do not speculate about insurance coverage or costs — direct those questions to the billing team. Always confirm the caller's identity before making any changes to an existing appointment. If unsure about something, say: \"Let me make a note of that and have someone from our team follow up with you.\"" },
  ];
  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Main Prompt Display */}
      <div className="col-span-2 flex flex-col gap-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#635BFF" }} />
          <div className="p-6 pb-2">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-base font-bold" style={{ color: t.textPrimary }}>Bright Smiles Dental — Voice Agent Prompt</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: t.tagBg, color: t.tagText }}>v3.2 — Live</span>
                <button className="text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)", color: "#FFFFFF" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Prompt
                </button>
              </div>
            </div>
            <p className="text-xs mb-5" style={{ color: t.textSecondary }}>Last updated by AI Manager · Today, 2:15 PM</p>
          </div>

          {/* Structured prompt sections */}
          <div className="px-6 pb-6">
            {sections.map((sec, i) => (
              <div key={sec.num} className={i < sections.length - 1 ? "mb-5" : ""}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>{sec.num}</div>
                  <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{sec.title}</p>
                </div>
                <div className="ml-[34px]">
                  <div className="w-full h-px mb-3" style={{ background: "#635BFF", opacity: 0.3 }} />
                  <p className="text-[13px] leading-relaxed" style={{ color: t.textSecondary }}>{sec.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variables */}
        <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Dynamic Variables</p>
          <div className="grid grid-cols-2 gap-3">
            {[{k:"{{business_name}}",v:"Bright Smiles Dental"},{k:"{{business_hours}}",v:"Mon-Fri 8am-6pm"},{k:"{{emergency_number}}",v:"+1 (555) 911-0001"},{k:"{{booking_link}}",v:"cal.com/brightsmiles"}].map((v)=>(
              <div key={v.k} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                <code className="text-xs font-semibold" style={{ color: t.codeText }}>{v.k}</code>
                <span className="text-xs" style={{ color: t.textSecondary }}>→</span>
                <span className="text-xs" style={{ color: t.textPrimary }}>{v.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar: Version History */}
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#8B5CF6" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Version History</p>
            <div className="space-y-2">
              {[{v:"v3.2",date:"Today, 2:15 PM",by:"AI Manager",active:true},{v:"v3.1",date:"Yesterday, 4:30 PM",by:"You",active:false},{v:"v3.0",date:"Feb 10, 11:00 AM",by:"AI Manager",active:false},{v:"v2.9",date:"Feb 8, 9:15 AM",by:"You",active:false},{v:"v2.8",date:"Feb 5, 3:45 PM",by:"AI Manager",active:false}].map((ver,i)=>(
                <button key={ver.v} onClick={()=>setActiveVersion(i)} className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left" style={{ background: activeVersion===i? t.sidebarActiveBg : "transparent", border: activeVersion===i ? `1px solid ${t.sidebarAccent}33` : "1px solid transparent" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: activeVersion===i ? `${t.sidebarAccent}15` : t.avatarBg, color: activeVersion===i ? t.sidebarAccent : t.avatarText }}>{ver.v}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: t.textPrimary }}>{ver.date}</p>
                    <p className="text-[10px]" style={{ color: t.textSecondary }}>by {ver.by}</p>
                  </div>
                  {ver.active && <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: t.badgeBg, color: t.badgeText }}>LIVE</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#F59E0B" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-1" style={{ color: t.textPrimary }}>AI Suggestions</p>
            <p className="text-xs mb-4" style={{ color: t.textSecondary }}>Based on recent call analysis</p>
            <div className="space-y-3">
              {[{s:"Add Spanish language support — 18% of callers speak Spanish",p:"High"},{s:"Shorten initial greeting by ~5 words for faster engagement",p:"Medium"}].map((sug)=>(
                <div key={sug.s} className="p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: sug.p==="High" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: sug.p==="High" ? "#EF4444" : "#F59E0B" }}>{sug.p}</span>
                  </div>
                  <p className="text-xs" style={{ color: t.textPrimary }}>{sug.s}</p>
                  <button className="text-[11px] font-medium mt-2" style={{ color: t.sidebarAccent }}>Apply →</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Call History Page ───
function CallHistoryContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [selectedCall, setSelectedCall] = useState<number|null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(35);
  const [promptInput, setPromptInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promptApplied, setPromptApplied] = useState(false);

  const calls = [
    { id: 1, caller: "Dr. Smith Office", phone: "+1 (555) 234-5678", duration: "4:32", outcome: "Appointment Booked", score: 9.2, time: "Today, 2:15 PM", sentiment: "positive" },
    { id: 2, caller: "Johnson Plumbing", phone: "+1 (555) 345-6789", duration: "2:18", outcome: "Info Provided", score: 8.8, time: "Today, 1:45 PM", sentiment: "positive" },
    { id: 3, caller: "Unknown Caller", phone: "+1 (555) 456-7890", duration: "0:45", outcome: "Transferred", score: 6.5, time: "Today, 12:30 PM", sentiment: "neutral" },
    { id: 4, caller: "Apex Dental", phone: "+1 (555) 567-8901", duration: "3:15", outcome: "Callback Scheduled", score: 8.1, time: "Today, 11:00 AM", sentiment: "positive" },
    { id: 5, caller: "Sarah Mitchell", phone: "+1 (555) 678-9012", duration: "1:52", outcome: "Appointment Booked", score: 9.5, time: "Today, 10:20 AM", sentiment: "positive" },
    { id: 6, caller: "Rivera HVAC", phone: "+1 (555) 789-0123", duration: "0:32", outcome: "Missed", score: 0, time: "Today, 9:45 AM", sentiment: "negative" },
    { id: 7, caller: "Maria Garcia", phone: "+1 (555) 890-1234", duration: "5:10", outcome: "Issue Resolved", score: 7.4, time: "Yesterday, 4:30 PM", sentiment: "neutral" },
  ];

  const transcripts: Record<number, { from: string; text: string; time: string }[]> = {
    1: [
      { from: "agent", text: "Thank you for calling Bright Smiles Dental! My name is Ava. How can I help you today?", time: "0:00" },
      { from: "caller", text: "Hi there, I'm calling from Dr. Smith's office. We need to schedule a referral patient for a cleaning and exam.", time: "0:05" },
      { from: "agent", text: "Of course! I'd be happy to help with that referral. Could I get the patient's name and their preferred day?", time: "0:14" },
      { from: "caller", text: "Yes, the patient is Robert Chen. He's flexible but prefers mornings if possible.", time: "0:22" },
      { from: "agent", text: "Perfect. I have an opening this Thursday at 9:30 AM with Dr. Williams for a new patient cleaning and exam. Would that work for Robert?", time: "0:30" },
      { from: "caller", text: "That would be great actually. Thursday at 9:30 works.", time: "0:42" },
      { from: "agent", text: "Wonderful! I've booked Robert Chen for Thursday at 9:30 AM with Dr. Williams. We'll send a confirmation text to the number on file. Is there anything else I can help with?", time: "0:48" },
      { from: "caller", text: "No that's all, thank you so much!", time: "1:02" },
      { from: "agent", text: "You're welcome! Thank you for the referral. Have a great day!", time: "1:06" },
    ],
    5: [
      { from: "agent", text: "Thank you for calling Bright Smiles Dental! My name is Ava. How can I help you today?", time: "0:00" },
      { from: "caller", text: "Hi Ava, this is Sarah Mitchell. I need to book a teeth whitening appointment.", time: "0:04" },
      { from: "agent", text: "Hi Sarah! Great to hear from you. I'd love to help you schedule that. Do you have a preference for which day works best?", time: "0:11" },
      { from: "caller", text: "Sometime next week would be ideal, maybe Tuesday or Wednesday?", time: "0:20" },
      { from: "agent", text: "Let me check... I have Tuesday at 11 AM or Wednesday at 3 PM available for whitening sessions. Each session takes about 90 minutes. Which do you prefer?", time: "0:26" },
      { from: "caller", text: "Tuesday at 11 works perfectly.", time: "0:38" },
      { from: "agent", text: "You're all set, Sarah! Tuesday at 11 AM for teeth whitening. Please avoid coffee and dark foods 24 hours before your appointment for best results. We'll send you a reminder the day before!", time: "0:42" },
      { from: "caller", text: "That's so helpful, thank you Ava!", time: "0:55" },
    ],
  };

  const activeCall = selectedCall !== null ? calls.find(c => c.id === selectedCall) : null;
  const activeTranscript = selectedCall !== null ? (transcripts[selectedCall] || transcripts[1]) : [];

  return (
    <>
      {/* Detail Modal Overlay */}
      {selectedCall !== null && activeCall && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl max-h-full overflow-auto rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            {/* Modal top accent */}
            <div className="h-1" style={{ background: "linear-gradient(90deg, #635BFF, #8B5CF6)" }} />

            {/* Modal header */}
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: t.avatarBg, color: t.avatarText }}>{activeCall.caller[0]}</div>
                <div>
                  <p className="text-base font-bold" style={{ color: t.textPrimary }}>{activeCall.caller}</p>
                  <p className="text-xs" style={{ color: t.textSecondary }}>{activeCall.phone} · {activeCall.time}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedCall(null); setPromptInput(""); setPromptApplied(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                <svg className="w-4 h-4" style={{ color: t.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Call details grid */}
            <div className="p-6" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Duration", value: activeCall.duration, icon: "⏱" },
                  { label: "Outcome", value: activeCall.outcome, icon: "✅" },
                  { label: "AI Score", value: activeCall.score > 0 ? `${activeCall.score}/10` : "N/A", icon: "🎯" },
                  { label: "Sentiment", value: activeCall.sentiment.charAt(0).toUpperCase() + activeCall.sentiment.slice(1), icon: activeCall.sentiment === "positive" ? "😊" : activeCall.sentiment === "neutral" ? "😐" : "😟" },
                ].map((d) => (
                  <div key={d.label} className="text-center p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                    <span className="text-base">{d.icon}</span>
                    <p className="text-sm font-bold mt-1" style={{ color: t.textPrimary }}>{d.value}</p>
                    <p className="text-[10px]" style={{ color: t.textSecondary }}>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Player */}
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" style={{ color: "#635BFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 14m0-14v14m-3.536-3.536a5 5 0 010-7.072M6.343 6.343a8 8 0 000 11.314"/></svg>
                <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Call Recording</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="w-full h-2 rounded-full cursor-pointer" style={{ background: t.chartBarInactive }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${playbackProgress}%`, background: "linear-gradient(90deg, #635BFF, #8B5CF6)" }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>1:35</span>
                    <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>{activeCall.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <svg className="w-3.5 h-3.5" style={{ color: t.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                  <div className="w-14 h-1.5 rounded-full" style={{ background: t.chartBarInactive }}><div className="h-full rounded-full w-3/4" style={{ background: t.textSecondary }}/></div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="px-6 pt-5 pb-2" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4" style={{ color: "#10B981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Transcript</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>{activeTranscript.length} messages</span>
              </div>
              <div className="space-y-3 max-h-64 overflow-auto pb-4">
                {activeTranscript.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{
                        background: msg.from === "agent" ? "linear-gradient(135deg, #635BFF, #8B5CF6)" : t.avatarBg,
                        color: msg.from === "agent" ? "#fff" : t.avatarText,
                      }}>{msg.from === "agent" ? "AI" : activeCall.caller[0]}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold" style={{ color: msg.from === "agent" ? "#635BFF" : t.textPrimary }}>{msg.from === "agent" ? "Ava (AI)" : activeCall.caller}</span>
                        <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>{msg.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Adjustment Section */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" style={{ color: "#8B5CF6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>Adjust Prompt Based on This Call</p>
              </div>
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: t.textSecondary }}>
                Describe what changes you want to make to the agent&apos;s behavior based on what you observed in this call. The AI will process your instructions through the seed prompt and generate the updated prompt for you.
              </p>

              {!promptApplied ? (
                <>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. The agent should confirm the referral source before booking. When scheduling for a new patient, always ask about insurance information upfront. The closing was good but should also mention our new patient welcome packet..."
                    className="w-full h-28 text-xs p-3.5 rounded-xl resize-none outline-none transition-all placeholder:leading-relaxed"
                    style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[10px]" style={{ color: t.textMuted }}>Changes will be processed through your seed prompt</p>
                    <button
                      onClick={() => { if (promptInput.trim()) { setIsProcessing(true); setTimeout(() => { setIsProcessing(false); setPromptApplied(true); }, 2000); }}}
                      className="flex items-center gap-2 text-xs font-semibold px-5 py-2 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ background: promptInput.trim() ? "linear-gradient(135deg, #635BFF, #8B5CF6)" : t.chartBarInactive, cursor: promptInput.trim() ? "pointer" : "not-allowed" }}
                    >
                      {isProcessing ? (
                        <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/></svg>Processing...</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Generate Changes</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(16,185,129,0.2)` }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(16,185,129,0.06)" }}>
                    <svg className="w-4 h-4" style={{ color: "#10B981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <p className="text-xs font-semibold" style={{ color: "#10B981" }}>Prompt Changes Generated</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="rounded-lg p-3" style={{ background: mode === "dark" ? "rgba(99,91,255,0.06)" : "rgba(99,91,255,0.03)", border: `1px solid ${mode === "dark" ? "rgba(99,91,255,0.15)" : "rgba(99,91,255,0.1)"}` }}>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded mb-2 inline-block" style={{ background: "rgba(99,91,255,0.1)", color: "#635BFF" }}>CALL_FLOW</span>
                      <p className="text-xs leading-relaxed" style={{ color: t.textPrimary }}>For referral calls, ask &ldquo;May I confirm who referred this patient?&rdquo; before proceeding to schedule. For new patients, ask about insurance provider and member ID after confirming the appointment time.</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: mode === "dark" ? "rgba(99,91,255,0.06)" : "rgba(99,91,255,0.03)", border: `1px solid ${mode === "dark" ? "rgba(99,91,255,0.15)" : "rgba(99,91,255,0.1)"}` }}>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded mb-2 inline-block" style={{ background: "rgba(99,91,255,0.1)", color: "#635BFF" }}>CLOSING</span>
                      <p className="text-xs leading-relaxed" style={{ color: t.textPrimary }}>When booking a new patient, mention: &ldquo;We&apos;ll also have a welcome packet ready for you at check-in with everything you need to know about our practice.&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Apply to Prompt
                      </button>
                      <button onClick={() => { setPromptApplied(false); setPromptInput(""); }} className="text-xs font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80" style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}>Edit Instructions</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Calls", value: "2,847", icon: "📞", color: "#635BFF", delta: "+124 this week" },
          { label: "Total Minutes", value: "8,432", icon: "⏱️", color: "#10B981", delta: "+312 this week" },
          { label: "Avg Duration", value: "2:58", icon: "⏰", color: "#8B5CF6", delta: "↑ 12s vs last week" },
          { label: "Success Rate", value: "94.2%", icon: "✅", color: "#F59E0B", delta: "+1.8% vs last week" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1" style={{ background: card.color }} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{card.icon}</span>
                <span className="text-[10px] font-medium" style={{ color: "#10B981" }}>{card.delta}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: t.textPrimary }}>{card.value}</p>
              <p className="text-[10px]" style={{ color: t.textSecondary }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
            {["All","Completed","Missed","Transferred"].map((l,i)=>(<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background:i===0?t.toggleActiveBg:"transparent", color:i===0?t.textPrimary:t.textSecondary, boxShadow:i===0&&mode==="light"?"0 1px 2px rgba(0,0,0,0.06)":"none" }}>{l}</button>))}
          </div>
          <div className="h-8 px-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputPlaceholder }}>
            🔍 Search calls...
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Sync from Retell
          </button>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: t.sidebarAccent, background: `rgba(99,91,255,${t.cardAccentOpacity})` }}>Export CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.tableDivider}` }}>
              {["Caller","Phone","Duration","Outcome","AI Score","Time",""].map((h)=>(
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.textSecondary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calls.map((call)=>(
              <tr key={call.id} className="transition-colors cursor-pointer" style={{ borderBottom: `1px solid ${t.tableDivider}` }}
                onMouseEnter={(e)=>e.currentTarget.style.background=t.tableRowHover}
                onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
                onClick={() => setSelectedCall(call.id)}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: t.avatarBg, color: t.avatarText }}>{call.caller[0]}</div>
                    <span className="text-sm font-medium" style={{ color: t.textPrimary }}>{call.caller}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: t.textSecondary }}>{call.phone}</td>
                <td className="px-5 py-3.5 text-xs font-mono" style={{ color: t.textPrimary }}>{call.duration}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{
                    background: call.outcome==="Missed" ? "rgba(239,68,68,0.1)" : call.outcome==="Transferred" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.08)",
                    color: call.outcome==="Missed" ? "#EF4444" : call.outcome==="Transferred" ? "#F59E0B" : "#10B981"
                  }}>{call.outcome}</span>
                </td>
                <td className="px-5 py-3.5">
                  {call.score > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: t.chartBarInactive }}>
                        <div className="h-full rounded-full" style={{ width:`${call.score*10}%`, background: call.score>=8?"#10B981":call.score>=6?"#F59E0B":"#EF4444" }}/>
                      </div>
                      <span className="text-xs font-medium" style={{ color: t.textPrimary }}>{call.score}</span>
                    </div>
                  ) : <span className="text-xs" style={{ color: t.textMuted }}>—</span>}
                </td>
                <td className="px-5 py-3.5 text-xs" style={{ color: t.textSecondary }}>{call.time}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all hover:opacity-80" style={{ color: "#635BFF", background: `rgba(99,91,255,${t.cardAccentOpacity})` }}>View Details</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── AI Manager Page ───
function AIManagerContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [expandedCard, setExpandedCard] = useState<number|null>(0);
  const [showProposed, setShowProposed] = useState<number|null>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const suggestions = [
    {
      title:"Add Natural Pauses Between Sequential Questions",
      desc:"The agent asks multiple questions back-to-back without pausing, which feels robotic and overwhelming to callers. Adding 1-2 second natural pauses and filler phrases like \"Great, and...\" between questions would significantly improve conversation flow.",
      impact:"High" as const, confidence:87, type:"CALL_FLOW", callCount:12,
      callIds:["#1847","#1832","#1819","#1806","#1798","#1791","#1785","#1772","#1768","#1754","#1743","#1731"],
      proposed:[
        { section:"CALL_FLOW", change:"After each caller response, insert a brief acknowledgment (\"Got it\", \"Perfect\", \"Great\") followed by a 1.5-second pause before asking the next question. Do not stack more than one question per turn." },
        { section:"PERSONALITY", change:"When transitioning between topics, use natural bridge phrases like \"Now let me help you with...\" or \"One more thing I'd love to help with...\" to create a conversational rhythm rather than an interrogation feel." },
      ]
    },
    {
      title:"Add Appointment Confirmation Follow-up",
      desc:"Callers who book appointments don't receive a verbal confirmation summary before the call ends. Adding a brief recap of date, time, provider, and any prep instructions would reduce no-shows by an estimated 20%.",
      impact:"High" as const, confidence:92, type:"Prompt", callCount:7,
      callIds:["#1845","#1838","#1822","#1811","#1795","#1787","#1776"],
      proposed:[
        { section:"CALL_FLOW", change:"Before ending any call where an appointment was booked, recite: \"Just to confirm, I have you scheduled for [date] at [time] with [provider]. Please arrive 10 minutes early. We'll send a text reminder 24 hours before.\"" },
        { section:"CONSTRAINTS", change:"Never end a booking call without verbal confirmation of the appointment details. If the caller tries to hang up quickly, prioritize confirming at minimum the date and time." },
      ]
    },
    {
      title:"Expand Business Hours Knowledge",
      desc:"12% of callers ask about Saturday hours which aren't in the knowledge base. The agent currently says \"I'm not sure about that\" which feels unprofessional. Adding weekend/holiday hours would resolve these queries instantly.",
      impact:"Medium" as const, confidence:75, type:"Knowledge", callCount:19,
      callIds:["#1846","#1840","#1835","#1829","#1823","#1816","#1810","#1803","#1797","#1790","#1784","#1778","#1771","#1765","#1758","#1752","#1745","#1739","#1733"],
      proposed:[
        { section:"KNOWLEDGE_BASE", change:"Add business hours entry: Monday-Friday 8:00 AM - 6:00 PM, Saturday 9:00 AM - 2:00 PM, Sunday CLOSED. Holiday closures: New Year's Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas." },
      ]
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main column */}
      <div className="col-span-2 space-y-5">
        {/* AI Learning Score — gamified */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #635BFF, #10B981)" }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>🧠</div>
                <div><p className="text-sm font-bold" style={{ color: t.textPrimary }}>AI Learning Progress</p><p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>Level 7 — Advanced Conversationalist</p></div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold" style={{ color: "#10B981" }}>87<span className="text-sm font-normal" style={{ color: t.textSecondary }}>/100</span></span>
                <p className="text-[10px] mt-0.5" style={{ color: "#10B981" }}>↑ 4pts this week</p>
              </div>
            </div>
            <div className="w-full h-3 rounded-full mb-1" style={{ background: t.chartBarInactive }}>
              <div className="h-full rounded-full transition-all" style={{ width:"87%", background:"linear-gradient(90deg,#635BFF,#10B981)" }}/>
            </div>
            <p className="text-[10px] mb-4" style={{ color: t.textSecondary }}>13 points to Level 8 — Expert Handler</p>
            <div className="grid grid-cols-4 gap-4">
              {[{l:"Greeting",v:"96%",emoji:"👋"},{l:"Intent Recognition",v:"91%",emoji:"🎯"},{l:"Booking Flow",v:"88%",emoji:"📅"},{l:"Objection Handling",v:"74%",emoji:"🛡️"}].map((s)=>(
                <div key={s.l} className="text-center p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                  <span className="text-sm">{s.emoji}</span>
                  <p className="text-lg font-bold mt-1" style={{ color: t.textPrimary }}>{s.v}</p>
                  <p className="text-[10px]" style={{ color: t.textSecondary }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Suggestions — gradient header with Run Analysis */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6, #A855F7)" }}>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-white">Pending Suggestions</p>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>{suggestions.length}</span>
            </div>
            <button
              onClick={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              {isAnalyzing ? (
                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/></svg>Analyzing...</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Run Analysis</>
              )}
            </button>
          </div>
          <div className="p-6 space-y-4">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-xl overflow-hidden transition-all" style={{ background: t.codeBg, border: `1px solid ${expandedCard === i ? "#635BFF" : t.codeBorder}` }}>
                {/* Card header — clickable to expand */}
                <button className="w-full text-left p-4" onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: s.impact==="High"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)", color: s.impact==="High"?"#EF4444":"#F59E0B" }}>{s.impact.toUpperCase()} IMPACT</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: t.tagBg, color: t.tagText }}>{s.type}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "rgba(99,91,255,0.1)", color: "#635BFF" }}>{s.confidence}% confidence</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{s.title}</p>
                    </div>
                    <svg className={`w-4 h-4 transition-transform flex-shrink-0 ml-3 ${expandedCard === i ? "rotate-180" : ""}`} style={{ color: t.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>

                {/* Expanded content */}
                {expandedCard === i && (
                  <div className="px-4 pb-4">
                    <p className="text-xs mb-4 leading-relaxed" style={{ color: t.textSecondary }}>{s.desc}</p>

                    {/* Call count + call ID pills */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-3.5 h-3.5" style={{ color: "#635BFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        <span className="text-xs font-semibold" style={{ color: t.textPrimary }}>Based on {s.callCount} calls</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.callIds.slice(0, 8).map((id) => (
                          <span key={id} className="text-[10px] font-medium px-2 py-0.5 rounded-md cursor-pointer hover:opacity-80 transition-opacity" style={{ background: "rgba(99,91,255,0.1)", color: "#635BFF", border: "1px solid rgba(99,91,255,0.2)" }}>{id}</span>
                        ))}
                        {s.callIds.length > 8 && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ color: t.textSecondary }}>+{s.callIds.length - 8} more</span>}
                      </div>
                    </div>

                    {/* Show/Hide Proposed Changes toggle */}
                    <button
                      className="flex items-center gap-2 text-xs font-semibold mb-3 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: "rgba(99,91,255,0.08)", color: "#635BFF" }}
                      onClick={(e) => { e.stopPropagation(); setShowProposed(showProposed === i ? null : i); }}
                    >
                      <svg className={`w-3 h-3 transition-transform ${showProposed === i ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                      {showProposed === i ? "Hide" : "Show"} Proposed Changes ({s.proposed.length})
                    </button>

                    {/* Proposed changes detail */}
                    {showProposed === i && (
                      <div className="space-y-3 mb-4">
                        {s.proposed.map((p, pi) => (
                          <div key={pi} className="rounded-lg p-3" style={{ background: mode === "dark" ? "rgba(99,91,255,0.06)" : "rgba(99,91,255,0.04)", border: `1px solid ${mode === "dark" ? "rgba(99,91,255,0.15)" : "rgba(99,91,255,0.12)"}` }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(99,91,255,0.12)", color: "#635BFF" }}>{p.section}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: t.textPrimary }}>{p.change}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${t.codeBorder}` }}>
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Apply Changes
                      </button>
                      <button className="text-xs font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80" style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}>Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Timeline — gamification */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #F59E0B, #10B981)" }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-sm font-bold" style={{ color: t.textPrimary }}>Improvement Timeline</p><p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>Your agent&apos;s growth journey</p></div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>🔥 7-day streak</span>
            </div>
            <div className="space-y-3">
              {[
                { date: "Today", event: "Applied \"Natural Pauses\" optimization", delta: "+3 pts", color: "#10B981" },
                { date: "Yesterday", event: "Learned 4 new intent patterns from calls", delta: "+1 pt", color: "#635BFF" },
                { date: "Feb 12", event: "Reached Level 7 — Advanced Conversationalist", delta: "🎉 Level Up!", color: "#F59E0B" },
                { date: "Feb 11", event: "Booking flow accuracy exceeded 85%", delta: "+2 pts", color: "#10B981" },
              ].map((item) => (
                <div key={item.date} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: t.codeBg }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: t.textPrimary }}>{item.event}</p>
                    <p className="text-[10px]" style={{ color: t.textSecondary }}>{item.date}</p>
                  </div>
                  <span className="text-[10px] font-bold flex-shrink-0" style={{ color: item.color }}>{item.delta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Agent Score Ring */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #635BFF, #8B5CF6)" }} />
          <div className="p-5 text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke={t.chartBarInactive} strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${87 * 2.64} ${264 - 87 * 2.64}`}/>
                <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#635BFF"/><stop offset="100%" stopColor="#10B981"/></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: t.textPrimary }}>87</span>
                <span className="text-[9px] font-medium" style={{ color: t.textSecondary }}>SCORE</span>
              </div>
            </div>
            <p className="text-xs font-semibold" style={{ color: t.textPrimary }}>Agent Health Score</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#10B981" }}>↑ 12% from last month</p>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#8B5CF6" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Recent Evaluations</p>
            <div className="space-y-3">
              {[{call:"Dr. Smith Office",score:9.2,verdict:"Excellent"},{call:"Johnson Plumbing",score:8.8,verdict:"Good"},{call:"Unknown Caller",score:6.5,verdict:"Needs Work"},{call:"Apex Dental",score:8.1,verdict:"Good"},{call:"Sarah Mitchell",score:9.5,verdict:"Excellent"}].map((e)=>(
                <div key={e.call} className="flex items-center justify-between py-1">
                  <div><p className="text-xs font-medium" style={{ color: t.textPrimary }}>{e.call}</p><p className="text-[10px]" style={{ color: t.textSecondary }}>{e.verdict}</p></div>
                  <span className="text-sm font-bold" style={{ color: e.score>=9?"#10B981":e.score>=7?"#F59E0B":"#EF4444" }}>{e.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Data */}
        <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Training Stats</p>
          <div className="space-y-4">
            {[{l:"Calls Analyzed",v:"2,847"},{l:"Patterns Learned",v:"156"},{l:"Avg Improvement/Week",v:"+2.3%"},{l:"Last Training",v:"2 hours ago"}].map((s)=>(
              <div key={s.l} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: t.textSecondary }}>{s.l}</span>
                <span className="text-xs font-semibold" style={{ color: t.textPrimary }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements — gamification */}
        <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Achievements</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "⭐", label: "First 100 Calls", earned: true },
              { emoji: "🎯", label: "90%+ Intent", earned: true },
              { emoji: "🔥", label: "7-Day Streak", earned: true },
              { emoji: "🏆", label: "Level 7", earned: true },
              { emoji: "💎", label: "Zero Failures", earned: false },
              { emoji: "🚀", label: "1K Calls", earned: false },
            ].map((a) => (
              <div key={a.label} className="text-center p-2 rounded-lg" style={{ background: t.codeBg, opacity: a.earned ? 1 : 0.4, border: `1px solid ${a.earned ? "rgba(99,91,255,0.2)" : t.codeBorder}` }}>
                <span className="text-base">{a.emoji}</span>
                <p className="text-[8px] mt-1 font-medium" style={{ color: t.textSecondary }}>{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Knowledge Base Page ───
function KnowledgeContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
          {["All Sources","Documents","FAQs","Website"].map((l,i)=>(<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background:i===0?t.toggleActiveBg:"transparent", color:i===0?t.textPrimary:t.textSecondary }}>{l}</button>))}
        </div>
        <button className="text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>+ Add Source</button>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[
          {name:"Business Hours & Policies",type:"Document",size:"2.4 KB",updated:"2 days ago",status:"Synced",icon:"📄",color:"#635BFF"},
          {name:"Service Menu & Pricing",type:"Document",size:"5.1 KB",updated:"1 week ago",status:"Synced",icon:"💰",color:"#10B981"},
          {name:"FAQ — Common Questions",type:"FAQ",size:"32 items",updated:"3 days ago",status:"Synced",icon:"❓",color:"#F59E0B"},
          {name:"Staff Directory",type:"Document",size:"1.8 KB",updated:"2 weeks ago",status:"Needs Update",icon:"👥",color:"#8B5CF6"},
          {name:"Website — brightsmiles.com",type:"Website",size:"12 pages",updated:"1 day ago",status:"Synced",icon:"🌐",color:"#06B6D4"},
          {name:"Insurance Providers List",type:"Document",size:"3.2 KB",updated:"1 month ago",status:"Needs Update",icon:"🏥",color:"#EC4899"},
        ].map((src)=>(
          <div key={src.name} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1" style={{ background: src.color }} />
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${src.color}10` }}>{src.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-0.5" style={{ color: t.textPrimary }}>{src.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: t.tagBg, color: t.tagText }}>{src.type}</span>
                    <span className="text-[10px]" style={{ color: t.textMuted }}>{src.size}</span>
                    <span className="text-[10px]" style={{ color: t.textMuted }}>•</span>
                    <span className="text-[10px]" style={{ color: t.textMuted }}>Updated {src.updated}</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{
                  background: src.status==="Synced" ? t.badgeBg : "rgba(245,158,11,0.1)",
                  color: src.status==="Synced" ? t.badgeText : "#F59E0B",
                }}>{src.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Test Agent Page ───
function TestAgentContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [testMode, setTestMode] = useState<"normal"|"training">("normal");
  const [selectedVoice, setSelectedVoice] = useState("11labs-Cimo");
  const [selectedModel, setSelectedModel] = useState("gpt-5.2");
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [trainingText, setTrainingText] = useState("");

  const voices = ["11labs-Cimo","11labs-Lily","11labs-Billy","11labs-Marissa","11labs-Jenny","11labs-Lucas","openai-Nova","cartesia-Brian","cartesia-Emily"];
  const models = ["gpt-5.2","gpt-5.1","gpt-5","gpt-4o","gpt-4.1","gpt-4.1-nano"];

  return (
    <div className="grid grid-cols-5 gap-6 h-full">
      {/* Chat window */}
      <div className="col-span-3 rounded-2xl overflow-hidden flex flex-col" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <div className="h-1" style={{ background: testMode === "training" ? "linear-gradient(90deg, #F59E0B, #F97316)" : "linear-gradient(90deg, #635BFF, #8B5CF6)" }} />

        {/* Header bar with mode toggle + selectors */}
        <div className="p-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: testMode === "training" ? "#F59E0B" : "#10B981" }}/>
              <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{testMode === "training" ? "Training Mode" : "Live Test Call"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: t.codeBg, color: t.codeText }}>02:34</span>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-red-500">End Call</button>
            </div>
          </div>

          {/* Mode toggle + Voice/Model selectors */}
          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div className="flex items-center rounded-lg p-0.5" style={{ background: t.toggleBg }}>
              <button onClick={() => setTestMode("normal")} className="text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all" style={{ background: testMode === "normal" ? "linear-gradient(135deg, #635BFF, #8B5CF6)" : "transparent", color: testMode === "normal" ? "#fff" : t.textSecondary }}>Normal Mode</button>
              <button onClick={() => setTestMode("training")} className="text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all" style={{ background: testMode === "training" ? "linear-gradient(135deg, #F59E0B, #F97316)" : "transparent", color: testMode === "training" ? "#fff" : t.textSecondary }}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Training Mode
                </span>
              </button>
            </div>

            <div className="h-5 w-px" style={{ background: t.cardBorder }} />

            {/* Voice selector */}
            <div className="relative">
              <button onClick={() => { setShowVoiceDropdown(!showVoiceDropdown); setShowModelDropdown(false); }} className="flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}`, color: t.textPrimary }}>
                <svg className="w-3 h-3" style={{ color: "#8B5CF6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                {selectedVoice}
                <svg className={`w-3 h-3 transition-transform ${showVoiceDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {showVoiceDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-xl py-1 z-50 shadow-xl" style={{ background: t.dropdownBg, border: `1px solid ${t.cardBorder}` }}>
                  <p className="text-[10px] font-semibold px-3 py-1.5 uppercase tracking-wider" style={{ color: t.textMuted }}>Select Voice</p>
                  {voices.map((v) => (
                    <button key={v} onClick={() => { setSelectedVoice(v); setShowVoiceDropdown(false); }} className="w-full text-left px-3 py-2 text-xs transition-all flex items-center justify-between" style={{ color: selectedVoice === v ? "#635BFF" : t.textPrimary, background: selectedVoice === v ? (mode === "dark" ? "rgba(99,91,255,0.1)" : "rgba(99,91,255,0.06)") : "transparent" }}>
                      {v}
                      {selectedVoice === v && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#635BFF" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model selector */}
            <div className="relative">
              <button onClick={() => { setShowModelDropdown(!showModelDropdown); setShowVoiceDropdown(false); }} className="flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}`, color: t.textPrimary }}>
                <svg className="w-3 h-3" style={{ color: "#10B981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {selectedModel}
                <svg className={`w-3 h-3 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl py-1 z-50 shadow-xl" style={{ background: t.dropdownBg, border: `1px solid ${t.cardBorder}` }}>
                  <p className="text-[10px] font-semibold px-3 py-1.5 uppercase tracking-wider" style={{ color: t.textMuted }}>Select Model</p>
                  {models.map((m) => (
                    <button key={m} onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }} className="w-full text-left px-3 py-2 text-xs transition-all flex items-center justify-between" style={{ color: selectedModel === m ? "#635BFF" : t.textPrimary, background: selectedModel === m ? (mode === "dark" ? "rgba(99,91,255,0.1)" : "rgba(99,91,255,0.06)") : "transparent" }}>
                      {m}
                      {selectedModel === m && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#635BFF" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Training mode instruction box */}
        {testMode === "training" && (
          <div className="px-4 pt-4">
            <div className="rounded-xl p-4" style={{ background: mode === "dark" ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)", border: `1px solid ${mode === "dark" ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.15)"}` }}>
              <div className="flex items-center gap-2 mb-2.5">
                <svg className="w-4 h-4" style={{ color: "#F59E0B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>Training Instructions</p>
              </div>
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: t.textSecondary }}>Describe the adjustments you want your agent to make during this test call. These changes will only apply to this session — you can apply them permanently afterward.</p>
              <textarea
                value={trainingText}
                onChange={(e) => setTrainingText(e.target.value)}
                placeholder="e.g. Be more empathetic when callers mention pain or discomfort. Pause longer after asking questions. Offer to transfer to a specialist if the caller seems unsure about treatment options..."
                className="w-full h-24 text-xs p-3 rounded-lg resize-none outline-none transition-all placeholder:leading-relaxed"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
              />
              <div className="flex items-center justify-between mt-2.5">
                <p className="text-[10px]" style={{ color: t.textMuted }}>Changes apply to this test session only</p>
                <button className="text-[11px] font-semibold px-4 py-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>Apply to Session</button>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 p-5 space-y-4 overflow-auto">
          {[
            {from:"agent",text:"Thank you for calling Bright Smiles Dental! My name is Ava. How can I help you today?"},
            {from:"caller",text:"Hi, I'd like to schedule a teeth cleaning appointment."},
            {from:"agent",text:"I'd be happy to help you schedule a cleaning! Could I get your name please?"},
            {from:"caller",text:"Sure, it's Michael Thompson."},
            {from:"agent",text:"Thank you, Michael! Let me check our available slots. We have openings this Thursday at 10 AM and 2 PM, or next Monday at 9 AM. Which works best for you?"},
            {from:"caller",text:"Thursday at 2 PM sounds great."},
          ].map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "caller" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.from === "caller" ? "rounded-br-md" : "rounded-bl-md"}`} style={{
                background: msg.from === "caller" ? "linear-gradient(135deg, #635BFF, #8B5CF6)" : t.codeBg,
                border: msg.from === "agent" ? `1px solid ${t.codeBorder}` : "none",
                color: msg.from === "caller" ? "#FFFFFF" : t.textPrimary,
              }}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {/* Training mode indicator in chat */}
          {testMode === "training" && trainingText && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.15)" }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Training adjustments active
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-10 px-4 rounded-xl flex items-center text-sm" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputPlaceholder }}>
              Type a response as the caller...
            </div>
            <button className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: testMode === "training" ? "linear-gradient(135deg, #F59E0B, #F97316)" : "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: Live analysis */}
      <div className="col-span-2 space-y-5">
        {/* Active config summary */}
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #8B5CF6, #EC4899)" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Test Configuration</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: t.codeBg }}>
                <span className="text-[11px]" style={{ color: t.textSecondary }}>Voice</span>
                <span className="text-[11px] font-semibold" style={{ color: "#8B5CF6" }}>{selectedVoice}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: t.codeBg }}>
                <span className="text-[11px]" style={{ color: t.textSecondary }}>Model</span>
                <span className="text-[11px] font-semibold" style={{ color: "#10B981" }}>{selectedModel}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: t.codeBg }}>
                <span className="text-[11px]" style={{ color: t.textSecondary }}>Mode</span>
                <span className="text-[11px] font-semibold" style={{ color: testMode === "training" ? "#F59E0B" : "#635BFF" }}>{testMode === "training" ? "Training" : "Normal"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#10B981" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Live Analysis</p>
            <div className="space-y-3">
              {[{l:"Sentiment",v:"Positive",c:"#10B981"},{l:"Intent",v:"Appointment Booking",c:"#635BFF"},{l:"Confidence",v:"94%",c:"#8B5CF6"},{l:"Tone Match",v:"Warm & Professional",c:"#10B981"}].map((m)=>(
                <div key={m.l} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: t.textSecondary }}>{m.l}</span>
                  <span className="text-xs font-semibold" style={{ color: m.c }}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "#F59E0B" }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Call Scorecard</p>
            <div className="grid grid-cols-2 gap-3">
              {[{l:"Greeting",s:10,m:10},{l:"Empathy",s:9,m:10},{l:"Efficiency",s:8,m:10},{l:"Resolution",s:9,m:10}].map((s)=>(
                <div key={s.l} className="text-center p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                  <p className="text-lg font-bold" style={{ color: t.textPrimary }}>{s.s}<span className="text-xs font-normal" style={{ color: t.textMuted }}>/{s.m}</span></p>
                  <p className="text-[10px]" style={{ color: t.textSecondary }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Voices Page ───
function VoicesContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [activeVoice, setActiveVoice] = useState(0);
  const voices = [
    { name: "Ava — Warm Professional", accent: "American English", speed: "1.0x", pitch: "Medium", gender: "Female", color: "#10B981", active: true, desc: "Friendly and clear, ideal for customer service and appointments" },
    { name: "Marcus — Confident & Direct", accent: "American English", speed: "1.1x", pitch: "Low", gender: "Male", color: "#6366F1", active: false, desc: "Authoritative tone, great for sales and consultations" },
    { name: "Sophie — Gentle & Empathetic", accent: "British English", speed: "0.95x", pitch: "Medium-High", gender: "Female", color: "#F59E0B", active: false, desc: "Soft and caring, perfect for healthcare and support" },
    { name: "Atlas — Energetic & Upbeat", accent: "American English", speed: "1.15x", pitch: "Medium", gender: "Male", color: "#EC4899", active: false, desc: "Dynamic and engaging, suited for marketing and outreach" },
  ];
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Voice List */}
      <div className="col-span-2 space-y-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: "linear-gradient(90deg, #635BFF, #EC4899)" }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div><p className="text-sm font-bold" style={{ color: t.textPrimary }}>Voice Library</p><p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>Select and configure your agent&apos;s voice</p></div>
              <button className="text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>+ Clone Voice</button>
            </div>
            <div className="space-y-3">
              {voices.map((v, i) => (
                <button key={v.name} onClick={() => setActiveVoice(i)} className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left" style={{ background: activeVoice === i ? t.sidebarActiveBg : t.codeBg, border: activeVoice === i ? `1px solid ${t.sidebarAccent}33` : `1px solid ${t.codeBorder}` }}>
                  {/* Waveform visualization */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${v.color}15` }}>
                    <svg width="28" height="20" viewBox="0 0 28 20"><g fill="none" stroke={v.color} strokeWidth="2" strokeLinecap="round">
                      <line x1="2" y1="8" x2="2" y2="12"/><line x1="6" y1="4" x2="6" y2="16"/><line x1="10" y1="6" x2="10" y2="14"/><line x1="14" y1="2" x2="14" y2="18"/><line x1="18" y1="5" x2="18" y2="15"/><line x1="22" y1="7" x2="22" y2="13"/><line x1="26" y1="9" x2="26" y2="11"/>
                    </g></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{v.name}</p>
                      {v.active && <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: t.badgeBg, color: t.badgeText }}>ACTIVE</span>}
                    </div>
                    <p className="text-xs" style={{ color: t.textSecondary }}>{v.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${v.color}12` }}>
                    <span style={{ color: v.color }}>▶</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Settings Panel */}
      <div className="space-y-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="h-1" style={{ background: voices[activeVoice].color }} />
          <div className="p-5">
            <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Voice Settings</p>
            <div className="space-y-4">
              {[
                { label: "Speed", value: voices[activeVoice].speed, pct: voices[activeVoice].speed === "0.95x" ? 47 : voices[activeVoice].speed === "1.0x" ? 50 : voices[activeVoice].speed === "1.1x" ? 55 : 58 },
                { label: "Pitch", value: voices[activeVoice].pitch, pct: voices[activeVoice].pitch === "Low" ? 30 : voices[activeVoice].pitch === "Medium" ? 50 : voices[activeVoice].pitch === "Medium-High" ? 65 : 50 },
                { label: "Stability", value: "82%", pct: 82 },
                { label: "Clarity", value: "91%", pct: 91 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: t.textSecondary }}>{s.label}</span>
                    <span className="text-xs font-semibold" style={{ color: t.textPrimary }}>{s.value}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: t.chartBarInactive }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: voices[activeVoice].color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <p className="text-sm font-bold mb-3" style={{ color: t.textPrimary }}>Voice Details</p>
          <div className="space-y-3">
            {[
              { l: "Gender", v: voices[activeVoice].gender },
              { l: "Accent", v: voices[activeVoice].accent },
              { l: "Latency", v: "~320ms" },
              { l: "Provider", v: "ElevenLabs" },
            ].map((d) => (
              <div key={d.l} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: t.textSecondary }}>{d.l}</span>
                <span className="text-xs font-semibold" style={{ color: t.textPrimary }}>{d.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scoreboard Page ───
function ScoreboardContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const rankings = [
    { rank: 1, agent: "Sophie", score: 9.5, calls: 312, success: "97.2%", trend: "+0.3", color: "#F59E0B" },
    { rank: 2, agent: "Ava", score: 9.2, calls: 847, success: "94.2%", trend: "+0.4", color: "#10B981" },
    { rank: 3, agent: "Marcus", score: 8.8, calls: 523, success: "91.8%", trend: "+0.6", color: "#6366F1" },
    { rank: 4, agent: "Atlas", score: 7.4, calls: 165, success: "85.5%", trend: "+1.2", color: "#EC4899" },
  ];

  return (
    <>
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[rankings[1], rankings[0], rankings[2]].map((r, i) => {
          const positions = [{ label: "2nd" }, { label: "1st" }, { label: "3rd" }];
          return (
            <div key={r.agent} className="rounded-2xl overflow-hidden text-center" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
              <div className="h-1" style={{ background: i === 1 ? "linear-gradient(90deg, #F59E0B, #EF4444)" : r.color }} />
              <div className="p-5">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3 ${i === 1 ? "ring-2 ring-yellow-400/30" : ""}`} style={{ background: `${r.color}15`, color: r.color }}>
                  {i === 1 ? "🏆" : r.agent[0]}
                </div>
                <p className="text-sm font-bold mb-0.5" style={{ color: t.textPrimary }}>{r.agent}</p>
                <p className="text-[10px] mb-3" style={{ color: t.textSecondary }}>{positions[i].label} Place</p>
                <p className="text-2xl font-bold" style={{ color: r.color }}>{r.score}</p>
                <p className="text-[10px]" style={{ color: t.textSecondary }}>avg score</p>
                <div className="flex items-center justify-center gap-3 mt-3 pt-3" style={{ borderTop: `1px solid ${t.tableDivider}` }}>
                  <div><p className="text-xs font-semibold" style={{ color: t.textPrimary }}>{r.calls}</p><p className="text-[9px]" style={{ color: t.textMuted }}>calls</p></div>
                  <div className="w-px h-6" style={{ background: t.tableDivider }} />
                  <div><p className="text-xs font-semibold" style={{ color: t.textPrimary }}>{r.success}</p><p className="text-[9px]" style={{ color: t.textMuted }}>success</p></div>
                  <div className="w-px h-6" style={{ background: t.tableDivider }} />
                  <div><p className="text-xs font-semibold" style={{ color: "#10B981" }}>{r.trend}</p><p className="text-[9px]" style={{ color: t.textMuted }}>trend</p></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Rankings Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.tableDivider}` }}>
          <p className="text-sm font-bold" style={{ color: t.textPrimary }}>Performance Rankings</p>
          <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
            {["This Week", "This Month", "All Time"].map((l, i) => (<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: i === 0 ? t.toggleActiveBg : "transparent", color: i === 0 ? t.textPrimary : t.textSecondary }}>{l}</button>))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.tableDivider}` }}>
              {["Rank", "Agent", "Avg Score", "Total Calls", "Success Rate", "Trend", "Top Skill"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: t.textSecondary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankings.map((r) => (
              <tr key={r.rank} style={{ borderBottom: `1px solid ${t.tableDivider}` }}>
                <td className="px-5 py-3.5"><span className="text-sm font-bold" style={{ color: r.rank <= 3 ? r.color : t.textPrimary }}>#{r.rank}</span></td>
                <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}dd)` }}>{r.agent[0]}</div><span className="text-sm font-medium" style={{ color: t.textPrimary }}>{r.agent}</span></div></td>
                <td className="px-5 py-3.5"><span className="text-sm font-bold" style={{ color: r.score >= 9 ? "#10B981" : r.score >= 8 ? "#F59E0B" : t.textPrimary }}>{r.score}</span></td>
                <td className="px-5 py-3.5 text-sm" style={{ color: t.textSecondary }}>{r.calls}</td>
                <td className="px-5 py-3.5 text-sm font-medium" style={{ color: t.textPrimary }}>{r.success}</td>
                <td className="px-5 py-3.5"><span className="text-xs font-semibold" style={{ color: "#10B981" }}>↑ {r.trend}</span></td>
                <td className="px-5 py-3.5"><span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: t.tagBg, color: t.tagText }}>{r.rank === 1 ? "Empathy" : r.rank === 2 ? "Greeting" : r.rank === 3 ? "Objection Handling" : "Energy"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Integrations Page ───
function IntegrationsContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const integrations = [
    { name: "Google Calendar", desc: "Allow your agent to check availability and book appointments directly", icon: "📅", color: "#4285F4", status: "Connected", category: "Calendar", capabilities: ["Check availability","Book appointments","Send confirmations"] },
    { name: "GoHighLevel", desc: "Automatically add leads, update pipelines, and trigger workflows", icon: "🚀", color: "#10B981", status: "Connected", category: "CRM", capabilities: ["Create contacts","Update opportunities","Trigger workflows","Log calls"] },
    { name: "Twilio", desc: "Phone number provisioning and call routing", icon: "📞", color: "#F22F46", status: "Connected", category: "Telephony", capabilities: ["Inbound calls","Outbound calls","SMS"] },
    { name: "Calendly", desc: "Share booking links, check availability, and track events", icon: "🗓️", color: "#006BFF", status: "Available", category: "Calendar", capabilities: ["Share booking link","Check availability","Event tracking"] },
    { name: "Stripe", desc: "Payment processing and invoicing", icon: "💳", color: "#635BFF", status: "Available", category: "Payments", capabilities: ["Process payments","Send invoices"] },
    { name: "Zapier", desc: "Connect 5,000+ apps via automations", icon: "⚡", color: "#FF4A00", status: "Available", category: "Automation", capabilities: ["Trigger zaps","Send data"] },
    { name: "Slack", desc: "Real-time call notifications to your team", icon: "💬", color: "#4A154B", status: "Connected", category: "Messaging", capabilities: ["Call alerts","Summary reports"] },
    { name: "HubSpot", desc: "Contact sync and deal tracking", icon: "🟠", color: "#FF7A59", status: "Coming Soon", category: "CRM", capabilities: ["Sync contacts","Track deals"] },
    { name: "Salesforce", desc: "Enterprise CRM integration", icon: "☁️", color: "#00A1E0", status: "Coming Soon", category: "CRM", capabilities: ["Sync records","Log activities"] },
  ];
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
          {["All", "Connected", "Available", "Coming Soon"].map((l, i) => (<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: i === 0 ? t.toggleActiveBg : "transparent", color: i === 0 ? t.textPrimary : t.textSecondary }}>{l}</button>))}
        </div>
        <div className="h-8 px-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputPlaceholder }}>
          🔍 Search integrations...
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {integrations.map((int) => (
          <div key={int.name} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1" style={{ background: int.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: `${int.color}12` }}>{int.icon}</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                  background: int.status === "Connected" ? t.badgeBg : int.status === "Available" ? `${t.sidebarAccent}10` : "rgba(139,141,152,0.1)",
                  color: int.status === "Connected" ? t.badgeText : int.status === "Available" ? t.sidebarAccent : t.textSecondary,
                  border: `1px solid ${int.status === "Connected" ? t.badgeBorder : int.status === "Available" ? `${t.sidebarAccent}25` : "rgba(139,141,152,0.15)"}`,
                }}>{int.status}</span>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>{int.name}</p>
              <p className="text-xs mb-2" style={{ color: t.textSecondary }}>{int.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {int.capabilities.map((cap) => (
                  <span key={cap} className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: `${int.color}08`, color: int.color, border: `1px solid ${int.color}20` }}>✓ {cap}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: t.tagBg, color: t.tagText }}>{int.category}</span>
                {int.status === "Connected" ? (
                  <button className="text-xs font-medium" style={{ color: t.textSecondary }}>Configure →</button>
                ) : int.status === "Available" ? (
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>Connect</button>
                ) : (
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}>Notify Me</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Marketplace Page ───
function MarketplaceContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const templates = [
    { name: "Dental Receptionist", desc: "Full-featured dental office agent with appointment booking, insurance verification, and emergency routing", installs: "1.2K", rating: "4.9", color: "#10B981", tags: ["Healthcare", "Booking"], featured: true },
    { name: "Real Estate Assistant", desc: "Property inquiry handler with showing scheduler, listing details, and lead qualification", installs: "890", rating: "4.8", color: "#6366F1", tags: ["Real Estate", "Lead Gen"], featured: true },
    { name: "Restaurant Host", desc: "Table reservation manager with waitlist handling, menu info, and special dietary routing", installs: "756", rating: "4.7", color: "#F59E0B", tags: ["Hospitality", "Booking"], featured: false },
    { name: "Legal Intake", desc: "Law firm intake specialist with case type routing, consultation scheduling, and conflict checking", installs: "534", rating: "4.6", color: "#8B5CF6", tags: ["Legal", "Intake"], featured: false },
    { name: "HVAC Dispatcher", desc: "Service call handler with emergency prioritization, tech dispatching, and estimate scheduling", installs: "423", rating: "4.8", color: "#EC4899", tags: ["Home Services", "Dispatch"], featured: false },
    { name: "Auto Shop Manager", desc: "Vehicle service scheduler with repair status updates, recall checking, and parts ordering", installs: "367", rating: "4.5", color: "#06B6D4", tags: ["Automotive", "Booking"], featured: false },
  ];
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: t.toggleBg }}>
          {["All Templates", "Healthcare", "Real Estate", "Services", "Legal"].map((l, i) => (<button key={l} className="text-xs px-3 py-1.5 rounded-md font-medium" style={{ background: i === 0 ? t.toggleActiveBg : "transparent", color: i === 0 ? t.textPrimary : t.textSecondary }}>{l}</button>))}
        </div>
        <div className="h-8 px-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputPlaceholder }}>
          🔍 Search templates...
        </div>
      </div>

      {/* Featured */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {templates.filter(t => t.featured).map((tmpl) => (
          <div key={tmpl.name} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${tmpl.color}, ${tmpl.color}88)` }} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0" style={{ background: `${tmpl.color}12`, color: tmpl.color }}>{tmpl.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-bold" style={{ color: t.textPrimary }}>{tmpl.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>FEATURED</span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: t.textSecondary }}>{tmpl.desc}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs" style={{ color: t.textSecondary }}>⬇ {tmpl.installs} installs</span>
                    <span className="text-xs" style={{ color: "#F59E0B" }}>★ {tmpl.rating}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tmpl.tags.map((tag) => (<span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: t.tagBg, color: t.tagText }}>{tag}</span>))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${t.tableDivider}` }}>
                <button className="flex-1 text-xs font-semibold py-2 rounded-lg text-white text-center" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>Use Template</button>
                <button className="text-xs font-medium py-2 px-4 rounded-lg" style={{ color: t.textSecondary, border: `1px solid ${t.cardBorder}` }}>Preview</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-5">
        {templates.filter(t => !t.featured).map((tmpl) => (
          <div key={tmpl.name} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="h-1" style={{ background: tmpl.color }} />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: `${tmpl.color}12`, color: tmpl.color }}>{tmpl.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: t.textPrimary }}>{tmpl.name}</p>
                  <div className="flex items-center gap-2"><span className="text-[10px]" style={{ color: t.textSecondary }}>⬇ {tmpl.installs}</span><span className="text-[10px]" style={{ color: "#F59E0B" }}>★ {tmpl.rating}</span></div>
                </div>
              </div>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: t.textSecondary }}>{tmpl.desc}</p>
              <div className="flex items-center gap-2 mb-3">
                {tmpl.tags.map((tag) => (<span key={tag} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: t.tagBg, color: t.tagText }}>{tag}</span>))}
              </div>
              <button className="w-full text-xs font-semibold py-2 rounded-lg text-center" style={{ color: t.sidebarAccent, background: `rgba(99,91,255,${t.cardAccentOpacity})` }}>Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Settings Page ───
function SettingsContent({ t, mode }: { t: ThemeTokens; mode: Mode }) {
  const [agentName, setAgentName] = useState("Bright Smiles Dental");
  const [agentStatus, setAgentStatus] = useState("Active");
  const [voiceModel, setVoiceModel] = useState("11labs-Cimo");
  const [copied, setCopied] = useState<string|null>(null);
  const [dataFields, setDataFields] = useState([
    { name: "Customer Name", enabled: true, required: true },
    { name: "Phone Number", enabled: true, required: true },
    { name: "Email Address", enabled: true, required: false },
    { name: "Service Requested", enabled: true, required: false },
    { name: "Address", enabled: false, required: false },
    { name: "Company Name", enabled: false, required: false },
    { name: "Preferred Contact Time", enabled: true, required: false },
    { name: "Additional Notes", enabled: true, required: false },
  ]);

  const handleCopy = (label: string, text: string) => { navigator.clipboard?.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 2000); };
  const toggleField = (i: number, key: "enabled"|"required") => { setDataFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: !f[key] } : f)); };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Agent Identifiers */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <div className="h-1" style={{ background: "linear-gradient(90deg, #635BFF, #8B5CF6)" }} />
        <div className="p-6">
          <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Agent Identifiers</p>
          <div className="space-y-3">
            {[
              { label: "Internal Agent ID", value: "agt_bsd_7f3k9x2m" },
              { label: "Retell Agent ID", value: "agent_a8b2c4d6e8f0a1b3" },
              { label: "Phone Number", value: "+1 (555) 123-4567" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}` }}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: t.textMuted }}>{item.label}</p>
                  <p className="text-xs font-mono" style={{ color: t.textPrimary }}>{item.value}</p>
                </div>
                <button onClick={() => handleCopy(item.label, item.value)} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all" style={{ background: copied === item.label ? "rgba(16,185,129,0.1)" : `rgba(99,91,255,${t.cardAccentOpacity})`, color: copied === item.label ? "#10B981" : "#635BFF" }}>
                  {copied === item.label ? "✓ Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Configuration */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <div className="h-1" style={{ background: "#10B981" }} />
        <div className="p-6">
          <p className="text-sm font-bold mb-4" style={{ color: t.textPrimary }}>Agent Configuration</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: t.textSecondary }}>Agent Name</label>
              <input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm outline-none" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: t.textSecondary }}>Voice Model</label>
                <select value={voiceModel} onChange={(e) => setVoiceModel(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm outline-none appearance-none cursor-pointer" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}>
                  {["11labs-Cimo (Female Professional)","11labs-Lily (Female Warm)","11labs-Billy (Male Confident)","11labs-Marissa (Female Professional)","11labs-Jenny (Female Friendly)","openai-Nova (Female Versatile)","cartesia-Brian (Male Conversational)"].map(v => <option key={v} value={v.split(" ")[0]}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: t.textSecondary }}>Agent Status</label>
                <select value={agentStatus} onChange={(e) => setAgentStatus(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm outline-none appearance-none cursor-pointer" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}>
                  {["📝 Draft","🧪 Testing","✅ Active","⏸️ Paused"].map(s => <option key={s} value={s.split(" ").slice(1).join(" ")}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Collection Configuration */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <div className="h-1" style={{ background: "#F59E0B" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: t.textPrimary }}>Data Collection</p>
              <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>Configure what information your agent collects from callers</p>
            </div>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#635BFF", background: `rgba(99,91,255,${t.cardAccentOpacity})` }}>+ Custom Field</button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-3 px-3 py-2">
              <span className="col-span-5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: t.textMuted }}>Field</span>
              <span className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-center" style={{ color: t.textMuted }}>Enabled</span>
              <span className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-center" style={{ color: t.textMuted }}>Required</span>
            </div>
            {dataFields.map((field, i) => (
              <div key={field.name} className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 rounded-lg transition-all" style={{ background: i % 2 === 0 ? t.codeBg : "transparent" }}>
                <span className="col-span-5 text-xs font-medium" style={{ color: t.textPrimary }}>{field.name}</span>
                <div className="col-span-3 flex justify-center">
                  <button onClick={() => toggleField(i, "enabled")} className="w-9 h-5 rounded-full transition-all relative" style={{ background: field.enabled ? "#635BFF" : t.chartBarInactive }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: field.enabled ? "18px" : "2px" }} />
                  </button>
                </div>
                <div className="col-span-3 flex justify-center">
                  <button onClick={() => toggleField(i, "required")} className="w-9 h-5 rounded-full transition-all relative" style={{ background: field.required ? "#F59E0B" : t.chartBarInactive, opacity: field.enabled ? 1 : 0.3, pointerEvents: field.enabled ? "auto" : "none" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ left: field.required ? "18px" : "2px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white shadow-lg transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>Save Settings</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHELL + MAIN PAGE
// ═══════════════════════════════════════════════════════════════

function AppShell({ mode, activeTab, setActiveTab }: { mode: Mode; activeTab: PageId; setActiveTab: (p: PageId) => void }) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState({ name: "Ava", initial: "A", color: "#10B981" });
  const t = getTheme(mode);

  const agents = [
    { name: "Ava", initial: "A", color: "#10B981", status: "Active" },
    { name: "Marcus", initial: "M", color: "#6366F1", status: "Active" },
    { name: "Sophie", initial: "S", color: "#F59E0B", status: "Paused" },
    { name: "Atlas", initial: "AT", color: "#EC4899", status: "Draft" },
  ];

  const navGroups = [
    { label: "AGENT", items: [{ id: "dashboard" as PageId, icon: "◉", label: "Dashboard" },{ id: "test" as PageId, icon: "▶", label: "Test Agent" },{ id: "prompt" as PageId, icon: "✎", label: "Prompt" },{ id: "knowledge" as PageId, icon: "◫", label: "Knowledge Base" },{ id: "voices" as PageId, icon: "♪", label: "Voices" }] },
    { label: "INSIGHTS", items: [{ id: "calls" as PageId, icon: "☏", label: "Call History" },{ id: "ai-manager" as PageId, icon: "⚡", label: "AI Manager" },{ id: "scoreboard" as PageId, icon: "★", label: "Scoreboard" }] },
    { label: "CONNECT", items: [{ id: "integrations" as PageId, icon: "⊞", label: "Integrations" },{ id: "marketplace" as PageId, icon: "◆", label: "Marketplace" }] },
    { label: "SYSTEM", items: [{ id: "settings" as PageId, icon: "⚙", label: "Settings" }] },
  ];

  const pageTitle: Record<PageId, string> = { dashboard: "Dashboard", test: "Test Agent", prompt: "Prompt Editor", knowledge: "Knowledge Base", voices: "Voice Settings", calls: "Call History", "ai-manager": "AI Manager", scoreboard: "Scoreboard", integrations: "Integrations", marketplace: "Marketplace", settings: "Settings" };
  const pageDesc: Record<PageId, string> = { dashboard: `Overview of ${selectedAgent.name}'s performance`, test: "Simulate a live call to test your agent", prompt: "Edit your agent's system prompt and behavior", knowledge: "Manage your agent's training data sources", voices: "Configure voice settings and cloning", calls: "Browse and analyze past conversations", "ai-manager": "AI-powered optimization and learning insights", scoreboard: "Performance rankings and benchmarks", integrations: "Connect your tools and platforms", marketplace: "Discover pre-built agent templates", settings: "Agent configuration and data collection" };

  return (
    <div className="w-full h-[720px] rounded-xl overflow-hidden flex shadow-2xl relative" style={{ border: `1px solid ${t.contentBorder}` }}>
      {/* Sidebar */}
      <div className="w-[240px] flex flex-col shrink-0 transition-colors duration-300" style={{ background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}` }}>
        <div className="h-16 flex items-center px-5" style={{ borderBottom: `1px solid ${t.sidebarBorder}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}><span className="text-white text-base font-bold">V</span></div>
          <div className="ml-3"><span className="font-bold text-sm" style={{ color: t.sidebarTextActive }}>VoiceAI</span><p className="text-[10px]" style={{ color: t.sidebarUserMuted }}>AI Phone Agents</p></div>
        </div>
        {/* Agent Switcher */}
        <div className="mx-3 mt-4 mb-2 relative">
          <button onClick={()=>setAgentOpen(!agentOpen)} className="w-full p-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all" style={{ background: t.sidebarSwitcherBg, border: `1px solid ${t.sidebarSwitcherBorder}` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0" style={{ background: `linear-gradient(135deg, ${selectedAgent.color}, ${selectedAgent.color}dd)` }}><span className="text-white font-bold">{selectedAgent.initial}</span></div>
            <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium truncate" style={{ color: t.sidebarSwitcherText }}>{selectedAgent.name}</p><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: t.statusDot }}/><p className="text-[10px]" style={{ color: t.badgeText }}>Active</p></div></div>
            <span style={{ color: t.sidebarSwitcherMuted }} className="text-xs">{agentOpen?"▲":"▼"}</span>
          </button>
          {agentOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50 shadow-xl" style={{ background: t.dropdownBg, border: `1px solid ${t.dropdownBorder}` }}>
              {agents.map((agent)=>(<button key={agent.name} onClick={()=>{setSelectedAgent(agent);setAgentOpen(false);}} className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left" style={{ background: selectedAgent.name===agent.name?t.sidebarActiveBg:"transparent" }} onMouseEnter={(e)=>{if(selectedAgent.name!==agent.name)e.currentTarget.style.background=t.dropdownHover;}} onMouseLeave={(e)=>{if(selectedAgent.name!==agent.name)e.currentTarget.style.background="transparent";}}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shrink-0" style={{ background:`linear-gradient(135deg,${agent.color},${agent.color}dd)` }}><span className="text-white font-bold">{agent.initial}</span></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: t.sidebarSwitcherText }}>{agent.name}</p></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background:agent.status==="Active"?"#10B981":agent.status==="Paused"?"#F59E0B":"#8B8D98" }}/><span className="text-[10px]" style={{ color: t.textSecondary }}>{agent.status}</span></div>
              </button>))}
              <div style={{ borderTop: `1px solid ${t.dropdownBorder}` }}><button className="w-full flex items-center gap-3 px-3 py-2.5 text-left" style={{ color: t.sidebarAccent }}><span className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: mode==="dark"?"rgba(99,91,255,0.1)":"rgba(99,91,255,0.06)" }}>+</span><span className="text-sm font-medium">Create New Agent</span></button></div>
            </div>
          )}
        </div>
        <div className="flex-1 py-2 overflow-auto">
          {navGroups.map((group)=>(<div key={group.label} className="mb-2"><p className="px-5 text-[10px] font-semibold tracking-widest mb-1 uppercase" style={{ color: t.sidebarGroupLabel }}>{group.label}</p>{group.items.map((item)=>(<button key={item.id} onClick={()=>{setActiveTab(item.id);setAgentOpen(false);}} className="w-full flex items-center gap-3 px-5 py-2.5 transition-all duration-150 text-left" style={{ color:activeTab===item.id?t.sidebarTextActive:t.sidebarText, background:activeTab===item.id?t.sidebarActiveBg:"transparent" }} onMouseEnter={(e)=>{if(activeTab!==item.id)e.currentTarget.style.background=t.sidebarHoverBg;}} onMouseLeave={(e)=>{if(activeTab!==item.id)e.currentTarget.style.background="transparent";}}><span className="text-sm shrink-0 w-5 text-center">{item.icon}</span><span className="text-[13px]">{item.label}</span>{activeTab===item.id&&<div className="ml-auto w-1 h-4 rounded-full" style={{ background: t.sidebarAccent }}/>}</button>))}</div>))}
        </div>
        <div className="p-4" style={{ borderTop: `1px solid ${t.sidebarBorder}` }}>
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-semibold" style={{ background: "linear-gradient(135deg, #635BFF, #8B5CF6)" }}>K</div><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate" style={{ color: t.sidebarTextActive }}>Kyle Kotecha</p><p className="text-[10px]" style={{ color: t.sidebarUserMuted }}>kyle@voiceai.com</p></div><button style={{ color: t.sidebarText }} className="hover:opacity-70">⚙</button></div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col transition-colors duration-300" style={{ background: t.contentBg }}>
        <div className="h-16 flex items-center justify-between px-8 transition-colors duration-300 shrink-0" style={{ background: t.topBarBg, borderBottom: `1px solid ${t.topBarBorder}`, boxShadow: mode==="light"?"0 1px 3px rgba(0,0,0,0.04)":"none" }}>
          <div><h2 className="text-lg font-bold" style={{ color: t.textPrimary }}>{pageTitle[activeTab]}</h2><p className="text-xs" style={{ color: t.textSecondary }}>{pageDesc[activeTab]}</p></div>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:opacity-70" style={{ background: t.codeBg, border: `1px solid ${t.codeBorder}`, color: t.textSecondary }} title="Help &amp; Tour">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
            {activeTab==="prompt"&&<button className="h-9 px-4 rounded-lg text-xs font-semibold" style={{ color: t.sidebarAccent, border: `1px solid ${t.cardBorder}` }}>Discard</button>}
            <button className="h-9 px-5 rounded-lg text-sm font-semibold text-white shadow-md flex items-center gap-2" style={{ background: "linear-gradient(135deg,#635BFF,#8B5CF6)" }}>
              {activeTab==="prompt"?"Save Prompt":activeTab==="test"?"New Test Call":<><span>🚀</span> Deploy Agent</>}
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-auto">
          {activeTab==="dashboard"&&<DashboardContent t={t} mode={mode} agentName={selectedAgent.name}/>}
          {activeTab==="prompt"&&<PromptContent t={t} mode={mode}/>}
          {activeTab==="calls"&&<CallHistoryContent t={t} mode={mode}/>}
          {activeTab==="ai-manager"&&<AIManagerContent t={t} mode={mode}/>}
          {activeTab==="knowledge"&&<KnowledgeContent t={t} mode={mode}/>}
          {activeTab==="test"&&<TestAgentContent t={t} mode={mode}/>}
          {activeTab==="voices"&&<VoicesContent t={t} mode={mode}/>}
          {activeTab==="scoreboard"&&<ScoreboardContent t={t} mode={mode}/>}
          {activeTab==="integrations"&&<IntegrationsContent t={t} mode={mode}/>}
          {activeTab==="marketplace"&&<MarketplaceContent t={t} mode={mode}/>}
          {activeTab==="settings"&&<SettingsContent t={t} mode={mode}/>}
        </div>
      </div>
    </div>
  );
}

export default function DesignPreviewPage() {
  const [mode, setMode] = useState<Mode>("light");
  const [activeTab, setActiveTab] = useState<PageId>("dashboard");

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-6">
        <p className="text-indigo-400 text-sm font-medium mb-3">Design Preview — Full App</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">VoiceAI<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Dashboard</span></h1>
        <p className="text-lg text-slate-400 max-w-2xl mb-6">Click the sidebar nav to explore every page. Toggle light/dark mode. Click the agent name to switch agents.</p>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={()=>setMode("light")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode==="light"?"bg-white text-slate-900 shadow-md":"text-slate-400 hover:text-slate-300"}`}>☀️ Light</button>
            <button onClick={()=>setMode("dark")} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode==="dark"?"bg-white/10 text-white shadow-md":"text-slate-400 hover:text-slate-300"}`}>🌙 Dark</button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["dashboard","prompt","test","calls","ai-manager","knowledge","voices","scoreboard","integrations","marketplace","settings"] as PageId[]).map((p)=>(
              <button key={p} onClick={()=>setActiveTab(p)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab===p?"bg-indigo-500/20 text-indigo-300":"text-slate-500 hover:text-slate-300"}`}>
                {p==="ai-manager"?"AI Manager":p==="calls"?"Call History":p==="knowledge"?"Knowledge Base":p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <AppShell mode={mode} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
