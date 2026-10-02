"use client";

/**
 * Motoren bak coachens Workbench-uke, trukket ut av WorkbenchUke uten å endre
 * oppførsel: samme server-handlinger (wb-actions), samme «kjør → last uka på
 * nytt → gi beskjed»-mønster og samme meldinger. WorkbenchUke (Train-lock) og
 * AG-11 i Precision Athletics bruker begge denne kroken, så det finnes bare én
 * skriveside for uka.
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { validateWeek } from "@/lib/domain/workbench/operations";
import { AREA_LABEL, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { RecurrencePolicy, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { OvelseInput } from "@/lib/domain/workbench/ovelse-utkast";
import { computeWeeklyLoad } from "@/lib/domain/workbench/load";
import {
  addDrill,
  addDrillFromSource,
  createSession,
  createSessionFromSource,
  createSessionSeries,
  deleteSession,
  deleteSessionSeries,
  loadWeek,
  moveSession,
  publishSessions,
  removeDrill,
  reorderDrills,
  saveWeekPlan,
  setSessionTemplate,
  unpublishSession,
  updateSessionEffort,
  updateDrill,
  type SaveWeekPlanInput,
} from "@/lib/workbench/wb-actions";
import { isoUkeIdentitet } from "@/lib/workbench/ukeplan-schema";
import type { NyOktVerdier } from "./CreateSessionModal";
import type { LeggTilDrillVerdier } from "./DrillListEditor";

export type FlyttVerdier = { newDate: string; newStartMinute: number; newDurationMinutes: number };

type Resultat<T> = { ok: true; data: T } | { ok: false; error: string };

export function useUkeMotor({ playerId, uke }: { playerId: string; uke: WeekViewModel }) {
  const [week, setWeek] = useState<WeekViewModel>(uke);
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();

  const alleOkter = useMemo(() => week.days.flatMap((d) => d.sessions), [week]);
  const weeklyLoad = useMemo(() => computeWeeklyLoad(alleOkter), [alleOkter]);
  const utkast = useMemo(() => alleOkter.filter((s) => s.status === "DRAFT"), [alleOkter]);
  const valideringsnotater = useMemo(() => validateWeek(alleOkter), [alleOkter]);
  const opptattIder = useMemo(
    () => new Set(valideringsnotater.map((n) => n.sessionId).filter((id): id is string => !!id)),
    [valideringsnotater],
  );

  const lastPaaNytt = useCallback(async () => {
    const res = await loadWeek({ weekStart: week.weekStart, mode: week.mode, playerId, targetMinutes: week.budget.targetMinutes });
    if (res.ok) { setWeek(res.data); setFeil(null); } else { setFeil(res.error); }
  }, [playerId, week.weekStart, week.mode, week.budget.targetMinutes]);

  function kjor<T>(handling: () => Promise<Resultat<T>>, vedSuksess: (data: T) => void) {
    start(async () => {
      try {
        const res = await handling();
        if (!res.ok) { setFeil(res.error); toast.error(res.error); return; }
        setFeil(null);
        await lastPaaNytt();
        vedSuksess(res.data);
      } catch {
        setFeil(UI.unknownError);
        toast.error(UI.unknownError);
      }
    });
  }

  // Valgfri callback bevarer gamle kall. Arket lukkes først når serveren
  // har bekreftet lagring; utelatte felt beholdes og null tømmer eksplisitt.
  const lagreUkeplan = (data: Partial<SaveWeekPlanInput>, ferdig?: () => void) =>
    kjor(
      () => saveWeekPlan({
        ...data,
        playerId,
        ...isoUkeIdentitet(week.weekStart),
        weekType: data.weekType ?? week.weekPlan?.weekType ?? "UTVIKLING",
        notes: data.notes ?? week.weekPlan?.notes ?? [],
      }),
      () => { toast.success("Ukeplan lagret"); ferdig?.(); },
    );

  /** `medAngre`: meldingen får «Angre», som sletter det som nettopp ble laget (AG-11). */
  const opprett = (v: NyOktVerdier, ferdig: (forsteId: string | null) => void, medAngre = false) => {
    const { repeatWeeks, ...felter } = v;
    if (repeatWeeks > 1) {
      kjor(() => createSessionSeries({ playerId, ...felter, repeatWeeks }), (okter: WorkbenchSession[]) => {
        ferdig(okter[0]?.id ?? null);
        const forste = okter[0]?.id;
        toast.success(UI.toastSeriesCreated(okter.length), medAngre && forste ? {
          action: { label: "Angre", onClick: () => kjor(() => deleteSessionSeries({ sessionId: forste, policy: "HELE_SERIEN" }), () => toast.success(UI.toastSeriesDeleted(okter.length))) },
        } : undefined);
      });
      return;
    }
    kjor(() => createSession({ playerId, ...felter }), (okt: WorkbenchSession) => {
      ferdig(okt.id);
      toast.success(UI.toastDraftCreated, medAngre ? {
        action: { label: "Angre", onClick: () => kjor(() => deleteSession(okt.id), () => toast.success(UI.toastSessionDeleted)) },
      } : undefined);
    });
  };

  const fraKilde = (dato: string, startMinutt: number, sourceId: string, ferdig: (id: string) => void) =>
    kjor(() => createSessionFromSource({ playerId, sourceId, date: dato, startMinute: startMinutt }), (okt) => {
      ferdig(okt.id);
      toast.success(UI.toastSourceDropped);
    });

  const drillFraKilde = (sessionId: string, sourceId: string) =>
    kjor(() => addDrillFromSource({ sessionId, sourceId }), () => toast.success(UI.toastDrillDroppedOnSession));

  /** `tilbake`: meldingen får «Angre», som flytter økta tilbake (AG-11, dra-og-slipp). */
  const flytt = (sessionId: string, v: FlyttVerdier, tilbake?: FlyttVerdier) =>
    kjor(() => moveSession({ sessionId, ...v }), () => toast.success(UI.toastSessionMoved, tilbake ? {
      action: { label: "Angre", onClick: () => kjor(() => moveSession({ sessionId, ...tilbake }), () => toast.success(UI.toastSessionMoved)) },
    } : undefined));

  const publiser = (ider: string[], ferdig?: () => void) => {
    if (ider.length === 0) return;
    kjor(() => publishSessions(ider), (publiserte: WorkbenchSession[]) => {
      ferdig?.();
      toast.success(publiserte.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(publiserte.length));
    });
  };

  const trekkTilbake = (sessionId: string) =>
    kjor(() => unpublishSession(sessionId), () => toast.success(UI.toastUnpublished));

  const slett = (session: WorkbenchSession, policy: RecurrencePolicy, ferdig: () => void) => {
    if (!session.seriesId) {
      kjor(() => deleteSession(session.id), () => { ferdig(); toast.success(UI.toastSessionDeleted); });
      return;
    }
    kjor(() => deleteSessionSeries({ sessionId: session.id, policy }), ({ slettet }) => {
      ferdig();
      toast.success(UI.toastSeriesDeleted(slettet));
    });
  };

  const lagreSomMal = (sessionId: string, isTemplate: boolean) =>
    kjor(() => setSessionTemplate(sessionId, isTemplate), () => toast.success(isTemplate ? UI.toastTemplateSaved : UI.toastTemplateRemoved));

  /** Øvelse fra drill-editoren i inspektøren (WorkbenchUke). */
  const leggTilDrill = (sessionId: string, v: LeggTilDrillVerdier) => {
    const etiketter = [PYRAMID_LABEL[v.pyramid], AREA_LABEL[v.area]];
    if (v.motorikk) etiketter.push(v.motorikk === "UTEN_BALL" ? "Uten ball" : v.motorikk === "LAV_HAST" ? "Lav hastighet" : "Automatikk");
    if (v.belastning) etiketter.push(v.belastning === "INNENDORS" ? "Innendørs" : v.belastning === "TRENINGSOMRADE" ? "Treningsområde" : v.belastning === "BANE" ? "Bane" : "Konkurranse");
    if (v.press) etiketter.push(v.press === "ALENE" ? "Alene" : v.press === "OBSERVERT" ? "Observert" : v.press === "KONKURRANSE" ? "Konkurranse" : "Turnering");
    const descParts = [v.description, v.mengde].filter(Boolean);
    const samletBeskrivelse = descParts.length > 0 ? descParts.join(" · ") : undefined;
    kjor(
      () =>
        addDrill({
          sessionId,
          drill: {
            title: v.title,
            durationMinutes: v.durationMinutes,
            akFormel: { pyramid: v.pyramid, area: v.area, motorikk: v.motorikk, belastning: v.belastning, press: v.press, label: etiketter.join(" · ") },
            techniqueFocus: v.techniqueFocus,
            description: samletBeskrivelse,
          },
        }),
      () => toast.success(UI.toastDrillAdded),
    );
  };

  /** Øvelse fra øvelsesskjemaet i åtte trinn (samme vei som Økt-visningen). */
  const leggTilOvelse = (sessionId: string, ovelse: OvelseInput, ferdig: () => void) =>
    kjor(() => addDrill({ sessionId, drill: ovelse }), () => { ferdig(); toast.success(UI.toastDrillAdded); });

  const oppdaterOvelse = (sessionId: string, drillId: string, ovelse: OvelseInput, ferdig: () => void) => {
    const session = alleOkter.find(s => s.id === sessionId);
    kjor(() => updateDrill({ sessionId, drillId, expectedUpdatedAt: session?.updatedAt, patch: {
      ...ovelse, description: ovelse.description ?? null, techniqueFocus: ovelse.techniqueFocus ?? null,
    } }), () => { ferdig(); toast.success("Øvelse lagret"); });
  };

  const flyttDrill = (session: WorkbenchSession, drillId: string, retning: -1 | 1) => {
    const idx = session.drills.findIndex((d) => d.id === drillId);
    const nyIdx = idx + retning;
    if (idx < 0 || nyIdx < 0 || nyIdx >= session.drills.length) return;
    const rekkefolge = session.drills.map((d) => d.id);
    [rekkefolge[idx], rekkefolge[nyIdx]] = [rekkefolge[nyIdx], rekkefolge[idx]];
    kjor(() => reorderDrills({ sessionId: session.id, orderedDrillIds: rekkefolge }), () => {});
  };

  const fjernDrill = (sessionId: string, drillId: string) =>
    kjor(() => removeDrill({ sessionId, drillId }), () => toast.success(UI.toastDrillRemoved));

  const oppdaterAnstrengelse = (sessionId: string, rpe: number | null, min?: number | null) =>
    kjor(() => updateSessionEffort({ sessionId, perceivedEffort: rpe, actualMinutes: min }), () => toast.success("Belastning oppdatert"));

  return {
    week, feil, travel, alleOkter, weeklyLoad, utkast, valideringsnotater, opptattIder,
    lastPaaNytt, lagreUkeplan, opprett, fraKilde, drillFraKilde, flytt, publiser, trekkTilbake, slett,
    lagreSomMal, leggTilDrill, leggTilOvelse, oppdaterOvelse, flyttDrill, fjernDrill, oppdaterAnstrengelse,
  };
}

export type UkeMotor = ReturnType<typeof useUkeMotor>;
