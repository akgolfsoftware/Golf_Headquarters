"use client";

/**
 * Spillerens øktark for en publisert Workbench-økt.
 * Start, hopp over, fullfør, belastning og recap kaller samme wb-actions.
 * Tegningen ui_kits/playerhq/screens/PH-03.jsx ligger ikke i git.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import {
  UI,
  PYRAMID_LABEL,
  formatMinutes,
} from "@/lib/domain/workbench/labels";
import { formatIntervallPunkt } from "@/lib/portal/idag-visning";
import { oktArkLiveHref } from "@/lib/portal/session-hrefs";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import {
  startSession,
  completeSessionWithEffort,
  skipSession,
  updateSessionEffort,
} from "@/lib/workbench/wb-actions";
import { computeSessionLoad, RPE_SKALA } from "@/lib/domain/workbench/load";
import { STATUS_CAPS } from "@/components/workbench/wb-visuelt";
import { AkseMerke, Ikon, type Akse } from "@/components/precision/pa";
import type { PyramidArea } from "@/lib/domain/workbench/types";

type Handling = "start" | "fullfor" | "hopp-over";

const AKSE: Record<PyramidArea, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

export function OktArk({ session: initial }: { session: WorkbenchSession }) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [travel, startTravel] = useTransition();
  const [aktivHandling, setAktivHandling] = useState<Handling | null>(null);
  const [valgtEffort, setValgtEffort] = useState<number | null>(session.perceivedEffort ?? null);
  const [faktiskeMinutter, setFaktiskeMinutter] = useState<string>(
    session.actualMinutes != null ? String(session.actualMinutes) : String(session.durationMinutes)
  );

  const parsedMin = parseInt(faktiskeMinutter, 10);
  const faktiskTid = Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : session.durationMinutes;
  const loadBeregnet = computeSessionLoad({
    durationMinutes: session.durationMinutes,
    actualMinutes: faktiskTid,
    perceivedEffort: valgtEffort,
  });

  function lagreBelastning() {
    startTravel(async () => {
      const res = await updateSessionEffort({
        sessionId: session.id,
        perceivedEffort: valgtEffort,
        actualMinutes: faktiskTid,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSession(res.data);
      toast.success("Belastning lagret");
    });
  }

  function utfor(handling: Handling) {
    setAktivHandling(handling);
    startTravel(async () => {
      const res =
        handling === "start"
          ? await startSession(session.id)
          : handling === "fullfor"
            ? await completeSessionWithEffort({
                sessionId: session.id,
                perceivedEffort: valgtEffort,
                actualMinutes: faktiskTid,
              })
            : await skipSession(session.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (handling === "start") {
        router.push(oktArkLiveHref(session.id, "IN_PROGRESS"));
        return;
      }
      setSession(res.data);
      if (handling === "fullfor") toast.success("Økt fullført");
      if (handling === "hopp-over") toast.success("Hoppet over");
    });
  }

  const laster = (h: Handling) => travel && aktivHandling === h;
  const meta = [
    PYRAMID_LABEL[session.pyramid],
    session.location?.trim(),
    formatIntervallPunkt(session.startMinute, session.durationMinutes),
  ].filter(Boolean).join(" · ");

  return (
    <div className="ph-okt">
      <header className="ph-okt-hode">
        <p className="ph-okt-kicker">
          {session.status === "PUBLISHED" ? UI.inspectorTitle : STATUS_CAPS[session.status]}
          {" · "}
          {formatMinutes(session.durationMinutes)}
        </p>
        <h1>{session.title}</h1>
        <p className="ph-okt-meta">
          <AkseMerke axis={AKSE[session.pyramid]} size="sm" />
          <span>{meta}</span>
        </p>
      </header>

      {session.notes && (
        <section className="pa-card ph-okt-kort">
          <p>{session.notes}</p>
        </section>
      )}

      <section className="pa-card ph-okt-kort ph-okt-ovelser">
        <header>
          <p className="ph-okt-kicker">{UI.drills}</p>
          <span>{session.drills.length}</span>
        </header>
        {session.drills.length === 0 ? (
          <p className="ph-okt-tom">{UI.emptyDrills}</p>
        ) : (
          <ol>
            {session.drills.map((d, i) => (
              <li key={d.id}>
                <span>{i + 1}</span>
                <span>
                  <strong>{d.title}</strong>
                  <small>{d.techniqueFocus}</small>
                </span>
                <span>{d.durationMinutes} min</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {session.status === "PUBLISHED" && (
        <div className="ph-okt-handlinger">
          <button type="button" className="pa-btn pa-btn--primary pa-btn--full" onClick={() => utfor("start")} disabled={travel}>
            {laster("start") ? "Starter …" : UI.startSession}
          </button>
          <button type="button" className="pa-btn pa-btn--ghost pa-btn--full" onClick={() => utfor("hopp-over")} disabled={travel}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </button>
        </div>
      )}

      {session.status === "IN_PROGRESS" && (
        <div className="ph-okt-handlinger">
          <Link href={oktArkLiveHref(session.id, "IN_PROGRESS")} className="pa-btn pa-btn--primary pa-btn--full">
            {UI.continueSession}
          </Link>
          <button type="button" className="pa-btn pa-btn--ghost pa-btn--full" onClick={() => utfor("fullfor")} disabled={travel}>
            {laster("fullfor") ? "Fullfører …" : UI.completeSession}
          </button>
          <button type="button" className="pa-btn pa-btn--ghost pa-btn--full" onClick={() => utfor("hopp-over")} disabled={travel}>
            {laster("hopp-over") ? "Lagrer …" : UI.skipSession}
          </button>
        </div>
      )}

      {(session.status === "IN_PROGRESS" || session.status === "COMPLETED") && (
        <section className="pa-card ph-okt-kort ph-okt-belastning">
          <header>
            <p className="ph-okt-kicker">Opplevd anstrengelse (sRPE)</p>
            {loadBeregnet != null && <strong>{loadBeregnet} belastningspoeng</strong>}
          </header>
          <p>Hvor anstrengende var økten på en skala fra 1 (veldig lett) til 10 (maksimalt)?</p>
          <div className="ph-okt-rpe" role="group" aria-label="Opplevd anstrengelse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                aria-pressed={valgtEffort === num}
                onClick={() => setValgtEffort(num)}
                title={`${num}: ${RPE_SKALA[num]?.kort} — ${RPE_SKALA[num]?.beskrivelse}`}
              >
                {num}
              </button>
            ))}
          </div>
          {valgtEffort != null && (
            <p className="ph-okt-rpe-tekst">
              <strong>{valgtEffort} / 10 · {RPE_SKALA[valgtEffort]?.kort}</strong>
              <span>{RPE_SKALA[valgtEffort]?.beskrivelse}</span>
            </p>
          )}
          <label className="ph-okt-minutter">
            Faktisk varighet (minutter)
            <input
              type="number"
              min={1}
              max={600}
              inputMode="numeric"
              value={faktiskeMinutter}
              onChange={(e) => setFaktiskeMinutter(e.target.value)}
            />
          </label>
          {session.status === "COMPLETED" && (
            <button type="button" className="pa-btn pa-btn--secondary pa-btn--full" onClick={lagreBelastning} disabled={travel}>
              {travel && aktivHandling == null ? "Lagrer …" : "Lagre belastning"}
            </button>
          )}
        </section>
      )}

      {session.status === "COMPLETED" && (
        <section className="pa-card ph-okt-kort ph-okt-ferdig">
          <p>
            <Ikon icon={Check} size={16} name="check" />
            <strong>{UI.sessionCompletedTitle}</strong>
          </p>
          <Link href={oktArkLiveHref(session.id, "COMPLETED")} className="pa-btn pa-btn--primary pa-btn--full">
            {UI.seRecap}
          </Link>
        </section>
      )}

      {session.status === "SKIPPED" && (
        <section className="pa-card ph-okt-kort ph-okt-ferdig">
          <p>
            <Ikon icon={ArrowRight} size={16} name="arrow-right" />
            <strong>{UI.sessionSkippedTitle}</strong>
          </p>
        </section>
      )}

      <Link href="/portal" className="ph-okt-tilbake">{UI.backToToday}</Link>
    </div>
  );
}
