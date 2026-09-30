"use client";

/**
 * Spillerens økt-ark for en publisert Workbench-økt — PH-03 Øktark i Precision
 * Athletics (Claude Design 7d7c2994). Visningen er PH03Oktark; denne filen eier
 * bare handlingene: Start → IN_PROGRESS + live-tapper, Fullfør med sRPE og
 * faktisk tid, Hopp over (bekreftes i ark). Kaller wb-actions direkte
 * (WbResultat + toast ved feil); lokal state oppdateres fra returnert økt.
 * Avvik fra tegningen: hopp over-arket har ikke årsaksvalg (årsaken lagres
 * ingen steder ennå).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Play, SkipForward } from "lucide-react";
import { UI, PYRAMID_LABEL, formatMinutes } from "@/lib/domain/workbench/labels";
import { formatIntervallPunkt } from "@/lib/portal/idag-visning";
import { oktArkLiveHref } from "@/lib/portal/session-hrefs";
import type { Belastning, Press, WorkbenchSession } from "@/lib/domain/workbench/types";
import { startSession, completeSessionWithEffort, skipSession, updateSessionEffort } from "@/lib/workbench/wb-actions";
import { computeSessionLoad, RPE_SKALA } from "@/lib/domain/workbench/load";
import { Knapp, KnappLenke, Meta, type Akse } from "@/components/precision/pa";
import { Ark, Skjemafelt, Tekstfelt } from "@/components/precision/pa-a4";
import { PH03Oktark, type PH03Status } from "@/components/portal/precision/PH03Oktark";

type Handling = "start" | "fullfor" | "hopp-over";

const STATUS: Partial<Record<WorkbenchSession["status"], PH03Status>> = {
  PUBLISHED: "Planlagt", SCHEDULED: "Planlagt", IN_PROGRESS: "Pågår", COMPLETED: "Gjennomført", SKIPPED: "Hoppet over", CANCELLED: "Avlyst",
};

const BELASTNING_NAVN: Record<Belastning, string> = { INNENDORS: "Innendørs", TRENINGSOMRADE: "Treningsområde", BANE: "Bane", KONKURRANSE: "Konkurranse" };
const PRESS_NAVN: Record<Press, string> = { ALENE: "Alene", OBSERVERT: "Observert", KONKURRANSE: "Konkurranse", TURNERING: "Turnering" };

/** Felles verdi på tvers av øvelsene; null når øvelsene er ulike eller ingen har verdi (vises som «—»). */
function feltlik<T extends string>(verdier: (T | undefined)[], navn: Record<T, string>): string | null {
  const satt = new Set(verdier.filter((v): v is T => v != null));
  return satt.size === 1 && verdier.every((v) => v != null) ? navn[[...satt][0]] : null;
}

