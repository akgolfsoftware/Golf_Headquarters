"use client";

/**
 * Live-økt (spiller, fullskjerm).
 * Fasit: designsystem/train-lock/PH-05 Live.dc.html
 * Lys: designsystem/train-lock/B3 Lys resterende skjermer.dc.html (Lys PH-05
 * Live) — mekanisk (PX-7, 29.08.2026): filen leser konsekvent var(--tl-*)
 * uten hardkodet hex, verifisert med grep — ingen manuell lys-finpuss utover det.
 * Faner skjult, caps «Live · tittel» + Avslutt i toppen, 72px øktklokke.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { LiveV2Session, DrillRepState, LiveCoachPanelData } from "./types";
import type { LiveV2Drill } from "./types";
import { DrillLogger } from "./DrillLogger";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { LiveLoopNav } from "./LiveLoopNav";
import { WhyDetails } from "./WhyDetails";
import { completeDrill, completeSession, startSession, logDrillReps } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import {
  lagreLiveDrillUtkast,
  lesLiveDrillUtkast,
  slettLiveDrillUtkast,
  synkLiveDrillKo,
} from "@/lib/offline-queue/live-drill-queue";
import type { LiveDrillReps } from "@/lib/offline-queue/live-drill-kladd";

import { TL } from "@/lib/v2/train-lock";


type DrillStatus = "done" | "active" | "queued";

type DrillState = LiveV2Drill & {
  status: DrillStatus;
} & DrillRepState;

type Modus = "sjekk" | "reps" | "logg";

/** Notat i den frie loggen — tidsstempel er mm:ss inn i økta. */
type LiveNotat = { t: string; tekst: string };

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** «90» → «1 t 30 min». */
function tidTekst(min: number): string {
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

function notatKey(sessionId: string): string {
  return `akhq-live-notater-${sessionId}`;
}

/** Les notater fra sessionStorage — DB-mekanisme for frie øktnotater finnes
 *  ikke; notatene flettes inn i «dine ord»-utkastet i ETTER (ærlig valg). */
function lesNotater(sessionId: string): LiveNotat[] {
  try {
    const raw = sessionStorage.getItem(notatKey(sessionId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is LiveNotat =>
        !!n && typeof n === "object" &&
        typeof (n as LiveNotat).t === "string" &&
        typeof (n as LiveNotat).tekst === "string",
    );
  } catch {
    return [];
  }
}

function lagreNotater(sessionId: string, notater: LiveNotat[]) {
  try {
    sessionStorage.setItem(notatKey(sessionId), JSON.stringify(notater));
  } catch {
    /* ignore */
  }
}

function buildInitialDrills(data: LiveV2Session): DrillState[] {
  const drills: DrillState[] = data.drills.map((d, i) => {
    const log = data.existingLogs.find((l) => l.drillId === d.id);
    return {
      ...d,
      status: (log ? "done" : i === 0 ? "active" : "queued") as DrillStatus,
      repsTotal: log?.repsTotal ?? 0,
      repsWithoutBall: log?.repsWithoutBall ?? 0,
      repsLowSpeed: log?.repsLowSpeed ?? 0,
      repsAutomatic: log?.repsAutomatic ?? 0,
      repsHit: log?.repsHit ?? 0,
    };
  });
  // Normaliser: sørg for én aktiv drill hvis ikke-ferdige finnes.
  if (!drills.some((d) => d.status === "active")) {
    const firstQueued = drills.find((d) => d.status === "queued");
    if (firstQueued) firstQueued.status = "active";
  }
  return drills;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(pattern);
    } catch {
      /* ignore */
    }
  }
}

// ── Confirm-overlay ──────────────────────────────────────────────────────────

