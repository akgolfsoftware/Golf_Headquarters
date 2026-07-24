"use client";

/**
 * BunnArk — delt produksjons-bottomsheet for mobil (M3, 17. juli 2026).
 * Lukker kanon-gapet kartleggingen fant: det fantes ingen gjenbrukbar
 * bunn-ark-primitiv, så hver skjerm komponerte sitt eget ad-hoc (MerPanel,
 * SerieMeny, FellesmeldingFlyt). Denne standardiserer mønsteret: fast backdrop
 * + bunn-forankret ark (avrundet topp, safe-area-inset, Escape-lukk, drag-hånd-
 * tak-hint). Rendrer ingenting når `open` er false. Kun v2 T-tokens, ingen rå hex.
 *
 * Craft-pass (2026-07-24, FASIT §4b): inn-animasjon (v2-sheet-in + backdrop-
 * fade fra motion-katalogen), fokus flyttes inn i arket og gjenopprettes ved
 * lukking, Tab holdes innenfor (fokus-felle for aria-modal), og body-scroll
 * låses mens arket er åpent.
 *
 * Brukes for tap→detalj på mobil (stall-sammendrag, kalender-dag, økt-detalj)
 * der desktop viser samme innhold i et side-panel. Eieren holder `open`-state.
 */

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

const FOKUSERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface BunnArkProps {
  open: boolean;
  onClose: () => void;
  /** Overskrift i arkets topprad (valgfri — utelates for rene innholdsark). */
  tittel?: string;
  /** Maks høyde som andel av viewport (default "82vh"). */
  maxHeight?: string;
  children: ReactNode;
}

export function BunnArk({ open, onClose, tittel, maxHeight = "82vh", children }: BunnArkProps) {
  const arkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Fokus inn i arket nå, tilbake dit brukeren var ved lukking.
    const forrigeFokus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    arkRef.current?.focus();
    // Scroll-lås: siden bak skal ikke rulle mens arket er åpent.
    const forrigeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Fokus-felle: Tab sykler innenfor arket (aria-modal-kontrakten).
      if (e.key === "Tab" && arkRef.current) {
        const fokuserbare = arkRef.current.querySelectorAll<HTMLElement>(FOKUSERBAR);
        if (fokuserbare.length === 0) {
          e.preventDefault();
          return;
        }
        const forste = fokuserbare[0];
        const siste = fokuserbare[fokuserbare.length - 1];
        const aktiv = document.activeElement;
        if (e.shiftKey && (aktiv === forste || aktiv === arkRef.current)) {
          e.preventDefault();
          siste.focus();
        } else if (!e.shiftKey && aktiv === siste) {
          e.preventDefault();
          forste.focus();
        }
      }
    };
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("keydown", keys);
      document.body.style.overflow = forrigeOverflow;
      forrigeFokus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className="v2-backdrop-in"
        style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)" }}
      />
      <div
        ref={arkRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={tittel ?? "Detaljer"}
        className="v2-sheet-in"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          maxHeight,
          overflowY: "auto",
          outline: "none",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: "18px 18px 0 0",
          padding: "10px 16px calc(20px + env(safe-area-inset-bottom))",
          boxShadow: "0 -18px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Drag-håndtak-hint (rent visuelt, ikke interaktivt) */}
        <div
          aria-hidden
          style={{
            width: 38,
            height: 4,
            borderRadius: 9999,
            background: T.border,
            margin: "0 auto 12px",
          }}
        />
        {tittel !== undefined && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{tittel}</span>
            <button
              onClick={onClose}
              className="v2-press v2-focus"
              aria-label="Lukk"
              style={{ background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 4 }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
