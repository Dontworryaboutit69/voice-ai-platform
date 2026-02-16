"use client";

import { useState } from "react";

/* ─────────────────────────────────────────────────────────
   CallFox Brand & Character Concepts — v2
   Direction: Cunning, confident, outsmarts competition.
   Think Nick Wilde meets tech startup founder.
   ───────────────────────────────────────────────────────── */

type BgMode = "light" | "dark";

/* ═══════════════════════════════════════════
   SVG CHARACTER ILLUSTRATIONS
   ═══════════════════════════════════════════ */

// ── The Confident Fox — half-smirk, sharp eyes, leaning back
const ConfidentFox = ({ size = 200 }: { size?: number }) => {
  const s = size / 200;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 200 240" fill="none">
      {/* ─ Tail ─ flowing, confident swoosh */}
      <path d="M155 180 Q190 160 185 120 Q182 100 170 95 Q178 110 175 130 Q172 155 150 170" fill="#E2680A" />
      <path d="M170 95 Q165 90 168 85" stroke="#FDBA74" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* ─ Body ─ leaning back, relaxed posture */}
      <ellipse cx="100" cy="185" rx="38" ry="42" fill="#F97316" />
      {/* Belly */}
      <ellipse cx="100" cy="192" rx="24" ry="28" fill="#FED7AA" opacity="0.6" />

      {/* ─ Left arm ─ crossed / casual */}
      <path d="M62 175 Q50 170 48 160 Q46 152 52 150" stroke="#EA580C" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Left paw */}
      <circle cx="52" cy="149" r="6" fill="#EA580C" />

      {/* ─ Right arm ─ pointing or gesturing */}
      <path d="M138 170 Q152 162 158 148 Q162 138 156 132" stroke="#EA580C" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Right paw with finger point */}
      <circle cx="155" cy="131" r="5" fill="#EA580C" />
      <line x1="155" y1="131" x2="160" y2="122" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />

      {/* ─ Legs ─ */}
      <ellipse cx="78" cy="224" rx="14" ry="8" fill="#EA580C" />
      <ellipse cx="122" cy="224" rx="14" ry="8" fill="#EA580C" />

      {/* ─ Head ─ slightly tilted, cocky angle */}
      <g transform="rotate(-3, 100, 100)">
        {/* Head shape */}
        <ellipse cx="100" cy="100" rx="42" ry="38" fill="#F97316" />

        {/* Ears ─ sharp, alert, confident */}
        <polygon points="62,60 74,82 54,80" fill="#F97316" />
        <polygon points="138,56 146,78 128,80" fill="#F97316" />
        <polygon points="64,64 72,80 58,78" fill="#FDBA74" opacity="0.5" />
        <polygon points="136,60 142,76 130,78" fill="#FDBA74" opacity="0.5" />

        {/* Face mask ─ lighter fur area */}
        <ellipse cx="100" cy="108" rx="22" ry="16" fill="#FED7AA" opacity="0.45" />

        {/* ─ EYES ─ the key: half-lidded, knowing, sharp */}
        {/* Left eye ─ slightly narrowed */}
        <ellipse cx="84" cy="94" rx="9" ry="7" fill="white" />
        {/* Eyelid ─ the "knowing" look */}
        <path d="M75 90 Q84 86 93 90" fill="#F97316" />
        <ellipse cx="86" cy="95" rx="4.5" ry="5" fill="#2D1B0E" />
        <circle cx="88" cy="93" r="1.8" fill="white" />
        {/* Slight eyebrow raise */}
        <path d="M76 82 Q84 78 92 82" stroke="#C2410C" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* Right eye ─ slightly more open (asymmetry = personality) */}
        <ellipse cx="116" cy="94" rx="9" ry="8" fill="white" />
        <path d="M107 89 Q116 86 125 90" fill="#F97316" />
        <ellipse cx="118" cy="95" rx="4.5" ry="5.5" fill="#2D1B0E" />
        <circle cx="120" cy="93" r="1.8" fill="white" />
        {/* Raised eyebrow ─ "oh really?" */}
        <path d="M108 80 Q116 75 124 80" stroke="#C2410C" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="100" cy="108" rx="4" ry="3" fill="#1E293B" />
        <circle cx="99" cy="107" r="1" fill="#475569" opacity="0.5" />

        {/* ─ SMIRK ─ the signature: one side up, confident */}
        <path d="M90 115 Q96 118 100 117 Q108 116 114 112" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Slight tooth / fang showing on smirk side */}
        <path d="M112 113 L114 117" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cheek fur tufts */}
        <path d="M58 100 Q52 104 48 100" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M142 98 Q148 102 152 98" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* ─ Headset ─ sleek, modern, one ear */}
      <path d="M58 82 Q56 60 80 52" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="50" y="78" width="12" height="16" rx="5" fill="#475569" />
      <rect x="52" y="80" width="8" height="12" rx="4" fill="#64748B" />
      {/* Mic arm ─ subtle */}
      <path d="M56 94 Q52 108 66 116" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="67" cy="117" r="4" fill="#475569" />
      <circle cx="67" cy="117" r="2" fill="#94A3B8" />
    </svg>
  );
};

