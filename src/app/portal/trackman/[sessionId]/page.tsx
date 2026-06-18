/**
 * PlayerHQ · TrackMan-økt detalj — hybrid design (2026-06-17)
 *
 * Portert fra: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ TrackMan Detalj (hybrid).dc.html
 *
 * Viser alle shots fra én TrackMan-økt med metrikker, KPI-strip og enkel
 * SG-beregning. Nås direkte fra workbench (uten "Mål"-konteksten).
 *
 * Hybrid-mønster: editorial lys hero (mono eyebrow + display-tittel med italic
 * forest-aksent) → terminal data-kort under (mono-tall, hårfine borders,
 * tabular-nums).
 *
 * Inneholder:
 * - Hero: dato + økt-type
 * - Snitt-KPI-rad (carry · ballfart · smash) + utvidet KPI-strip
 * - SG-beregning (proxy via smash-faktor)
 * - Shot-tabell med alle slag (terminal data-table)
 * - Actions: eksport CSV · slett · sammenlign
 *
 * Param `[sessionId]`. URL: `/portal/trackman/<sessionId>`.
 * Ingen dummy-data — tom/ukjent økt gir en ekte tom-tilstand.
 */

import Link from "next/link";
import { ArrowLeft, Wind, Thermometer, MapPin, Activity } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero } from "@/components/portal/player-hero";
import { TrackManSessionClient } from "./trackman-client";

type Shot = {
  shotNumber: number;
  club: string;
  clubSpeed: number; // mph
  ballSpeed: number; // mph
  smash: number;
  carry: number; // m
  total: number; // m
  deviation: number; // m (negative = venstre)
  spin: number; // rpm
  launch: number; // degrees
};