export function OktArk({ session: initial, coachNavn = null }: { session: WorkbenchSession; coachNavn?: string | null }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [travel, startTravel] = useTransition();
  const [aktiv, setAktiv] = useState<Handling | null>(null);
  const [hoppArk, setHoppArk] = useState(false);
  const [effort, setEffort] = useState<number | null>(session.perceivedEffort ?? null);
  const [minutter, setMinutter] = useState(String(session.actualMinutes ?? session.durationMinutes));

  const parsed = parseInt(minutter, 10);
  const faktiskTid = Number.isFinite(parsed) && parsed > 0 ? parsed : session.durationMinutes;
  const belastning = computeSessionLoad({ durationMinutes: session.durationMinutes, actualMinutes: faktiskTid, perceivedEffort: effort });

  function lagreBelastning() {
    setAktiv(null);
    startTravel(async () => {
      const res = await updateSessionEffort({ sessionId: session.id, perceivedEffort: effort, actualMinutes: faktiskTid });
      if (!res.ok) { toast.error(res.error); return; }
      setSession(res.data);
      toast.success("Belastning lagret");
    });
  }

  function utfor(h: Handling) {
    setAktiv(h);
    startTravel(async () => {
      const res = h === "start" ? await startSession(session.id)
        : h === "fullfor" ? await completeSessionWithEffort({ sessionId: session.id, perceivedEffort: effort, actualMinutes: faktiskTid })
        : await skipSession(session.id);
      if (!res.ok) { toast.error(res.error); return; }
      if (h === "start") { router.push(oktArkLiveHref(session.id, "IN_PROGRESS")); return; }
      setHoppArk(false);
      setSession(res.data);
      toast.success(h === "fullfor" ? "Økt fullført" : "Hoppet over");
    });
  }
  const laster = (h: Handling) => travel && aktiv === h;

  const planlagt = session.status === "PUBLISHED" || session.status === "SCHEDULED";
  const pagar = session.status === "IN_PROGRESS";
  const ferdig = session.status === "COMPLETED";

  const handlinger = planlagt ? <>
    <Knapp icon={Play} iconName="play" loading={laster("start")} loadingText="Starter …" disabled={travel} onClick={() => utfor("start")}>{UI.startSession}</Knapp>
    <Knapp variant="ghost" icon={SkipForward} iconName="skip-forward" disabled={travel} onClick={() => setHoppArk(true)}>{UI.skipSession}</Knapp>
  </> : pagar ? <>
    <Knapp icon={Check} iconName="check" loading={laster("fullfor")} loadingText="Fullfører …" disabled={travel} onClick={() => utfor("fullfor")}>{UI.completeSession}</Knapp>
    <KnappLenke href={oktArkLiveHref(session.id, "IN_PROGRESS")} variant="secondary" icon={Play} iconName="play">{UI.continueSession}</KnappLenke>
    <Knapp variant="ghost" icon={SkipForward} iconName="skip-forward" disabled={travel} onClick={() => setHoppArk(true)}>{UI.skipSession}</Knapp>
  </> : ferdig ? <KnappLenke href={oktArkLiveHref(session.id, "COMPLETED")} variant="secondary">{UI.seRecap}</KnappLenke> : null;

  return (
    <PH03Oktark
      tilstand="data"
      kicker={`${PYRAMID_LABEL[session.pyramid]} · ${formatIntervallPunkt(session.startMinute, session.durationMinutes)}${session.location?.trim() ? ` · ${session.location.trim()}` : ""}`}
      tittel={session.title}
      status={STATUS[session.status] ?? "Planlagt"}
      statusMeta={pagar ? `${session.drills.length} ØVELSER` : null}
      ovelser={session.drills.map((d) => ({ id: d.id, akse: d.akFormel.pyramid.toLowerCase() as Akse, navn: d.title, kode: d.akFormel.label || null, mengde: null, min: d.durationMinutes, gjort: null }))}
      nokler={[
        ["Fokus", [...new Set(session.drills.map((d) => d.techniqueFocus).filter((f): f is string => !!f))].join(", ") || null],
        ["Belastning", feltlik(session.drills.map((d) => d.akFormel.belastning), BELASTNING_NAVN)],
        ["Press", feltlik(session.drills.map((d) => d.akFormel.press), PRESS_NAVN)],
        ["Mål", session.maalsetning?.trim() || null],
        ["Coach", coachNavn],
        ["Varighet", formatMinutes(session.durationMinutes)],
        ["Pyramide", PYRAMID_LABEL[session.pyramid]],
        ["Sted", session.location?.trim() || null],
        ["Faktisk tid", session.actualMinutes != null ? formatMinutes(session.actualMinutes) : null],
      ]}
      notatTittel="Notat fra coach"
      notat={session.notes ? { tekst: session.notes, kilde: "COACH" } : null}
      tilbake={{ href: "/portal", label: "I dag" }}
      handlinger={handlinger}
      feilKode={`FEIL · ØKT · ${session.id.slice(0, 8).toUpperCase()}`}
      ekstra={(pagar || ferdig) ? (
        <section aria-label="Opplevd anstrengelse" className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
          <span className="kicker">Opplevd anstrengelse (sRPE)</span>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Hvor anstrengende var økten, fra 1 (veldig lett) til 10 (maksimalt)?</p>
          <div className="ph03-rpe" role="group" aria-label="Velg anstrengelse fra 1 til 10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button key={n} type="button" aria-pressed={effort === n} title={`${n}: ${RPE_SKALA[n]?.kort} — ${RPE_SKALA[n]?.beskrivelse}`} onClick={() => setEffort(n)}>{n}</button>
            ))}
          </div>
          {effort != null && <Meta>{effort} / 10 · {(RPE_SKALA[effort]?.kort ?? "").toUpperCase()}</Meta>}
          {effort != null && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{RPE_SKALA[effort]?.beskrivelse}</p>}
          <Skjemafelt label="Faktisk varighet (minutter)">
            <Tekstfelt value={minutter} onChange={setMinutter} mono inputMode="numeric" />
          </Skjemafelt>
          {belastning != null && <Meta>{belastning} BELASTNINGSPOENG</Meta>}
          {ferdig && <Knapp variant="secondary" fullWidth loading={travel} disabled={travel} onClick={lagreBelastning}>Lagre belastning</Knapp>}
        </section>
      ) : null}
    >
      <Ark open={hoppArk} onClose={() => setHoppArk(false)} kicker="Hoppe over" title={session.title}
        footer={<>
          <Knapp fullWidth loading={laster("hopp-over")} disabled={travel} onClick={() => utfor("hopp-over")}>Hopp over økt</Knapp>
          <Knapp variant="ghost" fullWidth onClick={() => setHoppArk(false)}>Avbryt</Knapp>
        </>}>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Coachen din ser at økta er hoppet over og kan flytte den.</p>
      </Ark>
    </PH03Oktark>
  );
}
