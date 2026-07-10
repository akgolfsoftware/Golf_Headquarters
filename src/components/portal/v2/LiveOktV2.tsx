"use client";

/**
 * PlayerHQ Live-økt (aktiv) — v2 (retning C «Presis», mørk fullskjerm).
 * Rekomponert 1:1 fra funksjonen i src/components/portal/live/LiveActive.tsx,
 * men i det mørke v2-språket. FULLSKJERM-flyt uten V2Shell: komponenten setter
 * sin egen dark-scope (som mockupens live-skjerm), siden en spiller midt i en
 * økt ikke skal ha app-navigasjon rundt seg.
 *
 * Datakontrakt uendret: LiveV2Session (drills + existingLogs + DrillRepState).
 * Alle server-actions beholdt: startSession (idempotent ved mount), completeDrill
 * (upsert DrillLogV2), completeSession (COMPLETED + summary + redirect). Timer,
 * pause, wake-lock, avslutt-bekreftelse og rep-logging per drill er bevart.
 *
 * Kun v2-komponenter/tokens (T.*) — ingen rå hex, ingen emoji, Lucide via Icon.
 * Rep-stegger og timer-visning er komponert inline med T-tokens (samme idiom som
 * fysisk.tsx StepKnapp/StegVerdi) — se gap-notatet i leveransen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import { Kort, Caps, AkseChip, StatusPill, Knapp } from "@/components/v2";
import type { LiveV2Drill, LiveV2Session, DrillRepState } from "@/components/portal/live/types";
import { plannedVolumText } from "@/components/portal/live/types";
import {
  completeDrill,
  completeSession,
  startSession,
} from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

/* ── Drill-tilstand ─────────────────────────────────────────────────── */

type DrillStatus = "done" | "active" | "queued";
type DrillState = LiveV2Drill & { status: DrillStatus } & DrillRepState;

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

