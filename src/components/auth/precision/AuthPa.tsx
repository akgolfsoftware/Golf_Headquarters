"use client";

/**
 * Felles byggeklosser for innlogging, registrering og passord (AU-01 til AU-03)
 * i Precision Athletics. Portert fra Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx (Box, H, FormField, InlineAlert).
 *
 * Bare visning: ingen innloggingslogikk bor her. Stilene kommer fra
 * precision-athletics.css (pa-*-klassene) og virker innenfor .pa-root.
 */
import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, OctagonAlert, TriangleAlert, CircleCheck, type LucideIcon } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/** Sentrert kolonne på sideflaten. Designet: maks 440 (520 for registrering). */
export function AuthRamme({ children, max = 440, natt }: { children: ReactNode; max?: number; natt?: boolean }) {
  return (
    <div
      className="pa-root"
      data-design="precision-athletics"
      data-theme={natt ? "night" : undefined}
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box", colorScheme: natt ? "dark" : "light" }}
    >
      <main
        className="au-ramme"
        style={{ width: "100%", maxWidth: max + 32, boxSizing: "border-box", padding: "clamp(24px, 6vw, 48px) 16px 40px", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}
      >
        <Link href="/" aria-label="AK Golf HQ, til forsiden" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, alignSelf: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG-logo, samme fil som skallene */}
          <img src={natt ? "/logos/logo-ak-golf-hq-negative.svg" : "/logos/logo-ak-golf-hq.svg"} alt="AK Golf HQ" height={22} style={{ height: 22, width: "auto" }} />
        </Link>
        {children}
      </main>
    </div>
  );
}

export function AuthHode({ kicker, tittel, under }: { kicker?: string; tittel: ReactNode; under?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 style={{ margin: 0, font: "600 26px/1.2 var(--font-sans)", color: "var(--text-primary)", textWrap: "balance" }}>{tittel}</h1>
      {under && <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-secondary)", textWrap: "pretty" }}>{under}</p>}
    </div>
  );
}

/** Felt med etikett, «Påkrevd», hjelpetekst og feilmelding. Passordfelt får vis/skjul. */
export function Felt({
  label, type = "text", value, onChange, autoComplete, required, error, hint, mono, placeholder, name, inputMode,
}: {
  label: string; type?: "text" | "email" | "password"; value: string; onChange: (v: string) => void;
  autoComplete?: string; required?: boolean; error?: string | null; hint?: string; mono?: boolean;
  placeholder?: string; name?: string; inputMode?: "text" | "email";
}) {
  const id = useId();
  const [vis, setVis] = useState(false);
  const erPassord = type === "password";
  const feilId = `${id}-feil`;
  return (
    <div className={cx("pa-field", error && "pa-formfield--error")}>
      <div className="pa-formfield__top">
        <label htmlFor={id} className="pa-field__label">{label}</label>
        {required && <span className="pa-formfield__req">Påkrevd</span>}
      </div>
      <div className="pa-formfield__control">
        <div className={cx("pa-control", "pa-control--lg", mono && "pa-control--mono", error && "pa-control--error")}>
          <input
            id={id}
            name={name}
            type={erPassord && vis ? "text" : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            inputMode={inputMode}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? feilId : undefined}
            autoCapitalize="none"
            spellCheck={false}
          />
          {erPassord && (
            <button
              type="button"
              onClick={() => setVis((v) => !v)}
              aria-label={vis ? "Skjul passord" : "Vis passord"}
              aria-pressed={vis}
              style={{ all: "unset", cursor: "pointer", display: "grid", placeItems: "center", width: 44, height: 44, margin: "0 -12px 0 0", color: "var(--text-muted)", flex: "none" }}
            >
              <Ikon icon={vis ? EyeOff : Eye} size={18} />
            </button>
          )}
        </div>
      </div>
      {error ? <span id={feilId} className="pa-formfield__error">{error}</span> : hint ? <span className="pa-field__hint">{hint}</span> : null}
    </div>
  );
}

