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
import { TL } from "@/lib/v2/train-lock";

import { formatMinutes, formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { RecurrencePolicy, WorkbenchSession } from "@/lib/domain/workbench/types";
import { harHake, STATUS_CAPS, WARM } from "./wb-visuelt";
import { DrillListEditor, type LeggTilDrillVerdier } from "./DrillListEditor";

const VARIGHETER = [30, 45, 60, 90, 120, 180];
const SERIE_POLICIER: RecurrencePolicy[] = ["DENNE", "DENNE_OG_FREMOVER", "HELE_SERIEN"];
const SERIE_POLICY_LABEL: Record<RecurrencePolicy, string> = {
  DENNE: UI.seriesPolicyThis,
  DENNE_OG_FREMOVER: UI.seriesPolicyThisAndFollowing,
  HELE_SERIEN: UI.seriesPolicyAll,
};

export type FlyttVerdier = {
  newDate: string;
  newStartMinute: number;
  newDurationMinutes: number;
};

export type { LeggTilDrillVerdier };

type Props = {
  session: WorkbenchSession | null;
  travel: boolean;
  onFlytt: (verdier: FlyttVerdier) => void;
  onPubliser: () => void;
  onTrekkTilbake: () => void;
  /** Sletter — når økten er del av en serie, sendes valgt endre-policy med. */
  onSlett: (policy: RecurrencePolicy) => void;
  onLagreSomMal: (isTemplate: boolean) => void;
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
  onLagreSomMal,
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
  const [slettPolicy, setSlettPolicy] = useState<RecurrencePolicy>("DENNE");

  if (!session) {
    return <InspektorTom tittel={UI.inspectorTitle} tekst={UI.inspectorEmptyBody} />;
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
            fontFamily: TL.font.mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: utkast ? TL.mute : WARM,
          }}
        >
          {harHake(session.status) && <Icon name="check" size={10} style={{ color: WARM }} />}
          {STATUS_CAPS[session.status]}
        </span>
      }
      fot={
        utkast ? (
          <>
            <Knapp ghost onClick={() => onSlett(slettPolicy)} disabled={travel}>
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
            borderRadius: TL.radius.row,
            border: `1px dashed ${TL.hair}`,
            background: TL.dock,
          }}
        >
          <Icon name="eye" size={14} style={{ color: TL.mute, marginTop: 1 }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
            {UI.draftBadge}
          </span>
        </div>
      )}

      <InspektorBlokk label={UI.timeLabel}>
        <div style={{ display: "grid", gap: 10 }}>
          <Felt label={UI.dateLabel}>
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
            {travel ? UI.saving : UI.moveSession}
          </Knapp>
        </div>
      </InspektorBlokk>

      <InspektorBlokk label={UI.sessionAboutLabel}>
        {/* Train-lock fargekoder aldri data (HANDOFF §MAT) — pyramide-området
            vises kun som caps-tekst, ingen fargeprikk. */}
        <InspektorLinje label={UI.pyramid} verdi={PYRAMID_LABEL[session.pyramid]} />
        <InspektorLinje
          label={UI.durationValueLabel}
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
        {/* Godkjenning + skjult-status (Loop 3T/B6, A-09/WB-10-mønster) —
            kun lesevisning her. Spilleren svarer selv i «I dag». */}
        {session.needsPlayerApproval && (
          <InspektorLinje label={UI.approvalStatusLabel} verdi={UI.approvalStatusPending} />
        )}
        {!session.needsPlayerApproval && session.approvalStatus === "ACCEPTED" && (
          <InspektorLinje label={UI.approvalStatusLabel} verdi={UI.approvalStatusAccepted} />
        )}
        {!session.needsPlayerApproval && session.approvalStatus === "REJECTED" && (
          <InspektorLinje label={UI.approvalStatusLabel} verdi={UI.approvalStatusRejectedValue} />
        )}
        {session.hiddenByPlayer && (
          <InspektorLinje label={UI.hiddenByPlayerLabel} verdi={UI.hiddenByPlayerValue} />
        )}
        <div style={{ marginTop: 10 }}>
          <Knapp
            ghost
            icon="star"
            onClick={() => onLagreSomMal(!session.isTemplate)}
            disabled={travel}
          >
            {session.isTemplate ? UI.removeAsTemplate : UI.saveAsTemplate}
          </Knapp>
        </div>
      </InspektorBlokk>

      {session.seriesId && utkast && (
        <InspektorBlokk label={UI.seriesPolicyLabel}>
          <Select
            value={slettPolicy}
            onChange={(e) => setSlettPolicy(e.target.value as RecurrencePolicy)}
          >
            {SERIE_POLICIER.map((p) => (
              <option key={p} value={p}>
                {SERIE_POLICY_LABEL[p]}
              </option>
            ))}
          </Select>
          <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, margin: "6px 0 0" }}>
            {UI.seriesEditHint(UI.delete)}
          </p>
        </InspektorBlokk>
      )}

      <InspektorBlokk label={UI.drills}>
        <DrillListEditor
          drills={session.drills}
          disabled={travel}
          defaultPyramid={session.pyramid}
          onLeggTil={onLeggTilDrill}
          onFlytt={onFlyttDrill}
          onFjern={onFjernDrill}
        />
      </InspektorBlokk>
    </Inspektorpanel>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
