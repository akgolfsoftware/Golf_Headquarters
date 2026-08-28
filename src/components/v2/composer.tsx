"use client";

/**
 * Composer — det delte skrivefeltet (PP-B3, rutefasit §Claude-følelsen:
 * «festet spørrefelt nederst på alle desktop-flater, mobil kun Hjem
 * (komponent `Composer`). Varianter fjerner den aldri.»)
 *
 * Fasit:
 * - Desktop: designsystem/paper/fase1/playerhq-chat-desktop.html og
 *   agencyos-konsoll-desktop.html — identisk struktur begge steder:
 *   `.composer` (border-top, surface-bakgrunn) → `.cwrap` (lesebredde,
 *   sentrert) → `.box` (felt-ramme, naken textarea, fokus-kant) → `.boxbar`
 *   ([verktøy] [/] [@] [spacer] [Send, «btn ink»]) → `.ctxline`
 *   ([«Ser: …»-pill] [enter-hint]).
 * - Mobil: playerhq-chat-mobil.html — kontekstlinje ØVERST, `.crow` med
 *   `.cbox` (textarea + `.cmini` med / og @), verktøy-slot og `.sendbtn`
 *   (44 px, radius 12, pil), hint under.
 *
 * Komponenten eier chromet og send-flyten (Enter sender, Shift+Enter ny
 * linje, tøm-felt-før-send, innsetting av / og @ ved markøren). PLASSERINGEN
 * (sticky/fixed/flex-bunn) eier flaten selv — eller V2Shell via
 * `composer`-prop for desktop-flater uten egen chat-layout.
 *
 * Ekstrahert 16.08.2026 fra PortalChatHjem (PP-1.1), KonsollChat (PP-2.1)
 * og kommando/agent-chat — én komponent, tre kallsteder.
 */

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";

export interface ComposerProps {
  /** Skjermleser-etikett for feltet («Skriv til PlayerHQ» / «Skriv til AgencyOS»). */
  label: string;
  placeholder: string;
  /**
   * Kalles med trimmet tekst. Feltet tømmes FØR kallet (chat-mønsteret alle
   * tre flatene brukte) — kallstedet kan sette egne refs (KonsollChat sin
   * `harSendt`) og await'e streamen.
   */
  onSend: (tekst: string) => void | Promise<void>;
  /** Sending pågår — Send deaktiveres; feltet forblir skrivbart. */
  sender?: boolean;
  /** Hele feltet er av (konsollen for COACH: ærlig deaktivert, ikke utelatt). */
  disabled?: boolean;
  /** Fasitens mobil-layout (playerhq-chat-mobil.html). Default: desktop. */
  mobil?: boolean;
  /** Fasitens `.ctx`/`.ctxline` — «Ser: …». Utelatt → ingen kontekstlinje. */
  kontekst?: ReactNode;
  /**
   * Slot for mic/vedlegg/chips — fasitens `.mic`-plass: først i boxbar på
   * desktop, mellom cbox og send-knappen på mobil.
   */
  verktoy?: ReactNode;
  /** «/»- og «@»-knappene (fasitens toggle-slash/toggle-at). `false` → skjult. */
  snarveier?: false | { slashLabel?: string; atLabel?: string };
  /** Lesebredde (fasit: 720 px PlayerHQ, 74ch ≈ 760 px konsoll). */
  maksBredde?: number | string;
}

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

/** Fasitens `.eyebrow` under/ved siden av feltet. */
const hintStil: CSSProperties = {
  fontFamily: TL.font.mono,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: TL.mute,
};

