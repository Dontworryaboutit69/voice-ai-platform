"use client";

import { useState } from "react";

// ============================================================
// DATA
// ============================================================
const stages = [
  { name: "Youtube Leads", count: 0, value: "$0.00", cards: [] },
  {
    name: "Web Form", count: 6, value: "$0.00",
    cards: [
      { name: "Daniel Woods", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 4, daysAgo: 2 },
      { name: "Talbert Williams", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 2, daysAgo: 5 },
      { name: "Tim Bentley", source: "Youtube Ads", value: "$0.00", calls: 3, texts: 3, daysAgo: 1 },
      { name: "Bryan Madden", source: "Youtube Ads", value: "$0.00", calls: 2, texts: 1, daysAgo: 7 },
    ],
  },
  { name: "Loveable Landing Page", count: 0, value: "$0.00", cards: [] },
  {
    name: "Voice AI Nurture", count: 22, value: "$0.00",
    cards: [
      { name: "Anita Wang", source: "Facebook", value: "$0.00", calls: 5, texts: 1, daysAgo: 1 },
      { name: "Hector Diaz", source: "Facebook", value: "$0.00", calls: 5, texts: 3, daysAgo: 3 },
      { name: "Landon", source: "Facebook", value: "$0.00", calls: 5, texts: 2, daysAgo: 4 },
      { name: "Kenn Wayne", source: "Facebook", value: "$0.00", calls: 2, texts: 1, daysAgo: 6 },
    ],
  },
  {
    name: "Not a working number", count: 7, value: "$0.00",
    cards: [
      { name: "James Stogner", source: "Facebook", value: "$0.00", calls: 3, texts: 1, daysAgo: 2 },
      { name: "Joshua Inglis", source: "Facebook", value: "$0.00", calls: 6, texts: 18, daysAgo: 8 },
      { name: "Todd Coney", source: "Facebook", value: "$0.00", calls: 2, texts: 4, daysAgo: 3 },
    ],
  },
];

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

