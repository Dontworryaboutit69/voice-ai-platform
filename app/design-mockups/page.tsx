"use client";

import { useState } from "react";

// ============================================================
// DATA — matches real GHL pipeline + sidebar from screenshot
// ============================================================
const stages = [
  { name: "Youtube Leads", count: 0, value: "$0.00", cards: [] },
  {
    name: "Web Form",
    count: 6,
    value: "$0.00",
    cards: [
      { name: "Daniel Woods", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 4, daysAgo: 2 },
      { name: "Talbert Williams", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 2, daysAgo: 5 },
      { name: "Tim Bentley", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 3, daysAgo: 1 },
      { name: "Bryan Madden", source: "Youtube Ads", value: "$0.00", calls: 2, texts: 1, daysAgo: 7 },
    ],
  },
  { name: "Loveable Landing Page", count: 0, value: "$0.00", cards: [] },
  {
    name: "Voice AI Nurture",
    count: 22,
    value: "$0.00",
    cards: [
      { name: "Anita Wang", source: "Facebook", value: "$0.00", calls: 5, texts: 1, daysAgo: 1 },
      { name: "Hector Diaz", source: "Facebook", value: "$0.00", calls: 5, texts: 3, daysAgo: 3 },
      { name: "Landon", source: "Facebook", value: "$0.00", calls: 5, texts: 2, daysAgo: 4 },
      { name: "Kenn Wayne", source: "Facebook", value: "$0.00", calls: 2, texts: 1, daysAgo: 6 },
    ],
  },
  {
    name: "Not a working number",
    count: 7,
    value: "$0.00",
    cards: [
      { name: "James Stogner", source: "Facebook", value: "$0.00", calls: 3, texts: 1, daysAgo: 2 },
      { name: "Joshua Inglis", source: "Facebook", value: "$0.00", calls: 6, texts: 18, daysAgo: 8 },
      { name: "Todd Coney", source: "Facebook", value: "$0.00", calls: 2, texts: 4, daysAgo: 3 },
    ],
  },
];

// Sidebar items matching GHL screenshot exactly
const sidebarTop = [
  { label: "Launchpad", icon: "launchpad" },
  { label: "Dashboard", icon: "dashboard" },
  { label: "Conversations", icon: "conversations" },
  { label: "Calendars", icon: "calendars" },
  { label: "Contacts", icon: "contacts" },
  { label: "Opportunities", icon: "opportunities", active: true },
  { label: "Payments", icon: "payments" },
];

const sidebarBottom = [
  { label: "AI Agents", icon: "ai" },
  { label: "Marketing", icon: "marketing" },
  { label: "Automation", icon: "automation" },
  { label: "Sites", icon: "sites" },
  { label: "Memberships", icon: "memberships" },
  { label: "Media Storage", icon: "media" },
  { label: "Reputation", icon: "reputation" },
  { label: "Reporting", icon: "reporting" },
  { label: "Settings", icon: "settings" },
];

