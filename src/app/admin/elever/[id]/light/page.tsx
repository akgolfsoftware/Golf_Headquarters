/**
 * Spiller-profil light-view (M18).
 * Mobile-vennlig kompakt visning av en spiller — hero-kort + mini-stats.
 * Optimert for små skjermer (single column, store fonts).
 */
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Flag, TrendingUp } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(1).replace(".", ",")}`;
}

const NB_FULL = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function SpillerLightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      rounds: {
        where: { playedAt: { gte: thirtyDaysAgo } },
        orderBy: { playedAt: "desc" },
        include: { course: true },
      },
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            where: {
              status: "COMPLETED",
              scheduledAt: { gte: startOfMonth },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!player || player.role !== "PLAYER") notFound();

  const initial = player.name.trim().charAt(0).toUpperCase() || "?";
  const sg = aggregateSg(player.rounds);
  const sisteRunde = player.rounds[0] ?? null;
  const okterDenneMaaneden = player.trainingPlans.reduce(
    (sum, p) => sum + p.sessions.length,
    0
  );

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Elever · Light-view"
        titleLead="Spiller"
        titleItalic="snapshot"
      />

      {/* Hero-kort */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          {player.avatarUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-secondary">
              <Image
                src={player.avatarUrl}
                alt={player.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="grid h-24 w-24 place-items-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground"
            >
              {initial}
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
              {player.name}
            </h2>
            {player.homeClub && (
              <p className="mt-1 text-sm text-muted-foreground">
                {player.homeClub}
              </p>
            )}
          </div>
          <div className="rounded-full bg-accent px-4 py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              HCP
            </span>
            <span className="ml-2 font-mono text-base font-semibold text-accent-foreground">
              {formatHcp(player.hcp)}
            </span>
          </div>
        </div>
      </div>

      {/* Mini-stats */}
      <div className="space-y-4">
        <MiniStat
          icon={<Flag className="h-5 w-5" strokeWidth={1.5} />}
          label="Siste runde"
          verdi={sisteRunde ? String(sisteRunde.score) : "—"}
          sub={
            sisteRunde
              ? `${sisteRunde.course?.name ?? "Ukjent bane"} · ${NB_FULL.format(sisteRunde.playedAt)}`
              : "Ingen runder siste 30 dager"
          }
        />
        <MiniStat
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
          label="SG total · siste 30 dager"
          verdi={formatSg(sg.total)}
          sub={
            sg.rundeAntall > 0
              ? `Snitt over ${sg.rundeAntall} runde${sg.rundeAntall === 1 ? "" : "r"}`
              : "Ingen SG-data registrert"
          }
        />
        <MiniStat
          icon={<Calendar className="h-5 w-5" strokeWidth={1.5} />}
          label="Økter denne måneden"
          verdi={String(okterDenneMaaneden)}
          sub="Fullførte treningsøkter"
        />
      </div>

      {/* Full profil-knapp */}
      <Link
        href={`/admin/elever/${player.id}`}
        className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        Full profil
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  verdi,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  verdi: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-secondary text-primary"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 font-mono text-2xl font-medium leading-none tracking-tight text-foreground">
            {verdi}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
    </div>
  );
}
