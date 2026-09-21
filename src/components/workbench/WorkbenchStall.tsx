"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { acceptPlanAction } from "@/lib/agents/actions";
import { AREA_LABEL, formatMinutes, PYRAMID_LABEL, STATUS_LABEL, UI } from "@/lib/domain/workbench/labels";
import { validateWeek } from "@/lib/domain/workbench/operations";
import type { Drill, WorkbenchSession } from "@/lib/domain/workbench/types";
import { publishSessions, type StallFollowupData } from "@/lib/workbench/wb-actions";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { VisningPiller } from "./VisningPiller";
import { osloIdag } from "./WeekGrid";

type Filter = "ALLE" | "UTKAST" | "DELT" | "GJENNOMFORT";

const FILTER: { id: Filter; label: string }[] = [
  { id: "ALLE", label: "Alle" },
  { id: "UTKAST", label: "Utkast" },
  { id: "DELT", label: "Delt" },
  { id: "GJENNOMFORT", label: "Gjennomført" },
];

const MOTORIKK: Record<string, string> = {
  UTEN_BALL: "Uten ball",
  LAV_HAST: "Lav hastighet",
  AUTO: "Automatikk",
};
const BELASTNING: Record<string, string> = {
  INNENDORS: "Innendørs",
  TRENINGSOMRADE: "Treningsområde",
  BANE: "Bane",
  KONKURRANSE: "Konkurranse",
};
const PRESS: Record<string, string> = {
  ALENE: "Alene",
  OBSERVERT: "Observert",
  KONKURRANSE: "Konkurranse",
  TURNERING: "Turnering",
};
const PRAKSIS: Record<string, string> = {
  BLOKK: "Blokk",
  VARIABEL: "Variabel",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

function kategori(session: WorkbenchSession): Filter | "ANNET" {
  if (session.status === "DRAFT") return "UTKAST";
  if (["SCHEDULED", "PUBLISHED", "IN_PROGRESS"].includes(session.status)) return "DELT";
  if (["COMPLETED", "SKIPPED"].includes(session.status)) return "GJENNOMFORT";
  return "ANNET";
}

function datoLabel(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  }).format(new Date(`${iso}T12:00:00Z`));
}

function formel(session: WorkbenchSession, drill: Drill | undefined) {
  const f = drill?.akFormel ?? session.drills[0]?.akFormel;
  return [
    { label: UI.pyramid, hint: UI.formelHintPyramide, value: PYRAMID_LABEL[session.pyramid] },
    { label: UI.drillArea, hint: UI.formelHintOmrade, value: f ? AREA_LABEL[f.area] : session.skillArea ?? "—" },
    { label: UI.formelMotorikk, hint: UI.formelHintMotorikk, value: f?.motorikk ? MOTORIKK[f.motorikk] : "—" },
    { label: UI.formelBelastning, hint: UI.formelHintBelastning, value: f?.belastning ? BELASTNING[f.belastning] : session.environment ? BELASTNING[session.environment] ?? session.environment : "—" },
    { label: UI.formelPress, hint: UI.formelHintPress, value: f?.press ? PRESS[f.press] : session.pressureLevel ?? "—" },
    { label: UI.formelHensikt, hint: UI.formelHintHensikt, value: session.pyramid === "FYS" ? session.rationale ?? "—" : "—" },
    { label: UI.formelMate, hint: UI.formelHintMate, value: drill?.description ?? (session.practiceType ? PRAKSIS[session.practiceType] : "—") },
    { label: UI.formelMal, hint: UI.formelHintMal, value: drill?.techniqueFocus ?? session.maalsetning ?? "—" },
  ];
}

function standardvalg(sessions: WorkbenchSession[]): string {
  return sessions[0]?.id ?? "";
}