// SVG icon paths (minimal, clean)
function SidebarIcon({ icon, color }: { icon: string; color: string }) {
  const s = { width: 18, height: 18, fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "launchpad": return <svg {...s} viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>;
    case "dashboard": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "conversations": return <svg {...s} viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
    case "calendars": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "contacts": return <svg {...s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "opportunities": return <svg {...s} viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
    case "payments": return <svg {...s} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>;
    case "ai": return <svg {...s} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
    case "marketing": return <svg {...s} viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
    case "automation": return <svg {...s} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
    case "sites": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
    case "memberships": return <svg {...s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case "media": return <svg {...s} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case "reputation": return <svg {...s} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "reporting": return <svg {...s} viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
    case "settings": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    default: return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>;
  }
}

// Avatar color generator
function getAvatarColor(name: string) {
  const colors = [
    ["#6366f1", "#818cf8"], ["#8b5cf6", "#a78bfa"], ["#ec4899", "#f472b6"],
    ["#06b6d4", "#22d3ee"], ["#10b981", "#34d399"], ["#f59e0b", "#fbbf24"],
    ["#ef4444", "#f87171"], ["#3b82f6", "#60a5fa"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ============================================================
// THEME 1: "Obsidian" — Ultra-dark with cyan/teal accents
// Inspired by Linear, Raycast. Crisp, techy, developer-friendly.
// ============================================================
function Theme1() {
  const accent = "#06b6d4";
  const accentBg = "rgba(6,182,212,0.08)";
  const accentBgHover = "rgba(6,182,212,0.12)";
  const bg = "#0a0a0f";
  const surface = "#111118";
  const surfaceHover = "#16161f";
  const border = "rgba(255,255,255,0.06)";
  const textPrimary = "#f0f0f5";
  const textSecondary = "rgba(255,255,255,0.45)";
  const textMuted = "rgba(255,255,255,0.28)";

  return (
    <div style={{ display: "flex", height: 780, background: bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: surface, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column", padding: "0" }}>
        {/* Brand */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)", borderRadius: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>R</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>REV² Ai</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Apopka, FL</div>
            </div>
          </div>
          {/* Search */}
          <div style={{ marginTop: 12, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke={textMuted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: textMuted }}>Search</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>⌘K</span>
          </div>
        </div>

        {/* Nav Top */}
        <div style={{ padding: "8px 8px 0", flex: 1 }}>
          {sidebarTop.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              fontWeight: item.active ? 500 : 400,
              color: item.active ? accent : textSecondary,
              background: item.active ? accentBg : "transparent",
              cursor: "pointer", marginBottom: 1, transition: "all 0.15s",
            }}>
              <SidebarIcon icon={item.icon} color={item.active ? accent : "rgba(255,255,255,0.35)"} />
              {item.label}
              {item.active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: accent }} />}
            </div>
          ))}

          <div style={{ height: 1, background: border, margin: "10px 12px" }} />

          {sidebarBottom.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              fontWeight: 400, color: textSecondary, cursor: "pointer", marginBottom: 1,
            }}>
              <SidebarIcon icon={item.icon} color="rgba(255,255,255,0.35)" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: bg }}>
        {/* Header */}
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h2 style={{ color: textPrimary, fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Opportunities</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ padding: "4px 12px", borderRadius: 6, background: accentBg, color: accent, fontSize: 11, fontWeight: 500 }}>Filters</span>
              <span style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: textSecondary, fontSize: 11 }}>Sort</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, color: textMuted, fontSize: 12 }}>Search...</div>
            <div style={{ padding: "6px 14px", borderRadius: 6, background: accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add</div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ flex: 1, display: "flex", gap: 1, padding: "0", overflowX: "auto", background: "rgba(255,255,255,0.02)" }}>
          {stages.map((stage, si) => (
            <div key={si} style={{ minWidth: 270, flex: 1, display: "flex", flexDirection: "column", background: si % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", padding: "16px 10px" }}>
              {/* Stage Header */}
              <div style={{ padding: "0 6px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary, letterSpacing: "-0.01em" }}>{stage.name}</span>
                  <span style={{ fontSize: 11, color: textMuted, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{stage.count}</span>
                </div>
                <div style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`, marginTop: 8, opacity: 0.5 }} />
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {stage.cards.map((card, ci) => {
                  const [c1, c2] = getAvatarColor(card.name);
                  return (
                    <div key={ci} style={{
                      padding: "12px", borderRadius: 10, background: surface, border: `1px solid ${border}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${c1}, ${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {card.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{card.daysAgo}d ago · {card.source}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: accentBg, color: accent, fontSize: 10, fontWeight: 500 }}>📞 {card.calls}</span>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: accentBg, color: accent, fontSize: 10, fontWeight: 500 }}>💬 {card.texts}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted }}>{card.value}</span>
                      </div>
                    </div>
                  );
                })}
                {stage.cards.length === 0 && (
                  <div style={{ padding: 32, borderRadius: 10, border: `1px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontSize: 11 }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// THEME 2: "Ivory" — Light, airy, Apple-esque
// Soft whites, refined grays, blue accent. Premium & clean.
// ============================================================
function Theme2() {
  const accent = "#3b82f6";
  const accentLight = "#eff6ff";
  const bg = "#f5f5f7";
  const surface = "#ffffff";
  const border = "#e8e8ed";
  const borderLight = "#f0f0f5";
  const textPrimary = "#1d1d1f";
  const textSecondary = "#6e6e73";
  const textMuted = "#aeaeb2";

  return (
    <div style={{ display: "flex", height: 780, background: bg, fontFamily: "'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: surface, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: `linear-gradient(135deg, ${accent} 0%, #2563eb 100%)`, borderRadius: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>R</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>REV² Ai</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>Apopka, FL</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 10, background: bg, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke={textMuted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: textMuted }}>Search</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted, background: surface, padding: "1px 6px", borderRadius: 4, border: `1px solid ${border}` }}>⌘K</span>
          </div>
        </div>

        <div style={{ padding: "8px 8px 0", flex: 1 }}>
          {sidebarTop.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              fontWeight: item.active ? 600 : 400,
              color: item.active ? accent : textSecondary,
              background: item.active ? accentLight : "transparent",
              cursor: "pointer", marginBottom: 1,
            }}>
              <SidebarIcon icon={item.icon} color={item.active ? accent : textMuted} />
              {item.label}
            </div>
          ))}
          <div style={{ height: 1, background: borderLight, margin: "10px 12px" }} />
          {sidebarBottom.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              color: textSecondary, cursor: "pointer", marginBottom: 1,
            }}>
              <SidebarIcon icon={item.icon} color={textMuted} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: surface, borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h2 style={{ color: textPrimary, fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Opportunities</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: bg, border: `1px solid ${border}`, color: textSecondary, fontSize: 11, fontWeight: 500 }}>Filters</span>
              <span style={{ padding: "4px 12px", borderRadius: 8, background: bg, border: `1px solid ${border}`, color: textSecondary, fontSize: 11 }}>Sort</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: bg, border: `1px solid ${border}`, color: textMuted, fontSize: 12 }}>Search...</div>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: 14, padding: "18px 16px", overflowX: "auto" }}>
          {stages.map((stage, si) => (
            <div key={si} style={{ minWidth: 270, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "10px 12px", marginBottom: 10, borderRadius: 12, background: surface, border: `1px solid ${border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{stage.name}</span>
                  <span style={{ fontSize: 11, color: textMuted, background: bg, padding: "2px 8px", borderRadius: 6 }}>{stage.count}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {stage.cards.map((card, ci) => {
                  const [c1, c2] = getAvatarColor(card.name);
                  return (
                    <div key={ci} style={{
                      padding: "14px", borderRadius: 14, background: surface, border: `1px solid ${border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${c1}, ${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {card.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{card.daysAgo}d ago</div>
                        </div>
                        <span style={{ fontSize: 10, color: textMuted, background: bg, padding: "2px 8px", borderRadius: 6 }}>{card.source}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${borderLight}`, paddingTop: 10 }}>
                        <span style={{ padding: "3px 8px", borderRadius: 6, background: accentLight, color: accent, fontSize: 10, fontWeight: 500 }}>📞 {card.calls}</span>
                        <span style={{ padding: "3px 8px", borderRadius: 6, background: accentLight, color: accent, fontSize: 10, fontWeight: 500 }}>💬 {card.texts}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: textSecondary, fontWeight: 500 }}>{card.value}</span>
                      </div>
                    </div>
                  );
                })}
                {stage.cards.length === 0 && (
                  <div style={{ padding: 32, borderRadius: 14, border: `2px dashed ${borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontSize: 11, background: surface }}>
                    No opportunities
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// THEME 3: "Nebula" — Dark with gradient purple/pink accents
// Bold, vibrant. Inspired by Figma dark mode, Discord.
// ============================================================
function Theme3() {
  const accent1 = "#8b5cf6";
  const accent2 = "#ec4899";
  const accentGrad = `linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%)`;
  const accentBg = "rgba(139,92,246,0.1)";
  const bg = "#0f0f14";
  const surface = "#17171e";
  const surfaceRaised = "#1e1e28";
  const border = "rgba(255,255,255,0.07)";
  const textPrimary = "#eeeef0";
  const textSecondary = "rgba(255,255,255,0.5)";
  const textMuted = "rgba(255,255,255,0.25)";

  return (
    <div style={{ display: "flex", height: 780, background: bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: surface, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: accentGrad, borderRadius: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>R</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>REV² Ai</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Apopka, FL</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke={textMuted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: textMuted }}>Search</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted, background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 4 }}>⌘K</span>
          </div>
        </div>

        <div style={{ padding: "8px 8px 0", flex: 1 }}>
          {sidebarTop.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              fontWeight: item.active ? 500 : 400,
              color: item.active ? "#fff" : textSecondary,
              background: item.active ? accentGrad : "transparent",
              cursor: "pointer", marginBottom: 1,
            }}>
              <SidebarIcon icon={item.icon} color={item.active ? "#fff" : "rgba(255,255,255,0.35)"} />
              {item.label}
            </div>
          ))}
          <div style={{ height: 1, background: border, margin: "10px 12px" }} />
          {sidebarBottom.map((item, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              color: textSecondary, cursor: "pointer", marginBottom: 1,
            }}>
              <SidebarIcon icon={item.icon} color="rgba(255,255,255,0.35)" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h2 style={{ color: textPrimary, fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Opportunities</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ padding: "4px 12px", borderRadius: 6, background: accentBg, color: accent1, fontSize: 11, fontWeight: 500 }}>Filters</span>
              <span style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: textSecondary, fontSize: 11 }}>Sort</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, color: textMuted, fontSize: 12 }}>Search...</div>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: accentGrad, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: 12, padding: "16px 14px", overflowX: "auto" }}>
          {stages.map((stage, si) => (
            <div key={si} style={{ minWidth: 270, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "10px 12px", marginBottom: 10, borderRadius: 10, background: surfaceRaised, border: `1px solid ${border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{stage.name}</span>
                  <span style={{ fontSize: 10, color: accent1, background: accentBg, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{stage.count}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: accentGrad, marginTop: 8, opacity: 0.6 }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {stage.cards.map((card, ci) => {
                  const [c1, c2] = getAvatarColor(card.name);
                  return (
                    <div key={ci} style={{
                      padding: "12px", borderRadius: 12, background: surfaceRaised, border: `1px solid ${border}`,
                      cursor: "pointer", transition: "all 0.15s",
                      position: "relative", overflow: "hidden",
                    }}>
                      {/* Subtle gradient top edge */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentGrad, opacity: 0.4 }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${c1}, ${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {card.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{card.source} · {card.daysAgo}d</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: accentBg, color: accent1, fontSize: 10, fontWeight: 500 }}>📞 {card.calls}</span>
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: "rgba(236,72,153,0.1)", color: accent2, fontSize: 10, fontWeight: 500 }}>💬 {card.texts}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted }}>{card.value}</span>
                      </div>
                    </div>
                  );
                })}
                {stage.cards.length === 0 && (
                  <div style={{ padding: 32, borderRadius: 12, border: `1px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontSize: 11 }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE — Theme Selector
// ============================================================
export default function DesignMockups() {
  const [selected, setSelected] = useState<number | null>(null);

  const themes = [
    { name: "Obsidian", desc: "Ultra-dark with cyan/teal accents — Linear & Raycast inspired", component: <Theme1 /> },
    { name: "Ivory", desc: "Light, airy, Apple-esque — soft whites with blue accents", component: <Theme2 /> },
    { name: "Nebula", desc: "Dark with vibrant purple/pink gradients — bold & modern", component: <Theme3 /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", padding: "48px 24px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <h1 style={{ color: "#fafafa", fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.04em" }}>
            GHL Design System
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginTop: 10, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Pick your favorite design direction. Round 2 will refine your choice with two variations.
          </p>
        </div>

        {/* Theme Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 72 }}>
          {themes.map((theme, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: selected === i ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.06)",
                      color: selected === i ? "#fff" : "rgba(255,255,255,0.4)",
                    }}>
                      {selected === i ? "✓ Selected" : `${i + 1} of 3`}
                    </span>
                    <h2 style={{ color: "#fafafa", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>{theme.name}</h2>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: "4px 0 0" }}>{theme.desc}</p>
                </div>
                <button
                  onClick={() => setSelected(i)}
                  style={{
                    padding: "10px 28px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    background: selected === i ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(255,255,255,0.06)",
                    color: selected === i ? "#fff" : "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                  }}
                >
                  {selected === i ? "Selected ✓" : "Pick This One"}
                </button>
              </div>

              <div style={{
                borderRadius: 16, overflow: "hidden",
                boxShadow: selected === i ? "0 0 0 2px #22c55e, 0 12px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.4)",
                transition: "all 0.3s",
              }}>
                {theme.component}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 72, padding: 32, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
            {selected !== null
              ? `You picked "${themes[selected].name}" — tell me and I'll create 2 refined variations next.`
              : "Pick a design above, then let me know your choice."}
          </p>
        </div>
      </div>
    </div>
  );
}
