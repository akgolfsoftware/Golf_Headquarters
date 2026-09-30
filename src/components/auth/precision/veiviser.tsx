"use client";

/**
 * Veiviser (oppstart) i Precision Athletics. Erstatter wizard-chrome.tsx og
 * wizard-fields.tsx for /auth/onboarding og /auth/onboarding/forelder, med
 * samme eksportnavn og prop-signaturer, så steg-logikken i wizardene er
 * uendret. Tegning: 7d7c2994, ui_kits/konto/screens/AU-04-spiller.jsx
 * (fire pikslers stegstrek, mono-meta over tittelen, grafitt primærknapp,
 * kortrader med ink-kant for valgt).
 *
 * De gamle filene står urørt fordi /inviter/forelder fortsatt bruker dem.
 */
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { ArrowRight, Check, ChevronLeft, Home, Plus, ShieldCheck, Sun, Trash2, type LucideIcon } from "lucide-react";
import { Ikon, Knapp, Meta } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { AuthFlate } from "./AuthFlate";

/* ---------- Chrome ---------- */

export function VeiviserFlate({ children }: { children: ReactNode }) {
  return <AuthFlate max={560}>{children}</AuthFlate>;
}

/** Fire pikslers stegstrek med mono-meta («SPILLER · STEG 2 AV 7»). */
export function ProgressDots({ total, current, etikett, valgfri }: { total: number; current: number; etikett?: string; valgfri?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="group" aria-label={`Steg ${current} av ${total}`}>
      <Meta>{(etikett ? etikett + " · " : "") + `STEG ${current} AV ${total}` + (valgfri ? " · KAN HOPPES OVER" : "")}</Meta>
      <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`, gap: 4 }}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} style={{ height: 4, background: i < current ? "var(--primary)" : "var(--surface-sunken)" }} />
        ))}
      </div>
    </div>
  );
}

export function StepHeader({ eyebrow, onBack, canGoBack, disabled }: { step?: number; total?: number; eyebrow: string; onBack: () => void; canGoBack: boolean; disabled?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 44 }}>
      {canGoBack ? (
        <Knapp variant="ghost" size="sm" icon={ChevronLeft} onClick={onBack} disabled={disabled}>Tilbake</Knapp>
      ) : (
        <Meta>{eyebrow.toUpperCase()}</Meta>
      )}
    </div>
  );
}

export function StepHeading({ eyebrow, title, emphasis, titleAfter, deck }: { eyebrow?: string; title: string; emphasis?: string; titleAfter?: string; deck?: ReactNode; center?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {eyebrow && <span className="kicker">{eyebrow}</span>}
      <h1 style={{ margin: 0, font: "600 26px/1.2 var(--font-sans)", color: "var(--text-primary)", textWrap: "balance", overflowWrap: "anywhere" }}>
        {title}{emphasis ? ` ${emphasis}` : ""}{titleAfter ?? ""}
      </h1>
      {deck && <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" }}>{deck}</p>}
    </div>
  );
}

export function PrimaryCta({ children, onClick, disabled, icon = ArrowRight, onBack, backDisabled }: { children: ReactNode; onClick: () => void; disabled?: boolean; icon?: LucideIcon; onBack?: () => void; backDisabled?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {onBack && <Knapp variant="ghost" size="lg" onClick={onBack} disabled={backDisabled}>Tilbake</Knapp>}
      <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex" }}>
        <Knapp size="lg" fullWidth iconRight={icon} onClick={onClick} disabled={disabled}>{children}</Knapp>
      </div>
    </div>
  );
}

export function SecondaryLink({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return <Knapp variant="ghost" fullWidth onClick={onClick} disabled={disabled}>{children}</Knapp>;
}

/* ---------- Felt ---------- */

export function Field({ label, hint, htmlFor, children, className }: { label: string; hint?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={["pa-field", className].filter(Boolean).join(" ")}>
      <label htmlFor={htmlFor} className="pa-field__label">{label}</label>
      {children}
      {hint && <span className="pa-field__hint">{hint}</span>}
    </div>
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  const { mono, className, style, ...rest } = props;
  const { width, textAlign } = (style ?? {}) as CSSProperties;
  return (
    <span className={["pa-control", mono && "pa-control--mono", className].filter(Boolean).join(" ")} style={width ? { width, flex: "none" } : undefined}>
      <input style={textAlign ? { textAlign } : undefined} {...rest} />
    </span>
  );
}

export function HeroIllo({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 56, padding: "0 16px", borderRadius: "var(--radius)", background: "var(--surface-inverse)", color: "var(--text-inverse)" }}>
      <span style={{ font: "var(--type-meta)", letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export function InfoNote({ children }: { children: ReactNode }) {
  return <InlineVarsel tone="info">{children}</InlineVarsel>;
}

export function ImplicationBanner({ children }: { children: ReactNode }) {
  return <InlineVarsel tone="info">{children}</InlineVarsel>;
}

export function FieldGroupLabel({ children }: { children: ReactNode }) {
  return <span className="pa-field__label">{children}</span>;
}

export function SecurityStrip({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
      <Ikon icon={ShieldCheck} size={18} />
      <span style={{ minWidth: 0, textWrap: "pretty" }}>{children}</span>
    </div>
  );
}

/* ---------- Valgkort ---------- */

function Indikator({ type, selected }: { type: "radio" | "checkbox"; selected: boolean }) {
  if (type === "radio") {
    return <span aria-hidden style={{ width: 18, height: 18, flex: "none", borderRadius: 999, border: "2px solid var(--text-primary)", boxShadow: selected ? "inset 0 0 0 3px var(--surface-card), inset 0 0 0 9px var(--text-primary)" : "none" }} />;
  }
  return (
    <span aria-hidden style={{ width: 20, height: 20, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 4, border: "1px solid " + (selected ? "var(--primary)" : "var(--border-control)"), background: selected ? "var(--primary)" : "var(--surface-card)", color: "var(--text-on-primary)" }}>
      {selected && <Check size={14} strokeWidth={2.5} />}
    </span>
  );
}

function ValgKort({ type, selected, onClick, leading, children, trailing, align = "center" }: { type: "radio" | "checkbox"; selected: boolean; onClick: () => void; leading?: ReactNode; children: ReactNode; trailing?: ReactNode; align?: "center" | "flex-start" }) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={selected}
      onClick={onClick}
      style={{
        all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", minHeight: 56, padding: "12px 14px",
        display: "flex", alignItems: align, gap: 12, textAlign: "left", minWidth: 0,
        background: "var(--surface-card)", color: "var(--text-primary)", borderRadius: "var(--radius)",
        border: "1px solid " + (selected ? "var(--border-ink)" : "var(--border-hairline)"),
        boxShadow: selected ? "inset 0 0 0 1px var(--border-ink)" : "none",
      }}
    >
      <Indikator type={type} selected={selected} />
      {leading}
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>{children}</span>
      {trailing}
    </button>
  );
}

const tittelStil: CSSProperties = { font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" };
const underStil: CSSProperties = { font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" };

export function OptionRow({ label, sub, trailing, icon, selected, onClick }: { label: string; sub?: string; trailing?: string; icon?: LucideIcon; selected: boolean; onClick: () => void }) {
  return (
    <ValgKort type="radio" selected={selected} onClick={onClick} leading={icon && <Ikon icon={icon} size={20} />} trailing={trailing && <Meta>{trailing}</Meta>}>
      <span style={tittelStil}>{label}</span>
      {sub && <span style={underStil}>{sub}</span>}
    </ValgKort>
  );
}

export function ProfileCard({ name, desc, icon, selected, onClick }: { name: string; desc: string; icon: LucideIcon; selected: boolean; onClick: () => void }) {
  return (
    <ValgKort type="radio" selected={selected} onClick={onClick} leading={<Ikon icon={icon} size={20} />}>
      <span style={tittelStil}>{name}</span>
      <span style={underStil}>{desc}</span>
    </ValgKort>
  );
}

export function FacilityRow({ name, sub, icon, selected, onClick }: { name: string; sub?: string; icon: LucideIcon; selected: boolean; onClick: () => void }) {
  return (
    <ValgKort type="checkbox" selected={selected} onClick={onClick} leading={<Ikon icon={icon} size={20} />}>
      <span style={tittelStil}>{name}</span>
      {sub && <span style={underStil}>{sub}</span>}
    </ValgKort>
  );
}

export function CoachCard({ initials, name, role, meta, selected, onClick }: { initials: string; name: string; role: string; meta: string; selected: boolean; onClick: () => void }) {
  return (
    <ValgKort
      type="radio"
      selected={selected}
      onClick={onClick}
      leading={<span aria-hidden style={{ width: 40, height: 40, flex: "none", display: "grid", placeItems: "center", borderRadius: "var(--radius)", background: "var(--surface-sunken)", font: "600 13px/1 var(--font-mono)" }}>{initials}</span>}
    >
      <span style={tittelStil}>{name}</span>
      <span style={underStil}>{role}</span>
      <Meta>{meta.toUpperCase()}</Meta>
    </ValgKort>
  );
}

export function PlanCard({ tier, price, per, features, footnote, recommended, selected, onClick }: { tier: string; price: string; per?: string; features: string[]; footnote?: string; recommended?: boolean; selected: boolean; onClick: () => void }) {
  return (
    <ValgKort type="radio" selected={selected} onClick={onClick} align="flex-start">
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "600 14px/1.2 var(--font-mono)", letterSpacing: ".08em" }}>{tier}{recommended ? " · ANBEFALT" : ""}</span>
        <span style={{ font: "var(--type-num)" }}>{price}{per ? <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}> {per}</span> : null}</span>
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {features.map((f) => <span key={f} style={underStil}>{f}</span>)}
      </span>
      {footnote && <Meta>{footnote}</Meta>}
    </ValgKort>
  );
}

export function AgreeItem({ title, desc, checked, onClick }: { title: string; desc: string; checked: boolean; onClick: () => void }) {
  return (
    <ValgKort type="checkbox" selected={checked} onClick={onClick} align="flex-start">
      <span style={tittelStil}>{title}</span>
      <span style={underStil}>{desc}</span>
    </ValgKort>
  );
}

/* ---------- Valg, rader og oppsummering ---------- */

export function PillToggle({ label, selected, onClick, icon }: { label: string; selected: boolean; onClick: () => void; icon?: LucideIcon }) {
  return (
    <button type="button" className="pa-choice" aria-pressed={selected} onClick={onClick}>
      {icon && <Ikon icon={icon} size={16} />}{label}
    </button>
  );
}

export function PlaceRow({ name, isIndoor, capabilities, capabilityOptions, onNameChange, onIndoorChange, onToggleCapability, onRemove }: { name: string; isIndoor: boolean; capabilities: string[]; capabilityOptions: { id: string; label: string }[]; onNameChange: (verdi: string) => void; onIndoorChange: (inne: boolean) => void; onToggleCapability: (id: string) => void; onRemove: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius)", background: "var(--surface-card)", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextField value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="f.eks. Gamle Fredrikstad GK" aria-label="Navn på stedet" />
        </div>
        <button type="button" className="pa-iconbtn" onClick={onRemove} aria-label={`Fjern ${name || "stedet"}`}><Ikon icon={Trash2} size={18} /></button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <PillToggle label="Ute" icon={Sun} selected={!isIndoor} onClick={() => onIndoorChange(false)} />
        <PillToggle label="Inne" icon={Home} selected={isIndoor} onClick={() => onIndoorChange(true)} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {capabilityOptions.map((c) => <PillToggle key={c.id} label={c.label} selected={capabilities.includes(c.id)} onClick={() => onToggleCapability(c.id)} />)}
      </div>
    </div>
  );
}

export function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <div><Knapp variant="secondary" icon={Plus} onClick={onClick}>{label}</Knapp></div>;
}

export function NumberRow({ label, hint, value, onChange, placeholder, id }: { label: string; hint?: string; value: string; onChange: (verdi: string) => void; placeholder?: string; id: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <label htmlFor={id} className="pa-field__label" style={{ flex: 1, minWidth: 0 }}>
        {label}{hint && <span className="pa-field__hint"> {hint}</span>}
      </label>
      <TextField id={id} mono inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "—"} style={{ width: 104, textAlign: "right" }} />
    </div>
  );
}

export function FrequencySegment({ options, value, onChange, unit }: { options: number[]; value: number; onChange: (n: number) => void; unit?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ font: "var(--type-num)", fontSize: 28 }}>{value}</span>
        {unit && <Meta>{unit.toUpperCase()}</Meta>}
      </div>
      <div className="pa-seg pa-seg--full" role="group" aria-label="Velg antall">
        {options.map((n) => <button key={n} type="button" className="pa-seg__opt" aria-pressed={value === n} onClick={() => onChange(n)}>{n}</button>)}
      </div>
    </div>
  );
}

export function SummaryCard({ children }: { children: ReactNode }) {
  return <div className="pa-card" style={{ padding: "0 16px", overflow: "hidden" }}><div style={{ marginTop: -1 }}>{children}</div></div>;
}

export function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, minHeight: 44, borderTop: "1px solid var(--border-hairline)" }}>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{value}</span>
    </div>
  );
}
