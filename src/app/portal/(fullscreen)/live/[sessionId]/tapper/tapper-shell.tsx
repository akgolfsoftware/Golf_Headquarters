"use client";

/**
 * PlayerHQ · Slagteller- og repetisjonsshell.
 * Støtter full sving (køller), nærspill (chip, pitch, lob, bunker)
 * og putting (kortputt, mellomputt, lengdeputt), samt repetisjonstyper (full fart, lav fart, tørrsving).
 *
 * Fasit: PH-06 Slagteller i Claude Design «AK Golf Precision Athletics»
 * (7d7c2994). Selve visningen ligger i PH06Slagteller; her bor tellingen,
 * lagringen (debounce, offline-kø) og avslutningen — uendret fra før.
 * Utvidet med repetisjonstyper og områder for AK-formelen.
 * Avvik:
 *   - Ingen slagmål og ingen TrackMan-kort; tegningens mål og siste slag finnes ikke i basen. Se PH06Slagteller.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";
import { LiveCoachPanel } from "@/components/portal/live/LiveCoachPanel";
import type { LiveCoachPanelData } from "@/components/portal/live/types";
import { saveTapperCounts, finishTapperSession } from "./actions";
import { leggIKo, tomKo } from "@/lib/offline-queue/tapper-queue";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import {
  RepetitionArea,
  RepetitionType,
  REPETITION_AREAS,
  REPETITION_TYPES,
  SHORT_GAME_TARGETS,
  PUTTING_TARGETS,
  buildRepKey,
  parseRepKey,
  formatRepLabel,
} from "@/lib/domain/workbench/reps";

type Club = { id: string; name: string };

type LogEntry = {
  club: string;
  count: number;
  area?: string | null;
  category?: string | null;
  repetitionType?: string | null;
};

type Props = {
  sessionId: string;
  /** Øktas navn — mono-sublinjen i toppen. */
  oktLabel: string;
  /** Kølleknappene — fra spillerens utstyrsbag (bygget i page.tsx). */
  clubs: Club[];
  coachPanel: LiveCoachPanelData;
  /** Tidligere lagrede tellinger (session_ball_logs) — gjenopptak etter refresh. */
  initialCounts?: Record<string, number>;
  initialLogs?: LogEntry[];
};

/** Lokalt tapp denne nettleserøkta — bærer «siste rep kl. X» + Angre. */
type Tapp = { key: string; label: string; kl: string };