export function Composer({
  label,
  placeholder,
  onSend,
  sender = false,
  disabled = false,
  mobil = false,
  kontekst,
  verktoy,
  snarveier = {},
  maksBredde = 720,
}: ComposerProps) {
  const feltId = useId();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [harFokus, setHarFokus] = useState(false);
  const kanSende = !disabled && !sender && input.trim().length > 0;

  function send() {
    const tekst = input.trim();
    if (!tekst || disabled || sender) return;
    setInput("");
    void onSend(tekst);
  }

  /** Fasitens `/`- og `@`-knapper: setter inn tegnet ved markøren og gir
   * feltet fokus tilbake — mønsteret fra agencyos-konsoll-desktop.html. */
  function settInnTegn(tegn: string) {
    const el = taRef.current;
    if (!el) {
      setInput((v) => v + tegn);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    setInput(input.slice(0, start) + tegn + input.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + tegn.length;
    });
  }

  const snarveiListe =
    snarveier === false
      ? []
      : [
          { tegn: "/", label: snarveier.slashLabel ?? "Sett inn kommando", odId: "toggle-slash" },
          { tegn: "@", label: snarveier.atLabel ?? "Sett inn omtale", odId: "toggle-at" },
        ];

  const ta = (
    <textarea
      id={feltId}
      ref={taRef}
      value={input}
      disabled={disabled}
      onChange={(e) => setInput(e.target.value)}
      onFocus={() => setHarFokus(true)}
      onBlur={() => setHarFokus(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      }}
      rows={1}
      placeholder={placeholder}
      data-od-id="composer-input"
      style={{
        width: "100%",
        display: "block",
        border: "none",
        outline: "none",
        resize: "none",
        background: "transparent",
        color: TL.text,
        // Fasit: desktop-feltet er prosa (`var(--body)` = Lora), mobil UI-sans.
        fontFamily: mobil ? TL.font.sans : TL.font.sans,
        fontSize: 15,
        lineHeight: mobil ? 1.45 : 1.5,
        minHeight: 44, // fasitens globale `textarea{ min-height: var(--tap) }`
        maxHeight: mobil ? 110 : 180,
        overflowY: "auto",
      }}
    />
  );

  const hint = <span style={hintStil}>Enter sender · Shift+Enter ny linje</span>;

  /* ── Mobil (fasit playerhq-chat-mobil.html): ctxline → crow → hint ── */
  if (mobil) {
    return (
      <div
        data-paper-composer
        style={{ borderTop: `1px solid ${TL.hair}`, background: TL.scene, padding: "8px 12px 12px" }}
      >
        <div style={{ maxWidth: maksBredde, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {kontekst != null && (
            <div
              data-od-id="toggle-context"
              style={{
                fontFamily: TL.font.mono,
                fontSize: 10.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: TL.mute,
                padding: "4px 4px 0",
              }}
            >
              {kontekst}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {/* Fasitens .cbox — rammen eier paddingen, textarea er naken inni. */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                background: TL.elev,
                border: `1px solid ${harFokus ? TL.text : TL.hair}`,
                borderRadius: TL.radius.card,
                padding: "8px 12px",
              }}
            >
              <label htmlFor={feltId} style={srOnly}>
                {label}
              </label>
              {ta}
              {snarveiListe.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {snarveiListe.map((s) => (
                    <button
                      key={s.tegn}
                      type="button"
                      onClick={() => settInnTegn(s.tegn)}
                      disabled={disabled}
                      aria-label={s.label}
                      data-od-id={s.odId}
                      className="v2-press v2-focus"
                      style={{
                        width: 44,
                        height: 44,
                        minHeight: 44,
                        display: "grid",
                        placeItems: "center",
                        border: "none",
                        borderRadius: TL.radius.row,
                        background: "transparent",
                        color: TL.mute,
                        fontFamily: TL.font.mono,
                        fontSize: 14,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.45 : 1,
                      }}
                    >
                      {s.tegn}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {verktoy}
            {/* Fasitens .sendbtn — 44 px, radius 12, cta-fylt, pil. */}
            <button
              type="button"
              onClick={send}
              disabled={!kanSende}
              aria-label="Send melding"
              data-od-id="send-message"
              className="v2-press v2-focus"
              style={{
                flex: "none",
                width: 44,
                height: 44,
                minHeight: 44,
                display: "grid",
                placeItems: "center",
                borderRadius: TL.radius.card,
                border: `1px solid ${kanSende ? TL.fill : TL.hair}`,
                background: kanSende ? TL.fill : TL.dim,
                color: kanSende ? TL.onFill : TL.mute,
                cursor: kanSende ? "pointer" : "default",
              }}
            >
              <Icon name="arrow-right" size={17} strokeWidth={2} />
            </button>
          </div>
          {hint}
        </div>
      </div>
    );
  }

  /* ── Desktop (fasit *-desktop.html): box + boxbar → ctxline ── */
  return (
    <div
      data-paper-composer
      style={{ borderTop: `1px solid ${TL.hair}`, background: TL.elev, padding: "12px 20px 16px" }}
    >
      <div style={{ position: "relative", maxWidth: maksBredde, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Fasitens .box — felt, deretter boxbar i én rad. */}
        <div
          style={{
            background: TL.scene,
            border: `1px solid ${harFokus ? TL.mute : TL.hair}`,
            borderRadius: TL.radius.card,
            padding: 12,
          }}
        >
          <label htmlFor={feltId} style={srOnly}>
            {label}
          </label>
          {ta}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            {verktoy}
            {snarveiListe.map((s) => (
              <button
                key={s.tegn}
                type="button"
                onClick={() => settInnTegn(s.tegn)}
                disabled={disabled}
                aria-label={s.label}
                data-od-id={s.odId}
                className="v2-press v2-focus"
                style={{
                  minHeight: 36,
                  minWidth: 36,
                  padding: "0 12px",
                  flex: "none",
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  color: TL.text,
                  background: "transparent",
                  border: `1px solid ${TL.hair}`,
                  borderRadius: TL.radius.row,
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                {s.tegn}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            {/* Fasitens `.btn.ink` — blekkfylt tekstknapp, ikke pil-CTA. */}
            <button
              type="button"
              onClick={send}
              disabled={!kanSende}
              data-od-id="send-message"
              className="v2-press v2-focus"
              style={{
                minHeight: 36,
                padding: "0 18px",
                flex: "none",
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 500,
                color: kanSende ? TL.onFill : TL.mute,
                background: kanSende ? TL.fill : TL.dim,
                border: `1px solid ${kanSende ? TL.fill : TL.hair}`,
                borderRadius: TL.radius.row,
                cursor: kanSende ? "pointer" : "default",
              }}
            >
              Send
            </button>
          </div>
        </div>
        {/* Fasitens .ctxline — kontekst-pill + tastatur-hint. */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "0 4px" }}>
          {kontekst != null && (
            <span
              data-od-id="toggle-context"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 28,
                padding: "0 10px",
                fontFamily: TL.font.mono,
                fontSize: 10.5,
                letterSpacing: "0.05em",
                color: TL.mute,
                border: `1px solid ${TL.hair}`,
                borderRadius: TL.radius.pill,
              }}
            >
              {kontekst}
            </span>
          )}
          {hint}
        </div>
      </div>
    </div>
  );
}