// Helper to render a sidebar
function Sidebar({ bg, border, brandGrad, brandShadow, searchBg, searchBorder, textSec, textMut, activeColor, activeBg, activeShadow, activeTextColor }: {
  bg: string; border: string; brandGrad: string; brandShadow: string; searchBg: string; searchBorder: string;
  textSec: string; textMut: string; activeColor: string; activeBg: string; activeShadow: string; activeTextColor: string;
}) {
  return (
    <div style={{ width: 240, background: bg, borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: brandGrad, borderRadius: 12, boxShadow: brandShadow }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>R</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>REV² Ai</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Apopka, FL</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 8, background: searchBg, border: `1px solid ${searchBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" fill="none" stroke={textMut} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span style={{ fontSize: 12, color: textMut }}>Search</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: textMut, background: "rgba(128,128,128,0.1)", padding: "2px 6px", borderRadius: 4 }}>⌘K</span>
        </div>
      </div>
      <div style={{ padding: "8px 8px", flex: 1, overflowY: "auto" }}>
        {sidebarTop.map((item, i) => (
          <div key={i} style={{
            padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
            fontWeight: item.active ? 500 : 400,
            color: item.active ? activeTextColor : textSec,
            background: item.active ? activeBg : "transparent",
            boxShadow: item.active ? activeShadow : "none",
            cursor: "pointer", marginBottom: 2,
          }}>
            <SidebarIcon icon={item.icon} color={item.active ? activeColor : textMut} />
            {item.label}
          </div>
        ))}
        <div style={{ height: 1, background: border, margin: "8px 12px" }} />
        {sidebarBottom.map((item, i) => (
          <div key={i} style={{
            padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13,
            color: textSec, cursor: "pointer", marginBottom: 2,
          }}>
            <SidebarIcon icon={item.icon} color={textMut} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to render pipeline board
function Pipeline({ surface, border, accentBg, accentColor, accentColor2, textPri, textSec, textMut }: {
  surface: string; border: string; accentBg: string; accentColor: string; accentColor2?: string;
  textPri: string; textSec: string; textMut: string;
}) {
  return (
    <div style={{ flex: 1, display: "flex", gap: 12, padding: "16px 14px", overflowX: "auto" }}>
      {stages.map((stage, si) => (
        <div key={si} style={{ minWidth: 270, flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", marginBottom: 10, borderRadius: 10, background: surface, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: textPri }}>{stage.name}</span>
              <span style={{ fontSize: 11, color: accentColor, background: accentBg, padding: "2px 8px", borderRadius: 5, fontWeight: 600 }}>{stage.count}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {stage.cards.map((card, ci) => {
              const [c1, c2] = getAvatarColor(card.name);
              return (
                <div key={ci} style={{
                  padding: "14px", borderRadius: 12, background: surface, border: `1px solid ${border}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${c1}, ${c2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {card.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
                      <div style={{ fontSize: 10, color: textMut }}>{card.daysAgo}d ago · {card.source}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${border}`, paddingTop: 10 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 5, background: accentBg, color: accentColor, fontSize: 10, fontWeight: 500 }}>📞 {card.calls}</span>
                    <span style={{ padding: "3px 8px", borderRadius: 5, background: accentColor2 ? `${accentColor2}18` : accentBg, color: accentColor2 || accentColor, fontSize: 10, fontWeight: 500 }}>💬 {card.texts}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: textSec, fontWeight: 500 }}>{card.value}</span>
                  </div>
                </div>
              );
            })}
            {stage.cards.length === 0 && (
              <div style={{ padding: 32, borderRadius: 12, border: `1px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMut, fontSize: 11 }}>
                No opportunities
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper for header
function Header({ bg, border, accentBg, accentColor, accentGrad, textPri, textSec, textMut }: {
  bg: string; border: string; accentBg: string; accentColor: string; accentGrad: string;
  textPri: string; textSec: string; textMut: string;
}) {
  return (
    <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <h2 style={{ color: textPri, fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Opportunities</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ padding: "5px 12px", borderRadius: 6, background: accentBg, color: accentColor, fontSize: 11, fontWeight: 500 }}>Filters</span>
          <span style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(128,128,128,0.08)", color: textSec, fontSize: 11 }}>Sort</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(128,128,128,0.06)", border: `1px solid ${border}`, color: textMut, fontSize: 12 }}>Search...</div>
        <div style={{ padding: "6px 16px", borderRadius: 8, background: accentGrad, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add</div>
      </div>
    </div>
  );
}

// ============================================================
// 1. OBSIDIAN — Ultra-dark, cyan/teal (Round 1)
// ============================================================
function ThemeObsidian() {
  return (
    <div style={{ display: "flex", height: 780, background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#111118" border="rgba(255,255,255,0.06)" brandGrad="linear-gradient(135deg, #0e7490, #06b6d4)" brandShadow="0 2px 8px rgba(6,182,212,0.25)" searchBg="rgba(255,255,255,0.03)" searchBorder="rgba(255,255,255,0.06)" textSec="rgba(255,255,255,0.45)" textMut="rgba(255,255,255,0.28)" activeColor="#06b6d4" activeBg="rgba(6,182,212,0.08)" activeShadow="none" activeTextColor="#06b6d4" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0a0a0f" }}>
        <Header bg="#0a0a0f" border="rgba(255,255,255,0.06)" accentBg="rgba(6,182,212,0.08)" accentColor="#06b6d4" accentGrad="#06b6d4" textPri="#f0f0f5" textSec="rgba(255,255,255,0.45)" textMut="rgba(255,255,255,0.28)" />
        <Pipeline surface="#111118" border="rgba(255,255,255,0.06)" accentBg="rgba(6,182,212,0.08)" accentColor="#06b6d4" textPri="#f0f0f5" textSec="rgba(255,255,255,0.45)" textMut="rgba(255,255,255,0.28)" />
      </div>
    </div>
  );
}

// ============================================================
// 2. IVORY — Light, Apple-esque, blue accent (Round 1)
// ============================================================
function ThemeIvory() {
  return (
    <div style={{ display: "flex", height: 780, background: "#f5f5f7", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#ffffff" border="#e8e8ed" brandGrad="linear-gradient(135deg, #3b82f6, #2563eb)" brandShadow="0 2px 8px rgba(59,130,246,0.2)" searchBg="#f5f5f7" searchBorder="#e8e8ed" textSec="#6e6e73" textMut="#aeaeb2" activeColor="#3b82f6" activeBg="#eff6ff" activeShadow="none" activeTextColor="#3b82f6" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#ffffff" border="#e8e8ed" accentBg="#eff6ff" accentColor="#3b82f6" accentGrad="#3b82f6" textPri="#1d1d1f" textSec="#6e6e73" textMut="#aeaeb2" />
        <Pipeline surface="#ffffff" border="#e8e8ed" accentBg="#eff6ff" accentColor="#3b82f6" textPri="#1d1d1f" textSec="#6e6e73" textMut="#aeaeb2" />
      </div>
    </div>
  );
}

// ============================================================
// 3. NEBULA — Dark, purple/pink gradients (Round 1)
// ============================================================
function ThemeNebula() {
  return (
    <div style={{ display: "flex", height: 780, background: "#0f0f14", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#17171e" border="rgba(255,255,255,0.07)" brandGrad="linear-gradient(135deg, #8b5cf6, #ec4899)" brandShadow="0 2px 10px rgba(139,92,246,0.25)" searchBg="rgba(255,255,255,0.03)" searchBorder="rgba(255,255,255,0.07)" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.25)" activeColor="#fff" activeBg="linear-gradient(135deg, #8b5cf6, #ec4899)" activeShadow="0 2px 6px rgba(139,92,246,0.3)" activeTextColor="#fff" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#0f0f14" border="rgba(255,255,255,0.07)" accentBg="rgba(139,92,246,0.1)" accentColor="#8b5cf6" accentGrad="linear-gradient(135deg, #8b5cf6, #ec4899)" textPri="#eeeef0" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.25)" />
        <Pipeline surface="#1e1e28" border="rgba(255,255,255,0.07)" accentBg="rgba(139,92,246,0.1)" accentColor="#8b5cf6" accentColor2="#ec4899" textPri="#eeeef0" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.25)" />
      </div>
    </div>
  );
}

// ============================================================
// 4. SLATE — Medium-dark warm gray + blue (Round 2)
// ============================================================
function ThemeSlate() {
  return (
    <div style={{ display: "flex", height: 780, background: "#1e2028", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#252830" border="rgba(255,255,255,0.08)" brandGrad="linear-gradient(135deg, #3b82f6, #2563eb)" brandShadow="0 2px 8px rgba(59,130,246,0.25)" searchBg="rgba(255,255,255,0.04)" searchBorder="rgba(255,255,255,0.08)" textSec="#9ca3af" textMut="#6b7280" activeColor="#fff" activeBg="#3b82f6" activeShadow="0 2px 6px rgba(59,130,246,0.2)" activeTextColor="#fff" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#1e2028" border="rgba(255,255,255,0.08)" accentBg="rgba(59,130,246,0.1)" accentColor="#3b82f6" accentGrad="#3b82f6" textPri="#e8eaed" textSec="#9ca3af" textMut="#6b7280" />
        <Pipeline surface="#282b35" border="rgba(255,255,255,0.08)" accentBg="rgba(59,130,246,0.1)" accentColor="#3b82f6" textPri="#e8eaed" textSec="#9ca3af" textMut="#6b7280" />
      </div>
    </div>
  );
}

// ============================================================
// 5. PEARL — Warm white, cream, indigo (Round 2)
// ============================================================
function ThemePearl() {
  return (
    <div style={{ display: "flex", height: 780, background: "#faf9f7", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#ffffff" border="#e7e5e0" brandGrad="linear-gradient(135deg, #6366f1, #7c3aed)" brandShadow="0 2px 8px rgba(99,102,241,0.2)" searchBg="#f5f4f1" searchBorder="#e7e5e0" textSec="#57534e" textMut="#a8a29e" activeColor="#4f46e5" activeBg="#eef2ff" activeShadow="none" activeTextColor="#4f46e5" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#ffffff" border="#e7e5e0" accentBg="#eef2ff" accentColor="#4f46e5" accentGrad="#6366f1" textPri="#1c1917" textSec="#57534e" textMut="#a8a29e" />
        <Pipeline surface="#ffffff" border="#e7e5e0" accentBg="#eef2ff" accentColor="#4f46e5" textPri="#1c1917" textSec="#57534e" textMut="#a8a29e" />
      </div>
    </div>
  );
}

// ============================================================
// 6. DUSK — Soft purple-tinted dark (Round 2)
// ============================================================
function ThemeDusk() {
  return (
    <div style={{ display: "flex", height: 780, background: "#1a1b2e", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#1f2037" border="rgba(255,255,255,0.08)" brandGrad="linear-gradient(135deg, #6366f1, #8b5cf6)" brandShadow="0 2px 10px rgba(99,102,241,0.25)" searchBg="rgba(255,255,255,0.04)" searchBorder="rgba(255,255,255,0.08)" textSec="#9d9db8" textMut="#6b6b88" activeColor="#fff" activeBg="linear-gradient(135deg, #6366f1, #8b5cf6)" activeShadow="0 2px 6px rgba(99,102,241,0.2)" activeTextColor="#fff" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#1a1b2e" border="rgba(255,255,255,0.08)" accentBg="rgba(129,140,248,0.1)" accentColor="#818cf8" accentGrad="linear-gradient(135deg, #6366f1, #8b5cf6)" textPri="#e8e8f0" textSec="#9d9db8" textMut="#6b6b88" />
        <Pipeline surface="#242640" border="rgba(255,255,255,0.08)" accentBg="rgba(129,140,248,0.1)" accentColor="#818cf8" accentColor2="#a78bfa" textPri="#e8e8f0" textSec="#9d9db8" textMut="#6b6b88" />
      </div>
    </div>
  );
}

// ============================================================
// 7. NEBULA PRO — Deep blue to electric blue gradients
// Same Nebula layout energy but strong, professional, masculine
// ============================================================
function NebulaProTheme() {
  const accent1 = "#3b82f6";
  const accent2 = "#06b6d4";
  const accentGrad = "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)";
  const accentGradSoft = "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)";
  return (
    <div style={{ display: "flex", height: 780, background: "#0f1219", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#151a24" border="rgba(255,255,255,0.07)" brandGrad={accentGrad} brandShadow="0 2px 12px rgba(59,130,246,0.3)" searchBg="rgba(255,255,255,0.03)" searchBorder="rgba(255,255,255,0.07)" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" activeColor="#fff" activeBg={accentGradSoft} activeShadow="0 2px 8px rgba(59,130,246,0.3)" activeTextColor="#fff" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#0f1219" border="rgba(255,255,255,0.07)" accentBg="rgba(59,130,246,0.1)" accentColor={accent1} accentGrad={accentGrad} textPri="#edf0f7" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" />
        <Pipeline surface="#181d28" border="rgba(255,255,255,0.07)" accentBg="rgba(59,130,246,0.1)" accentColor={accent1} accentColor2={accent2} textPri="#edf0f7" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" />
      </div>
    </div>
  );
}

// ============================================================
// 8. NEBULA EDGE — Deep indigo to teal/emerald gradients
// Rich, bold, premium. Strong without being aggressive.
// ============================================================
function NebulaEdgeTheme() {
  const accent1 = "#6366f1";
  const accent2 = "#10b981";
  const accentGrad = "linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #10b981 100%)";
  const accentGradSoft = "linear-gradient(135deg, #4f46e5 0%, #10b981 100%)";
  return (
    <div style={{ display: "flex", height: 780, background: "#0d1117", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar bg="#131920" border="rgba(255,255,255,0.07)" brandGrad={accentGrad} brandShadow="0 2px 12px rgba(99,102,241,0.25)" searchBg="rgba(255,255,255,0.03)" searchBorder="rgba(255,255,255,0.07)" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" activeColor="#fff" activeBg={accentGradSoft} activeShadow="0 2px 8px rgba(99,102,241,0.25)" activeTextColor="#fff" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header bg="#0d1117" border="rgba(255,255,255,0.07)" accentBg="rgba(99,102,241,0.1)" accentColor={accent1} accentGrad={accentGrad} textPri="#e6edf3" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" />
        <Pipeline surface="#161b22" border="rgba(255,255,255,0.07)" accentBg="rgba(99,102,241,0.1)" accentColor={accent1} accentColor2={accent2} textPri="#e6edf3" textSec="rgba(255,255,255,0.5)" textMut="rgba(255,255,255,0.28)" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE — All designs
// ============================================================
export default function DesignMockups() {
  const [selected, setSelected] = useState<number | null>(null);

  const themes = [
    { name: "Nebula Pro", desc: "Deep blue to electric blue/cyan gradients — strong, professional, tech-forward", round: "Final", component: <NebulaProTheme /> },
    { name: "Nebula Edge", desc: "Indigo to teal/emerald gradients — bold, premium, modern", round: "Final", component: <NebulaEdgeTheme /> },
    { name: "Obsidian", desc: "Ultra-dark with cyan/teal accents — Linear/Raycast vibe", round: 1, component: <ThemeObsidian /> },
    { name: "Ivory", desc: "Light, Apple-esque with blue accents — clean & airy", round: 1, component: <ThemeIvory /> },
    { name: "Nebula", desc: "Dark with vibrant purple/pink gradients — bold & modern", round: 1, component: <ThemeNebula /> },
    { name: "Slate", desc: "Medium-dark warm gray + blue — Notion/GitHub dark feel, not too dark", round: 2, component: <ThemeSlate /> },
    { name: "Pearl", desc: "Warm white with cream tones & indigo — Stripe/Notion light feel", round: 2, component: <ThemePearl /> },
    { name: "Dusk", desc: "Soft purple-tinted dark — your current GHL vibe but way cleaner", round: 2, component: <ThemeDusk /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", padding: "48px 24px", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 56, textAlign: "center" }}>
          <h1 style={{ color: "#fafafa", fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.04em" }}>
            GHL Design System
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, marginTop: 10, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            2 new Nebula refinements at the top (stronger colors, same gradient energy) + all previous designs below. Pick the winner.
          </p>
        </div>

        {/* Themes */}
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
                      {selected === i ? "✓ Selected" : `Round ${theme.round}`}
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
              ? `You picked "${themes[selected].name}" — tell me and we'll go with this one!`
              : "Pick your final design above and let me know."}
          </p>
        </div>
      </div>
    </div>
  );
}
