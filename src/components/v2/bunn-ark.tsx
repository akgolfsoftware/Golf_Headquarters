"use client";

/* AK Golf HQ v2 — BunnArk: delt LIVE overlegg-primitiv for aksjons-ark.
   Mobil (<md): bunn-forankret sheet med drag-håndtak, avrundet topp,
   maxHeight 85dvh og safe-area-bunn — trykket og resultatet hører sammen
   nederst på flaten (Anders' mobil-funn 13/7: sentrerte dialoger og
   bunn-accordions gjorde Workbench uforståelig på telefon).
   Desktop (md+): sentrert r20-kort som før (samme visuelle språk som
   NyOktArk/ForslagArk hadde).
   NB: overlays.tsx sitt Ark/Modal er STATISKE galleri-demoer — dette er
   produksjons-varianten med scrim, lukking og posisjonering. */

import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { useMobile } from "@/lib/v2/hooks";
import { Icon } from "@/components/v2/icon";

export interface BunnArkProps {
  /** Overskrift i arket. Utelatt → innholdet eier hele flaten. */
  tittel?: ReactNode;
  /** Liten undertekst under tittelen. */
  under?: ReactNode;
  onLukk: () => void;
  /** Blokkerer scrim-/kryss-lukking mens en mutasjon pågår. */
  laast?: boolean;
  /** Ønsket bredde på desktop (px). Default 420. */
  bredde?: number;
  children: ReactNode;
}

export function BunnArk({ tittel, under, onLukk, laast, bredde = 420, children }: BunnArkProps) {
  const mobil = useMobile();
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 70, display: "flex", flexDirection: "column",
        alignItems: mobil ? "stretch" : "center",
        justifyContent: mobil ? "flex-end" : "center",
        padding: mobil ? 0 : 16,
      }}
    >
      <div
        onClick={laast ? undefined : onLukk}
        style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={
          mobil
            ? {
                position: "relative", width: "100%", maxHeight: "85dvh", overflowY: "auto",
                background: T.panel, border: `1px solid ${T.borderS}`, borderBottom: "none",
                borderRadius: "24px 24px 0 0",
                padding: "10px 18px calc(22px + env(safe-area-inset-bottom))",
                boxShadow: "0 -18px 48px rgba(0,0,0,0.45)",
              }
            : {
                position: "relative", width: `min(${bredde}px, 100%)`, maxHeight: "88vh", overflowY: "auto",
                background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20,
                padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }
        }
      >
        {mobil && (
          <span style={{ display: "block", width: 38, height: 4, borderRadius: 9999, background: T.borderS, margin: "0 auto 12px" }} />
        )}
        {(tittel || !mobil) && (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {tittel && (
                <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobil ? 17 : 18, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>
                  {tittel}
                </h2>
              )}
              {under && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>{under}</div>}
            </div>
            <button
              type="button"
              onClick={onLukk}
              disabled={laast}
              aria-label="Lukk"
              style={{
                appearance: "none", cursor: "pointer",
                width: mobil ? 44 : 28, height: mobil ? 44 : 28, borderRadius: mobil ? 12 : 8,
                background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex",
                alignItems: "center", justifyContent: "center", flex: "none",
              }}
            >
              <Icon name="x" size={mobil ? 16 : 14} style={{ color: T.fg2 }} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
