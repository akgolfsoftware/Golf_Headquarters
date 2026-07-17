"use client";

/**
 * Onboarding-wizard — mobil-først felt- og valg-byggeklosser (430px).
 * v2-port 16. juli 2026 (retning C «Presis»): restylet IN PLACE til
 * v2-tokens (T fra @/lib/v2/tokens) — samme eksporterte navn og
 * prop-signaturer som før, så wizard-filene er UENDRET. Inndatafeltene
 * følger FELT-idiomet fra src/components/v2/skjema.tsx, valg-kortene følger
 * ValgKort/RadioGruppe-idiomet (valgt = lime kant, panel3), pillene følger
 * FilterChips-idiomet (valgt = lime m/ onLime).
 *
 * Ren presentasjon — ingen logikk endret. Ingen rå hex (kun T-tokens +
 * rgba/color-mix). Ingen emoji — kun lucide-react.
 */

import { Check, Info, type LucideIcon } from "lucide-react";
import { T } from "@/lib/v2/tokens";
import { cn } from "@/lib/utils";

// Placeholder-farge + siste-rad-regler kan ikke settes inline — injiseres én
// gang (samme idiom som core.tsx/skjema.tsx sine ensureStyles).
function ensureFeltStyles(): void {
  if (typeof document === "undefined" || document.getElementById("v2-obfelt-style")) return;
  const el = document.createElement("style");
  el.id = "v2-obfelt-style";
  el.textContent =
    `.obf-input::placeholder{color:var(--v2-mut);opacity:1;}` +
    `.obf-sumrow:last-child{border-bottom:none;padding-bottom:0;}`;
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensureFeltStyles();

const CAPS: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: T.mut,
};