const OSLO_KL = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export function TapperShell({
  sessionId,
  oktLabel,
  clubs,
  coachPanel,
  initialCounts,
  initialLogs,
}: Props) {
  const router = useRouter();
  const eierId = useLokalDataEier();

  const [activeArea, setActiveArea] = useState<RepetitionArea>("FULL_SVING");
  const [activeRepType, setActiveRepType] = useState<RepetitionType>("FULL_SPEED");
  const [valgtId, setValgtId] = useState<string | null>(clubs[0]?.id ?? null);

  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(clubs.map((c) => [c.id, 0])),
    ...(initialCounts ?? {}),
  }));
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [tapp, setTapp] = useState<Tapp[]>([]);
  const [lagreStatus, setLagreStatus] = useState<"ok" | "kolagt" | "gitt-opp">("ok");

  // Metadata-oppslag for nøkkel
  function getMeta(key: string) {
    const { baseId, repType } = parseRepKey(key);

    const clubMatch = clubs.find((c) => c.id === baseId);
    if (clubMatch) {
      return {
        name: formatRepLabel(clubMatch.name, repType),
        baseName: clubMatch.name,
        area: "FULL_SVING" as RepetitionArea,
        category: baseId,
        repetitionType: repType,
      };
    }

    const shortMatch = SHORT_GAME_TARGETS.find((s) => s.baseId === baseId);
    if (shortMatch) {
      return {
        name: formatRepLabel(shortMatch.name, repType),
        baseName: shortMatch.name,
        area: "NAERSPILL" as RepetitionArea,
        category: shortMatch.category,
        repetitionType: repType,
      };
    }

    const puttMatch = PUTTING_TARGETS.find((p) => p.baseId === baseId);
    if (puttMatch) {
      return {
        name: formatRepLabel(puttMatch.name, repType),
        baseName: puttMatch.name,
        area: "PUTTING" as RepetitionArea,
        category: puttMatch.category,
        repetitionType: repType,
      };
    }

    const logMatch = initialLogs?.find((l) => l.club === key);
    if (logMatch) {
      return {
        name: formatRepLabel(logMatch.club, (logMatch.repetitionType as RepetitionType) || repType),
        baseName: logMatch.club,
        area: (logMatch.area as RepetitionArea) || "FULL_SVING",
        category: logMatch.category || logMatch.club,
        repetitionType: (logMatch.repetitionType as RepetitionType) || repType,
      };
    }

    return {
      name: formatRepLabel(baseId, repType),
      baseName: baseId,
      area: "FULL_SVING" as RepetitionArea,
      category: baseId,
      repetitionType: repType,
    };
  }

  const navnFor = (key: string) => getMeta(key).name;

  // ── Persistering: debounce + flush ──────────
  const countsRef = useRef(counts);
  useEffect(() => {
    countsRef.current = counts;
  }, [counts]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildPayload() {
    return Object.entries(countsRef.current).map(([club, count]) => {
      const meta = getMeta(club);
      return {
        club,
        count,
        area: meta.area,
        category: meta.category,
        repetitionType: meta.repetitionType,
      };
    });
  }

  async function lagre(): Promise<boolean> {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const payload = buildPayload();
    try {
      const res = await saveTapperCounts(sessionId, payload);
      if (res.ok) {
        setLagreStatus("ok");
        return true;
      }
    } catch {
      /* nettverksfeil — køes lokalt under */
    }
    const kolagt = eierId
      ? await leggIKo(eierId, sessionId, payload).catch(() => false)
      : false;
    setLagreStatus(kolagt ? "kolagt" : "gitt-opp");
    return false;
  }

  function planleggLagring() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void lagre(), 5_000);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    async function synk() {
      if (!eierId) return;
      const resultat = await tomKo(eierId, sessionId, saveTapperCounts);
      if (resultat === "synket") setLagreStatus("ok");
      else if (resultat === "gitt-opp") setLagreStatus("gitt-opp");
    }
    void synk();
    window.addEventListener("online", synk);
    return () => window.removeEventListener("online", synk);
  }, [eierId, sessionId]);

  async function avslutt() {
    if (finishing) return;
    setFinishing(true);
    setFinishError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      const result = await finishTapperSession(sessionId, buildPayload());
      if (!result.ok) {
        setFinishError(result.error ?? "Økten ble ikke avsluttet. Prøv igjen.");
        return;
      }
      router.push(`/portal/live/${sessionId}/summary`);
    } catch {
      setFinishError("Økten ble ikke avsluttet. Behold siden åpen og prøv igjen når nettet er tilbake.");
    } finally {
      setFinishing(false);
    }
  }

  function tappElement(baseId: string) {
    if (finishing) return;
    const key = buildRepKey(baseId, activeRepType);
    const label = navnFor(key);
    setCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    setTapp((prev) => [{ key, label, kl: OSLO_KL.format(new Date()) }, ...prev]);
    planleggLagring();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch {
        /* noop */
      }
    }
  }

  function angre() {
    if (finishing) return;
    const siste = tapp[0];
    if (!siste) return;
    setCounts((prev) => ({
      ...prev,
      [siste.key]: Math.max(0, (prev[siste.key] ?? 0) - 1),
    }));
    setTapp((prev) => prev.slice(1));
    planleggLagring();
  }

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const elementer: { id: string; navn: string }[] =
    activeArea === "FULL_SVING"
      ? clubs.map((c) => ({ id: c.id, navn: c.name }))
      : activeArea === "NAERSPILL"
        ? SHORT_GAME_TARGETS.map((t) => ({ id: t.baseId, navn: t.name }))
        : PUTTING_TARGETS.map((t) => ({ id: t.baseId, navn: t.name }));
  const valgt = elementer.some((e) => e.id === valgtId) ? valgtId : (elementer[0]?.id ?? null);

  function byttOmrade(a: RepetitionArea) {
    setActiveArea(a);
    setValgtId(null);
  }

  function leggTil(n: number) {
    if (!valgt) return;
    for (let i = 0; i < n; i++) tappElement(valgt);
  }

  const fordeling = Object.keys(counts)
    .filter((key) => (counts[key] ?? 0) > 0)
    .map((key) => ({ key, navn: navnFor(key), antall: counts[key] ?? 0 }));

  const lagreFeil =
    lagreStatus === "ok"
      ? null
      : {
          tittel: "Tellingene ble ikke lagret",
          tekst:
            lagreStatus === "gitt-opp"
              ? "Fikk ikke synket etter flere forsøk. Repetisjonene ligger fortsatt trygt på telefonen. Sjekk nettet ditt."
              : `Nettet forsvant under lagringen. De ${totalCount} repetisjonene ligger trygt på telefonen og sendes automatisk når nettet er tilbake.`,
          kode: lagreStatus === "gitt-opp" ? "SYNK · GITT OPP" : "SYNK · KØET LOKALT",
        };

  const enhet = activeArea === "FULL_SVING" ? "slag" : "rep";

  return (
    <div data-paper-slug="playerhq-live-tapper" data-od-id="playerhq-live-tapper">
      <PH06Slagteller
        tilstand={lagreFeil ? "feil" : totalCount === 0 ? "tom" : "data"}
        oktLabel={oktLabel}
        tilbakeHref={`/portal/live/${sessionId}`}
        totalt={totalCount}
        omrader={REPETITION_AREAS}
        omrade={activeArea}
        onOmrade={byttOmrade}
        repTyper={REPETITION_TYPES}
        repType={activeRepType}
        onRepType={setActiveRepType}
        elementer={elementer}
        valgt={valgt}
        onValgt={setValgtId}
        valgtAntall={valgt ? (counts[buildRepKey(valgt, activeRepType)] ?? 0) : 0}
        fordeling={fordeling}
        sist={tapp[0] ? { label: tapp[0].label, kl: tapp[0].kl } : null}
        enhet={enhet}
        lagreFeil={lagreFeil}
        onProvIgjen={() => void lagre()}
        avsluttFeil={finishError}
        avslutter={finishing}
        onLeggTil={leggTil}
        onAngre={angre}
        onAvslutt={() => void avslutt()}
      >
        <LiveCoachPanel data={coachPanel} bunnLoft={224} />
      </PH06Slagteller>
    </div>
  );
}
