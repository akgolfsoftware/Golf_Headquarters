/**
 * AgencyOS — Full spiller-profil (`/admin/spillere/[id]/profil`)
 *
 * Pixel-perfekt v2 (sesjon-1, skjerm 4).
 * Vertikal stack med personalia, forelder, spiller-DNA (radar), aktive mål,
 * skade-historikk og coach-vurdering (Inter Tight blokk-quote).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PenSquare } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

const NB_LONG = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function SpillerProfilSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      childRelations: {
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      leaves: {
        orderBy: { startAt: "desc" },
        take: 10,
      },
      coachNotesAbout: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { coach: { select: { name: true } } },
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const ageYears = calcAge(player.dateOfBirth);
  const coachNote = player.coachNotesAbout[0] ?? null;

  // Spiller-DNA fra preferences-JSON (sample dersom mangler)
  type DnaShape = { fys: number; tek: number; slag: number; spill: number; turn: number };
  let dna: DnaShape | null = null;
  const cohort: DnaShape = { fys: 70, tek: 68, slag: 72, spill: 65, turn: 70 };
  try {
    const prefs = player.preferences as { spillerDna?: DnaShape } | null;
    if (prefs?.spillerDna) dna = prefs.spillerDna;
  } catch {
    /* ignore */
  }
  if (!dna) {
    dna = { fys: 78, tek: 82, slag: 74, spill: 60, turn: 65 };
  }

  return (
    <div className="space-y-6">
      {/* SUB-HERO */}
      <header className="space-y-4">
        <Link
          href={`/admin/spillere/${player.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft size={12} strokeWidth={2} />
          Tilbake til {player.name}
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            Spiller-
            <em className="font-display italic font-normal text-primary">
              profil
            </em>
          </h1>
          <Link
            href={`/admin/spillere/${player.id}/rediger`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <PenSquare size={14} strokeWidth={1.75} />
            Rediger
          </Link>
        </div>
      </header>

      {/* 1. PERSONALIA */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Personalia
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
            Stamdata
          </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Fact label="Fullt navn" value={player.name} />
          <Fact label="E-post" value={player.email} mono />
          <Fact
            label="Fødselsdato"
            value={
              player.dateOfBirth
                ? `${NB_LONG.format(player.dateOfBirth)}${ageYears != null ? ` · ${ageYears} år` : ""}`
                : "—"
            }
          />
          <Fact label="Telefon" value={player.phone ?? "—"} mono />
          <Fact label="Hjemmeklubb" value={player.homeClub ?? "—"} />
          <Fact label="Skole" value={player.school ?? "—"} />
          <Fact label="Spilte år" value={player.playingYears ? `${player.playingYears} år` : "—"} />
          <Fact label="Ambisjon" value={player.ambition ?? "—"} />
        </dl>
      </section>

      {/* 2. FORELDER/VERGE */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Forelder / verge
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
              Foresatte
            </h2>
          </div>
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
          >
            + Legg til forelder
          </button>
        </div>
        {player.childRelations.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            Ingen foresatte registrert.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {player.childRelations.map((cr) => {
              const p = cr.parent;
              return (
                <div
                  key={cr.id}
                  className="flex items-start gap-2 rounded-xl border border-border bg-background p-4"
                >
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full font-mono text-xs font-semibold text-white"
                      style={{ background: avatarBg(p.name) }}
                    >
                      {initialsFromName(p.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {p.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {cr.relationship}
                    </div>
                    <div className="mt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {p.phone ?? p.email}
                    </div>
                    <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                      Stripe-betaler
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SPILLER-DNA */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Spiller-DNA
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
            5-akset profil
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[280px_1fr]">
          <RadarChart dna={dna} cohort={cohort} />
          <div className="space-y-2">
            <DnaAxisRow label="FYS" value={dna.fys} cohort={cohort.fys} axis="fys" />
            <DnaAxisRow label="TEK" value={dna.tek} cohort={cohort.tek} axis="tek" />
            <DnaAxisRow label="SLAG" value={dna.slag} cohort={cohort.slag} axis="slag" />
            <DnaAxisRow label="SPILL" value={dna.spill} cohort={cohort.spill} axis="spill" />
            <DnaAxisRow label="TURN" value={dna.turn} cohort={cohort.turn} axis="turn" />
            <div className="mt-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-accent" />
                Spilleren
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-muted-foreground" />
                Cohort-snitt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AKTIVE MÅL */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Aktive mål
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
              Pågående målbilder
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {player.goals.length}
          </span>
        </div>
        {player.goals.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            Ingen aktive mål.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {player.goals.slice(0, 3).map((g) => {
              const typeLabel =
                g.type === "HCP_TARGET"
                  ? "Resultat"
                  : g.type === "SG_AREA"
                    ? "Prosess"
                    : "Atferd";
              return (
                <div
                  key={g.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                    {typeLabel}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                    {g.title}
                  </h3>
                  <ProgressRing pct={50} />
                  {g.targetDate && (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      Frist: {NB_DATE.format(g.targetDate)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. SKADER / PERMISJONER */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Skader / permisjoner
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
            Historikk
          </h2>
        </div>
        {player.leaves.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            Ingen registrerte hendelser.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="pb-2 pr-4 font-semibold">Årsak</th>
                  <th className="pb-2 pr-4 font-semibold">Fra</th>
                  <th className="pb-2 pr-4 font-semibold">Til</th>
                  <th className="pb-2 pr-4 font-semibold">Beskrivelse</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {player.leaves.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-foreground">{l.reason}</td>
                    <td className="py-2 pr-4 font-mono text-xs tabular-nums text-muted-foreground">
                      {NB_DATE.format(l.startAt)}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs tabular-nums text-muted-foreground">
                      {l.endAt ? NB_DATE.format(l.endAt) : "pågår"}
                    </td>
                    <td className="py-2 pr-4 text-foreground">{l.description ?? "—"}</td>
                    <td className="py-2">
                      <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        {l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 6. COACH-VURDERING */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1.5 bg-accent"
        />
        <div className="pl-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Coachens vurdering
          </div>
          {coachNote ? (
            <>
              <blockquote className="mt-4 font-display italic text-xl leading-relaxed text-foreground sm:text-2xl">
                &laquo;{coachNote.content}&raquo;
              </blockquote>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {coachNote.coach.name} · oppdatert {NB_DATE.format(coachNote.updatedAt)}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Ingen vurdering registrert ennå.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------- Helpers ----------

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-foreground ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

type PyramidAxis = "fys" | "tek" | "slag" | "spill" | "turn";

function DnaAxisRow({
  label,
  value,
  cohort,
  axis,
}: {
  label: string;
  value: number;
  cohort: number;
  axis: PyramidAxis;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.08em]">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value} <span className="text-muted-foreground">/ cohort {cohort}</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${value}%`, background: `var(--color-pyr-${axis})` }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 h-full w-0.5 bg-muted-foreground"
          style={{ left: `${cohort}%` }}
        />
      </div>
    </div>
  );
}

