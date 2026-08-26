"use client";

/**
 * WorkbenchUke — orkestreringen av Agency-uka (natt-plan Loop 2).
 *
 * Eier tilstanden (valgt økt, dialoger, laster/feil) og oversetter
 * `WbResultat` fra server-actions til norsk copy + toast. Domenet er rent,
 * actions eier sideeffektene, denne filen eier bare skjermen.
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { BunnArk } from "@/components/v2/bunn-ark";
import { T } from "@/lib/v2/tokens";
import { TL } from "@/lib/v2/train-lock";
import { addDays, mondayOf, validateWeek } from "@/lib/domain/workbench/operations";
import { AREA_LABEL, formatHours, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type {
  SourceItem,
  WeekViewModel,
  WorkbenchSession,
} from "@/lib/domain/workbench/types";
import type { RecurrencePolicy } from "@/lib/domain/workbench/types";
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
  setSessionTemplate,
  unpublishSession,
} from "@/lib/workbench/wb-actions";
import { CreateSessionModal, type NyOktVerdier } from "./CreateSessionModal";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import {
  SessionInspector,
  type FlyttVerdier,
  type LeggTilDrillVerdier,
} from "./SessionInspector";
import { SourcesPanel } from "./SourcesPanel";
import { TL_SCOPE } from "./wb-tl-scope";
import { osloIdag, WeekGrid } from "./WeekGrid";

type Props = {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  kilder: SourceItem[];
};

export function WorkbenchUke({ playerId, spillerNavn, uke, kilder }: Props) {
  const router = useRouter();
  const [week, setWeek] = useState<WeekViewModel>(uke);
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<{ dato: string; startMinutt: number } | null>(null);
  const [publiserApen, setPubliserApen] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();

  const idag = osloIdag();
  const alleOkter = useMemo(() => week.days.flatMap((d) => d.sessions), [week]);
  const utkast = useMemo(() => alleOkter.filter((s) => s.status === "DRAFT"), [alleOkter]);
  /** Overlapp-VARSEL for hele uka (aldri en sperre — invariant 1). Vises i publiser-dialogen. */
  const valideringsnotater = useMemo(() => validateWeek(alleOkter), [alleOkter]);
  const valgt = useMemo(
    () => alleOkter.find((s) => s.id === valgtId) ?? null,
    [alleOkter, valgtId],
  );

  /** Henter uka på nytt etter en skriving. Feil her er en tilstand, ikke en stille no-op. */
  const lastPaaNytt = useCallback(async () => {
    const res = await loadWeek({
      weekStart: week.weekStart,
      mode: week.mode,
      playerId,
      targetMinutes: week.budget.targetMinutes,
    });
    if (res.ok) {
      setWeek(res.data);
      setFeil(null);
    } else {
      setFeil(res.error);
    }
  }, [playerId, week.weekStart, week.mode, week.budget.targetMinutes]);

  function kjor<T>(
    handling: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>,
    vedSuksess: (data: T) => void,
  ) {
    start(async () => {
      try {
        const res = await handling();
        if (!res.ok) {
          setFeil(res.error);
          toast.error(res.error);
          return;
        }
        setFeil(null);
        await lastPaaNytt();
        vedSuksess(res.data);
      } catch {
        setFeil(UI.unknownError);
        toast.error(UI.unknownError);
      }
    });
  }

  function byttUke(retning: -1 | 1) {
    const ny = mondayOf(addDays(week.weekStart, retning * 7));
    router.push(`/admin/workbench/${playerId}?uke=${ny}`);
  }

  /** Delt mellom desktop-panelet (fast kolonne) og mobil-bunn-arket — samme handlinger. */
  const inspectorNode = (
    <SessionInspector
      key={
        valgt ? `${valgt.id}:${valgt.date}:${valgt.startMinute}:${valgt.durationMinutes}` : "tom"
      }
      session={valgt}
      travel={travel}
      onFlytt={(v: FlyttVerdier) => {
        if (!valgt) return;
        kjor(
          () =>
            moveSession({
              sessionId: valgt.id,
              newDate: v.newDate,
              newStartMinute: v.newStartMinute,
              newDurationMinutes: v.newDurationMinutes,
            }),
          () => toast.success(UI.toastSessionMoved),
        );
      }}
      onPubliser={() => {
        if (!valgt) return;
        kjor(
          () => publishSessions([valgt.id]),
          () => toast.success(UI.publishSuccess),
        );
      }}
      onTrekkTilbake={() => {
        if (!valgt) return;
        kjor(
          () => unpublishSession(valgt.id),
          () => toast.success(UI.toastUnpublished),
        );
      }}
      onSlett={(policy: RecurrencePolicy) => {
        if (!valgt) return;
        const id = valgt.id;
        if (!valgt.seriesId) {
          kjor(
            () => deleteSession(id),
            () => {
              setValgtId(null);
              toast.success(UI.toastSessionDeleted);
            },
          );
          return;
        }
        kjor(
          () => deleteSessionSeries({ sessionId: id, policy }),
          ({ slettet }) => {
            setValgtId(null);
            toast.success(UI.toastSeriesDeleted(slettet));
          },
        );
      }}
      onLagreSomMal={(isTemplate: boolean) => {
        if (!valgt) return;
        kjor(
          () => setSessionTemplate(valgt.id, isTemplate),
          () => toast.success(isTemplate ? UI.toastTemplateSaved : UI.toastTemplateRemoved),
        );
      }}
      onLeggTilDrill={(v: LeggTilDrillVerdier) => {
        if (!valgt) return;
        kjor(
          () =>
            addDrill({
              sessionId: valgt.id,
              drill: {
                title: v.title,
                durationMinutes: v.durationMinutes,
                akFormel: {
                  pyramid: v.pyramid,
                  area: v.area,
                  label: `${PYRAMID_LABEL[v.pyramid]} · ${AREA_LABEL[v.area]}`,
                },
              },
            }),
          () => toast.success(UI.toastDrillAdded),
        );
      }}
      onFlyttDrill={(drillId, retning) => {
        if (!valgt) return;
        const idx = valgt.drills.findIndex((d) => d.id === drillId);
        const nyIdx = idx + retning;
        if (idx < 0 || nyIdx < 0 || nyIdx >= valgt.drills.length) return;
        const rekkefolge = valgt.drills.map((d) => d.id);
        [rekkefolge[idx], rekkefolge[nyIdx]] = [rekkefolge[nyIdx], rekkefolge[idx]];
        kjor(
          () => reorderDrills({ sessionId: valgt.id, orderedDrillIds: rekkefolge }),
          () => {},
        );
      }}
      onFjernDrill={(drillId) => {
        if (!valgt) return;
        kjor(
          () => removeDrill({ sessionId: valgt.id, drillId }),
          () => toast.success(UI.toastDrillRemoved),
        );
      }}
    />
  );

  return (
    <div
      style={{
        ...TL_SCOPE,
        display: "grid",
        gap: 16,
        minWidth: 0,
        background: "var(--tl-scene)",
        color: "var(--tl-text)",
        fontFamily: "var(--tl-font-sans)",
      }}
    >
      <Topplinje
        spillerNavn={spillerNavn}
        week={week}
        antallUtkast={utkast.length}
        travel={travel}
        onForrige={() => byttUke(-1)}
        onNeste={() => byttUke(1)}
        onIdag={() => router.push(`/admin/workbench/${playerId}?uke=${mondayOf(idag)}`)}
        onNyOkt={() => setNyOkt({ dato: week.days[0]?.date ?? idag, startMinutt: 16 * 60 })}
        onPubliser={() => setPubliserApen(true)}
      />

      {feil && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 13px",
            borderRadius: T.rCard,
            border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
            background: `color-mix(in srgb, ${T.down} 8%, transparent)`,
          }}
        >
          <Icon name="triangle-alert" size={15} style={{ color: T.down }} />
          <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, flex: 1 }}>{feil}</span>
          <Knapp ghost onClick={() => void lastPaaNytt()}>
            {UI.retry}
          </Knapp>
        </div>
      )}

      {/* Kolonnebredder låst av D2-beslutning 3: kilder TL.skall.kilder (220),
          inspektør TL.skall.artefakt (380). */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[var(--wb-kilder)_minmax(0,1fr)_var(--wb-artefakt)]"
        style={{
          gap: 16,
          minWidth: 0,
          alignItems: "start",
          ["--wb-kilder" as string]: TL.skall.kilder,
          ["--wb-artefakt" as string]: TL.skall.artefakt,
        }}
      >
        <div className="hidden lg:block" style={{ minWidth: 0 }}>
          <SourcesPanel kilder={kilder} />
        </div>

        <div style={{ minWidth: 0 }}>
          <WeekGrid
            week={week}
            selectedSessionId={valgtId}
            onSelectSession={setValgtId}
            onCreateAt={(dato, startMinutt) => setNyOkt({ dato, startMinutt })}
            onDropSource={(dato, startMinutt, sourceId) => {
              kjor(
                () => createSessionFromSource({ playerId, sourceId, date: dato, startMinute: startMinutt }),
                (okt) => {
                  setValgtId(okt.id);
                  toast.success(UI.toastSourceDropped);
                },
              );
            }}
            onDropDrillOnSession={(sessionId, sourceId) => {
              kjor(
                () => addDrillFromSource({ sessionId, sourceId }),
                () => toast.success(UI.toastDrillDroppedOnSession),
              );
            }}
          />
        </div>

        <div className="hidden lg:block" style={{ minWidth: 0 }}>
          {inspectorNode}
        </div>
      </div>

      {/* Mobil (< lg): inspektøren er ellers helt utilgjengelig, se gotchas §Cookie-banner
          for bunn-forankret-mønsteret BunnArk selv arver (kjent, ikke løst her). */}
      <div className="lg:hidden">
        <BunnArk
          open={valgtId !== null}
          onClose={() => setValgtId(null)}
          tittel={valgt?.title ?? UI.inspectorTitle}
        >
          {inspectorNode}
        </BunnArk>
      </div>

      <CreateSessionModal
        key={nyOkt ? `${nyOkt.dato}:${nyOkt.startMinutt}` : "lukket"}
        open={nyOkt !== null}
        dato={nyOkt?.dato ?? idag}
        startMinutt={nyOkt?.startMinutt ?? 16 * 60}
        lagrer={travel}
        onLukk={() => setNyOkt(null)}
        onOpprett={(v: NyOktVerdier) => {
          const { repeatWeeks, ...felter } = v;
          if (repeatWeeks > 1) {
            kjor(
              () => createSessionSeries({ playerId, ...felter, repeatWeeks }),
              (okter: WorkbenchSession[]) => {
                setNyOkt(null);
                setValgtId(okter[0]?.id ?? null);
                toast.success(UI.toastSeriesCreated(okter.length));
              },
            );
            return;
          }
          kjor(
            () => createSession({ playerId, ...felter }),
            (okt: WorkbenchSession) => {
              setNyOkt(null);
              setValgtId(okt.id);
              toast.success(UI.toastDraftCreated);
            },
          );
        }}
      />

      <PublishConfirmDialog
        open={publiserApen}
        okter={utkast}
        idag={idag}
        notater={valideringsnotater}
        publiserer={travel}
        onLukk={() => setPubliserApen(false)}
        onBekreft={() => {
          kjor(
            () => publishSessions(utkast.map((s) => s.id)),
            (publiserte: WorkbenchSession[]) => {
              setPubliserApen(false);
              toast.success(
                publiserte.length === 1
                  ? UI.toastPublishedOne
                  : UI.toastPublishedMany(publiserte.length),
              );
            },
          );
        }}
      />
    </div>
  );
}