/** Sekunder → «m:ss» eller «t:mm:ss». */
function fmtTid(sec: number): string {
  const t = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ss = String(s).padStart(2, "0");
  if (t > 0) return `${t}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/* Norsk akse-etikett (pyramiden) for eyebrow-tekst. */
const AKSE_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

/* ── Steg-kontroll (44 px berøringsmål, samme idiom som fysisk.tsx) ──── */

function StegKnapp({ icon, onClick, disabled }: { icon: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        appearance: "none",
        cursor: disabled ? "default" : "pointer",
        width: 44,
        height: 44,
        flex: "none",
        borderRadius: 12,
        background: T.panel3,
        border: `1px solid ${T.borderS}`,
        color: disabled ? T.mut : T.fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

/** Én tellerrad: etikett + stepper. `primary` = uthevet total (skrivebeskyttet). */
function RepStegRad({
  label,
  value,
  onChange,
  primary,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  primary?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 14px",
        borderRadius: T.rRow,
        background: primary ? `color-mix(in srgb,${T.lime} 8%,${T.panel})` : T.panel2,
        border: `1px solid ${primary ? `color-mix(in srgb,${T.lime} 40%,transparent)` : T.border}`,
      }}
    >
      <span
        style={{
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: primary ? 700 : 500,
          color: primary ? T.fg : T.fg2,
        }}
      >
        {label}
      </span>
      {onChange ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StegKnapp icon="minus" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0} />
          <span
            style={{
              minWidth: 40,
              textAlign: "center",
              fontFamily: T.mono,
              fontSize: 17,
              fontWeight: 700,
              color: T.fg,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </span>
          <StegKnapp icon="plus" onClick={() => onChange(value + 1)} />
        </div>
      ) : (
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 22,
            fontWeight: 700,
            color: primary ? T.lime : T.fg,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

/* ── Bekreft-overlay (avslutt økt) ──────────────────────────────────── */

function BekreftOverlay({ show, onConfirm, onCancel }: { show: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: T.rCard,
          padding: 22,
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>Avslutt økt?</div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 18px" }}>
          Fremgangen din blir lagret. Du kan fortsette senere.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              appearance: "none",
              cursor: "pointer",
              width: "100%",
              borderRadius: 9999,
              border: `1px solid color-mix(in srgb,${T.down} 30%,transparent)`,
              background: `color-mix(in srgb,${T.down} 12%,transparent)`,
              color: T.down,
              padding: "13px 0",
              fontFamily: T.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Avslutt og lagre
          </button>
          <Knapp full onClick={onCancel}>
            Fortsett økt
          </Knapp>
        </div>
      </div>
    </div>
  );
}

/* ── Drill-kort i aktiv-lista ───────────────────────────────────────── */

function DrillKort({ drill, onLogg }: { drill: DrillState; onLogg?: () => void }) {
  const aktiv = drill.status === "active";
  const ferdig = drill.status === "done";
  const kø = drill.status === "queued";
  const pct = drill.plannedReps > 0 ? Math.min((drill.repsTotal / drill.plannedReps) * 100, 100) : 0;
  const planlagt = plannedVolumText(drill);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: T.rCard,
        padding: "16px 18px",
        background: aktiv ? `${T.tint}, ${T.panel}` : T.panel,
        border: `1px solid ${aktiv ? `color-mix(in srgb,${T.lime} 45%,transparent)` : T.border}`,
        boxShadow: aktiv ? `0 0 0 3px color-mix(in srgb,${T.lime} 12%,transparent)` : "none",
        opacity: kø ? 0.6 : 1,
        transition: `opacity 180ms ${T.ease}, border-color 180ms ${T.ease}`,
      }}
    >
      {/* Eyebrow — akse */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <AkseChip a={drill.pyramide} />
        <Caps size={9} style={{ display: "inline" }}>
          {AKSE_LABEL[drill.pyramide] ?? drill.pyramide}
        </Caps>
      </div>

      {/* Tittel */}
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, lineHeight: 1.15, letterSpacing: "-0.02em", color: T.fg }}>
        {drill.name}
      </div>

      {/* Planlagt volum (det coachen la inn) */}
      {planlagt && (
        <div style={{ marginTop: 4, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>
          Planlagt: {planlagt}
        </div>
      )}

      {/* Fremdrift */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 7px" }}>
        <span style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>Fremdrift</span>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
          {drill.repsTotal}
          {drill.plannedReps > 0 && <span style={{ fontWeight: 400, color: T.mut }}> / {drill.plannedReps}</span>}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 9999, overflow: "hidden", background: T.track, border: `1px solid ${T.border}` }}>
        <div
          style={{
            height: "100%",
            borderRadius: 9999,
            width: `${ferdig ? 100 : pct}%`,
            background: ferdig ? `linear-gradient(90deg, ${T.up}, ${T.forest})` : `linear-gradient(90deg, ${T.forest}, ${T.lime})`,
            transition: `width 700ms ${T.ease}`,
          }}
        />
      </div>

      {/* Status + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        {aktiv ? (
          <StatusPill tone="lime">Pågår</StatusPill>
        ) : ferdig ? (
          <StatusPill tone="up">Fullført</StatusPill>
        ) : (
          <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>Venter</span>
        )}

        {aktiv && onLogg && <Knapp icon="plus" onClick={onLogg}>Logg rep</Knapp>}
        {ferdig && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.up }}>
            <Icon name="check" size={13} strokeWidth={2.5} style={{ color: T.up }} />
            Fullført
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Hoved-komponent ────────────────────────────────────────────────── */

export function LiveOktV2({ data }: { data: LiveV2Session | null }) {
  const router = useRouter();
  const [drills, setDrills] = useState<DrillState[]>(() => (data ? buildInitialDrills(data) : []));
  const [paused, setPaused] = useState(false);
  const [totalSec, setTotalSec] = useState(0);
  const [drillSec, setDrillSec] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogger, setShowLogger] = useState(false);

  const sessionId = data?.sessionId ?? null;
  const activeIdx = useMemo(() => drills.findIndex((d) => d.status === "active"), [drills]);
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  // Start sesjonen ved mount (idempotent).
  const activatedRef = useRef(false);
  useEffect(() => {
    if (!sessionId || activatedRef.current) return;
    activatedRef.current = true;
    let cancelled = false;
    void startSession(sessionId).then((res) => {
      if (cancelled) return;
      if (res.state === "completed") router.replace(`/portal/live/${sessionId}/summary`);
      if (res.state === "unavailable") router.replace("/portal/planlegge");
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  // Timer — total + aktiv drill.
  useEffect(() => {
    if (paused || !active) return;
    const id = setInterval(() => {
      setTotalSec((t) => t + 1);
      setDrillSec((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, active]);

  // Wake-lock — hold skjermen våken under økta.
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
    void acquire();
    return () => {
      cancelled = true;
      wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    };
  }, []);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const handleDrillChange = useCallback(
    (state: DrillRepState) => {
      if (!active) return;
      setDrills((prev) => prev.map((d) => (d.id === active.id ? { ...d, ...state } : d)));
    },
    [active],
  );

  const handleCompleteDrill = useCallback(async () => {
    if (!active || !sessionId || isCompleting) return;
    setIsCompleting(true);
    vibrate(40);

    try {
      await completeDrill({
        sessionId,
        drillId: active.id,
        repsTotal: active.repsTotal,
        repsWithoutBall: active.repsWithoutBall,
        repsLowSpeed: active.repsLowSpeed,
        repsAutomatic: active.repsAutomatic,
        repsHit: active.repsHit,
        successRate: active.repsTotal > 0 ? Math.round((active.repsHit / active.repsTotal) * 100) : 0,
      });
    } catch (err) {
      console.error("[LiveOktV2] completeDrill feilet", err);
    } finally {
      setIsCompleting(false);
    }

    setDrills((prev) =>
      prev.map((d, i) => {
        if (d.id === active.id) return { ...d, status: "done" as const };
        if (i === activeIdx + 1) return { ...d, status: "active" as const };
        return d;
      }),
    );
    setDrillSec(0);
    setShowLogger(false);
    vibrate([60, 40]);

    if (activeIdx === drills.length - 1) {
      await completeSession(sessionId, totalSec + drillSec);
    }
  }, [active, activeIdx, sessionId, drills.length, isCompleting, totalSec, drillSec]);

  const completedCount = drills.filter((d) => d.status === "done").length;
  const progressPct = drills.length > 0 ? (completedCount / drills.length) * 100 : 0;
  const allDone = completedCount === drills.length && drills.length > 0;

  // Ærlig tom-tilstand — ingen aktiv økt for denne brukeren.
  if (!data) {
    return (
      <Scope>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <span style={{ width: 56, height: 56, borderRadius: 18, background: T.panel2, border: `1px dashed ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="play" size={24} style={{ color: T.mut }} />
          </span>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>Ingen aktiv økt</div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 280 }}>
              Du har ingen økt klar til gjennomføring nå. Planlegg en økt i Plan for å starte en live-økt.
            </p>
          </div>
          <Knapp icon="calendar" onClick={() => router.push("/portal/planlegge")}>
            Til Plan
          </Knapp>
        </div>
      </Scope>
    );
  }

  const sessionMeta = [data.title, drills.length > 0 ? `${completedCount} / ${drills.length} øvelser` : null]
    .filter(Boolean)
    .join(" · ");

  // ── Rep-logger (fullskjerm-overlay) ──────────────────────────────────
  if (showLogger && active) {
    const computedTotal = active.repsWithoutBall + active.repsLowSpeed + active.repsAutomatic + active.repsHit;
    const setField = (key: keyof DrillRepState, value: number) => {
      const next = { ...(active as DrillRepState), [key]: Math.max(0, value) };
      next.repsTotal = next.repsWithoutBall + next.repsLowSpeed + next.repsAutomatic + next.repsHit;
      handleDrillChange(next);
    };
    return (
      <Scope>
        {/* Mini-topbar */}
        <header style={topbarStyle}>
          <button
            type="button"
            onClick={() => setShowLogger(false)}
            style={{ appearance: "none", cursor: "pointer", background: "transparent", border: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.fg2 }}
          >
            Tilbake
          </button>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.lime }}>Logger øvelse</span>
          <span style={{ width: 56 }} />
        </header>

        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px 28px", display: "flex", flexDirection: "column", gap: T.gap }}>
          {/* Drillinfo */}
          <Kort tint>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <AkseChip a={active.pyramide} />
                  {active.lFase && (
                    <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}>
                      {active.lFase}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 24, lineHeight: 1.1, letterSpacing: "-0.02em", color: T.fg }}>{active.name}</div>
                {active.description && (
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.55, margin: "8px 0 0" }}>{active.description}</p>
                )}
              </div>
              <span style={{ width: 44, height: 44, flex: "none", borderRadius: 14, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="target" size={19} style={{ color: T.lime }} />
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 14, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>
              <span>{active.durationMinutes} min</span>
              <span style={{ color: T.mut }}>·</span>
              <span>{active.plannedReps > 0 ? `${active.plannedReps} reps mål` : "Ingen reps-mål"}</span>
            </div>
            {active.notes && (
              <div style={{ marginTop: 14, borderRadius: T.rRow, background: T.panel2, border: `1px solid ${T.border}`, padding: "10px 14px", fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
                {active.notes}
              </div>
            )}
          </Kort>

          {/* Tellere */}
          <RepStegRad label="Totalt" value={computedTotal} primary />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <RepStegRad label="Uten ball" value={active.repsWithoutBall} onChange={(v) => setField("repsWithoutBall", v)} />
            <RepStegRad label="Lav hastighet" value={active.repsLowSpeed} onChange={(v) => setField("repsLowSpeed", v)} />
            <RepStegRad label="Automatikk" value={active.repsAutomatic} onChange={(v) => setField("repsAutomatic", v)} />
            <RepStegRad label="Golfballer slått" value={active.repsHit} onChange={(v) => setField("repsHit", v)} />
          </div>

          <Knapp full icon="check" disabled={isCompleting} onClick={handleCompleteDrill}>
            {activeIdx === drills.length - 1 ? "Fullfør økt" : "Fullfør øvelse"}
          </Knapp>
        </main>
      </Scope>
    );
  }

  // ── Aktiv-visning ────────────────────────────────────────────────────
  return (
    <Scope>
      <BekreftOverlay
        show={showConfirm}
        onConfirm={() => {
          setShowConfirm(false);
          router.replace("/portal/planlegge");
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Topbar */}
      <header style={topbarStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, lineHeight: 1.2, letterSpacing: "-0.01em", color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.title}
          </div>
          <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, color: T.mut }}>{sessionMeta}</div>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          style={{ appearance: "none", cursor: "pointer", flex: "none", borderRadius: 9999, border: `1px solid color-mix(in srgb,${T.down} 25%,transparent)`, background: `color-mix(in srgb,${T.down} 9%,transparent)`, color: T.down, padding: "6px 14px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          Avslutt
        </button>
      </header>

      {/* Innhold */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px 28px", display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Fremdrift + timer */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap }}>
          <Kort eyebrow="Fremdrift" action={
            <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
              {completedCount}<span style={{ fontWeight: 400, color: T.mut }}> / {drills.length}</span>
            </span>
          }>
            <div style={{ height: 10, borderRadius: 9999, overflow: "hidden", background: T.track, border: `1px solid ${T.border}` }}>
              <div style={{ height: "100%", borderRadius: 9999, width: `${progressPct}%`, background: `linear-gradient(90deg, ${T.forest}, ${T.lime})`, transition: `width 700ms ${T.ease}` }} />
            </div>
            <div style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
              {allDone
                ? "Alle øvelser fullført — flott innsats."
                : completedCount > 0
                  ? `Øvelse ${completedCount + 1} av ${drills.length} pågår`
                  : "Trykk «Logg rep» for å begynne"}
            </div>
          </Kort>

          {/* Timer */}
          <Kort eyebrow="Økt-tid" action={paused ? <StatusPill tone="warn">Pause</StatusPill> : <StatusPill tone="lime">Går</StatusPill>}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 700, color: T.fg, lineHeight: 0.9, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                {fmtTid(totalSec)}
              </span>
              <button
                type="button"
                onClick={togglePause}
                title={paused ? "Fortsett" : "Pause"}
                style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, flex: "none", borderRadius: 12, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name={paused ? "play" : "clock"} size={17} />
              </button>
            </div>
          </Kort>
        </div>

        {/* Alle ferdige — banner */}
        {allDone && (
          <Kort tint>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg }}>Alle øvelser fullført</div>
              <div style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{data.title}</div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                <Knapp icon="bar-chart" onClick={() => sessionId && void completeSession(sessionId, totalSec)}>
                  Se oppsummering
                </Knapp>
              </div>
            </div>
          </Kort>
        )}

        {/* Øvelses-liste */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {drills.map((drill) => (
            <DrillKort key={drill.id} drill={drill} onLogg={drill.status === "active" ? () => setShowLogger(true) : undefined} />
          ))}
        </div>

        {/* Sticky fullfør-knapp */}
        {active && !allDone && (
          <Knapp full icon="check" disabled={isCompleting} onClick={handleCompleteDrill}>
            {activeIdx === drills.length - 1 ? "Fullfør økt" : "Fullfør øvelse"}
          </Knapp>
        )}
      </main>
    </Scope>
  );
}

/* ── Dark-scope + delt topbar-stil ──────────────────────────────────── */

const topbarStyle = {
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  borderBottom: `1px solid ${T.border}`,
  background: `color-mix(in srgb,${T.panel} 70%,transparent)`,
  backdropFilter: "blur(10px)",
  padding: "12px 18px",
  paddingTop: "max(env(safe-area-inset-top) + 12px, 16px)",
} as const;

/** Egen mørk fullskjerm-ramme (ingen V2Shell) — setter dark-scope + vignett. */
function Scope({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        isolation: "isolate",
        colorScheme: "dark",
        color: T.fg,
        fontFamily: T.ui,
        background: `radial-gradient(1100px 460px at 24% -8%, rgba(0,88,64,0.16), transparent 62%), ${T.bg}`,
      }}
    >
      {children}
    </div>
  );
}