// ── The Scheming Fox ─ narrowed eyes, rubbing paws together
const SchemingFox = ({ size = 200 }: { size?: number }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none">
    {/* Tail */}
    <path d="M150 180 Q180 155 178 115 Q176 95 165 90 Q172 105 170 130 Q168 155 145 170" fill="#E2680A" />
    <path d="M165 90 Q160 85 163 80" stroke="#FDBA74" strokeWidth="3" fill="none" strokeLinecap="round" />

    {/* Body */}
    <ellipse cx="100" cy="175" rx="36" ry="38" fill="#F97316" />
    <ellipse cx="100" cy="182" rx="22" ry="25" fill="#FED7AA" opacity="0.5" />

    {/* Arms ─ paws together, scheming */}
    <path d="M65 165 Q58 155 62 142 Q66 132 74 130" stroke="#EA580C" strokeWidth="9" fill="none" strokeLinecap="round" />
    <path d="M135 165 Q142 155 138 142 Q134 132 126 130" stroke="#EA580C" strokeWidth="9" fill="none" strokeLinecap="round" />
    {/* Paws pressed together */}
    <circle cx="76" cy="129" r="7" fill="#EA580C" />
    <circle cx="124" cy="129" r="7" fill="#EA580C" />
    <ellipse cx="100" cy="128" rx="18" ry="7" fill="#EA580C" opacity="0.8" />
    {/* Finger tips touching */}
    <circle cx="90" cy="125" r="3" fill="#C2410C" />
    <circle cx="100" cy="123" r="3" fill="#C2410C" />
    <circle cx="110" cy="125" r="3" fill="#C2410C" />

    {/* Legs */}
    <ellipse cx="78" cy="210" rx="14" ry="7" fill="#EA580C" />
    <ellipse cx="122" cy="210" rx="14" ry="7" fill="#EA580C" />

    {/* Head */}
    <ellipse cx="100" cy="80" rx="40" ry="36" fill="#F97316" />
    {/* Ears */}
    <polygon points="64,42 76,62 56,60" fill="#F97316" />
    <polygon points="136,42 144,60 124,62" fill="#F97316" />
    <polygon points="66,46 74,60 60,58" fill="#FDBA74" opacity="0.4" />
    <polygon points="134,46 140,58 128,60" fill="#FDBA74" opacity="0.4" />

    {/* Face mask */}
    <ellipse cx="100" cy="90" rx="20" ry="14" fill="#FED7AA" opacity="0.4" />

    {/* Eyes ─ VERY narrowed, scheming slits */}
    <ellipse cx="84" cy="76" rx="9" ry="4" fill="white" />
    <ellipse cx="116" cy="76" rx="9" ry="4" fill="white" />
    {/* Heavy lids */}
    <path d="M75 73 Q84 70 93 73" fill="#F97316" />
    <path d="M107 73 Q116 70 125 73" fill="#F97316" />
    {/* Sharp pupils */}
    <ellipse cx="86" cy="76" rx="3.5" ry="3.5" fill="#2D1B0E" />
    <ellipse cx="118" cy="76" rx="3.5" ry="3.5" fill="#2D1B0E" />
    <circle cx="88" cy="75" r="1.2" fill="white" />
    <circle cx="120" cy="75" r="1.2" fill="white" />
    {/* Devious eyebrows */}
    <path d="M74 66 Q80 62 92 66" stroke="#C2410C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M108 66 Q120 62 126 66" stroke="#C2410C" strokeWidth="2.2" fill="none" strokeLinecap="round" />

    {/* Nose */}
    <ellipse cx="100" cy="88" rx="3.5" ry="2.5" fill="#1E293B" />

    {/* Devious grin ─ wide, one fang showing */}
    <path d="M82 96 Q90 104 100 102 Q110 100 118 94" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M116 95 L118 100" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M84 96 L82 101" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ── The Cool Fox ─ sunglasses, arms crossed, "what are you gonna do about it"
const CoolFox = ({ size = 200 }: { size?: number }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 200 240" fill="none">
    {/* Tail ─ relaxed swoosh */}
    <path d="M158 185 Q192 165 188 120 Q185 98 172 92 Q180 110 177 135 Q174 160 152 175" fill="#E2680A" />

    {/* Body */}
    <ellipse cx="100" cy="188" rx="40" ry="44" fill="#F97316" />
    <ellipse cx="100" cy="195" rx="26" ry="30" fill="#FED7AA" opacity="0.5" />

    {/* Arms ─ crossed, confident */}
    <path d="M60 178 Q48 170 44 155 Q42 145 48 140 Q50 148 55 155 Q62 165 75 168" fill="#EA580C" />
    <path d="M140 178 Q152 170 156 155 Q158 145 152 140 Q150 148 145 155 Q138 165 125 168" fill="#EA580C" />
    {/* Crossed forearms */}
    <path d="M55 168 Q70 160 85 168" stroke="#EA580C" strokeWidth="12" fill="none" strokeLinecap="round" />
    <path d="M115 168 Q130 160 145 168" stroke="#EA580C" strokeWidth="12" fill="none" strokeLinecap="round" />

    {/* Legs */}
    <ellipse cx="78" cy="228" rx="15" ry="8" fill="#EA580C" />
    <ellipse cx="122" cy="228" rx="15" ry="8" fill="#EA580C" />

    {/* Head */}
    <g transform="rotate(2, 100, 95)">
      <ellipse cx="100" cy="95" rx="42" ry="38" fill="#F97316" />
      {/* Ears */}
      <polygon points="60,54 74,76 52,74" fill="#F97316" />
      <polygon points="140,52 148,72 128,76" fill="#F97316" />
      <polygon points="62,58 72,74 56,72" fill="#FDBA74" opacity="0.4" />
      <polygon points="138,56 144,70 132,74" fill="#FDBA74" opacity="0.4" />

      {/* Face mask */}
      <ellipse cx="100" cy="104" rx="22" ry="14" fill="#FED7AA" opacity="0.4" />

      {/* ─ SUNGLASSES ─ the attitude */}
      <rect x="68" y="84" width="26" height="18" rx="4" fill="#1E293B" />
      <rect x="106" y="84" width="26" height="18" rx="4" fill="#1E293B" />
      <path d="M94 92 L106 90" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      {/* Slight glare on lenses */}
      <path d="M72 88 L78 86" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M110 87 L116 85" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      {/* Temple arms */}
      <path d="M68 90 Q60 88 54 82" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M132 89 Q140 86 146 80" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="100" cy="106" rx="3.5" ry="2.5" fill="#1E293B" />

      {/* Confident smirk */}
      <path d="M88 114 Q96 118 100 117 Q108 115 116 110" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M114 111 L116 115" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

      {/* Cheek tufts */}
      <path d="M56 100 Q50 104 46 100" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M144 98 Q150 102 154 98" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// ── Fox throwing a banana — the "outsmarting" pose
const FoxThrowing = ({ size = 200 }: { size?: number }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 220 260" fill="none">
    {/* Tail ─ dynamic, action pose */}
    <path d="M45 190 Q15 170 10 130 Q8 110 18 105 Q16 120 20 145 Q25 168 48 180" fill="#E2680A" />

    {/* Body ─ turned sideways, throwing motion */}
    <ellipse cx="100" cy="190" rx="36" ry="40" fill="#F97316" transform="rotate(-8, 100, 190)" />
    <ellipse cx="100" cy="196" rx="22" ry="26" fill="#FED7AA" opacity="0.5" transform="rotate(-8, 100, 196)" />

    {/* Left arm ─ follow through from throw */}
    <path d="M70 170 Q55 158 50 145 Q48 138 52 135" stroke="#EA580C" strokeWidth="10" fill="none" strokeLinecap="round" />

    {/* Right arm ─ extended, just released banana */}
    <path d="M130 165 Q148 148 165 130 Q175 118 180 108" stroke="#EA580C" strokeWidth="10" fill="none" strokeLinecap="round" />
    <circle cx="180" cy="107" r="6" fill="#EA580C" />

    {/* ─ THE BANANA ─ flying through air */}
    <g transform="rotate(-30, 200, 85)">
      <ellipse cx="200" cy="85" rx="14" ry="6" fill="#FDE047" />
      <path d="M186 85 Q200 72 214 85" stroke="#EAB308" strokeWidth="1.5" fill="none" />
      {/* Banana tip */}
      <ellipse cx="186" cy="85" rx="2" ry="3" fill="#A16207" />
    </g>
    {/* Motion lines */}
    <line x1="188" y1="95" x2="195" y2="90" stroke="#D4D4D8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="185" y1="100" x2="192" y2="96" stroke="#D4D4D8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <line x1="190" y1="88" x2="197" y2="82" stroke="#D4D4D8" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

    {/* Legs ─ dynamic stance */}
    <path d="M80 220 Q76 230 72 236" stroke="#EA580C" strokeWidth="12" fill="none" strokeLinecap="round" />
    <path d="M115 218 Q125 228 130 236" stroke="#EA580C" strokeWidth="12" fill="none" strokeLinecap="round" />
    <ellipse cx="70" cy="240" rx="14" ry="7" fill="#EA580C" />
    <ellipse cx="132" cy="240" rx="14" ry="7" fill="#EA580C" />

    {/* Head ─ looking over shoulder with smirk */}
    <g transform="rotate(5, 100, 100)">
      <ellipse cx="95" cy="100" rx="40" ry="36" fill="#F97316" />
      {/* Ears */}
      <polygon points="58,58 72,78 50,76" fill="#F97316" />
      <polygon points="130,54 138,74 120,76" fill="#F97316" />
      <polygon points="60,62 70,76 54,74" fill="#FDBA74" opacity="0.4" />
      <polygon points="128,58 134,72 124,74" fill="#FDBA74" opacity="0.4" />

      {/* Face mask */}
      <ellipse cx="95" cy="108" rx="20" ry="14" fill="#FED7AA" opacity="0.4" />

      {/* Eyes ─ looking sideways with amusement */}
      <ellipse cx="80" cy="94" rx="8" ry="6" fill="white" />
      <ellipse cx="110" cy="94" rx="8" ry="7" fill="white" />
      {/* Half lids */}
      <path d="M72 91 Q80 87 88 91" fill="#F97316" />
      <path d="M102 90 Q110 86 118 91" fill="#F97316" />
      {/* Pupils looking toward thrown banana */}
      <ellipse cx="83" cy="94" rx="3.5" ry="4" fill="#2D1B0E" />
      <ellipse cx="113" cy="94" rx="3.5" ry="4.5" fill="#2D1B0E" />
      <circle cx="85" cy="93" r="1.2" fill="white" />
      <circle cx="115" cy="93" r="1.2" fill="white" />

      {/* Smug raised eyebrow */}
      <path d="M72 84 Q80 79 88 83" stroke="#C2410C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M102 82 Q110 76 118 82" stroke="#C2410C" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="95" cy="106" rx="3.5" ry="2.5" fill="#1E293B" />

      {/* Big smug grin */}
      <path d="M80 114 Q88 122 95 120 Q105 118 115 110" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M113 111 L115 116" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

// ── Minimal Logo Mark ─ just the sharp fox face for icons/favicons
const FoxMark = ({ size = 48, color = "#F97316" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Sharp angular head */}
    <path d="M8 8 L22 32 L10 52 Q18 60 32 60 Q46 60 54 52 L42 32 L56 8 L40 28 Q36 24 32 24 Q28 24 24 28 Z" fill={color} />
    {/* Eyes ─ sharp, knowing slits */}
    <ellipse cx="24" cy="36" rx="4" ry="2.5" fill="white" />
    <ellipse cx="40" cy="36" rx="4" ry="2.5" fill="white" />
    <ellipse cx="25.5" cy="36" rx="2" ry="2.2" fill="#1E293B" />
    <ellipse cx="41.5" cy="36" rx="2" ry="2.2" fill="#1E293B" />
    {/* Smirk */}
    <path d="M26 44 Q30 47 32 46 Q36 45 40 42" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Nose */}
    <ellipse cx="32" cy="42" rx="2.5" ry="1.8" fill="#1E293B" />
  </svg>
);


/* ═══════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function LogoConceptsPage() {
  const [bg, setBg] = useState<BgMode>("dark");

  const isDark = bg === "dark";
  const pageBg = isDark ? "#0B0D11" : "#F8F9FB";
  const cardBg = isDark ? "#13151B" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#F1F1F3" : "#0F1117";
  const textSecondary = isDark ? "#8B8D98" : "#6B7280";
  const textMuted = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const accent = "#F97316";

  return (
    <div style={{ background: pageBg, minHeight: "100vh", transition: "background 0.3s" }}>
      {/* ─── Header ─── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent }}>
            Brand & Character v2
          </span>
          <button
            onClick={() => setBg(bg === "light" ? "dark" : "light")}
            style={{
              padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              color: isDark ? "#fff" : "#1E293B", border: "none", transition: "all 0.2s",
            }}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: textPrimary, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
          Meet Call<span style={{ color: accent }}>Fox</span>
        </h1>
        <p style={{ fontSize: 20, color: textSecondary, maxWidth: 640, lineHeight: 1.6, marginBottom: 12 }}>
          Cunning. Confident. Always one step ahead.
        </p>
        <p style={{ fontSize: 15, color: textMuted, maxWidth: 640, lineHeight: 1.6, marginBottom: 56 }}>
          The character that outsmarts every competitor. Think less &ldquo;cute mascot&rdquo; and more &ldquo;the smartest one in the room who knows it.&rdquo; A fox that throws bananas at apes and steals calls from flowers.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ═══════ SECTION 1: CHARACTER POSES ═══════ */}
        <SectionHeader title="Character Poses" subtitle="Each pose = a content format. TikTok, ads, thumbnails, emails." color={textPrimary} muted={textMuted} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginBottom: 64 }}>

          {/* The Confident Fox */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 24px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: accent }}>Pose 01</span>
              <ConfidentFox size={180} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginTop: 8 }}>The Confident Lean</h3>
              <p style={{ fontSize: 13, color: textSecondary, textAlign: "center" as const, maxWidth: 300, lineHeight: 1.6 }}>
                Default brand pose. Half-lidded eyes, one-sided smirk, pointing. <br />
                <span style={{ color: textMuted }}>&ldquo;Your calls? Handled. Go take a nap.&rdquo;</span>
              </p>
            </div>
          </Card>

          {/* The Scheming Fox */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 24px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: accent }}>Pose 02</span>
              <SchemingFox size={180} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginTop: 8 }}>The Schemer</h3>
              <p style={{ fontSize: 13, color: textSecondary, textAlign: "center" as const, maxWidth: 300, lineHeight: 1.6 }}>
                Paws together, plotting. Narrowed eyes, two fangs showing. <br />
                <span style={{ color: textMuted }}>&ldquo;Oh, your competitor doesn&apos;t have self-learning AI? Interesting...&rdquo;</span>
              </p>
            </div>
          </Card>

          {/* The Cool Fox */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 24px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: accent }}>Pose 03</span>
              <CoolFox size={180} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginTop: 8 }}>The Cool One</h3>
              <p style={{ fontSize: 13, color: textSecondary, textAlign: "center" as const, maxWidth: 300, lineHeight: 1.6 }}>
                Sunglasses, arms crossed. &ldquo;Deal with it&rdquo; energy. <br />
                <span style={{ color: textMuted }}>&ldquo;24/7 coverage. I don&apos;t even need sleep.&rdquo;</span>
              </p>
            </div>
          </Card>

          {/* The Banana Throw */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 24px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: accent }}>Pose 04</span>
              <FoxThrowing size={180} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginTop: 8 }}>The Outsmart</h3>
              <p style={{ fontSize: 13, color: textSecondary, textAlign: "center" as const, maxWidth: 300, lineHeight: 1.6 }}>
                Throwing a banana, looking back with a smirk. THE viral pose. <br />
                <span style={{ color: textMuted }}>&ldquo;Sales Ape never saw it coming.&rdquo;</span>
              </p>
            </div>
          </Card>
        </div>

        {/* ═══════ SECTION 2: LOGO LOCKUPS ═══════ */}
        <SectionHeader title="Logo Lockups" subtitle="How the fox mark + wordmark work together at different sizes." color={textPrimary} muted={textMuted} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
          {/* Icon + Wordmark horizontal */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 1.5, textTransform: "uppercase" as const }}>Horizontal</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FoxMark size={40} color={accent} />
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: textPrimary }}>
                  Call<span style={{ color: accent }}>Fox</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6 }}>
                <FoxMark size={24} color={accent} />
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: textPrimary }}>
                  Call<span style={{ color: accent }}>Fox</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Stacked */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 1.5, textTransform: "uppercase" as const }}>Stacked</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <FoxMark size={52} color={accent} />
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: textPrimary }}>
                  Call<span style={{ color: accent }}>Fox</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Icon only — app icons, favicons */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px 24px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 1.5, textTransform: "uppercase" as const }}>Icon Only</span>
              <div style={{ display: "flex", gap: 16, alignItems: "end" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}>
                  <FoxMark size={38} color="white" />
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FoxMark size={28} color={accent} />
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FoxMark size={20} color="white" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ═══════ SECTION 3: TYPOGRAPHY ═══════ */}
        <SectionHeader title="Wordmark Styles" subtitle="Different typographic treatments for different contexts." color={textPrimary} muted={textMuted} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginBottom: 64 }}>
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 24px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: textMuted, letterSpacing: 1.5, textTransform: "uppercase" as const }}>Primary</span>
              <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: textPrimary }}>
                Call<span style={{ color: accent }}>Fox</span>
              </span>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: textPrimary }}>
                call<span style={{ color: accent }}>fox</span><span style={{ fontWeight: 400, color: textMuted }}>.ai</span>
              </span>
            </div>
          </Card>

          <Card bg={isDark ? "#0A0B0F" : "#0F1117"} border="rgba(255,255,255,0.08)" isDark={true}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 24px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase" as const }}>Premium Dark</span>
              <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: "#F1F1F3" }}>
                Call<span style={{ color: "#F59E0B" }}>Fox</span>
              </span>
              <span style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#F59E0B" }}>
                CallFox
              </span>
            </div>
          </Card>
        </div>

        {/* ═══════ SECTION 4: CONTENT SCENARIOS ═══════ */}
        <SectionHeader title="Content Scenarios" subtitle="How the character shows up in actual marketing content." color={textPrimary} muted={textMuted} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 64 }}>

          {/* TikTok storyboard */}
          <Card bg={cardBg} border={cardBorder} isDark={isDark}>
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" as const, color: accent }}>TikTok Storyboard</span>
                <span style={{ fontSize: 11, color: textMuted }}>&mdash; &ldquo;The Banana Incident&rdquo;</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { frame: "1", desc: "Sales Ape charges at CallFox, angry, chest-beating", emotion: "Ape: furious" },
                  { frame: "2", desc: "CallFox doesn't even flinch. One eyebrow raised. Reaches behind back.", emotion: "Fox: amused" },
                  { frame: "3", desc: "CallFox casually tosses a banana to the side. Ape's eyes go wide.", emotion: "Fox: smirking" },
                  { frame: "4", desc: "Ape chases banana. Fox turns to camera, winks. 'callfox.ai' appears.", emotion: "Fox: wink + smirk" },
                ].map((s) => (
                  <div key={s.frame} style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderRadius: 12, padding: 16, border: `1px solid ${cardBorder}` }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: accent, marginBottom: 8 }}>{s.frame}</div>
                    <p style={{ fontSize: 12, color: textPrimary, lineHeight: 1.5, marginBottom: 8 }}>{s.desc}</p>
                    <span style={{ fontSize: 10, color: textMuted, fontStyle: "italic" }}>{s.emotion}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* More scenario cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            <Card bg={cardBg} border={cardBorder} isDark={isDark}>
              <div style={{ padding: "24px", textAlign: "center" as const }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>App Store Listing</h4>
                <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
                  Confident Fox as the icon. &ldquo;Your calls, outsmarted.&rdquo; Instantly recognizable in a sea of boring SaaS icons.
                </p>
              </div>
            </Card>
            <Card bg={cardBg} border={cardBorder} isDark={isDark}>
              <div style={{ padding: "24px", textAlign: "center" as const }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎥</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Video AI Avatar</h4>
                <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
                  Animated CallFox as your video spokesperson. These poses become keyframes. The smirk, the throw, the lean — all animatable.
                </p>
              </div>
            </Card>
            <Card bg={cardBg} border={cardBorder} isDark={isDark}>
              <div style={{ padding: "24px", textAlign: "center" as const }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧢</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Merch & Stickers</h4>
                <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>
                  Cool Fox with sunglasses on hats. Scheming Fox sticker pack. Banana-throw as a GIF reaction. The character IS the merch.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* ═══════ SECTION 5: PERSONALITY GUIDE ═══════ */}
        <SectionHeader title="Character Personality" subtitle="Who IS CallFox? The voice, the attitude, the vibe." color={textPrimary} muted={textMuted} />

        <Card bg={cardBg} border={cardBorder} isDark={isDark}>
          <div style={{ padding: "40px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: accent, marginBottom: 16 }}>CallFox IS:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "The friend who always has a plan",
                  "Confident but not arrogant — earned, not entitled",
                  "Quick-witted, always has a comeback",
                  "Calm under pressure (never panics on a call)",
                  "The one who outworks AND outsmarks everyone",
                  "Loyal — once you're in, Fox has your back",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: accent, fontWeight: 800 }}>+</span>
                    <span style={{ fontSize: 14, color: textPrimary, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#EF4444", marginBottom: 16 }}>CallFox is NOT:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Cute, cuddly, or soft (this isn't a plush toy)",
                  "Mean-spirited (wins through brains, not cruelty)",
                  "Corporate or generic (no stock-photo energy)",
                  "Desperate (never begs — the product speaks)",
                  "Complicated (simple, clean, instantly readable)",
                  "A follower (sets trends, doesn't chase them)",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#EF4444", fontWeight: 800 }}>&times;</span>
                    <span style={{ fontSize: 14, color: textPrimary, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "0 40px 40px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: textPrimary, marginBottom: 16 }}>Voice & Tone Examples</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { context: "Missed call notification", line: "While you were sleeping, I closed 3 leads. You're welcome." },
                { context: "Competitor comparison", line: "They answer calls. I outsmart them. There's a difference." },
                { context: "Onboarding welcome", line: "Smart move. Let's set me up — I work fast." },
                { context: "Error / downtime", line: "Even foxes take a breath. Back in 60 seconds." },
                { context: "Holiday email", line: "Taking the day off? Cool. I'm not. Happy holidays from your busiest employee." },
                { context: "Social media bio", line: "AI that answers calls so well, your customers think I'm human. I'm not. I'm better." },
              ].map((v, i) => (
                <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderRadius: 12, padding: 16, border: `1px solid ${cardBorder}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase" as const, letterSpacing: 1 }}>{v.context}</span>
                  <p style={{ fontSize: 13, color: textPrimary, lineHeight: 1.5, marginTop: 8, fontStyle: "italic" }}>&ldquo;{v.line}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ═══════ COLOR PALETTE ═══════ */}
        <div style={{ marginTop: 64, padding: "40px 0", borderTop: `1px solid ${cardBorder}` }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: textPrimary, marginBottom: 24 }}>Brand Colors</h2>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12 }}>
            {[
              { color: "#F97316", label: "Fox Orange", hex: "#F97316" },
              { color: "#EA580C", label: "Deep Fur", hex: "#EA580C" },
              { color: "#FED7AA", label: "Underbelly", hex: "#FED7AA" },
              { color: "#C2410C", label: "Brow Line", hex: "#C2410C" },
              { color: "#0F1117", label: "Night", hex: "#0F1117" },
              { color: "#1E293B", label: "Eyes", hex: "#1E293B" },
              { color: "#F59E0B", label: "Gold Accent", hex: "#F59E0B" },
              { color: "#FDE047", label: "Banana Yellow", hex: "#FDE047" },
            ].map((c) => (
              <div key={c.hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: c.color, border: `1px solid ${cardBorder}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{c.label}</span>
                <span style={{ fontSize: 10, color: textMuted, fontFamily: "monospace" }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Reusable Components ─── */

function SectionHeader({ title, subtitle, color, muted }: { title: string; subtitle: string; color: string; muted: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: "-0.02em", marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 14, color: muted }}>{subtitle}</p>
    </div>
  );
}

function Card({ children, bg, border, isDark }: { children: React.ReactNode; bg: string; border: string; isDark: boolean }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", transition: "all 0.2s" }}>
      {children}
    </div>
  );
}