function RadarChart({
  dna,
  cohort,
}: {
  dna: { fys: number; tek: number; slag: number; spill: number; turn: number };
  cohort: { fys: number; tek: number; slag: number; spill: number; turn: number };
}) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const axes = [
    { key: "FYS", v: dna.fys, c: cohort.fys },
    { key: "TEK", v: dna.tek, c: cohort.tek },
    { key: "SLAG", v: dna.slag, c: cohort.slag },
    { key: "SPILL", v: dna.spill, c: cohort.spill },
    { key: "TURN", v: dna.turn, c: cohort.turn },
  ];
  const N = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt = (v: number, i: number) => {
    const rad = (v / 100) * r;
    return [cx + rad * Math.cos(angle(i)), cy + rad * Math.sin(angle(i))];
  };
  const path = (vals: number[]) =>
    vals
      .map((v, i) => {
        const [x, y] = pt(v, i);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* Grid pentagons */}
      {[20, 40, 60, 80, 100].map((p) => (
        <polygon
          key={p}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={0.5}
          points={axes
            .map((_, i) => {
              const [x, y] = pt(p, i);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
        />
      ))}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const [x, y] = pt(100, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth={0.5}
          />
        );
      })}
      {/* Cohort (dotted gray) */}
      <path
        d={path(axes.map((a) => a.c))}
        fill="none"
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* Player (lime fill) */}
      <path
        d={path(axes.map((a) => a.v))}
        fill="var(--color-accent)"
        fillOpacity={0.35}
        stroke="var(--color-primary)"
        strokeWidth={2}
      />
      {/* Labels */}
      {axes.map((a, i) => {
        const labelR = r + 18;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        return (
          <text
            key={a.key}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="monospace"
            fill="var(--color-muted-foreground)"
            style={{ letterSpacing: "0.08em" }}
          >
            {a.key}
          </text>
        );
      })}
    </svg>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (pct / 100) * C;
  return (
    <div className="mt-2 flex items-center gap-2">
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="font-mono text-sm font-semibold tabular-nums text-primary">
        {pct} %
      </div>
    </div>
  );
}
