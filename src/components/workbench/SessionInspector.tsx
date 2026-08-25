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
  AREA_LABEL,
  formatMinutes,
  formatTime,
  PYRAMID_LABEL,
  UI,
} from "@/lib/domain/workbench/labels";
import type {
  Drill,
  PyramidArea,
  TrainingArea,
  WorkbenchSession,
} from "@/lib/domain/workbench/types";
import { harHake, pyramideFarge, STATUS_CAPS, WARM } from "./wb-visuelt";

const VARIGHETER = [30, 45, 60, 90, 120, 180];

const OMRADE_GRUPPER: { label: string; areas: TrainingArea[] }[] = [
  { label: "Full sving", areas: ["TEE", "INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50"] },
  { label: "Nærspill", areas: ["CHIP", "PITCH", "LOB", "BUNKER"] },
  { label: "Putt", areas: ["PUTT_0_3", "PUTT_3_5", "PUTT_5_10", "PUTT_10_25", "PUTT_25_40", "PUTT_40_PLUSS"] },
  { label: "Fysisk", areas: ["STYRKE", "KONDISJON", "BEVEGELIGHET"] },
  { label: "Bane", areas: ["BANE"] },
];

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function drillErKomplett(d: Drill): boolean {
  return d.title.trim() !== "" && d.durationMinutes > 0 && Boolean(d.akFormel?.label);
}

export type FlyttVerdier = {
  newDate: string;
  newStartMinute: number;
  newDurationMinutes: number;
};

export type LeggTilDrillVerdier = {
  title: string;
  durationMinutes: number;
  pyramid: PyramidArea;
  area: TrainingArea;
};

type Props = {
  session: WorkbenchSession | null;
  travel: boolean;
  onFlytt: (verdier: FlyttVerdier) => void;
  onPubliser: () => void;
  onTrekkTilbake: () => void;
  onSlett: () => void;
  onLeggTilDrill: (verdier: LeggTilDrillVerdier) => void;
  onFlyttDrill: (drillId: string, retning: -1 | 1) => void;
  onFjernDrill: (drillId: string) => void;
};

export function SessionInspector({
  session,
  travel,
  onFlytt,
  onPubliser,
  onTrekkTilbake,
  onSlett,
  onLeggTilDrill,
  onFlyttDrill,
  onFjernDrill,
}: Props) {
  // Feltene speiler den lagrede økten ved montering. WorkbenchUke gir
  // komponenten en `key` som inkluderer tid og varighet, så en lagret flytting
  // remonter panelet i stedet for å synkes med en effekt.
  const [dag, setDag] = useState(session?.date ?? "");
  const [start, setStart] = useState(session ? formatTime(session.startMinute) : "");
  const [varighet, setVarighet] = useState(session?.durationMinutes ?? 60);

  const [visDrillSkjema, setVisDrillSkjema] = useState(false);
  const [drillTittel, setDrillTittel] = useState("");
  const [drillPyramid, setDrillPyramid] = useState<PyramidArea>(session?.pyramid ?? "TEK");
  const [drillOmrade, setDrillOmrade] = useState<TrainingArea>("TEE");
  const [drillVarighet, setDrillVarighet] = useState(15);

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
        <div style={{ display: "grid", gap: 10 }}>
          {session.drills.length === 0 ? (
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
              {UI.emptyDrills}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
              {session.drills.map((d, i) => {
                const komplett = drillErKomplett(d);
                return (
                  <li
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "7px 9px",
                      borderRadius: T.rTag,
                      border: `1px solid ${T.border}`,
                      background: T.panel2,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontFamily: T.ui,
                          fontSize: 12.5,
                          color: T.fg,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.title || UI.drillTitlePlaceholder}
                      </span>
                      {komplett ? (
                        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
                          {PYRAMID_LABEL[d.akFormel.pyramid]} · {AREA_LABEL[d.akFormel.area]} ·{" "}
                          {d.durationMinutes} min
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: T.mono,
                            fontSize: 10.5,
                            color: T.down,
                          }}
                        >
                          <Icon name="triangle-alert" size={11} />
                          {UI.incompleteDrill}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 2, flex: "none" }}>
                      <IkonKnapp
                        icon="arrow-up"
                        title={UI.moveDrillUp}
                        disabled={travel || i === 0}
                        onClick={() => onFlyttDrill(d.id, -1)}
                      />
                      <IkonKnapp
                        icon="arrow-down"
                        title={UI.moveDrillDown}
                        disabled={travel || i === session.drills.length - 1}
                        onClick={() => onFlyttDrill(d.id, 1)}
                      />
                      <IkonKnapp
                        icon="x"
                        title={UI.removeDrillLabel}
                        disabled={travel}
                        onClick={() => onFjernDrill(d.id)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {visDrillSkjema ? (
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: "9px 11px",
                borderRadius: T.rTag,
                border: `1px dashed ${T.border}`,
              }}
            >
              <Felt label={UI.drillTitle}>
                <Input
                  value={drillTittel}
                  onChange={(e) => setDrillTittel(e.target.value)}
                  placeholder={UI.drillTitlePlaceholder}
                  autoFocus
                />
              </Felt>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Felt label={UI.drillPyramid}>
                  <Select
                    value={drillPyramid}
                    onChange={(e) => setDrillPyramid(e.target.value as PyramidArea)}
                  >
                    {PYRAMIDER.map((p) => (
                      <option key={p} value={p}>
                        {PYRAMID_LABEL[p]}
                      </option>
                    ))}
                  </Select>
                </Felt>
                <Felt label={UI.drillArea}>
                  <Select
                    value={drillOmrade}
                    onChange={(e) => setDrillOmrade(e.target.value as TrainingArea)}
                  >
                    {OMRADE_GRUPPER.map((gruppe) => (
                      <optgroup key={gruppe.label} label={gruppe.label}>
                        {gruppe.areas.map((a) => (
                          <option key={a} value={a}>
                            {AREA_LABEL[a]}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Felt>
              </div>
              <Felt label={UI.drillDuration}>
                <Input
                  type="number"
                  min={1}
                  max={600}
                  value={drillVarighet}
                  onChange={(e) => setDrillVarighet(Number(e.target.value))}
                />
              </Felt>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Knapp
                  ghost
                  onClick={() => {
                    setVisDrillSkjema(false);
                    setDrillTittel("");
                  }}
                >
                  {UI.cancel}
                </Knapp>
                <Knapp
                  disabled={travel || drillTittel.trim() === "" || !(drillVarighet > 0)}
                  onClick={() => {
                    onLeggTilDrill({
                      title: drillTittel.trim(),
                      durationMinutes: drillVarighet,
                      pyramid: drillPyramid,
                      area: drillOmrade,
                    });
                    setVisDrillSkjema(false);
                    setDrillTittel("");
                  }}
                >
                  {UI.save}
                </Knapp>
              </div>
            </div>
          ) : (
            <Knapp ghost icon="plus" disabled={travel} onClick={() => setVisDrillSkjema(true)}>
              {UI.addDrill}
            </Knapp>
          )}
        </div>
      </InspektorBlokk>
    </Inspektorpanel>
  );
}

function IkonKnapp({
  icon,
  title,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: T.rTag,
        border: `1px solid ${T.border}`,
        background: "transparent",
        color: T.mut,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={icon} size={11} />
    </button>
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