function Topplinje({
  spillerNavn,
  week,
  antallUtkast,
  travel,
  onForrige,
  onNeste,
  onIdag,
  onNyOkt,
  onPubliser,
}: {
  spillerNavn: string;
  week: WeekViewModel;
  antallUtkast: number;
  travel: boolean;
  onForrige: () => void;
  onNeste: () => void;
  onIdag: () => void;
  onNyOkt: () => void;
  onPubliser: () => void;
}) {
  const slutt = week.days[week.days.length - 1]?.date ?? week.weekStart;
  const periode = `${week.weekStart.slice(8, 10)}.${week.weekStart.slice(5, 7)} – ${slutt.slice(8, 10)}.${slutt.slice(5, 7)}`;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 600, color: T.fg }}>
          {UI.titleAgency}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
          {spillerNavn} · {periode} ·{" "}
          {UI.budgetLabel(
            formatHours(week.budget.plannedMinutes),
            formatHours(week.budget.targetMinutes),
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
        <Knapp ghost icon="chevron-left" onClick={onForrige}>
          {UI.weekNavPrev}
        </Knapp>
        <Knapp ghost onClick={onIdag}>
          {UI.today}
        </Knapp>
        <Knapp ghost icon="chevron-right" onClick={onNeste}>
          {UI.weekNavNext}
        </Knapp>
        {/* Fasitens topplinje (A-01) har KUN én hvit primær: Publiser.
            «+ Ny økt» er en hairline sekundærknapp — derfor `ghost`, ikke
            solid, selv om Knapp-primitiven nå arver Train-lock-fyll. */}
        <Knapp ghost icon="plus" onClick={onNyOkt}>
          {UI.createSession}
        </Knapp>
        <Knapp enTing disabled={antallUtkast === 0 || travel} onClick={onPubliser}>
          {`${UI.publishWeek} · ${antallUtkast}`}
        </Knapp>
      </div>
    </div>
  );
}