const VARSEL_IKON: Record<"warn" | "ok" | "info" | "signal", LucideIcon> = { warn: TriangleAlert, ok: CircleCheck, info: CircleCheck, signal: OctagonAlert };

export function Varsel({ tone = "warn", title, children }: { tone?: "warn" | "ok" | "info" | "signal"; title?: string; children?: ReactNode }) {
  return (
    <div className={cx("pa-alert", `pa-alert--${tone}`)} role={tone === "ok" ? "status" : "alert"}>
      <Ikon icon={VARSEL_IKON[tone]} size={18} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        {title && <span className="pa-alert__title">{title}</span>}
        {children && <span style={{ overflowWrap: "anywhere" }}>{children}</span>}
      </div>
    </div>
  );
}

/** Frittstående tekstlenke med 44 px treffmål. */
export function Lenke({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, font: "500 14px/1.2 var(--font-sans)", color: "var(--link)", textDecoration: "underline", textUnderlineOffset: 3 }}>
      {children}
    </Link>
  );
}

/** Lenke i løpende tekst. */
export function LenkeTekst({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} style={{ color: "var(--link)", textDecoration: "underline", textUnderlineOffset: 3 }}>{children}</Link>;
}

/** Avkryssing i pa-check-stilen, med ekte checkbox under. */
export function Avkryssing({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="pa-check" style={{ alignItems: "flex-start", paddingTop: 10, paddingBottom: 10 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="pa-check__box" style={{ marginTop: 1 }}>{checked && <Ikon icon={Check} size={14} />}</span>
      <span style={{ minWidth: 0 }}>{children}</span>
    </label>
  );
}

/** Radiokort (pakkevalg): grafitt ramme når valgt. */
export function ValgKort({ valgt, onVelg, tittel, pris, tekst, merke }: {
  valgt: boolean; onVelg: () => void; tittel: string; pris: string; tekst: string; merke?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={valgt}
      onClick={onVelg}
      style={{
        textAlign: "left", padding: 16, borderRadius: "var(--radius)", minHeight: 44, minWidth: 0,
        border: "1px solid " + (valgt ? "var(--border-ink)" : "var(--border-hairline)"),
        boxShadow: valgt ? "inset 0 0 0 1px var(--border-ink)" : "none",
        background: "var(--surface-card)", color: "var(--text-primary)", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 6,
      }}
    >
      <span style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ font: "600 14px/1.2 var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>{tittel}</span>
        <span style={{ font: "var(--type-num)" }}>{pris}</span>
      </span>
      {merke && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{merke}</span>}
      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{tekst}</span>
    </button>
  );
}

/** Stegindikator for registrering: Pakke, Konto og samtykke, Sjekk e-post, Betaling. */
export const REGISTRER_STEG = ["Pakke", "Konto og samtykke", "Sjekk e-post", "Betaling"] as const;
export function Stegrad({ aktiv }: { aktiv: number }) {
  return (
    <ol aria-label="Steg i registreringen" style={{ display: "flex", gap: "6px 12px", flexWrap: "wrap", margin: 0, padding: 0, listStyle: "none" }}>
      {REGISTRER_STEG.map((s, i) => (
        <li key={s} aria-current={i === aktiv ? "step" : undefined} style={{ display: "inline-flex", gap: 6, alignItems: "center", font: "var(--type-meta)", letterSpacing: ".04em", color: i <= aktiv ? "var(--text-primary)" : "var(--text-muted)" }}>
          <span
            style={{
              width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", flex: "none",
              background: i < aktiv ? "var(--primary)" : "transparent", color: i < aktiv ? "var(--text-on-primary)" : "inherit",
              border: "1px solid var(--border-ink)", font: "600 11px/1 var(--font-mono)",
            }}
          >
            {i + 1}
          </span>
          {s.toUpperCase()}
        </li>
      ))}
    </ol>
  );
}
