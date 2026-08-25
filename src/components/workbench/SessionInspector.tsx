"use client";

/**
 * SessionInspector — høyrekolonnen i Workbench-uka (natt-plan Loop 2).
 *
 * Flytting skjer HER i v1: dato, start og varighet er redigerbare felter som
 * kaller `moveSession`. Ingen drag-lib (anti-scope). Publiser/trekk tilbake og
 * sletting ligger i bunnhandlingene.
 */

import { useState } from "react";
import {
  Inspektorpanel,
  InspektorBlokk,
  InspektorLinje,
  InspektorTom,
} from "@/components/v2/inspektorpanel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import {
  formatMinutes,
  formatTime,
  PYRAMID_LABEL,
  UI,
} from "@/lib/domain/workbench/labels";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { harHake, pyramideFarge, STATUS_CAPS, WARM } from "./wb-visuelt";

const VARIGHETER = [30, 45, 60, 90, 120, 180];

export type FlyttVerdier = {
  newDate: string;
  newStartMinute: number;
  newDurationMinutes: number;
};

type Props = {
  session: WorkbenchSession | null;
  travel: boolean;
  onFlytt: (verdier: FlyttVerdier) => void;
  onPubliser: () => void;
  onTrekkTilbake: () => void;
  onSlett: () => void;
};

export function SessionInspector({
  session,
  travel,
  onFlytt,
  onPubliser,
  onTrekkTilbake,
  onSlett,
}: Props) {
  // Feltene speiler den lagrede økten ved montering. WorkbenchUke gir
  // komponenten en `key` som inkluderer tid og varighet, så en lagret flytting
  // remonter panelet i stedet for å synkes med en effekt.
  const [dag, setDag] = useState(session?.date ?? "");
  const [start, setStart] = useState(session ? formatTime(session.startMinute) : "");
  const [varighet, setVarighet] = useState(session?.durationMinutes ?? 60);

  if (!session) {
    return (
      <InspektorTom
        tittel={UI.inspectorTitle}
        tekst="Velg en økt i uka for å se og endre den."
      />
    );
  }

  const utkast = session.status === "DRAFT";
  const [t, m] = start.split(":");
  const nyStartMin = Number(t) * 60 + Number(m);
  const endret =
    dag !== session.date ||
    nyStartMin !== session.startMinute ||
    varighet !== session.durationMinutes;

  return (
    <Inspektorpanel
      tittel={session.title}
      tag={
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: T.mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: utkast ? T.mut : WARM,
          }}
        >
          {harHake(session.status) && <Icon name="check" size={10} style={{ color: WARM }} />}
          {STATUS_CAPS[session.status]}
        </span>
      }
      fot={
        utkast ? (
          <>
            <Knapp ghost onClick={onSlett} disabled={travel}>
              {UI.delete}
            </Knapp>
            <Knapp enTing onClick={onPubliser} disabled={travel}>
              {UI.publish}
            </Knapp>
          </>
        ) : (
          <Knapp ghost onClick={onTrekkTilbake} disabled={travel}>
            {UI.unpublish}
          </Knapp>
        )
      }
    >
      {utkast && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            padding: "9px 11px",
            borderRadius: T.rTag,
            border: `1px dashed ${T.border}`,
            background: T.panel2,
          }}
        >
          <Icon name="eye" size={14} style={{ color: T.mut, marginTop: 1 }} />
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>
            {UI.draftBadge}
          </span>
        </div>
      )}

      <InspektorBlokk label="Tid">
        <div style={{ display: "grid", gap: 10 }}>
          <Felt label="Dato">
            <Input type="date" value={dag} onChange={(e) => setDag(e.target.value)} />
          </Felt>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Felt label={UI.start}>
              <Input
                type="time"
                step={1800}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Felt>
            <Felt label={UI.duration}>
              <Select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))}>
                {VARIGHETER.map((v) => (
                  <option key={v} value={v}>
                    {v} min
                  </option>
                ))}
              </Select>
            </Felt>
          </div>
          <Knapp
            full
            disabled={!endret || travel || !Number.isFinite(nyStartMin)}
            onClick={() =>
              onFlytt({
                newDate: dag,
                newStartMinute: nyStartMin,
                newDurationMinutes: varighet,
              })
            }
          >
            {travel ? "Lagrer …" : UI.moveSession}
          </Knapp>
        </div>
      </InspektorBlokk>

      <InspektorBlokk label="Om økten">
        <InspektorLinje
          label={UI.pyramid}
          verdi={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: pyramideFarge(session.pyramid),
                }}
              />
              {PYRAMID_LABEL[session.pyramid]}
            </span>
          }
        />
        <InspektorLinje
          label="Varer"
          verdi={formatMinutes(session.durationMinutes)}
        />
        {session.publishedAt && (
          <InspektorLinje
            label={UI.publishedAt}
            verdi={new Intl.DateTimeFormat("nb-NO", {
              timeZone: "Europe/Oslo",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(session.publishedAt))}
          />
        )}
      </InspektorBlokk>

      <InspektorBlokk label={UI.drills}>
        {session.drills.length === 0 ? (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
            {UI.emptyDrills}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {session.drills.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  color: T.fg,
                  minWidth: 0,
                }}
              >
                <span
                  style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {d.title}
                </span>
                <span style={{ flex: "none", fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                  {d.durationMinutes} min
                </span>
              </li>
            ))}
          </ul>
        )}
      </InspektorBlokk>
    </Inspektorpanel>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
