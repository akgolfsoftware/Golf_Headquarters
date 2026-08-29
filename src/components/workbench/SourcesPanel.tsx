"use client";

/**
 * SourcesPanel — venstrekolonnen «Sett inn» (natt-plan Loop 2T/B5, PX-2).
 *
 * Fasit: designsystem/train-lock/A-04 Kilder Ovelsesbank.dc.html
 * Fasit: designsystem/train-lock/A-01b Mac Uke kollapset.dc.html (avvik)
 * Fasit: designsystem/train-lock/A-04b Program ghost.dc.html (avvik)
 *
 * Fasit-stilen (A-01/A-04): caps-overskrift «Sett inn» 11/600/0.08em, rader
 * med border-top hairline (aldri kort-ramme), gruppetittel 13/600 + antall
 * 11 mute tabular. Elementene under er `draggable` (native HTML5 DnD,
 * wb-drag.ts).
 *
 * Kjente avvik (PX-2): søkefeltet, minikalenderen og Kontekst-seksjonen med
 * øye-toggles er ikke bygget; ⌘\-kollaps (A-01b) mangler; program-slipp gir
 * økter direkte i stedet for A-04b sine ghost-uker med Bekreft/Forkast.
 */

import type { DragEvent } from "react";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";

import { UI } from "@/lib/domain/workbench/labels";
import type { SourceItem } from "@/lib/domain/workbench/types";
import { settKildeDataTransfer } from "./wb-drag";

type Props = {
  kilder: SourceItem[];
};

const GRUPPER: { kind: SourceItem["kind"]; tittel: string; ikon: string }[] = [
  { kind: "DRILL", tittel: UI.sourcesDrills, ikon: "dumbbell" },
  { kind: "TEMPLATE", tittel: UI.sourcesTemplates, ikon: "star" },
  { kind: "PREVIOUS_WEEK", tittel: UI.sourcesPrevious, ikon: "history" },
];

export function SourcesPanel({ kilder }: Props) {
  return (
    <aside aria-label={UI.sourcesTitle} style={{ minWidth: 0 }}>
      {/* A-01/A-04: caps «Sett inn»-overskrift 11/600/0.08em — ingen ramme. */}
      <div
        style={{
          fontFamily: TL.font.sans,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {UI.sourcesTitle}
      </div>

      {kilder.length === 0 ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
          <Icon name="layers" size={14} style={{ color: TL.mute, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.mute }}>
              {UI.emptySourcesTitle}
            </div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 3 }}>
              {UI.emptySourcesBody}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {GRUPPER.map((gruppe) => {
            const elementer = kilder.filter((k) => k.kind === gruppe.kind);
            if (elementer.length === 0) return null;
            return (
              <div key={gruppe.kind} style={{ minWidth: 0 }}>
                {/* A-01: gruppe-rad — 13/600 tittel + antall 11 mute tabular,
                    border-top hairline. */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 6,
                    padding: "9px 2px",
                    borderTop: `1px solid ${TL.hair}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 13,
                      fontWeight: 600,
                      color: TL.text,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {gruppe.tittel}
                  </span>
                  <span
                    style={{
                      fontFamily: TL.font.sans,
                      fontSize: 11,
                      color: TL.mute,
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {elementer.length}
                  </span>
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: "0 0 6px" }}>
                  {elementer.map((k) => (
                    <KildeKort key={k.id} kilde={k} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

function KildeKort({ kilde }: { kilde: SourceItem }) {
  return (
    <li
      draggable
      title={UI.dragHint}
      onDragStart={(e: DragEvent<HTMLLIElement>) => {
        settKildeDataTransfer(e, kilde.id);
        // A-11: elementet som dras får hair-ring i biblioteket.
        e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${TL.draftBorder}`;
      }}
      onDragEnd={(e: DragEvent<HTMLLIElement>) => {
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        fontFamily: TL.font.sans,
        fontSize: 13,
        fontWeight: 600,
        color: TL.text,
        padding: "6px 2px 6px 10px",
        borderRadius: 8,
        cursor: "grab",
        minWidth: 0,
      }}
    >
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {kilde.title}
      </div>
      {kilde.subtitle && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: TL.mute,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {kilde.subtitle}
        </div>
      )}
    </li>
  );
}
