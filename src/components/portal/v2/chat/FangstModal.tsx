"use client";

/**
 * FangstModal — «fangst»-knappen i topplinja (avviksliste A1, punkt 5).
 * Matcher Paper-fasitens sentrerte fangst-modal (playerhq-chat-desktop.html
 * #captureWrap): stemme ELLER tekst → «Legg i tråden» sender den samme
 * veien som composeren (usePortalChat.sendMessage), så observasjonen dukker
 * opp som en vanlig samtale-tur. Auto-tagging mot pyramideformelen (fasitens
 * chip-rad) er IKKE bygget her — krever ak-formel-visning-kobling mot dagens
 * økt og hører til en egen PR, ikke inngangspunktet denne saken ber om.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { MicButton } from "@/components/shared/mic-button";

export function FangstModal({
  onClose,
  onLeggITraden,
}: {
  onClose: () => void;
  onLeggITraden: (tekst: string) => void;
}) {
  const [tekst, setTekst] = useState("");
  const kanSende = tekst.trim().length > 0;

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 92, background: T.farge.svartA55 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fangst-tittel"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 93,
          width: 420,
          maxWidth: "calc(100vw - 24px)",
          maxHeight: "calc(100vh - 24px)",
          overflowY: "auto",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          boxShadow: `0 24px 64px ${T.farge.svartA35}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span id="fangst-tittel" style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>
            Fangst
          </span>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.mut,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              borderRadius: T.rPill,
              padding: "2px 8px",
            }}
          >
            Går rett inn
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk fangst"
            className="v2-press v2-focus"
            style={{ marginLeft: "auto", background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <MicButton
              variant="standalone"
              onResult={(t) => setTekst((v) => (v ? `${v} ${t}` : t))}
            />
          </div>

          <label htmlFor="fangst-tekst" style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
            Det du sier eller skriver
          </label>
          <textarea
            id="fangst-tekst"
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="Ord for ord — dine egne."
            rows={4}
            style={{
              resize: "none",
              width: "100%",
              padding: 10,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              borderRadius: T.rRow,
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 13.5,
              lineHeight: 1.5,
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <button
              type="button"
              onClick={() => kanSende && (onLeggITraden(tekst.trim()), onClose())}
              disabled={!kanSende}
              className="v2-press v2-focus"
              style={{
                minHeight: 44,
                padding: "0 16px",
                borderRadius: T.rTag,
                border: "none",
                background: kanSende ? T.lime : T.panel3,
                color: kanSende ? T.onLime : T.mut,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 600,
                cursor: kanSende ? "pointer" : "default",
              }}
            >
              Legg i tråden
            </button>
            <button
              type="button"
              onClick={onClose}
              className="v2-press v2-focus"
              style={{
                minHeight: 44,
                padding: "0 16px",
                borderRadius: T.rTag,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.fg,
                fontFamily: T.ui,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Lukk
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
