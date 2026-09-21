"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { UI } from "@/lib/domain/workbench/labels";
import type { PlanningGoalSummary, SourceItem } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { settKildeDataTransfer } from "./wb-drag";

type Props = {
  kilder: SourceItem[];
  playerId?: string;
  uke?: string;
  maned?: string;
  aar?: string;
  goals?: PlanningGoalSummary[];
};

const GRUPPER: { kind: SourceItem["kind"]; tittel: string; ikon: string }[] = [
  { kind: "DRILL", tittel: UI.sourcesDrills, ikon: "dumbbell" },
  { kind: "TEMPLATE", tittel: UI.sourcesTemplates, ikon: "star" },
  { kind: "PREVIOUS_WEEK", tittel: UI.sourcesPrevious, ikon: "history" },
];

export function SourcesPanel({ kilder, playerId, uke, maned, aar, goals = [] }: Props) {
  const nivaa = playerId
    ? [
        { id: "aar" as const, label: UI.visAar },
        { id: "periode" as const, label: UI.visPeriode },
        { id: "maned" as const, label: UI.visManed },
        { id: "uke" as const, label: UI.visUke },
      ]
    : [];
  return (
    <aside aria-label={UI.sourcesTitle} style={{ minWidth: 0 }}>
      <div style={{ fontFamily: TL.font.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
        {playerId ? UI.timeLevels : UI.sourcesTitle}
      </div>
      {nivaa.length > 0 ? (
        <div style={{ marginTop: 10, display: "grid", gap: 2 }}>
          {nivaa.map((n) => (
            <Link key={n.id} href={workbenchUrl(playerId!, n.id, { uke, maned, aar })} style={{ minHeight: 44, display: "flex", alignItems: "center", borderRadius: 2, padding: "0 8px", fontFamily: TL.font.sans, fontSize: 13, color: TL.text, textDecoration: "none" }}>
              {n.label}
            </Link>
          ))}
        </div>
      ) : null}
      {goals.length > 0 ? <MaalSpor goals={goals} /> : null}
      {kilder.length === 0 ? (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
          <Icon name="layers" size={14} style={{ color: TL.mute, marginTop: 2 }} />
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.mute }}>{UI.emptySourcesTitle}</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, marginTop: 3 }}>{UI.emptySourcesBody}</div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {GRUPPER.map((gruppe) => {
            const elementer = kilder.filter((k) => k.kind === gruppe.kind);
            if (elementer.length === 0) return null;
            return (
              <div key={gruppe.kind} style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "9px 2px", borderTop: `1px solid ${TL.hair}` }}>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{gruppe.tittel}</span>
                  <span style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute }}>{elementer.length}</span>
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

function MaalSpor({ goals }: { goals: PlanningGoalSummary[] }) {
  const grupper = [
    { category: "OUTCOME" as const, label: "Resultatmål" },
    { category: "PROCESS" as const, label: "Prosessmål" },
  ];
  return (
    <section aria-label="Aktive mål" style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
      <div style={{ fontFamily: TL.font.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
        Målsetninger
      </div>
      {grupper.map((gruppe) => {
        const rader = goals.filter((goal) => goal.category === gruppe.category);
        if (rader.length === 0) return null;
        return (
          <div key={gruppe.category} style={{ marginTop: 10 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11, fontWeight: 600, color: TL.mute }}>{gruppe.label}</div>
            {rader.map((goal) => (
              <div key={goal.id} style={{ padding: "7px 0", borderBottom: `1px solid ${TL.hair}` }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text, lineHeight: 1.35 }}>{goal.title}</div>
                {goal.targetDate ? (
                  <div style={{ marginTop: 2, fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>
                    Frist {goal.targetDate.slice(8, 10)}.{goal.targetDate.slice(5, 7)}.{goal.targetDate.slice(0, 4)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}

function KildeKort({ kilde }: { kilde: SourceItem }) {
  return (
    <li draggable title={UI.dragHint} onDragStart={(e: DragEvent<HTMLLIElement>) => { settKildeDataTransfer(e, kilde.id); e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${TL.draftBorder}`; }} onDragEnd={(e: DragEvent<HTMLLIElement>) => { e.currentTarget.style.boxShadow = "none"; }} style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text, padding: "6px 2px 6px 10px", borderRadius: 2, cursor: "grab", minWidth: 0 }}>
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kilde.title}</div>
      {kilde.subtitle && <div style={{ fontSize: 11, fontWeight: 400, color: TL.mute, marginTop: 1 }}>{kilde.subtitle}</div>}
    </li>
  );
}
