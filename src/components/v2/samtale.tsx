"use client";

/* AK Golf HQ v2 — SAMTALE (retning C «Presis»). Chat-primitiver for AI-coach:
   identitetsmerke, meldingsbobler, «skriver»-indikator, skrivefelt (komposisjon)
   og forslags-chips. Mønsteret finnes ikke i kjernebiblioteket (chat er en egen
   flate) — komponert her etter Anders' mandat (skreddersy komponent for dataene,
   aldri ad-hoc i skjermfil). Kun T.*-tokens; ingen rå hex. */

import type { ReactNode } from "react";
import { useRef } from "react";
import { TL } from "@/lib/v2/train-lock";

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
        background: TL.dim,
        border: `1px solid ${TL.hair}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name="sparkles" size={Math.round(size * 0.45)} style={{ color: TL.fill }} />
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
        <span style={{ position: "absolute", right: -2, bottom: -2, width: 13, height: 13, borderRadius: 9999, background: TL.fill, border: `2px solid ${TL.elev}` }} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 14, color: TL.text, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{navn}</div>
        <div style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TL.mute, marginTop: 3 }}>{sub}</div>
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
    <span style={{ width: 34, height: 34, borderRadius: 9999, background: TL.fill, color: TL.onFill, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, flex: "none" }}>{initialer}</span>
  ) : (
    <AiSkive size={34} />
  );
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", justifyContent: bruker ? "flex-end" : "flex-start" }}>
      {!bruker && avatar}
      <div
        style={{
          maxWidth: "86%",
          background: bruker ? `color-mix(in srgb, ${TL.fill} 8%, transparent)` : TL.dock,
          border: `1px solid ${bruker ? `color-mix(in srgb, ${TL.fill} 22%, transparent)` : TL.hair}`,
          borderRadius: 16,
          borderBottomRightRadius: bruker ? 5 : 16,
          borderBottomLeftRadius: bruker ? 16 : 5,
          padding: "12px 14px",
          fontFamily: TL.font.sans,
          fontSize: 14,
          lineHeight: 1.55,
          color: TL.text,
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
      <div style={{ display: "inline-flex", gap: 5, alignItems: "center", background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 16, borderBottomLeftRadius: 5, padding: "15px 16px" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="v2-blink" style={{ width: 6, height: 6, borderRadius: 9999, background: TL.mute, animationDelay: `${i * 160}ms` }} />
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
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 12px", borderRadius: 10, background: `color-mix(in srgb, ${TL.danger} 12%, transparent)`, border: `1px solid ${`color-mix(in srgb, ${TL.danger} 30%, transparent)`}`, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger, lineHeight: 1.5 }}
    >
      <Icon name="x-circle" size={14} style={{ color: TL.danger, flex: "none", marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

/* ── Send-knapp (delt) ────────────────────────────────────
   Fasitens `.sendbtn` (playerhq-chat-mobil.html · agencyos-konsoll-mobil.html):
   rund, blekkfylt knapp med pil — ikke papirfly, som leses som «send e-post».
   Lå inline i PortalChatHjem etter PP-1.1 (PR #428); løftet hit 12.08 fordi
   signeringen fant SAMME avvik på konsollen (PP-2.1). Fikslista: «Én
   komponentfiks dekker begge.» */
export interface SendKnappProps {
  onClick: () => void;
  /** false ⇒ dempet flate og ingen peker (tomt felt, sender, eller ikke tillatt). */
  aktiv: boolean;
  /** Fasitens tap-mål er 44; konsollens composer bruker 48. */
  storrelse?: number;
}
export function SendKnapp({ onClick, aktiv, storrelse = 44 }: SendKnappProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!aktiv}
      aria-label="Send"
      data-od-id="send-message"
      className="v2-press v2-focus"
      style={{
        flex: "none",
        width: storrelse,
        height: storrelse,
        minHeight: storrelse,
        borderRadius: 9999,
        border: "none",
        background: aktiv ? TL.text : TL.dim,
        color: aktiv ? TL.scene : TL.mute,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: aktiv ? "pointer" : "default",
      }}
    >
      <Icon name="arrow-right" size={18} />
    </button>
  );
}

/* ── Skrivefelt (komposisjon) ─────────────────────────── */
export interface SkrivefeltProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sender?: boolean;
  placeholder?: string;
  /**
   * bare = kun textarea (Paper Hjem: ytre ramme + capture-mic eier layout).
   * default = felt + send-knapp (ink CTA, ikke lime — Paper .sendbtn).
   */
  variant?: "default" | "bare";
  /** Skjul send-knapp (når parent eier send/mic). */
  hideSend?: boolean;
}
export function Skrivefelt({
  value,
  onChange,
  onSend,
  sender,
  placeholder = "Spør om hva som helst …",
  variant = "default",
  hideSend = false,
}: SkrivefeltProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const kanSende = value.trim().length > 0 && !sender;
  const bare = variant === "bare" || hideSend;

  const ta = (
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
      data-od-id="composer-input"
      style={{
        width: "100%",
        display: "block",
        resize: "none",
        border: "none",
        outline: "none",
        background: "transparent",
        color: TL.text,
        fontFamily: TL.font.sans,
        fontSize: 15,
        lineHeight: 1.45,
        /* Paper .cbox textarea har ingen egen padding — rammen (.cbox) eier den.
           minHeight 44 = to linjer à 22px, som fasitens composer viser. */
        padding: bare ? 0 : "9px 10px",
        minHeight: 44,
        maxHeight: 110,
      }}
    />
  );

  if (bare) {
    return ta;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 44px",
        gap: 8,
        alignItems: "end",
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 6,
      }}
    >
      {ta}
      <button
        type="button"
        onClick={() => kanSende && onSend()}
        disabled={!kanSende}
        aria-label="Send"
        data-od-id="send-message"
        className="v2-press v2-focus"
        style={{
          width: 44,
          height: 44,
          borderRadius: TL.radius.row,
          border: "none",
          /* Paper .sendbtn = ink CTA, ikke lime */
          background: kanSende ? TL.text : TL.dim,
          color: kanSende ? TL.scene : TL.mute,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: kanSende ? "pointer" : "default",
        }}
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
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TL.mute, marginRight: 2 }}>Forslag</span>
      )}
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 500, color: TL.text, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 9999, padding: "7px 13px", whiteSpace: "nowrap" }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