type ConfirmOverlayProps = {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmOverlay({ show, onConfirm, onCancel }: ConfirmOverlayProps) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: TL.scrim, backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[320px] rounded-[20px] p-6"
        style={{ background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", color: "var(--tl-text)" }}
      >
        <div className="font-sans text-[18px] font-semibold" style={{ color: "var(--tl-text)" }}>
          Avslutte økta?
        </div>
        <p className="mb-5 mt-2 font-serif text-[13.5px] leading-[1.55]" style={{ color: "var(--tl-mute)" }}>
          Alt du har telt og notert blir med til oppsummeringen.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full border-none py-[13px] font-sans text-[14px] font-semibold v2-press"
            style={{ background: "var(--tl-fill)", color: "var(--tl-on-fill)", minHeight: 52, borderRadius: 12 }}
          >
            Avslutt og logg
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-[13px] font-sans text-[13px] font-medium v2-press"
            style={{ border: "1px solid var(--tl-hair)", background: "var(--tl-dim)", color: "var(--tl-text)", borderRadius: 12 }}
          >
            Fortsett økta
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * UNDER-skjermen i live-sløyfa — Paper-fasit playerhq-live-okt.html (PP-3).
 * Klokke øverst, modusveksler Sjekkliste | Reps | Logg, clay «Avslutt og
 * logg økta» i dokken. Ingenting sperrer — avvik forklares i ETTER.
 */
export function LiveActive({ data, coachPanel }: { data: LiveV2Session; coachPanel: LiveCoachPanelData }) {
  const router = useRouter();
  const [drills, setDrills] = useState<DrillState[]>(() => buildInitialDrills(data));
  const [paused, setPaused] = useState(false);
  const [totalSec, setTotalSec] = useState(0);
  const [drillSec, setDrillSec] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modus, setModus] = useState<Modus>("sjekk");
  const [valgtDrillId, setValgtDrillId] = useState<string | null>(null);
  const [notater, setNotater] = useState<LiveNotat[]>([]);
  const [notatTekst, setNotatTekst] = useState("");
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );

  const activeIdx = useMemo(() => drills.findIndex((d) => d.status === "active"), [drills]);
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  // Valgt drill i Reps-modus — default den aktive.
  const valgt = useMemo(() => {
    const v = valgtDrillId ? drills.find((d) => d.id === valgtDrillId) : null;
    return v ?? active ?? drills[0] ?? null;
  }, [drills, valgtDrillId, active]);

  // Start sesjonen ved mount (idempotent).
  const activatedRef = useRef(false);
  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    let cancelled = false;
    void startSession(data.sessionId).then((res) => {
      if (cancelled) return;
      if (res.state === "completed") router.replace(`/portal/live/${data.sessionId}/summary`);
      if (res.state === "unavailable") router.replace("/portal/planlegge");
    });
    return () => {
      cancelled = true;
    };
  }, [data.sessionId, router]);

  // Gjenopprett midlertidige reps fra IndexedDB (overlever refresh/offline).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    setNotater(lesNotater(data.sessionId));
    void lesLiveDrillUtkast(data.sessionId).then((utkast) => {
      if (!utkast?.drills.length) return;
      setDrills((prev) =>
        prev.map((d) => {
          const u = utkast.drills.find((x) => x.drillId === d.id);
          if (!u) return d;
          // Fullførte drills i DB vinner; ellers gjenopprett lokale tellinger.
          if (d.status === "done") return d;
          return {
            ...d,
            status: u.status === "done" ? "done" : d.status,
            repsTotal: Math.max(d.repsTotal, u.repsTotal),
            repsWithoutBall: Math.max(d.repsWithoutBall, u.repsWithoutBall),
            repsLowSpeed: Math.max(d.repsLowSpeed, u.repsLowSpeed),
            repsAutomatic: Math.max(d.repsAutomatic, u.repsAutomatic),
            repsHit: Math.max(d.repsHit, u.repsHit),
            logNotes: u.notes ?? d.logNotes,
          };
        }),
      );
      if (utkast.totalSec > 0) setTotalSec((t) => Math.max(t, utkast.totalSec));
    });
  }, [data.sessionId]);

  // Debounce: lagre lokal utkast + forsøk synk når online.
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistDrills = useCallback(
    (neste: DrillState[], sec: number, drillVarigheter?: Record<string, number>) => {
      const payload: LiveDrillReps[] = neste.map((d) => ({
        drillId: d.id,
        repsTotal: d.repsTotal,
        repsWithoutBall: d.repsWithoutBall,
        repsLowSpeed: d.repsLowSpeed,
        repsAutomatic: d.repsAutomatic,
        repsHit: d.repsHit,
        notes: d.logNotes,
        status: d.status,
        actualDurationSec: drillVarigheter?.[d.id],
      }));
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        void lagreLiveDrillUtkast(data.sessionId, payload, sec).then(() => {
          if (typeof navigator !== "undefined" && !navigator.onLine) return;
          void synkLiveDrillKo(data.sessionId, async (sessionId, kladd) => {
            for (const d of kladd) {
              if (d.repsTotal <= 0 && d.status !== "done") continue;
              const res = await logDrillReps({
                sessionId,
                drillId: d.drillId,
                repsTotal: d.repsTotal,
                repsWithoutBall: d.repsWithoutBall,
                repsLowSpeed: d.repsLowSpeed,
                repsAutomatic: d.repsAutomatic,
                repsHit: d.repsHit,
                notes: d.notes,
                actualDurationSec: d.actualDurationSec,
              }).catch(() => ({ ok: false }));
              if (!res.ok) return { ok: false };
            }
            return { ok: true };
          });
        });
      }, 800);
    },
    [data.sessionId],
  );

  // Online/offline: synk køen når nettet kommer tilbake + ærlig banner.
  useEffect(() => {
    function onOnline() {
      setOffline(false);
      void synkLiveDrillKo(data.sessionId, async (sessionId, kladd) => {
        for (const d of kladd) {
          if (d.repsTotal <= 0 && d.status !== "done") continue;
          const res = await logDrillReps({
            sessionId,
            drillId: d.drillId,
            repsTotal: d.repsTotal,
            repsWithoutBall: d.repsWithoutBall,
            repsLowSpeed: d.repsLowSpeed,
            repsAutomatic: d.repsAutomatic,
            repsHit: d.repsHit,
            notes: d.notes,
          }).catch(() => ({ ok: false }));
          if (!res.ok) return { ok: false };
        }
        return { ok: true };
      });
    }
    function onOffline() {
      setOffline(true);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [data.sessionId]);

  // Timer — økt-tid tikker fra start uavhengig av aktiv drill; stopper når
  // alt er fullført.
  useEffect(() => {
    const ferdig = drills.length > 0 && drills.every((d) => d.status === "done");
    if (paused || ferdig) return;
    const id = setInterval(() => {
      setTotalSec((t) => t + 1);
      setDrillSec((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, drills]);

  // Wake-lock — hold skjermen våken.
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
        }).wakeLock;
        if (wl) {
          const sentinel = await wl.request("screen");
          if (!cancelled) wakeRef.current = sentinel;
        }
      } catch {
        /* ignore */
      }
    }
    acquire();
    return () => {
      cancelled = true;
      wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    };
  }, []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const handleDrillChange = useCallback(
    (drillId: string, state: DrillRepState) => {
      setDrills((prev) => {
        const neste = prev.map((d) => (d.id === drillId ? { ...d, ...state } : d));
        persistDrills(neste, totalSec);
        return neste;
      });
    },
    [persistDrills, totalSec],
  );

  /** Fullfør en drill (server + lokal state). Fullfører ALDRI økta automatisk —
   *  fasiten lar spilleren selv trykke «Avslutt og logg økta» i dokken. */
  const fullforDrill = useCallback(
    async (drill: DrillState) => {
      if (isCompleting) return;
      setIsCompleting(true);
      vibrate(40);

      const erAktiv = drill.status === "active";
      const brukteSek = erAktiv ? drillSec : null;

      try {
        const res = await completeDrill({
          sessionId: data.sessionId,
          drillId: drill.id,
          repsTotal: drill.repsTotal,
          repsWithoutBall: drill.repsWithoutBall,
          repsLowSpeed: drill.repsLowSpeed,
          repsAutomatic: drill.repsAutomatic,
          repsHit: drill.repsHit,
          successRate:
            drill.repsTotal > 0 ? Math.round((drill.repsHit / drill.repsTotal) * 100) : 0,
          notes: drill.logNotes,
          actualDurationSec: brukteSek ?? undefined,
        });
        if (!res.ok && typeof navigator !== "undefined" && !navigator.onLine) {
          persistDrills(
            drills.map((d) => (d.id === drill.id ? { ...d, status: "done" as const } : d)),
            totalSec,
            brukteSek != null ? { [drill.id]: brukteSek } : undefined,
          );
        }
      } catch (err) {
        console.error("[LiveActive] completeDrill feilet", err);
        persistDrills(drills, totalSec, brukteSek != null ? { [drill.id]: brukteSek } : undefined);
      } finally {
        setIsCompleting(false);
      }

      setDrills((prev) => {
        let nesteAktivSatt = false;
        const neste = prev.map((d) => {
          if (d.id === drill.id) return { ...d, status: "done" as const };
          return d;
        });
        // Var den fullførte drillen aktiv? Flytt aktiv til første i kø.
        if (erAktiv) {
          for (const d of neste) {
            if (!nesteAktivSatt && d.status === "queued") {
              d.status = "active";
              nesteAktivSatt = true;
            }
          }
        }
        persistDrills(neste, totalSec, brukteSek != null ? { [drill.id]: brukteSek } : undefined);
        return neste;
      });
      if (erAktiv) setDrillSec(0);
      vibrate([60, 40]);
    },
    [data.sessionId, drills, drillSec, isCompleting, persistDrills, totalSec],
  );

  /** Fjern haken lokalt (kladd) — en allerede logget drill i DB røres ikke;
   *  du kan telle videre og fullføre på nytt. */
  const angreDrill = useCallback(
    (drill: DrillState) => {
      setDrills((prev) => {
        const neste = prev.map((d) =>
          d.id === drill.id
            ? { ...d, status: (prev.some((x) => x.status === "active") ? "queued" : "active") as DrillStatus }
            : d,
        );
        persistDrills(neste, totalSec);
        return neste;
      });
    },
    [persistDrills, totalSec],
  );

  const avsluttOkta = useCallback(async () => {
    setShowConfirm(false);
    await completeSession(data.sessionId, totalSec);
    await slettLiveDrillUtkast(data.sessionId);
  }, [data.sessionId, totalSec]);

  const lagreNotat = useCallback(() => {
    const tekst = notatTekst.trim();
    if (!tekst) return;
    const neste = [{ t: fmtMSS(totalSec), tekst }, ...notater];
    setNotater(neste);
    setNotatTekst("");
    lagreNotater(data.sessionId, neste);
  }, [data.sessionId, notatTekst, notater, totalSec]);

  const completedCount = drills.filter((d) => d.status === "done").length;

  // Klokke-meta: «satt opp HH:MM · planlagt X» — vi lagrer ikke faktisk
  // starttidspunkt klientside, så vi viser det planlagte, ærlig merket.
  const oppsattKl = OSLO_TID.format(new Date(data.scheduledAtISO));
  const vindusMin = Math.max(
    0,
    Math.round(
      (new Date(data.endTimeISO).getTime() - new Date(data.scheduledAtISO).getTime()) / 60000,
    ),
  );
  const planlagtMin = vindusMin > 0 ? vindusMin : data.drills.reduce((s, d) => s + d.durationMinutes, 0);
  const klokkeMeta = `satt opp ${oppsattKl}${planlagtMin > 0 ? ` · planlagt ${tidTekst(planlagtMin)}` : ""}`;

  const eyebrowCls = "font-mono text-[10px] font-medium uppercase tracking-[0.09em]";

  return (
    <div
      data-paper-portal-live-active
      data-paper-slug="playerhq-live-okt"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: "var(--tl-scene)",
        color: "var(--tl-text)",
        isolation: "isolate",
        fontFamily: "var(--tl-font-sans, system-ui, sans-serif)",
      }}
    >
      <ConfirmOverlay
        show={showConfirm}
        onConfirm={() => void avsluttOkta()}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Topp — PH-05: caps «Live · tittel» venstre, Avslutt (mute tekst) høyre */}
      <header
        data-paper-topp
        className="flex flex-shrink-0 items-center justify-between gap-2 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top) + 8px, 12px)",
          background: "var(--tl-scene)",
        }}
      >
        <h1
          className="truncate font-sans"
          style={{
            margin: 0,
            minWidth: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--tl-mute)",
          }}
        >
          Live · {data.title}
        </h1>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          data-od-id="live-avslutt"
          className="v2-press flex-none border-none bg-transparent font-sans"
          style={{
            height: 44,
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--tl-mute)",
            cursor: "pointer",
          }}
        >
          Avslutt
        </button>
      </header>

      {/* Scrollbart innhold */}
      <main
        className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-4"
        style={{ minHeight: 0, maxWidth: 720, margin: "0 auto", width: "100%", paddingBottom: 96 }}
      >
        <LiveLoopNav aktiv="under" sessionId={data.sessionId} />

        {/* Offline er informasjon, ikke feil — alt lagres lokalt og synkes. */}
        {offline && (
          <div
            className="mb-4 mt-2 px-4 py-3 font-serif text-[12.5px]"
            style={{
              background: "var(--tl-dim)",
              border: "1px solid var(--tl-hair)",
              borderRadius: 12,
              color: "var(--tl-mute)",
            }}
            role="status"
          >
            Mistet forbindelsen. Alt du teller og noterer lagres på telefonen og
            synkes når nettet er tilbake — fortsett å trene.
          </div>
        )}

        {/* Øktklokka — PH-05: 72px tabular, punktum-separator, meta-linje under.
            Pause stopper telleren, aldri økta. */}
        <div className="mt-2">
          <div
            aria-live="polite"
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: paused ? "var(--tl-mute)" : "var(--tl-text)",
            }}
          >
            {fmtMSS(totalSec).replace(":", ".")}
          </div>
          <div
            className="mt-2 flex items-center justify-between gap-2"
            style={{ fontSize: 13, color: "var(--tl-mute)", fontVariantNumeric: "tabular-nums" }}
          >
            <span className="min-w-0 truncate">
              {[
                planlagtMin > 0 ? `${Math.max(0, planlagtMin - Math.floor(totalSec / 60))} min igjen` : null,
                drills.length > 0 ? `steg ${Math.min(completedCount + 1, drills.length)} av ${drills.length}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || klokkeMeta}
            </span>
            <button
              type="button"
              onClick={togglePause}
              aria-label={paused ? "Fortsett økt" : "Pause økt"}
              className="v2-press flex-none border-none bg-transparent font-sans"
              style={{ minHeight: 44, padding: "0 4px", fontSize: 13, fontWeight: 600, color: "var(--tl-text)", cursor: "pointer" }}
            >
              {paused ? "Fortsett" : "Pause"}
            </button>
          </div>
        </div>

        {/* Modusveksler: Sjekkliste · Reps · Logg */}
        <div
          className="mt-4 flex gap-1 p-1"
          style={{ background: "var(--tl-dim)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}
          role="group"
          aria-label="Velg visning"
        >
          {(
            [
              ["sjekk", "Sjekkliste"],
              ["reps", "Reps"],
              ["logg", "Logg"],
            ] as Array<[Modus, string]>
          ).map(([id, label]) => {
            const on = modus === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                data-od-id={`live-modus-${id}`}
                onClick={() => setModus(id)}
                className="flex-1 font-sans text-[13px] font-medium"
                style={{
                  minHeight: 44,
                  borderRadius: 8,
                  border: on ? "1px solid var(--tl-hair)" : "1px solid transparent",
                  background: on ? "var(--tl-elev)" : "transparent",
                  color: on ? "var(--tl-text)" : "var(--tl-mute)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tom tilstand: økt uten drills — ærlig melding + vei videre */}
        {drills.length === 0 && modus !== "logg" && (
          <div
            className="mt-4 px-4 py-6"
            style={{ background: "var(--tl-dim)", border: "1px dashed var(--tl-hair)", borderRadius: 12 }}
          >
            <h3 className="m-0 font-sans text-[15px] font-semibold" style={{ color: "var(--tl-text)" }}>
              Ingen drills i denne økta
            </h3>
            <p className="mb-3 mt-2 font-serif text-[13.5px]" style={{ color: "var(--tl-mute)" }}>
              Åpne økta i planen og legg til driller — eller tren fritt, noter i
              Logg og avslutt når du er ferdig.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/portal/planlegge/workbench")}
              className="w-full font-sans text-[13px] font-semibold"
              style={{
                minHeight: 48,
                borderRadius: 12,
                border: "1px solid var(--tl-hair)",
                background: "var(--tl-elev)",
                color: "var(--tl-text)",
              }}
            >
              Til planen
            </button>
          </div>
        )}

        {/* ── Sjekkliste ── */}
        {modus === "sjekk" && drills.length > 0 && (
          <div className="mt-4 min-w-0">
            <span className={eyebrowCls} style={{ color: "var(--tl-mute)" }}>
              drills · {completedCount} av {drills.length} gjennomført
            </span>
            <div className="mt-2 flex min-w-0 flex-col gap-2">
              {drills.map((d) => {
                const ferdig = d.status === "done";
                return (
                  <div
                    key={d.id}
                    className="flex min-w-0 items-start gap-3 p-3"
                    style={{
                      background: "var(--tl-elev)",
                      border: "1px solid var(--tl-hair)",
                      borderRadius: 12,
                    }}
                  >
                    <button
                      type="button"
                      aria-pressed={ferdig}
                      aria-label={(ferdig ? "Fjern hake: " : "Marker gjennomført: ") + d.name}
                      data-od-id={`live-sjekk-${d.index}`}
                      onClick={() => (ferdig ? angreDrill(d) : void fullforDrill(d))}
                      disabled={isCompleting}
                      className="grid flex-none place-items-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 9999,
                        border: `1px solid ${ferdig ? "var(--tl-ok)" : "var(--tl-hair)"}`,
                        background: ferdig ? "var(--tl-dim)" : "transparent",
                        color: ferdig ? "var(--tl-ok)" : "var(--tl-mute)",
                      }}
                    >
                      <Check className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span
                        className="block text-[13.5px] font-semibold"
                        style={{
                          color: ferdig ? "var(--tl-mute)" : "var(--tl-text)",
                          textDecoration: ferdig ? "line-through" : "none",
                        }}
                      >
                        {d.name}
                      </span>
                      <span className="font-mono text-[10.5px]" style={{ color: "var(--tl-mute)" }}>
                        {d.repsTotal} av {d.plannedReps > 0 ? d.plannedReps : "—"} reps
                        {d.durationMinutes > 0 ? ` · ${d.durationMinutes} min` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Tell reps for ${d.name}`}
                      data-od-id={`live-tell-${d.index}`}
                      onClick={() => {
                        setValgtDrillId(d.id);
                        setModus("reps");
                      }}
                      className="flex-none self-center px-3 font-sans text-[13px] font-medium"
                      style={{
                        minHeight: 44,
                        borderRadius: 12,
                        border: "1px solid var(--tl-hair)",
                        background: "transparent",
                        color: "var(--tl-text)",
                      }}
                    >
                      Tell
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mb-0 mt-3 font-serif text-[12.5px]" style={{ color: "var(--tl-mute)" }}>
              Å hoppe over en drill er lov. Det du ikke rekker, følger med til
              oppsummeringen som avvik — ikke som feil.
            </p>
          </div>
        )}

        {/* ── Reps: én-drill-fokus med DrillLogger ── */}
        {modus === "reps" && drills.length > 0 && valgt && (
          <div className="mt-4 min-w-0">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Velg drill"
              style={{ scrollbarWidth: "none" }}
            >
              {drills.map((d) => {
                const on = d.id === valgt.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={on}
                    data-od-id={`live-repdrill-${d.index}`}
                    onClick={() => setValgtDrillId(d.id)}
                    className="flex-none whitespace-nowrap px-3 text-[12.5px]"
                    style={{
                      minHeight: 44,
                      borderRadius: 9999,
                      border: `1px solid ${on ? "var(--tl-text)" : "var(--tl-hair)"}`,
                      background: on ? "var(--tl-text)" : "var(--tl-elev)",
                      color: on ? "var(--tl-scene)" : "var(--tl-mute)",
                    }}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
            <div className="-mx-4">
              <DrillLogger
                drill={valgt}
                state={{
                  repsTotal: valgt.repsTotal,
                  repsWithoutBall: valgt.repsWithoutBall,
                  repsLowSpeed: valgt.repsLowSpeed,
                  repsAutomatic: valgt.repsAutomatic,
                  repsHit: valgt.repsHit,
                  logNotes: valgt.logNotes,
                }}
                onChange={(state) => handleDrillChange(valgt.id, state)}
                onComplete={() => void fullforDrill(valgt)}
                isLast={completedCount === drills.length - 1 && valgt.status !== "done"}
                completedCount={completedCount}
                totalCount={drills.length}
                drillSeconds={valgt.status === "active" ? drillSec : 0}
              />
            </div>

            {/* Målet — alltid synlig der det telles */}
            {data.maalsetning && (
              <div
                className="mt-2 p-4"
                style={{ background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}
              >
                <span className={eyebrowCls} style={{ color: "var(--tl-mute)" }}>
                  mål i dag
                </span>
                <p className="m-0 mt-1 font-serif text-[14px]" style={{ color: "var(--tl-text)" }}>
                  {data.maalsetning}
                </p>
                <WhyDetails
                  odId="live-why-maal"
                  punkter={[
                    data.coachName
                      ? `Kilde: målsetningen ${data.coachName} la på økta i planen.`
                      : "Kilde: målsetningen som ligger på økta i planen.",
                    "Forbehold: veiledende, aldri låst. Telle uten mål er også lov.",
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Logg: fritt notat med tidsstempel inn i økta ── */}
        {modus === "logg" && (
          <div className="mt-4 min-w-0">
            <span className={eyebrowCls} style={{ color: "var(--tl-mute)" }}>
              notat til loggen
            </span>
            <textarea
              value={notatTekst}
              onChange={(e) => setNotatTekst(e.target.value)}
              placeholder="Hva skjedde? Skriv kort — «traff tynt på 70 m når jeg ble sliten» er nok."
              aria-label="Notat til loggen"
              data-od-id="live-loggfelt"
              className="mt-2 w-full resize-y p-3 font-serif text-[15px]"
              style={{
                minHeight: 110,
                background: "var(--tl-elev)",
                color: "var(--tl-text)",
                border: "1px solid var(--tl-hair)",
                borderRadius: 12,
              }}
            />
            <button
              type="button"
              data-od-id="live-lagre-notat"
              onClick={lagreNotat}
              disabled={!notatTekst.trim()}
              className="mt-2 w-full font-sans text-[14px] font-medium disabled:opacity-50"
              style={{
                minHeight: 48,
                borderRadius: 12,
                border: "1px solid var(--tl-fill)",
                background: "var(--tl-fill)",
                color: "var(--tl-on-fill)",
              }}
            >
              Lagre notat
            </button>
            <p className="mb-0 mt-3 font-serif text-[12.5px]" style={{ color: "var(--tl-mute)" }}>
              Notatene ligger på telefonen gjennom økta og flettes inn i
              oppsummeringen — der lagres de i loggen med dine ord.
              Stemmefangst finnes på I dag-skjermen.
            </p>
            {notater.length > 0 && (
              <div className="mt-4">
                <span className={eyebrowCls} style={{ color: "var(--tl-mute)" }}>
                  notater i denne økta · {notater.length}
                </span>
                {notater.map((n, i) => (
                  <div
                    key={`${n.t}-${i}`}
                    className="mt-2 p-3 font-serif text-[13.5px]"
                    style={{
                      background: "var(--tl-elev)",
                      border: "1px solid var(--tl-hair)",
                      borderRadius: 12,
                      color: "var(--tl-text)",
                    }}
                  >
                    <span className="mb-[2px] block font-mono text-[10px]" style={{ color: "var(--tl-mute)" }}>
                      {n.t} inn i økta
                    </span>
                    {n.tekst}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </main>

      {/* PH-05: ingen bunn-dokk — Avslutt bor i toppen, mute. */}
      <LiveCoachPanel data={coachPanel} activeDrillId={active?.id ?? null} />
    </div>
  );
}