function kategoriLabel(session: WorkbenchSession): string {
  const value = kategori(session);
  if (value === "UTKAST") return "Utkast";
  if (value === "DELT") return "Delt";
  if (value === "GJENNOMFORT") return "Gjennomført";
  return STATUS_LABEL[session.status];
}

function SessionSummary({
  session,
  playerId,
  weekStart,
  canApprove,
  pending,
  onApprove,
  draftCount,
  onPublish,
  compact = false,
}: {
  session: WorkbenchSession;
  playerId: string;
  weekStart: string;
  canApprove: boolean;
  pending: boolean;
  onApprove: () => void;
  draftCount: number;
  onPublish: () => void;
  compact?: boolean;
}) {
  const formula = formel(session, session.drills[0]);
  const visibleFormula = compact ? [formula[0], formula[1], formula[3], formula[5]] : formula;
  return (
    <section className="wb-week-summary wb-stall-summary">
      <span className="wb-kicker">Valgt økt</span>
      <h2>{session.title}</h2>
      {!compact ? <p>{datoLabel(session.date)} · {formatMinutes(session.durationMinutes)}</p> : null}
      {!compact ? <span className="wb-kicker wb-stall-formula-title">Formel</span> : null}
      <dl>
        {visibleFormula.map((item) => <div key={item.label}><dt>{item.label} <button type="button" className="wb-help" title={item.hint} aria-label={`${item.label}: ${item.hint}`}>?</button></dt><dd>{item.value}</dd></div>)}
      </dl>
      {session.needsPlayerApproval ? <p className="wb-stall-note">Venter på svar fra spilleren.</p> : null}
      <div className="wb-mobile-actions">
        {canApprove ? <button type="button" className={compact ? "wb-quiet" : "wb-publish"} disabled={pending} onClick={onApprove}>{pending ? "Godkjenner …" : "Godkjenn økt"}</button> : <Link className="wb-quiet wb-inline-link" href={workbenchUrl(playerId, "okt", { uke: weekStart, okt: session.id })}>Åpne økt</Link>}
        {compact && draftCount > 0 ? <button type="button" className="wb-publish" disabled={pending} onClick={onPublish}>Publiser stall</button> : null}
      </div>
    </section>
  );
}

