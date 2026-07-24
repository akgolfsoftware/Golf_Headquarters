"use client";

/* AK Golf HQ v2 — SAMTALE (retning C «Presis»). Chat-primitiver for AI-coach:
   identitetsmerke, meldingsbobler, «skriver»-indikator, skrivefelt (komposisjon)
   og forslags-chips. Mønsteret finnes ikke i kjernebiblioteket (chat er en egen
   flate) — komponert her etter Anders' mandat (skreddersy komponent for dataene,
   aldri ad-hoc i skjermfil). Kun T.*-tokens; ingen rå hex. */

import type { ReactNode } from "react";
import { useRef } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

/* Blink-keyframes for «skriver»-prikkene (.v2-blink) bor statisk i
   src/styles/v2/motion.css (FASIT §4b). */

/* AI-avatar — sparkle i mørk skive med lime-prikk (assistent-identitet). */
function AiSkive({ size = 34 }: { size?: number }) {
  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 9999,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name="sparkles" size={Math.round(size * 0.45)} style={{ color: T.lime }} />
    </span>
  );
}

/* ── Identitetsmerke ──────────────────────────────────── */
export interface AiMerkeProps {
  navn?: ReactNode;
  sub?: ReactNode;
}
export function AiMerke({ navn = "AI-coach", sub = "Personlig kontekst" }: AiMerkeProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      <span style={{ position: "relative", flex: "none" }}>
        <AiSkive size={40} />
        <span style={{ position: "absolute", right: -2, bottom: -2, width: 13, height: 13, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}` }} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{navn}</div>
        <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── Melding ──────────────────────────────────────────── */
export type SamtaleRolle = "user" | "assistant";
export interface SamtaleBobleProps {
  rolle: SamtaleRolle;
  initialer?: string;
  children?: ReactNode;
}
export function SamtaleBoble({ rolle, initialer = "DU", children }: SamtaleBobleProps) {
  const bruker = rolle === "user";
  const avatar = bruker ? (
    <span style={{ width: 34, height: 34, borderRadius: 9999, background: T.lime, color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, flex: "none" }}>{initialer}</span>
  ) : (
    <AiSkive size={34} />
  );
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: bruker ? "flex-end" : "flex-start" }}>
      {!bruker && avatar}
      <div
        style={{
          maxWidth: "86%",
          background: bruker ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : T.panel2,
          border: `1px solid ${bruker ? `color-mix(in srgb, ${T.lime} 22%, transparent)` : T.border}`,
          borderRadius: 16,
          borderBottomRightRadius: bruker ? 5 : 16,
          borderBottomLeftRadius: bruker ? 16 : 5,
          padding: "12px 14px",
          fontFamily: T.ui,
          fontSize: 14,
          lineHeight: 1.55,
          color: T.fg,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {children}
      </div>
      {bruker && avatar}
    </div>
  );
}

/* «Skriver …»-indikator (assistent tenker). */
export function SamtaleSkriver() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AiSkive size={34} />
      <div style={{ display: "inline-flex", gap: 5, alignItems: "center", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 16, borderBottomLeftRadius: 5, padding: "15px 16px" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="v2-blink" style={{ width: 6, height: 6, borderRadius: 9999, background: T.mut, animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
    </div>
  );
}

/* ── Feilbånd ─────────────────────────────────────────── */
export interface SamtaleFeilProps {
  children?: ReactNode;
}
export function SamtaleFeil({ children }: SamtaleFeilProps) {
  return (
    <div
      role="alert"
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 10, background: `color-mix(in srgb, ${T.down} 12%, transparent)`, border: `1px solid ${`color-mix(in srgb, ${T.down} 30%, transparent)`}`, fontFamily: T.ui, fontSize: 12.5, color: T.down, lineHeight: 1.5 }}
    >
      <Icon name="x-circle" size={14} style={{ color: T.down, flex: "none", marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

/* ── Skrivefelt (komposisjon) ─────────────────────────── */
export interface SkrivefeltProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sender?: boolean;
  placeholder?: string;
}
export function Skrivefelt({ value, onChange, onSend, sender, placeholder = "Spør AI-coach …" }: SkrivefeltProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const kanSende = value.trim().length > 0 && !sender;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 44px", gap: 8, alignItems: "end", background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 6 }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (kanSende) onSend();
          }
        }}
        placeholder={placeholder}
        rows={1}
        disabled={sender}
        style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: T.fg, fontFamily: T.ui, fontSize: 14, lineHeight: 1.5, padding: "9px 10px", minHeight: 40, maxHeight: 140 }}
      />
      <button
        type="button"
        onClick={() => kanSende && onSend()}
        disabled={!kanSende}
        aria-label="Send"
        className="v2-press v2-focus"
        style={{ width: 44, height: 40, borderRadius: 10, border: "none", background: kanSende ? T.lime : T.panel3, color: kanSende ? T.onLime : T.mut, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: kanSende ? "pointer" : "default" }}
      >
        <Icon name="send" size={17} />
      </button>
    </div>
  );
}

/* ── Forslags-chips ───────────────────────────────────── */
export interface ForslagRadProps {
  items: string[];
  onPick: (s: string) => void;
  /** true → sentrert uten «Forslag»-etikett (brukes i tom-tilstand). */
  sentrert?: boolean;
}
export function ForslagRad({ items, onPick, sentrert }: ForslagRadProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: sentrert ? "center" : "flex-start" }}>
      {!sentrert && (
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, marginRight: 2 }}>Forslag</span>
      )}
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 12.5, fontWeight: 500, color: T.fg, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "7px 13px", whiteSpace: "nowrap" }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
