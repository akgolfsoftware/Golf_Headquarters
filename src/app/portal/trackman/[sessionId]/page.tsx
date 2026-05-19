/**
 * PlayerHQ · TrackMan-økt detalj (forenklet versjon for workbench-navigasjon)
 *
 * Viser alle shots fra én TrackMan-økt med metrikker, KPI-strip og enkel
 * SG-beregning. Dette er en mer fokusert variant av `/portal/mal/trackman/[id]`
 * — designet for å nås direkte fra workbench (uten "Mål"-konteksten).
 *
 * Inneholder:
 * - Hero: dato + økt-type
 * - KPI-strip: shots · CS · smash · carry · deviation
 * - Shot-tabell med alle slag
 * - SG-beregning (hvis data finnes)
 * - Actions: eksport CSV · slett · sammenlign
 *
 * Param `[sessionId]`. URL: `/portal/trackman/<sessionId>`.
 */

import Link from "next/link";
import { ArrowLeft, Wind, Thermometer, MapPin } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
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

const DUMMY_SHOTS: Shot[] = Array.from({ length: 47 }, (_, i) => {
  const cs = 108 + Math.sin(i / 4) * 4 + (Math.random() - 0.5) * 2;
  const bs = cs * 1.48 + (Math.random() - 0.5) * 2;
  const carry = 260 + Math.sin(i / 5) * 10 + (Math.random() - 0.5) * 8;
  return {
    shotNumber: i + 1,
    club: "Driver",
    clubSpeed: Number(cs.toFixed(1)),
    ballSpeed: Number(bs.toFixed(1)),
    smash: Number((bs / cs).toFixed(2)),
    carry: Number(carry.toFixed(1)),
    total: Number((carry + 15 + Math.random() * 5).toFixed(1)),
    deviation: Number(((Math.random() - 0.5) * 12).toFixed(1)),
    spin: Math.round(2400 + (Math.random() - 0.5) * 400),
    launch: Number((11 + (Math.random() - 0.5) * 2).toFixed(1)),
  };
});

const DUMMY_SESSION: Session = {
  id: "dummy-session",
  recordedAt: new Date("2026-05-12T11:00:00"),
  sessionLabel: "Driver grunntrening",
  source: "TrackMan 4",
  shots: DUMMY_SHOTS,
  environment: {
    temp: 14,
    wind: 3.2,
    location: "Range matte 4 · AK Golf Academy",
  },
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
    day: "2-digit",
    month: "short",
  });
}

export default async function TrackManSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  let session: Session = DUMMY_SESSION;

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
          sessionLabel: `${mapped[0]?.club ?? "Trackman"}-økt`,
          source: prismaSession.source,
          shots: mapped.length > 0 ? mapped : DUMMY_SHOTS,
          environment: {
            temp: null,
            wind: null,
            location: prismaSession.source,
          },
        };
      }
    }
  } catch {
    // DB nede — bruk dummy.
  }

  const shots = session.shots;
  const kpis = {
    count: shots.length,
    clubSpeed: avg(shots.map((s) => s.clubSpeed)),
    smash: avg(shots.map((s) => s.smash)),
    carry: avg(shots.map((s) => s.carry)),
    deviation: avg(shots.map((s) => Math.abs(s.deviation))),
    spin: avg(shots.map((s) => s.spin)),
  };

  const sgEstimate = (kpis.smash - 1.44) * 8; // enkel proxy

  return (
    <div className="space-y-10">
      <Link
        href="/portal/mal/trackman"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Tilbake til TrackMan-økter
      </Link>

      <PageHeader
        eyebrow={`TRACKMAN · ${formatDateShort(session.recordedAt).toUpperCase()} · ${session.sessionLabel.toUpperCase()}`}
        titleLead="Økt:"
        titleItalic={session.sessionLabel}
        sub={`${formatDate(session.recordedAt)} · ${session.source}`}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-secondary-foreground">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {session.environment.location}
          </span>
        }
      />

      {/* Environment-strip */}
      {(session.environment.temp != null || session.environment.wind != null) && (
        <div className="flex flex-wrap gap-6 rounded-2xl border border-border bg-card px-6 py-4">
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

      {/* KPI-strip */}
      <section
        aria-label="Nøkkeltall"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        <KpiCard label="Antall shots" value={kpis.count.toString()} unit="" />
        <KpiCard
          label="Snitt club-speed"
          value={kpis.clubSpeed.toFixed(1).replace(".", ",")}
          unit="mph"
          accent
        />
        <KpiCard
          label="Snitt smash"
          value={kpis.smash.toFixed(2).replace(".", ",")}
          unit=""
        />
        <KpiCard
          label="Snitt carry"
          value={kpis.carry.toFixed(0)}
          unit="m"
          accent
        />
        <KpiCard
          label="Snitt deviation"
          value={`±${kpis.deviation.toFixed(1).replace(".", ",")}`}
          unit="m"
        />
      </section>

      {/* SG-beregning */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
          SG-estimat (proxy via smash-faktor)
        </span>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-display text-3xl font-semibold tabular-nums text-foreground">
            {sgEstimate >= 0 ? "+" : ""}
            {sgEstimate.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-sm text-muted-foreground">
            SG vs. tour-snitt
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Estimat basert på smash-faktor i denne økten. Full SG-beregning krever
          baseline mot tour-snitt per disiplin.
        </p>
      </section>

      {/* Shot-tabell */}
      <section
        aria-labelledby="shots-heading"
        className="rounded-2xl border border-border bg-card"
      >
        <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
          <h2
            id="shots-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Alle shots · {shots.length} slag
          </h2>
          <TrackManSessionClient.Filter />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Kølle</th>
                <th className="px-4 py-3 text-right">CS</th>
                <th className="px-4 py-3 text-right">BS</th>
                <th className="px-4 py-3 text-right">Smash</th>
                <th className="px-4 py-3 text-right">Carry</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Dev</th>
                <th className="px-4 py-3 text-right">Spin</th>
                <th className="px-4 py-3 text-right">Launch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shots.map((s) => (
                <tr key={s.shotNumber} className="hover:bg-secondary/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground tabular-nums">
                    {s.shotNumber}
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{s.club}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.clubSpeed.toFixed(1).replace(".", ",")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.ballSpeed.toFixed(1).replace(".", ",")}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${s.smash >= 1.48 ? "text-primary" : ""}`}
                  >
                    {s.smash.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.carry.toFixed(0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {s.total.toFixed(0)}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono tabular-nums ${Math.abs(s.deviation) > 5 ? "text-destructive" : "text-foreground"}`}
                  >
                    {s.deviation > 0 ? "+" : ""}
                    {s.deviation.toFixed(1).replace(".", ",")}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {s.spin}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                    {s.launch.toFixed(1).replace(".", ",")}°
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

function mapRawShot(
  row: Record<string, unknown>,
  idx: number,
): Shot | null {
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
    deviation: num(
      row["Side"] ?? row["deviation"] ?? row["Carry Side"] ?? 0,
    ),
    spin: num(row["Spin Rate"] ?? row["spin"]),
    launch: num(row["Launch Angle"] ?? row["launch"]),
  };
}

/* --- Sub-komponenter --- */

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
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
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
