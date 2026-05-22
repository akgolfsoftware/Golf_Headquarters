/**
 * Sammenlign-vei to spillere (M18).
 * Coach/admin velger en motpart fra dropdown — query-param ?vs= setter den.
 * Viser KPI-strip side-om-side: HCP, antall runder, SG total, beste runde,
 * achievements-antall.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitCompare, Trophy, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

type SearchParams = { vs?: string };

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(1).replace(".", ",")}`;
}

async function hentSpillerMedAggregat(id: string) {
  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { playedAt: "desc" },
        include: { course: true },
        take: 50,
      },
      _count: {
        select: {
          achievements: true,
          rounds: true,
        },
      },
    },
  });
  if (!player || player.role !== "PLAYER") return null;

  const sg = aggregateSg(player.rounds);
  const besteRunde = player.rounds.reduce<typeof player.rounds[number] | null>(
    (best, r) => {
      if (best == null) return r;
      return r.score < best.score ? r : best;
    },
    null
  );

  return { player, sg, besteRunde };
}

export default async function SammenligningPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const { vs } = await searchParams;

  const primary = await hentSpillerMedAggregat(id);
  if (!primary) notFound();

  const secondary = vs ? await hentSpillerMedAggregat(vs) : null;

  // Spillerliste for dropdown — alle PLAYER bortsett fra primær
  const alleSpillere = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      id: { not: id },
    },
    select: { id: true, name: true, hcp: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Elever · Sammenligning"
        titleLead="Sammenlign"
        titleItalic="to spillere"
        sub={`Sammenlikner ${primary.player.name} mot en annen spiller — HCP, runder, SG total og prestasjoner.`}
        actions={
          <Link
            href={`/admin/elever/${id}`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake til profil
          </Link>
        }
      />

      {/* Spiller-velger */}
      <form
        method="GET"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sammenlign med
          </span>
          <select
            name="vs"
            defaultValue={vs ?? ""}
            className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="">— Velg spiller —</option>
            {alleSpillere.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.hcp != null ? ` (HCP ${formatHcp(s.hcp)})` : ""}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          Sammenlign
        </button>
      </form>

      {!secondary ? (
        <EmptyState
          icon={GitCompare}
          titleItalic="Velg"
          titleTrail="en motpart"
          sub="Bruk dropdown over for å velge spilleren du vil sammenlikne med."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SpillerKolonne
            navn={primary.player.name}
            hcp={primary.player.hcp}
            antallRunder={primary.player._count.rounds}
            sgTotal={primary.sg.total}
            sgRunder={primary.sg.rundeAntall}
            besteScore={primary.besteRunde?.score ?? null}
            besteBane={primary.besteRunde?.course?.name ?? null}
            achievements={primary.player._count.achievements}
          />
          <SpillerKolonne
            navn={secondary.player.name}
            hcp={secondary.player.hcp}
            antallRunder={secondary.player._count.rounds}
            sgTotal={secondary.sg.total}
            sgRunder={secondary.sg.rundeAntall}
            besteScore={secondary.besteRunde?.score ?? null}
            besteBane={secondary.besteRunde?.course?.name ?? null}
            achievements={secondary.player._count.achievements}
          />
        </div>
      )}
    </div>
  );
}

function SpillerKolonne({
  navn,
  hcp,
  antallRunder,
  sgTotal,
  sgRunder,
  besteScore,
  besteBane,
  achievements,
}: {
  navn: string;
  hcp: number | null;
  antallRunder: number;
  sgTotal: number | null;
  sgRunder: number;
  besteScore: number | null;
  besteBane: string | null;
  achievements: number;
}) {
  const initial = navn.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
        >
          {initial}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight">
            {navn}
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Spillerprofil
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatRute label="HCP" verdi={formatHcp(hcp)} />
        <StatRute label="Runder totalt" verdi={String(antallRunder)} />
        <StatRute
          label="SG total (snitt)"
          verdi={formatSg(sgTotal)}
          sub={
            sgRunder > 0
              ? `Basert på ${sgRunder} runde${sgRunder === 1 ? "" : "r"}`
              : "Ingen SG-data"
          }
        />
        <StatRute
          label="Beste runde"
          verdi={besteScore != null ? String(besteScore) : "—"}
          sub={besteBane ?? "Ingen data"}
        />
        <StatRute
          label="Prestasjoner"
          verdi={String(achievements)}
          icon={<Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />}
        />
        <StatRute
          label="Aktiv"
          verdi={antallRunder > 0 ? "Ja" : "—"}
          icon={<Users className="h-3.5 w-3.5" strokeWidth={1.5} />}
        />
      </div>
    </div>
  );
}

function StatRute({
  label,
  verdi,
  sub,
  icon,
}: {
  label: string;
  verdi: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-medium leading-none tracking-tight text-foreground">
        {verdi}
      </div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
