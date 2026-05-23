/**
 * CoachHQ — Full spiller-profil (`/admin/spillere/[id]/profil`)
 *
 * Pixel-perfekt v2 (sesjon-1, skjerm 4).
 * Vertikal stack med personalia, forelder, spiller-DNA (radar), aktive mål,
 * skade-historikk og coach-vurdering (Instrument Serif blokk-quote).
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
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const ageYears = calcAge(player.dateOfBirth);

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
          className="inline-flex items-center gap-2 rounded-full border border-[#E5E3DD] bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57] transition-colors hover:bg-[#F1EEE5]"
        >
          <ArrowLeft size={12} strokeWidth={2} />
          Tilbake til {player.name}
        </Link>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#0A1F17] sm:text-4xl">
            Spiller-
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              profil
            </em>
          </h1>
          <Link
            href={`/admin/spillere/${player.id}/rediger`}
            className="inline-flex items-center gap-2 rounded-full bg-[#005840] px-4 py-2 text-sm font-semibold text-[#D1F843] hover:opacity-90"
          >
            <PenSquare size={14} strokeWidth={1.75} />
            Rediger
          </Link>
        </div>
      </header>

      {/* 1. PERSONALIA */}
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Personalia
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
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
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
              Forelder / verge
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
              Foresatte
            </h2>
          </div>
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#005840] hover:underline"
          >
            + Legg til forelder
          </button>
        </div>
        {player.childRelations.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#E5E3DD] bg-[#FAFAF7] p-4 text-sm text-[#5E5C57]">
            Ingen foresatte registrert.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {player.childRelations.map((cr) => {
              const p = cr.parent;
              return (
                <div
                  key={cr.id}
                  className="flex items-start gap-3 rounded-xl border border-[#E5E3DD] bg-[#FAFAF7] p-4"
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
                    <div className="truncate text-sm font-semibold text-[#0A1F17]">
                      {p.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                      {cr.relationship}
                    </div>
                    <div className="mt-2 font-mono text-[11px] tabular-nums text-[#5E5C57]">
                      {p.phone ?? p.email}
                    </div>
                    <span className="mt-2 inline-flex rounded-full bg-[#005840]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#005840]">
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
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Spiller-DNA
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
            5-akset profil
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[280px_1fr]">
          <RadarChart dna={dna} cohort={cohort} />
          <div className="space-y-3">
            <DnaAxisRow label="FYS" value={dna.fys} cohort={cohort.fys} color="#005840" />
            <DnaAxisRow label="TEK" value={dna.tek} cohort={cohort.tek} color="#1A7D56" />
            <DnaAxisRow label="SLAG" value={dna.slag} cohort={cohort.slag} color="#D1F843" />
            <DnaAxisRow label="SPILL" value={dna.spill} cohort={cohort.spill} color="#B8852A" />
            <DnaAxisRow label="TURN" value={dna.turn} cohort={cohort.turn} color="#5E5C57" />
            <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-[#D1F843]" />
                Spilleren
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-[#9C9990]" />
                Cohort-snitt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AKTIVE MÅL */}
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
              Aktive mål
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
              Pågående målbilder
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
            {player.goals.length}
          </span>
        </div>
        {player.goals.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#E5E3DD] bg-[#FAFAF7] p-4 text-sm text-[#5E5C57]">
            Ingen aktive mål.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="rounded-xl border border-[#E5E3DD] bg-[#FAFAF7] p-4"
                >
                  <span className="inline-flex rounded-full bg-[#005840]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#005840]">
                    {typeLabel}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-[#0A1F17]">
                    {g.title}
                  </h3>
                  <ProgressRing pct={50} />
                  {g.targetDate && (
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
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
      <section className="rounded-2xl border border-[#E5E3DD] bg-card p-5 sm:p-6">
        <div className="mb-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Skader / permisjoner
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-[#0A1F17]">
            Historikk
          </h2>
        </div>
        {player.leaves.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#E5E3DD] bg-[#FAFAF7] p-4 text-sm text-[#5E5C57]">
            Ingen registrerte hendelser.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E3DD] font-mono text-[10px] uppercase tracking-[0.08em] text-[#5E5C57]">
                  <th className="pb-2 pr-4 font-semibold">Årsak</th>
                  <th className="pb-2 pr-4 font-semibold">Fra</th>
                  <th className="pb-2 pr-4 font-semibold">Til</th>
                  <th className="pb-2 pr-4 font-semibold">Beskrivelse</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {player.leaves.map((l) => (
                  <tr key={l.id} className="border-b border-[#E5E3DD] last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-[#0A1F17]">{l.reason}</td>
                    <td className="py-3 pr-4 font-mono text-xs tabular-nums text-[#5E5C57]">
                      {NB_DATE.format(l.startAt)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs tabular-nums text-[#5E5C57]">
                      {l.endAt ? NB_DATE.format(l.endAt) : "pågår"}
                    </td>
                    <td className="py-3 pr-4 text-[#0A1F17]">{l.description ?? "—"}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-full bg-[#F1EEE5] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5E5C57]">
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
      <section className="relative overflow-hidden rounded-2xl border border-[#E5E3DD] bg-[#F1EEE5] p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ background: "#D1F843" }}
        />
        <div className="pl-3">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
            Coachens vurdering
          </div>
          <blockquote
            className="mt-4 text-xl leading-relaxed text-[#0A1F17] sm:text-2xl"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
            }}
          >
            &laquo;{player.name.split(" ")[0]} har stor teknisk progresjon, men
            trenger fortsatt mental robusthet i turnerings-press. Fokus til vinter:
            pre-shot rutine 7 sek + putting under 2,5 m.&raquo;
          </blockquote>
          <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#5E5C57]">
            Anders Kvam · oppdatert 21. mai
          </div>
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
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[#5E5C57]">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-[#0A1F17] ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function DnaAxisRow({
  label,
  value,
  cohort,
  color,
}: {
  label: string;
  value: number;
  cohort: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.08em]">
        <span className="font-semibold text-[#0A1F17]">{label}</span>
        <span className="tabular-nums text-[#5E5C57]">
          {value} <span className="text-[#9C9990]">/ cohort {cohort}</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-[#E5E3DD]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 h-full w-0.5 bg-[#9C9990]"
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
          stroke="#E5E3DD"
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
            stroke="#E5E3DD"
            strokeWidth={0.5}
          />
        );
      })}
      {/* Cohort (dotted gray) */}
      <path
        d={path(axes.map((a) => a.c))}
        fill="none"
        stroke="#9C9990"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* Player (lime fill) */}
      <path
        d={path(axes.map((a) => a.v))}
        fill="#D1F843"
        fillOpacity={0.35}
        stroke="#005840"
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
            fill="#5E5C57"
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
    <div className="mt-3 flex items-center gap-3">
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E5E3DD"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#005840"
          strokeWidth={stroke}
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="font-mono text-sm font-semibold tabular-nums text-[#005840]">
        {pct} %
      </div>
    </div>
  );
}