export function WorkbenchStall({
  playerId,
  spillerNavn,
  data,
  selectedSessionId,
}: {
  playerId: string;
  spillerNavn: string;
  data: StallFollowupData;
  selectedSessionId?: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ALLE");
  const [selectedId, setSelectedId] = useState(selectedSessionId ?? standardvalg(data.sessions));
  const [pendingIds, setPendingIds] = useState(() => new Set(data.pendingPlanActionIds));
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedPublishIds, setSelectedPublishIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const sessions = useMemo(() => data.sessions.filter((session) => session.status !== "CANCELLED"), [data.sessions]);
  const filtered = useMemo(() => filter === "ALLE" ? sessions : sessions.filter((session) => kategori(session) === filter), [filter, sessions]);
  const selected = filtered.find((session) => session.id === selectedId) ?? filtered[0];
  const draftCount = sessions.filter((session) => session.status === "DRAFT").length;
  const drafts = useMemo(() => sessions.filter((session) => session.status === "DRAFT"), [sessions]);
  const validationNotes = useMemo(() => validateWeek(sessions), [sessions]);
  const occupiedIds = useMemo(() => new Set(validationNotes.map((note) => note.sessionId).filter((id): id is string => Boolean(id))), [validationNotes]);
  const canApprove = Boolean(selected?.planActionId && pendingIds.has(selected.planActionId));

  function selectSession(id: string) {
    setSelectedId(id);
    router.replace(workbenchUrl(playerId, "stall", { uke: data.from, okt: id }), { scroll: false });
  }

  function approveSelected() {
    if (!selected?.planActionId || !pendingIds.has(selected.planActionId)) return;
    const actionId = selected.planActionId;
    startTransition(async () => {
      try {
        await acceptPlanAction(actionId);
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(actionId);
          return next;
        });
        toast.success("Økten er godkjent");
        router.refresh();
      } catch {
        toast.error("Økten kunne ikke godkjennes. Prøv igjen fra Godkjenninger.");
      }
    });
  }

  function openPublishing() {
    setSelectedPublishIds(new Set(drafts.filter((session) => !occupiedIds.has(session.id)).map((session) => session.id)));
    setPublishOpen(true);
  }

  function publish(ids: string[]) {
    if (ids.length === 0) return;
    startTransition(async () => {
      const result = await publishSessions(ids);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPublishOpen(false);
      toast.success(result.data.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(result.data.length));
      router.refresh();
    });
  }

  return (
    <div className="wb-layout wb-stall-layout">
      <main className="wb-main">
        <div className="wb-pills">
          <VisningPiller playerId={playerId} visning="stall" uke={data.from} maned={data.from.slice(0, 7)} aar={data.from.slice(0, 4)} okt={selected?.id} />
        </div>
        <div className="wb-body wb-stall-body">
          <header className="wb-heading wb-stall-heading">
            <div><span className="wb-kicker">Stall</span><h1>Økter til oppfølging</h1></div>
            <span className="wb-sub">{spillerNavn} · {sessions.length} økter · {draftCount} utkast</span>
          </header>

          <nav className="wb-stall-filters" aria-label="Filtrer økter">
            {FILTER.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </nav>

          {filtered.length > 0 ? (
            <section className="wb-stall-list" aria-label="Økter til oppfølging">
              {filtered.map((session) => (
                <button key={session.id} type="button" data-lag={session.pyramid} aria-pressed={selected?.id === session.id} onClick={() => selectSession(session.id)}>
                  <span data-label="Spiller">{spillerNavn}</span>
                  <b>{session.title}</b>
                  <span data-label="Dato">{datoLabel(session.date)}</span>
                  <span data-label="Pyramide">{PYRAMID_LABEL[session.pyramid]}</span>
                  <small>{datoLabel(session.date)} · {session.durationMinutes} min</small>
                  <em data-status={kategori(session)}>{kategoriLabel(session)}</em>
                </button>
              ))}
            </section>
          ) : (
            <section className="wb-period-empty"><span className="wb-kicker">Stall</span><h1>Ingen økter her</h1><p>Velg et annet filter eller tidsrom.</p></section>
          )}
        </div>
      </main>

      <aside className="wb-inspector">
        {selected ? <SessionSummary session={selected} playerId={playerId} weekStart={data.from} canApprove={canApprove} pending={pending} onApprove={approveSelected} draftCount={draftCount} onPublish={openPublishing} /> : <p className="wb-empty">Velg en økt for å se detaljene.</p>}
      </aside>

      {selected ? <aside className="wb-mobile-summary wb-stall-mobile" aria-label="Valgt økt"><div className="wb-grip" aria-hidden /><SessionSummary session={selected} playerId={playerId} weekStart={data.from} canApprove={canApprove} pending={pending} onApprove={approveSelected} draftCount={draftCount} onPublish={openPublishing} compact /></aside> : null}

      <PublishConfirmDialog
        open={publishOpen}
        okter={drafts}
        idag={osloIdag()}
        kicker={`Stall · ${spillerNavn}`}
        notater={validationNotes}
        opptattIder={occupiedIds}
        valgte={selectedPublishIds}
        onVeksle={(id) => setSelectedPublishIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })}
        onVelgAlle={() => setSelectedPublishIds((current) => current.size === drafts.length ? new Set() : new Set(drafts.map((session) => session.id)))}
        publiserer={pending}
        onLukk={() => setPublishOpen(false)}
        onPubliserValgte={() => publish(drafts.filter((session) => selectedPublishIds.has(session.id)).map((session) => session.id))}
        onPubliserAlle={() => publish(drafts.map((session) => session.id))}
      />
    </div>
  );
}
