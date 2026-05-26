/**
 * PlayerHQ · Trening · Turnering — Detalj
 *
 * Detaljvisning for én enkelt turnering. Henter ekte data fra Tournament-
 * modellen og viser spillerens egen TournamentEntry hvis den finnes.
 * Tomt resultat = EmptyState.
 *
 * Den tidligere klient-versjonen (turnering-client.tsx) brukte hardkodet
 * Sørlandsåpent-mock. Den er fjernet fra renderingen — filen blir liggende
 * inntil videre, men brukes ikke.
 */

import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  Flag,
  MapPin,
  Trophy,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(start: Date, end: Date | null | undefined): string {
  if (!end || end.toDateString() === start.toDateString()) {
    return formatDate(start);
  }
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function statusBadge(status: string | null | undefined): {
  label: string;
  className: string;
} {
  switch (status) {
    case "UPCOMING":
      return {
        label: "Kommende",
        className: "bg-primary/10 text-primary",
      };
    case "IN_PROGRESS":
      return {
        label: "Pågår",
        className: "bg-accent/30 text-accent-foreground",
      };
    case "COMPLETED":
      return {
        label: "Fullført",
        className: "bg-muted text-muted-foreground",
      };
    case "CANCELLED":
      return {
        label: "Avlyst",
        className: "bg-destructive/10 text-destructive",
      };
    default:
      return {
        label: status ?? "Ukjent",
        className: "bg-secondary text-muted-foreground",
      };
  }
}

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser();

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      course: { select: { name: true } },
      entries: {
        where: { userId: user.id },
        take: 1,
        select: {
          id: true,
          entryStatus: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!tournament) {
    return (
      <div className="space-y-6 pb-20">
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Tilbake til turneringer
        </Link>
        <PageHeader
          eyebrow="PlayerHQ · Tren · Turnering"
          titleLead="Turnering"
          titleItalic="ikke funnet"
          sub="Vi fant ingen turnering med denne ID-en."
        />
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen"
          titleTrail="turnering tilgjengelig"
          sub="Turneringen ble ikke funnet eller du har ikke tilgang."
          cta={
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Se alle turneringer
            </Link>
          }
        />
      </div>
    );
  }

  const badge = statusBadge(tournament.status);
  const entry = tournament.entries[0] ?? null;
  const banenavn =
    tournament.course?.name ?? tournament.location ?? "Bane ikke angitt";

  return (
    <div className="space-y-8 pb-20">
      <Link
        href="/portal/tren/turneringer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til turneringer
      </Link>

      {/* Hero */}
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Tren · Turnering
        </span>
        <h1 className="mt-2 font-display text-[28px] sm:text-[36px] italic font-medium leading-[1.05] tracking-tight">
          <em className="font-normal italic">{tournament.name}</em>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${badge.className}`}
          >
            {badge.label}
          </span>
          {tournament.tour && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {tournament.tour}
            </span>
          )}
          {tournament.format && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {tournament.format}
            </span>
          )}
        </div>
      </header>

      {/* Fakta-strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Calendar size={12} strokeWidth={1.5} />
            Dato
          </div>
          <div className="mt-2 text-[15px] font-semibold tabular-nums">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <MapPin size={12} strokeWidth={1.5} />
            Bane
          </div>
          <div className="mt-2 text-[15px] font-semibold">{banenavn}</div>
          {tournament.location && (
            <div className="mt-1 text-[13px] text-muted-foreground">
              {tournament.location}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Flag size={12} strokeWidth={1.5} />
            Vinner
          </div>
          <div className="mt-2 text-[15px] font-semibold">
            {tournament.winnerName ?? "Ikke avgjort"}
          </div>
        </div>
      </section>

      {/* Din påmelding */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold tracking-tight">
          Din påmelding
        </h2>
        {entry ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1 font-semibold">{entry.entryStatus}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Påmeldt
              </dt>
              <dd className="mt-1 font-mono text-sm tabular-nums">
                {formatDate(entry.createdAt)}
              </dd>
            </div>
            {entry.notes && (
              <div className="sm:col-span-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Notater
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {entry.notes}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Du er ikke påmeldt denne turneringen.
          </p>
        )}
      </section>

      {/* Notater */}
      {tournament.notes && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 font-display text-base font-semibold tracking-tight">
            Notater
          </h2>
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {tournament.notes}
          </p>
        </section>
      )}

      {/* Offisiell lenke */}
      {tournament.officialUrl && (
        <a
          href={tournament.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Offisiell turnerings-side
        </a>
      )}
    </div>
  );
}
