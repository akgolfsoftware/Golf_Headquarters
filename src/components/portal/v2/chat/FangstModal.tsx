"use client";

/**
 * FangstModal — rask stemme-/tekstobservasjon fra "I dag" (fasit:
 * playerhq-chat-desktop.html .modalwrap/.modal). Ren observasjon, uendret og
 * utolket ("Din observasjon, dine ord. Jeg tolker den ikke for deg.") —
 * derfor INGEN AI-analyse eller auto-utledede etiketter her (fasitens
 * chip-rad krever klassifisering vi ikke har en ekte kilde for per nå; heller
 * ingen chips enn påtatte).
 *
 * Transkripsjon: gjenbruker MicButton (samme Web Speech-baserte tale-til-tekst
 * som resten av appen) i stedet for å bygge en egen opptaksmotor — transkriptet
 * fylles inn i et redigerbart felt før lagring, i stedet for et låst live-felt.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { MicButton } from "@/components/shared/mic-button";
import { sendFangstFraHjem } from "@/lib/portal/fangst-hjem-action";

type Fase = "tom" | "lagrer" | "lagret" | "feil";

export function FangstModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tekst, setTekst] = useState("");
  const [fase, setFase] = useState<Fase>("tom");
  const [klokkeslett, setKlokkeslett] = useState<string | null>(null);

  if (!open) return null;

  async function lagre() {
    if (!tekst.trim()) return;
    setFase("lagrer");
    const res = await sendFangstFraHjem(tekst);
    if (res.ok) {
      setKlokkeslett(res.klokkeslett);
      setFase("lagret");
    } else {
      setFase("feil");
    }
  }

  function lukkOgNullstill() {
    setTekst("");
    setFase("tom");
    setKlokkeslett(null);
    onClose();
  }

  return createPortal(
    <div
      role="presentation"
      onClick={lukkOgNullstill}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: T.farge.svartA55,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fangst-tittel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 94vw)",
          maxHeight: "88vh",
          overflow: "auto",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          boxShadow: `0 24px 64px ${T.farge.svartA35}`,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <h2 id="fangst-tittel" style={{ margin: 0, fontFamily: T.disp, fontSize: 16, fontWeight: 600, color: T.fg }}>
            Fangst
          </h2>
          <span
            style={{
              padding: "3px 8px",
              borderRadius: 999,
              fontFamily: T.mono,
              fontSize: 10.5,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              background: T.panel2,
              color: T.mut,
              border: `1px solid ${T.border}`,
            }}
          >
            Går rett inn
          </span>
          <button
            type="button"
            onClick={lukkOgNullstill}
            aria-label="Lukk fangst"
            className="v2-press v2-focus"
            style={{ marginLeft: "auto", background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 4 }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {fase === "lagret" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 14, color: T.fg }}>
              Fanget. Lagret <span style={{ fontFamily: T.mono }}>{klokkeslett}</span> — Anders ser det i innboksen sin.
            </p>
            <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
              Din observasjon, dine ord. Den tolkes ikke for deg.
            </p>
            <button
              type="button"
              onClick={lukkOgNullstill}
              className="v2-press v2-focus"
              style={{
                minHeight: 44,
                borderRadius: 10,
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 0" }}>
              <MicButton
                variant="standalone"
                onResult={(nyTekst) => setTekst((v) => (v ? `${v} ${nyTekst}` : nyTekst))}
                disabled={fase === "lagrer"}
              />
              <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
                trykk for å snakke
              </span>
            </div>

            <label htmlFor="fangst-tekst" style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: T.mut }}>
              Det du sier, ord for ord — rediger fritt før du lagrer
            </label>
            <textarea
              id="fangst-tekst"
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder="Snakk, eller skriv direkte her …"
              rows={4}
              style={{
                width: "100%",
                minHeight: 96,
                padding: 12,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                fontFamily: T.ui,
                fontSize: 14.5,
                lineHeight: 1.6,
                color: T.fg,
                resize: "vertical",
              }}
            />

            {fase === "feil" && (
              <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                Fikk ikke lagret akkurat nå. Prøv igjen.
              </p>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={lagre}
                disabled={!tekst.trim() || fase === "lagrer"}
                className="v2-press v2-focus"
                style={{
                  minHeight: 44,
                  padding: "0 20px",
                  borderRadius: 10,
                  border: `1px solid ${T.handling}`,
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.ui,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: tekst.trim() ? "pointer" : "not-allowed",
                  opacity: !tekst.trim() || fase === "lagrer" ? 0.6 : 1,
                }}
              >
                {fase === "lagrer" ? "Lagrer …" : "Legg i innboksen"}
              </button>
              <button
                type="button"
                onClick={lukkOgNullstill}
                className="v2-press v2-focus"
                style={{
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: 10,
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
        )}
      </div>
    </div>,
    document.body,
  );
}
