"use client";

/**
 * PlayerHQ · Slagteller- og repetisjonsshell.
 * Støtter full sving (køller), nærspill (chip, pitch, lob, bunker)
 * og putting (kortputt, mellomputt, lengdeputt), samt repetisjonstyper (full fart, lav fart, tørrsving).
 *
 * Fasit: PH-06 Slagteller i Claude Design «AK Golf Precision Athletics»
 * (7d7c2994). Selve visningen ligger i PH06Slagteller; her bor tellingen,
 * lagringen (lokal kladd, ordnet sending) og avslutningen.
 * Utvidet med repetisjonstyper og områder for AK-formelen.
 * Avvik:
 *   - Ingen slagmål og ingen TrackMan-kort; tegningens mål og siste slag finnes ikke i basen. Se PH06Slagteller.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";
import { LiveCoachPanel } from "@/components/portal/live/LiveCoachPanel";
import type { LiveCoachPanelData } from "@/components/portal/live/types";
import { saveTapperCounts, finishTapperSession } from "./actions";
import { leggIKo, tomKo, lesTapperUtkast, slettTapperUtkast } from "@/lib/offline-queue/tapper-queue";
import { gjenopptaTapper } from "@/lib/offline-queue/tapper-kladd";
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
  serverUpdatedAt?: string;
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
  serverUpdatedAt,
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
  const [ready, setReady] = useState(false);
  const [lagreStatus, setLagreStatus] = useState<"ok" | "lagrer" | "kolagt" | "gitt-opp" | "lokal-feil">("ok");
  const finishingRef = useRef(false);
  const initialServerStamp = useRef(serverUpdatedAt);
  const localWrites = useRef<Promise<boolean>>(Promise.resolve(true));
  const mounted = useRef(true);

  // Metadata-oppslag for nøkkel
  const getMeta = useCallback((key: string) => {
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
  }, [clubs, initialLogs]);

  const navnFor = (key: string) => getMeta(key).name;

  // Hvert trykk blir først en varig lokal kladd; bare nettverket forsinkes.
  const countsRef = useRef(counts);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildPayload = useCallback((snapshot = countsRef.current) => Object.entries(snapshot).map(([club, count]) => {
    const meta = getMeta(club);
    return { club, count, area: meta.area, category: meta.category, repetitionType: meta.repetitionType };
  }), [getMeta]);

  const saveLocal = useCallback((snapshot: Record<string, number>) => {
    const payload = buildPayload(snapshot);
    const write = localWrites.current.catch(() => false).then(() => eierId ? leggIKo(eierId, sessionId, payload).catch(() => false) : false);
    localWrites.current = write;
    void write.then(ok => { if (mounted.current && !ok) setLagreStatus("lokal-feil"); });
    return write;
  }, [buildPayload, eierId, sessionId]);

  const lagre = useCallback(async (): Promise<boolean> => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    if (!(await localWrites.current) || !eierId) { setLagreStatus("lokal-feil"); return false; }
    if (!navigator.onLine) { setLagreStatus("kolagt"); return false; }
    const result = await tomKo(eierId, sessionId, saveTapperCounts);
    const ok = result === "tom" || result === "synket";
    if (mounted.current) setLagreStatus(ok ? "ok" : result === "gitt-opp" ? "gitt-opp" : "kolagt");
    return ok;
  }, [eierId, sessionId]);

  function updateCounts(next: Record<string, number>) {
    countsRef.current = next;
    setCounts(next);
    setLagreStatus(navigator.onLine ? "lagrer" : "kolagt");
    void saveLocal(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void lagre(), 5_000);
  }

  useEffect(() => {
    mounted.current = true;
    let disposed = false;
    void (async () => {
      if (!eierId) return;
      const cached = await lesTapperUtkast(eierId, sessionId);
      if (disposed) return;
      const restored = gjenopptaTapper(cached, initialServerStamp.current);
      if (restored) {
        const next = { ...countsRef.current, ...Object.fromEntries(restored.map(row => [row.club, row.count])) };
        countsRef.current = next; setCounts(next);
      }
      setReady(true);
      if (navigator.onLine) void lagre();
      else if (restored) setLagreStatus("kolagt");
    })();
    const online = () => { void lagre(); };
    const leave = () => { if (navigator.onLine && !finishingRef.current) void lagre(); };
    window.addEventListener("online", online);
    window.addEventListener("pagehide", leave);
    return () => {
      disposed = true; mounted.current = false;
      window.removeEventListener("online", online); window.removeEventListener("pagehide", leave);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [eierId, sessionId, lagre]);

  async function avslutt() {
    if (finishingRef.current || !ready) return;
    finishingRef.current = true;
    setFinishing(true); setFinishError(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      if (!(await saveLocal(countsRef.current))) throw new Error("local-save");
      // Alle eldre sendinger må være kvittert før sluttellingen lagres.
      if (!(await lagre()) && !(await lagre())) throw new Error("sync");
      const result = await finishTapperSession(sessionId, buildPayload());
      if (!result.ok) { setFinishError(result.error ?? "Økta ble ikke avsluttet. Prøv igjen."); return; }
      if (eierId) await slettTapperUtkast(eierId, sessionId);
      router.push(`/portal/live/${sessionId}/summary`);
    } catch {
      setFinishError("Økta ble ikke avsluttet. Behold siden åpen og prøv igjen når nettet er tilbake.");
    } finally { finishingRef.current = false; setFinishing(false); }
  }

  function tappElement(baseId: string) {
    if (finishingRef.current || !ready) return;
    const key = buildRepKey(baseId, activeRepType);
    const label = navnFor(key);
    updateCounts({ ...countsRef.current, [key]: (countsRef.current[key] ?? 0) + 1 });
    setTapp((prev) => [{ key, label, kl: OSLO_KL.format(new Date()) }, ...prev]);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch {
        /* noop */
      }
    }
  }

  function angre() {
    if (finishingRef.current || !ready) return;
    const siste = tapp[0];
    if (!siste) return;
    updateCounts({ ...countsRef.current, [siste.key]: Math.max(0, (countsRef.current[siste.key] ?? 0) - 1) });
    setTapp((prev) => prev.slice(1));
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
    ["ok", "lagrer"].includes(lagreStatus)
      ? null
      : {
          tittel: "Kunne ikke lagres",
          tekst:
            lagreStatus === "lokal-feil"
              ? "Tellingene kunne ikke lagres på denne enheten. Behold siden åpen og prøv igjen."
              : "Tellingene er lagret på denne enheten, men er ikke bekreftet på serveren. Prøv igjen når du har nett.",
          kode: lagreStatus === "gitt-opp" ? "SYNK · GITT OPP" : "SYNK · KØET LOKALT",
        };

  const enhet = activeArea === "FULL_SVING" ? "slag" : "rep";

  return (
    <div data-paper-slug="playerhq-live-tapper" data-od-id="playerhq-live-tapper">
      <PH06Slagteller
        tilstand={!ready ? "laster" : lagreFeil ? "feil" : totalCount === 0 ? "tom" : "data"}
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
        lagreTekst={lagreStatus === "lagrer" ? "Lagrer tellinger …" : lagreStatus === "ok" && ready ? "Tellingene er lagret" : undefined}
        onProvIgjen={() => { void saveLocal(countsRef.current).then(ok => { if (ok) void lagre(); }); }}
        avsluttFeil={finishError}
        avslutter={finishing || !ready}
        onLeggTil={leggTil}
        onAngre={angre}
        onAvslutt={() => void avslutt()}
      >
        <LiveCoachPanel data={coachPanel} bunnLoft={224} />
      </PH06Slagteller>
    </div>
  );
}