type Session = {
  id: string;
  recordedAt: Date;
  sessionLabel: string;
  source: string;
  shots: Shot[];
  environment: {
    temp: number | null;
    wind: number | null;
    location: string;
  };
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function nb(n: number, decimals: number): string {
  return n.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default async function TrackManSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  let session: Session | null = null;

  try {
    const prismaSession = await prisma.trackManSession.findUnique({
      where: { id: sessionId },
    });
    if (prismaSession) {
      const isOwner =
        prismaSession.userId === user.id ||
        user.role === "ADMIN" ||
        user.role === "COACH";
      if (isOwner) {
        const rawShots = Array.isArray(prismaSession.rawJson)
          ? (prismaSession.rawJson as Record<string, unknown>[])
          : [];
        const mapped: Shot[] = rawShots
          .map((row, idx) => mapRawShot(row, idx))
          .filter((s): s is Shot => s !== null);
        session = {
          id: prismaSession.id,
          recordedAt: prismaSession.recordedAt,
          sessionLabel: `${mapped[0]?.club ?? "TrackMan"}-økt`,
          source: prismaSession.source,
          shots: mapped,
          environment: {
            temp: null,
            wind: null,
            location: prismaSession.source,
          },
        };
      }
    }
  } catch {
    // DB nede — vis tom-tilstand i stedet for å feile.
  }

  // ── Tom-tilstand: ukjent økt eller ingen slag ──────────────────────────────
  if (!session || session.shots.length === 0) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <Link
          href="/portal/mal/trackman"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          TrackMan
        </Link>

        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Activity className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
          <p className="font-display text-lg font-bold text-foreground">
            Fant ingen slag for denne økten
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Økten finnes ikke, eller den har ingen registrerte TrackMan-slag
            ennå. Importer en CSV eller velg en annen økt.
          </p>
          <Link
            href="/portal/mal/trackman"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tilbake til TrackMan-økter
          </Link>
        </div>
      </div>
    );
  }

  const shots = session.shots;
  const kpis = {
    count: shots.length,
    clubSpeed: avg(shots.map((s) => s.clubSpeed)),
    smash: avg(shots.map((s) => s.smash)),
    carry: avg(shots.map((s) => s.carry)),
    ballSpeed: avg(shots.map((s) => s.ballSpeed)),
    deviation: avg(shots.map((s) => Math.abs(s.deviation))),
    spin: avg(shots.map((s) => s.spin)),
  };

  const sgEstimate = (kpis.smash - 1.44) * 8; // enkel proxy

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      {/* Tilbake */}
      <Link
        href="/portal/mal/trackman"
        className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        TrackMan
      </Link>

      {/* Hero — editorial */}
      <PlayerHero
        eyebrow={`${shots[0]?.club ?? "TRACKMAN"} · ${session.source}`.toUpperCase()}
        titleLead="Økt"
        titleItalic={formatDateShort(session.recordedAt)}
        sub={`${shots.length} slag · ${formatDate(session.recordedAt)}`}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-secondary-foreground">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {session.environment.location}
          </span>
        }
      />

      {/* Environment-strip */}
      {(session.environment.temp != null || session.environment.wind != null) && (
        <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm sm:gap-6 sm:px-6">
          {session.environment.temp != null && (
            <div className="flex items-center gap-2">
              <Thermometer
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="font-mono text-sm tabular-nums text-foreground">
                {session.environment.temp}°C
              </span>
            </div>
          )}
          {session.environment.wind != null && (
            <div className="flex items-center gap-2">
              <Wind
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="font-mono text-sm tabular-nums text-foreground">
                {session.environment.wind} m/s
              </span>
            </div>
          )}
        </div>
      )}

      {/* Snitt-KPI-rad — 3-kolonners terminal-stripe (carry · ballfart · smash) */}
      <section
        aria-label="Snitt"
        className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <SnittCell
          label="Carry snitt"
          value={kpis.carry > 0 ? kpis.carry.toFixed(0) : "–"}
          unit="m"
          border
        />
        <SnittCell
          label="Ballfart"
          value={kpis.ballSpeed > 0 ? nb(kpis.ballSpeed, 1) : "–"}
          unit="mph"
          border
        />
        <SnittCell
          label="Smash"
          value={kpis.smash > 0 ? nb(kpis.smash, 2) : "–"}
          unit=""
        />
      </section>

      {/* Utvidet KPI-strip — terminal data-kort */}
      <section
        aria-label="Nøkkeltall"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <KpiCard label="Antall slag" value={kpis.count.toString()} unit="" />
        <KpiCard
          label="Snitt club-speed"
          value={kpis.clubSpeed > 0 ? nb(kpis.clubSpeed, 1) : "–"}
          unit="mph"
          accent
        />
        <KpiCard
          label="Snitt smash"
          value={kpis.smash > 0 ? nb(kpis.smash, 2) : "–"}
          unit=""
        />
        <KpiCard
          label="Snitt carry"
          value={kpis.carry > 0 ? kpis.carry.toFixed(0) : "–"}
          unit="m"
          accent
        />
        <KpiCard
          label="Snitt avvik"
          value={`±${nb(kpis.deviation, 1)}`}
          unit="m"
        />
      </section>

      {/* SG-estimat */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm sm:p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
          SG-estimat (proxy via smash-faktor)
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold tabular-nums text-foreground">
            {sgEstimate >= 0 ? "+" : ""}
            {nb(sgEstimate, 2)}
          </span>
          <span className="text-sm text-muted-foreground">SG vs. tour-snitt</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Estimat basert på smash-faktor i denne økten. Full SG-beregning krever
          baseline mot tour-snitt per disiplin.
        </p>
      </section>

      {/* Shot-tabell — terminal data-table */}
      <section
        aria-labelledby="shots-heading"
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col items-start gap-2 border-b border-border bg-secondary px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h2
            id="shots-heading"
            className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Alle slag · {shots[0]?.club ?? "økt"} · {shots.length} slag
          </h2>
          <TrackManSessionClient.Filter />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-border font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Kølle</th>
                <th className="px-3 py-2 text-right">CS</th>
                <th className="px-3 py-2 text-right">Ballfart</th>
                <th className="px-3 py-2 text-right">Smash</th>
                <th className="px-3 py-2 text-right">Carry</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Avvik</th>
                <th className="px-3 py-2 text-right">Spinn</th>
                <th className="px-3 py-2 text-right">Launch</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((s) => (
                <tr
                  key={s.shotNumber}
                  className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-secondary/40"
                >
                  <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                    {s.shotNumber}
                  </td>
                  <td className="px-3 py-2 text-foreground">{s.club}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                    {nb(s.clubSpeed, 1)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                    {nb(s.ballSpeed, 1)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums ${s.smash >= 1.48 ? "text-primary" : "text-foreground"}`}
                  >
                    {nb(s.smash, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                    {s.carry.toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                    {s.total.toFixed(0)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono tabular-nums ${Math.abs(s.deviation) > 5 ? "text-destructive" : "text-foreground"}`}
                  >
                    {s.deviation > 0 ? "+" : ""}
                    {nb(s.deviation, 1)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {s.spin}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                    {nb(s.launch, 1)}°
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      <TrackManSessionClient.Actions
        sessionId={session.id}
        shotCount={shots.length}
      />
    </div>
  );
}

/* --- Hjelpere --- */

function mapRawShot(row: Record<string, unknown>, idx: number): Shot | null {
  const num = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const cleaned = v.replace(",", ".").replace(/[^0-9.\-]/g, "");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };
  const club = String(row["Club"] ?? row["club"] ?? row["Kølle"] ?? "Ukjent");
  if (!club) return null;
  return {
    shotNumber: idx + 1,
    club,
    clubSpeed: num(row["Club Speed"] ?? row["clubSpeed"] ?? row["CS"]),
    ballSpeed: num(row["Ball Speed"] ?? row["ballSpeed"] ?? row["BS"]),
    smash: num(row["Smash Factor"] ?? row["smash"]),
    carry: num(row["Carry"] ?? row["carry"]),
    total: num(row["Total"] ?? row["total"]),
    deviation: num(row["Side"] ?? row["deviation"] ?? row["Carry Side"] ?? 0),
    spin: num(row["Spin Rate"] ?? row["spin"]),
    launch: num(row["Launch Angle"] ?? row["launch"]),
  };
}

/* --- Sub-komponenter --- */

function SnittCell({
  label,
  value,
  unit,
  border,
}: {
  label: string;
  value: string;
  unit: string;
  border?: boolean;
}) {
  return (
    <div className={`p-4 ${border ? "border-r border-border" : ""}`}>
      <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold leading-none tabular-nums text-foreground">
        {value}
        {unit && (
          <small className="ml-1 text-[10px] font-medium text-muted-foreground">
            {unit}
          </small>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