// ── Felt-label + input ──────────────────────────────────────────
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)} style={{ gap: 7 }}>
      <label htmlFor={htmlFor} style={CAPS}>
        {label}
        {hint && (
          <span
            style={{
              marginLeft: 7,
              fontFamily: T.mono,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "none",
              color: T.mut,
              opacity: 0.85,
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function TextField(
  props: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean },
) {
  const { mono, className, style, ...rest } = props;
  return (
    <input
      className={cn("obf-input v2-focus", className)}
      style={{
        width: "100%",
        boxSizing: "border-box",
        appearance: "none",
        height: 44,
        background: T.panel2,
        border: `1px solid ${T.borderS}`,
        borderRadius: 11,
        padding: "0 13px",
        fontFamily: mono ? T.mono : T.ui,
        fontVariantNumeric: mono ? "tabular-nums" : undefined,
        fontSize: 13.5,
        color: T.fg,
        outline: "none",
        lineHeight: 1.4,
        ...style,
      }}
      {...rest}
    />
  );
}

// ── Hero-illo (kun steg 1) — forest-merkevarekort på v2-flaten ──
export function HeroIllo({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        height: 88,
        overflow: "hidden",
        borderRadius: 16,
        background: T.forest,
        padding: "8px 12px",
      }}
    >
      {/* diagonal-stripe-overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 12px, rgba(255,255,255,0.9) 12px 24px)",
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(255,255,255,0.14)",
          fontFamily: T.disp,
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
        }}
      >
        ak
      </span>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          marginLeft: "auto",
          fontFamily: T.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Info-banner (mindreårig-note): panel + 3px lime venstrekant ─
export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "14px 1fr",
        gap: 8,
        borderRadius: 11,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.lime}`,
        padding: "10px 12px",
      }}
    >
      <Info size={14} strokeWidth={1.75} style={{ marginTop: 2, color: T.lime }} aria-hidden />
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.55, color: T.fg }}>
        {children}
      </p>
    </div>
  );
}

// ── Seksjons-eyebrow inne i steg-body ───────────────────────────
export function FieldGroupLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ ...CAPS, display: "block" }}>{children}</span>;
}

// ── Valg-kort (ValgKort-idiom: ikon-kvadrat + tittel + check-sirkel) ─
function CheckCircle({ selected }: { selected: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        flex: "none",
        borderRadius: 9999,
        background: selected ? T.lime : "transparent",
        border: `1.5px solid ${selected ? T.lime : T.borderS}`,
        color: selected ? T.onLime : "transparent",
      }}
    >
      {selected && <Check size={13} strokeWidth={2.5} aria-hidden />}
    </span>
  );
}

function IkonKvadrat({ icon: Icon, selected }: { icon: LucideIcon; selected: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 12,
        background: selected ? `color-mix(in srgb, ${T.lime} 14%, transparent)` : T.panel3,
        color: selected ? T.lime : T.fg2,
      }}
    >
      <Icon size={21} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

const VALGKORT: React.CSSProperties = {
  appearance: "none",
  display: "flex",
  alignItems: "center",
  gap: 13,
  width: "100%",
  borderRadius: 14,
  padding: "13px 15px",
  textAlign: "left",
  cursor: "pointer",
};

export function OptionRow({
  label,
  sub,
  trailing,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  trailing?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        ...VALGKORT,
        background: selected ? T.panel3 : T.panel2,
        border: `1px solid ${selected ? T.lime : T.border}`,
      }}
    >
      {Icon && <IkonKvadrat icon={Icon} selected={selected} />}
      <span style={{ minWidth: 0, flex: 1, lineHeight: 1.3 }}>
        <span style={{ display: "block", fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
          {label}
        </span>
        {sub && (
          <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            {sub}
          </span>
        )}
      </span>
      {trailing && (
        <span
          style={{
            flex: "none",
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: selected ? T.lime : T.fg,
          }}
        >
          {trailing}
        </span>
      )}
      <CheckCircle selected={selected} />
    </button>
  );
}

// ── Multi-pill toggle (sesongmål, preferanser) — FilterChips-idiom ─
export function PillToggle({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 12px",
        borderRadius: 9999,
        background: selected ? T.lime : T.panel3,
        border: `1px solid ${selected ? "transparent" : T.borderS}`,
        color: selected ? T.onLime : T.fg2,
        fontFamily: T.mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
        cursor: "pointer",
      }}
    >
      {Icon && <Icon size={12} strokeWidth={1.75} aria-hidden />}
      {label}
    </button>
  );
}

// ── Profil-bryter-kort (mosjon / konkurranse) ───────────────────
export function ProfileCard({
  name,
  desc,
  icon: Icon,
  selected,
  onClick,
}: {
  name: string;
  desc: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        borderRadius: 13,
        padding: "12px 8px",
        textAlign: "center",
        cursor: "pointer",
        background: selected ? T.panel3 : T.panel2,
        border: `1px solid ${selected ? T.lime : T.border}`,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: selected ? `color-mix(in srgb, ${T.lime} 14%, transparent)` : T.panel3,
          color: selected ? T.lime : T.mut,
        }}
      >
        <Icon size={15} strokeWidth={1.75} aria-hidden />
      </span>
      <span style={{ fontFamily: T.disp, fontSize: 12.5, fontWeight: 700, letterSpacing: "-0.015em", color: T.fg }}>
        {name}
      </span>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: "0.04em",
          lineHeight: 1.4,
          color: T.mut,
        }}
      >
        {desc}
      </span>
    </button>
  );
}

// ── Implikasjons-banner (lime-tint, aldri ropende) ──────────────
export function ImplicationBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 10,
        background: `color-mix(in srgb, ${T.lime} 12%, transparent)`,
        padding: "8px 12px",
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        lineHeight: 1.7,
        color: T.lime,
      }}
    >
      {children}
    </div>
  );
}

// ── Fasilitet-rad (samme valg-kort-utseende, multi-select) ──────
export function FacilityRow({
  name,
  sub,
  icon: Icon,
  selected,
  onClick,
}: {
  name: string;
  sub?: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        ...VALGKORT,
        background: selected ? T.panel3 : T.panel2,
        border: `1px solid ${selected ? T.lime : T.border}`,
      }}
    >
      <IkonKvadrat icon={Icon} selected={selected} />
      <span style={{ minWidth: 0, flex: 1, lineHeight: 1.3 }}>
        <span style={{ display: "block", fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
          {name}
        </span>
        {sub && (
          <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            {sub}
          </span>
        )}
      </span>
      <CheckCircle selected={selected} />
    </button>
  );
}

// ── Frekvens — segmentert kontroll (mono-tall) ──────────────────
export function FrequencySegment({
  options,
  value,
  onChange,
  unit,
}: {
  options: number[];
  value: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        padding: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            fontVariantNumeric: "tabular-nums",
            color: T.fg,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>
            {unit}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {options.map((n) => {
          const on = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={on}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                height: 36,
                flex: 1,
                borderRadius: 9,
                border: "1px solid transparent",
                fontFamily: T.mono,
                fontSize: 13,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                cursor: "pointer",
                background: on ? T.lime : T.panel3,
                color: on ? T.onLime : T.fg2,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Coach-kort ──────────────────────────────────────────────────
export function CoachCard({
  initials,
  name,
  role,
  meta,
  selected,
  onClick,
}: {
  initials: string;
  name: string;
  role: string;
  meta: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        position: "relative",
        appearance: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        borderRadius: 13,
        padding: "12px 14px",
        textAlign: "left",
        cursor: "pointer",
        background: selected ? T.panel3 : T.panel2,
        border: `1px solid ${selected ? T.lime : T.border}`,
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            borderRadius: 4,
            background: T.lime,
            padding: "2px 6px",
            fontFamily: T.mono,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.onLime,
          }}
        >
          Valgt
        </span>
      )}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          flex: "none",
          borderRadius: 9999,
          background: selected ? T.lime : T.panel3,
          border: `1px solid ${selected ? "transparent" : T.border}`,
          fontFamily: T.mono,
          fontSize: 13,
          fontWeight: 700,
          color: selected ? T.onLime : T.fg2,
        }}
      >
        {initials}
      </span>
      <span style={{ minWidth: 0, lineHeight: 1.3 }}>
        <span style={{ display: "block", fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.015em", color: T.fg }}>
          {name}
        </span>
        <span style={{ ...CAPS, display: "block", marginTop: 2, fontSize: 9 }}>{role}</span>
        <span style={{ display: "block", marginTop: 2, fontFamily: T.ui, fontSize: 11, lineHeight: 1.45, color: T.mut }}>
          {meta}
        </span>
      </span>
    </button>
  );
}

// ── Abonnement-kort ─────────────────────────────────────────────
export function PlanCard({
  tier,
  price,
  per,
  features,
  footnote,
  recommended,
  selected,
  onClick,
}: {
  tier: string;
  price: string;
  per?: string;
  features: string[];
  footnote?: string;
  recommended?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="v2-press v2-focus"
      style={{
        position: "relative",
        appearance: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderRadius: 14,
        padding: "15px 16px",
        textAlign: "left",
        cursor: "pointer",
        background: selected ? T.panel3 : T.panel2,
        border: `1px solid ${selected ? T.lime : T.border}`,
      }}
    >
      {recommended && selected && (
        <span
          style={{
            position: "absolute",
            top: -9,
            right: 14,
            borderRadius: 4,
            background: T.lime,
            padding: "2px 6px",
            fontFamily: T.mono,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.onLime,
          }}
        >
          Anbefalt
        </span>
      )}
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: selected ? T.lime : T.mut,
        }}
      >
        {tier}
      </span>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: T.fg,
        }}
      >
        {price}
        {per && <span style={{ marginLeft: 4, fontSize: 12.5, fontWeight: 500, color: T.mut }}>{per}</span>}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {features.map((f) => (
          <span
            key={f}
            style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: T.ui, fontSize: 12, lineHeight: 1.45, color: T.fg2 }}
          >
            <Check size={12} strokeWidth={2} style={{ marginTop: 3, flex: "none", color: T.up }} aria-hidden />
            {f}
          </span>
        ))}
      </span>
      {footnote && (
        <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{footnote}</span>
      )}
    </button>
  );
}

// ── Oppsummering (siste sjekk) ──────────────────────────────────
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="obf-sumrow"
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "9px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <span style={{ ...CAPS, flex: "none", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ textAlign: "right", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
        {value}
      </span>
    </div>
  );
}

export function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        background: T.panel2,
        border: `1px solid ${T.border}`,
        padding: "15px 16px",
      }}
    >
      <span style={{ ...CAPS, display: "block", marginBottom: 6 }}>Du har valgt</span>
      {children}
    </div>
  );
}

// ── Samtykke-rad (checkbox-kort, Avkryssing-idiom) ──────────────
export function AgreeItem({
  title,
  desc,
  checked,
  onClick,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        display: "flex",
        alignItems: "flex-start",
        gap: 11,
        width: "100%",
        borderRadius: 13,
        padding: "13px 15px",
        textAlign: "left",
        cursor: "pointer",
        background: checked ? T.panel3 : T.panel2,
        border: `1px solid ${checked ? T.lime : T.border}`,
      }}
    >
      <span
        style={{
          marginTop: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          flex: "none",
          borderRadius: 6,
          background: checked ? T.lime : T.panel2,
          border: `1px solid ${checked ? "transparent" : T.borderS}`,
          color: T.onLime,
        }}
      >
        {checked && <Check size={13} strokeWidth={2.5} aria-hidden />}
      </span>
      <span style={{ lineHeight: 1.4 }}>
        <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
          {title}
        </span>
        <span style={{ display: "block", marginTop: 2, fontFamily: T.ui, fontSize: 12, lineHeight: 1.5, color: T.mut }}>
          {desc}
        </span>
      </span>
    </button>
  );
}

// ── Sikkerhets-strip (lime-tint, GDPR) ──────────────────────────
export function SecurityStrip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid color-mix(in srgb, ${T.lime} 40%, transparent)`,
        background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
        padding: "11px 15px",
        fontFamily: T.ui,
        fontSize: 12.5,
        lineHeight: 1.55,
        color: T.fg,
      }}
    >
      {children}
    </div>
  );
}
