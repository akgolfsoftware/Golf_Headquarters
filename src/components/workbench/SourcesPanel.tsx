"use client";

/**
 * SourcesPanel — venstrekolonnen (natt-plan Loop 2T/B5).
 *
 * Ekte innhold fra `loadSources` (øvelsesbank, maler, forrige uke), gruppert
 * per kilde-type. Hvert element er `draggable` — dra inn i uka via native
 * HTML5 drag-and-drop (se wb-drag.ts). Klikk gjør ingenting ennå; kortene er
 * kun en dra-kilde i v1.
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
    <aside
      aria-label={UI.sourcesTitle}
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: 14,
        minWidth: 0,
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: TL.font.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {UI.sourcesTitle}
      </div>

      {kilder.length === 0 ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon name="layers" size={14} style={{ color: TL.mute, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
              {UI.emptySourcesTitle}
            </div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 3 }}>
              {UI.emptySourcesBody}
            </div>
          </div>
        </div>
      ) : (
        GRUPPER.map((gruppe) => {
          const elementer = kilder.filter((k) => k.kind === gruppe.kind);
          if (elementer.length === 0) return null;
          return (
            <div key={gruppe.kind} style={{ display: "grid", gap: 6, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: TL.font.mono,
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: TL.mute,
                }}
              >
                <Icon name={gruppe.ikon} size={11} style={{ color: TL.mute }} />
                {gruppe.tittel}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                {elementer.map((k) => (
                  <KildeKort key={k.id} kilde={k} />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </aside>
  );
}

function KildeKort({ kilde }: { kilde: SourceItem }) {
  return (
    <li
      draggable
      title={UI.dragHint}
      onDragStart={(e: DragEvent<HTMLLIElement>) => settKildeDataTransfer(e, kilde.id)}
      style={{
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        color: TL.text,
        padding: "7px 9px",
        borderRadius: TL.radius.row,
        background: TL.dock,
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
            fontSize: 10.5,
            color: TL.mute,
            marginTop: 2,
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
