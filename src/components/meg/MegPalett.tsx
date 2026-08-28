"use client";

/**
 * ⌘K-kommandopalett for /meg — hopper mellom de 11 artefaktene. Fasit:
 * jarvis-base.js sin openPal/closePal/buildPal (⌘K åpner/lukker, Escape
 * lukker, fokus går tilbake til utløseren). Egen, liten komponent —
 * src/components/shared/cmd-palette.tsx er PlayerHQs globale sidesøk med
 * en helt annen (hardkodet, gammelt-tema) elementliste og passer ikke
 * artefakt-navigasjon i /meg.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import { ARTEFAKT_TITTEL, ARTEFAKT_TYPER, type ArtefaktType } from "@/lib/jarvis/artefakt";

const ARTEFAKT_IKON: Record<ArtefaktType, string> = {
  saker: "inbox",
  sak: "file-text",
  vakt: "calendar",
  dagen: "clock",
  brief: "file-text",
  journal: "book-open",
  review: "bar-chart",
  maskinrom: "cog",
  historikk: "history",
  innstillinger: "settings",
  fangst: "mic",
};

export function MegPalett({
  open,
  onClose,
  onVelg,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  onVelg: (type: ArtefaktType) => void;
  /** Elementet som åpnet paletten — får fokus tilbake ved lukking. */
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const [sok, setSok] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /** Lukker og nullstiller søket — brukes av Escape, bakgrunn-klikk og valg. */
  function lukk() {
    setSok("");
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        lukk();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
    // lukk() er stabil nok for dette formålet — kun avhengig av open-toggling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) return;
    triggerRef.current?.focus();
    // triggerRef er en ref — endres ikke mellom rendre, trygt å utelate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const treff = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return ARTEFAKT_TYPER;
    return ARTEFAKT_TYPER.filter((t) => ARTEFAKT_TITTEL[t].toLowerCase().includes(q));
  }, [sok]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hopp til"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        background: TL.scrim,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) lukk();
      }}
    >
      <div
        style={{
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          background: TL.elev,
          border: `1px solid ${TL.hair}`,
          borderRadius: TL.radius.card,
          overflow: "hidden",
          boxShadow: `0 12px 32px ${TL.scrim}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${TL.hair}` }}>
          <Icon name="search" size={16} strokeWidth={1.7} style={{ color: TL.mute }} />
          <input
            ref={inputRef}
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="Hopp til …"
            aria-label="Hopp til artefakt"
            data-od-id="palette-input"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 14,
            }}
          />
          <kbd style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>ESC</kbd>
        </div>
        <div style={{ overflowY: "auto", padding: 6 }} role="listbox">
          {treff.length === 0 && (
            <div style={{ padding: "16px 12px", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>Ingen treff</div>
          )}
          {treff.map((type) => (
            <button
              key={type}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                onVelg(type);
                lukk();
              }}
              data-od-id={`palette-item-${type}`}
              className="v2-press v2-focus"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: TL.radius.row,
                border: "none",
                background: "transparent",
                color: TL.text,
                fontFamily: TL.font.sans,
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <Icon name={ARTEFAKT_IKON[type]} size={15} strokeWidth={1.7} style={{ color: TL.mute }} />
              {ARTEFAKT_TITTEL[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
