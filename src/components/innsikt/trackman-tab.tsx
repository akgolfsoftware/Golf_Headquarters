"use client";

import Link from "next/link";
import { Crosshair, Plus, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type TrackManTabSession = {
  id: string;
  recordedAt: string; // ISO-string
  shotCount: number;
  environment?: string | null;
  // Avledede metrics — hentes fra rawJson eller beregnes
  tittel?: string;
  carryM?: number | null;
  smashFactor?: number | null;
  clubSpeedKmh?: number | null;
};

export type TrackManTabProps = {
  sessions?: TrackManTabSession[];
  kpi?: {
    totalOkter: number;
    sisteOkt: string | null; // formatert dato
    snittClubSpeed: number | null;
  };
};

// ---------------------------------------------------------------------------
// Demo-data
// ---------------------------------------------------------------------------

const DEMO_SESSIONS: TrackManTabSession[] = [
  {
    id: "tm-1",
    recordedAt: "2026-05-18T10:00:00",
    shotCount: 48,
    tittel: "Driver-økt",
    carryM: 268,
    smashFactor: 1.48,
    clubSpeedKmh: 162,
  },
  {
    id: "tm-2",
    recordedAt: "2026-05-14T09:30:00",
    shotCount: 36,
    tittel: "7-jern teknikk",
    carryM: 172,
    smashFactor: 1.44,
    clubSpeedKmh: 143,
  },
  {
    id: "tm-3",
    recordedAt: "2026-05-10T11:00:00",
    shotCount: 52,
    tittel: "5—8 jern",
    carryM: 186,
    smashFactor: 1.42,
    clubSpeedKmh: 148,
  },
  {
    id: "tm-4",
    recordedAt: "2026-04-28T14:00:00",
    shotCount: 40,
    tittel: "Driver + 3-wood",
    carryM: 255,
    smashFactor: 1.47,
    clubSpeedKmh: 159,
  },
  {
    id: "tm-5",
    recordedAt: "2026-04-21T10:30:00",
    shotCount: 44,
    tittel: "Kilt-økt",
    carryM: 130,
    smashFactor: 1.40,
    clubSpeedKmh: 128,
  },
];

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

function formatDato(isoStr: string): { dag: string; dato: string } {
  const d = new Date(isoStr);
  const dag = d.toLocaleDateString("nb-NO", { weekday: "short" }).toUpperCase();
  const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  return { dag, dato };
}

// ---------------------------------------------------------------------------
// Mini-sparkline SVG (deterministisk basert på id-hash)
// ---------------------------------------------------------------------------

function MiniSparkline({ sessionId, shotCount }: { sessionId: string; shotCount: number }) {
  const W = 56;
  const H = 20;
  const N = 8;

  // Deterministisk hash for å generere pseudo-tilfeldige, men stabile punkter
  function hash(s: string, i: number): number {
    let h = 0;
    for (let j = 0; j < s.length; j++) h = (h * 31 + s.charCodeAt(j)) >>> 0;
    return (h ^ (i * 2654435761)) >>> 0;
  }

  const points = Array.from({ length: N }, (_, i) => {
    const v = (hash(sessionId, i) % 60) + 20; // 20..79
    const x = (i / (N - 1)) * W;
    const y = H - (v / 100) * H;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      className="in-tm-mini-svg"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-label={`${shotCount} slag`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--in-brand)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TrackMan-kort
// ---------------------------------------------------------------------------

function TmCard({ session }: { session: TrackManTabSession }) {
  const { dag, dato } = formatDato(session.recordedAt);
  const tittel = session.tittel ?? `${session.shotCount} slag`;

  return (
    <div className="in-tm-card">
      <div className="in-tm-card-head">
        <div className="dato">
          <span className="dag">{dag}</span>
          <span className="datotxt">{dato}</span>
        </div>
        <MiniSparkline sessionId={session.id} shotCount={session.shotCount} />
      </div>
      <div className="in-tm-tittel">{tittel}</div>
      <div className="in-tm-metrics">
        {session.carryM != null && (
          <span className="metric">
            <span className="val">{session.carryM}</span>
            <span className="enhet">m carry</span>
          </span>
        )}
        {session.smashFactor != null && (
          <span className="metric">
            <span className="val">{session.smashFactor.toFixed(2)}</span>
            <span className="enhet">smash</span>
          </span>
        )}
      </div>
      <Link href={`/portal/trackman/${session.id}`} className="in-tm-aapne">
        Åpne <ArrowRight size={11} aria-hidden />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Eksportert komponent
// ---------------------------------------------------------------------------

export function TrackManTab({ sessions, kpi }: TrackManTabProps) {
  const visSessions = sessions && sessions.length > 0 ? sessions : DEMO_SESSIONS;

  const totalOkter = kpi?.totalOkter ?? visSessions.length;
  const sisteOkt =
    kpi?.sisteOkt ??
    new Date(visSessions[0].recordedAt).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    });
  const snittClubSpeed =
    kpi?.snittClubSpeed ??
    Math.round(
      visSessions.reduce((s, r) => s + (r.clubSpeedKmh ?? 0), 0) / visSessions.length
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* KPI-rad */}
      <div className="in-kpi-row">
        <div className="in-kpi-card">
          <div className="in-kpi-label">Totalt økter</div>
          <div className="in-kpi-val">{totalOkter}</div>
          <div className="in-kpi-delta">registrert</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Siste økt</div>
          <div className="in-kpi-val" style={{ fontSize: 15 }}>{sisteOkt}</div>
          <div className="in-kpi-delta muted">dato</div>
        </div>
        <div className="in-kpi-card">
          <div className="in-kpi-label">Snitt club-speed</div>
          <div className="in-kpi-val">
            {snittClubSpeed}<small>km/t</small>
          </div>
          <div className="in-kpi-delta">driver</div>
        </div>
      </div>

      {/* Siste 5 økter */}
      <section>
        <div className="in-sec-header">
          <h2 className="in-sec-title">Siste {visSessions.length} TrackMan-økter</h2>
          <Link href="/portal/mal/trackman" className="in-sec-link">
            <Crosshair size={11} aria-hidden />
            Alle økter
          </Link>
        </div>
        <div className="in-tm-grid">
          {visSessions.map((s) => (
            <TmCard key={s.id} session={s} />
          ))}
        </div>
      </section>

      {/* Importer CTA */}
      <div>
        <Link href="/portal/mal/trackman" className="in-sec-cta">
          <Plus size={13} aria-hidden />
          Importer ny økt
        </Link>
      </div>

    </div>
  );
}
