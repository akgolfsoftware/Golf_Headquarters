"use client";

/**
 * BunnArk — delt produksjons-bottomsheet for mobil (M3, 17. juli 2026).
 * Lukker kanon-gapet kartleggingen fant: det fantes ingen gjenbrukbar
 * bunn-ark-primitiv, så hver skjerm komponerte sitt eget ad-hoc (MerPanel,
 * SerieMeny, FellesmeldingFlyt). Denne standardiserer mønsteret: fast backdrop
 * + bunn-forankret ark (avrundet topp, safe-area-inset, Escape-lukk, drag-hånd-
 * tak-hint). Rendrer ingenting når `open` er false. Kun v2 T-tokens, ingen rå hex.
 *
 * Brukes for tap→detalj på mobil (stall-sammendrag, kalender-dag, økt-detalj)
 * der desktop viser samme innhold i et side-panel. Eieren holder `open`-state.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

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
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tittel ?? "Detaljer"}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          maxHeight,
          overflowY: "auto",
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
              className="v2-press"
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
