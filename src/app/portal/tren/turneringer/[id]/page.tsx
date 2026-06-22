/**
 * PlayerHQ · Trening · Turnering — Detalj (/portal/tren/turneringer/[id])
 *
 * Hybrid design: forest-green gradient hero + terminal data cards.
 * Bygget fra hybrid design-source (PlayerHQ Turneringsdetalj (hybrid).dc.html).
 *
 * Server component. Auth-guard via requirePortalUser (PLAYER/COACH/ADMIN).
 * Not-found-branch beholdt med EmptyState.
 */

import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  loadTurneringDetalj,
  type TurneringDetalj as TurneringDetaljLoad,
} from "@/lib/portal-turnering/turnering-detalj-data";
import { meldDegPa, meldDegAv } from "../actions";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

/** Tone → badge klasser for status-badge i hero */
function statusBadgeClass(tone: string): string {
  switch (tone) {
    case "live":
      return "bg-accent text-accent-foreground";
    case "done":
      return "bg-white/20 text-white";
    case "cancelled":
      return "bg-destructive/80 text-white";
    default:
      // upcoming
      return "bg-white/15 text-white";
  }
}

/** Tone → tekst-farge for entry state badge */
function entryBadgeClass(tone: string): string {
  switch (tone) {
    case "ok":
      return "bg-accent/20 text-accent-foreground";
    case "warn":
      return "bg-warning/20 text-warning";
    case "urgent":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await loadTurneringDetalj(user.id, id);

  // Not-found branch — bevarer opprinnelig EmptyState-mønster
  if (!data) {
    return (
      <div className="space-y-6 pb-20">
        <Link
          href="/portal/tren/turneringer"
          className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Turneringer
        </Link>
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen"
          titleTrail="turnering tilgjengelig"
          sub="Turneringen ble ikke funnet eller du har ikke tilgang."
          cta={
            <Link
              href="/portal/tren/turneringer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground hover:opacity-90"
            >
              Se alle turneringer
            </Link>
          }
        />
      </div>
    );
  }

  const pameldt = data.entry?.state.active === true;

  async function pameldAction() {
    "use server";
    await meldDegPa(id);
  }

  async function avmeldAction() {
    "use server";
    const me = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
    const entry = await prisma.tournamentEntry.findFirst({
      where: { userId: me.id, tournamentId: id },
      select: { id: true },
    });
    if (entry) await meldDegAv(entry.id);
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Back link */}
      <Link
        href="/portal/tren/turneringer"
        className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Turneringer
      </Link>

      {/* Forest gradient hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-forest-deep px-6 py-8">
        {/* Status badge — top right */}
        {data.status && (
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] ${statusBadgeClass(data.status.tone)}`}
          >
            {data.status.label}
          </span>
        )}

        {/* Tour type label */}
        {data.tour && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
            {data.tour}
          </p>
        )}

        {/* Tournament name */}
        <h1 className="font-display mt-2 text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
          {data.name}
        </h1>

        {/* Meta: date + venue */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
            <Calendar size={13} strokeWidth={1.5} />
            {data.dateLong}
          </span>
          {data.venue && (
            <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
              <MapPin size={13} strokeWidth={1.5} />
              {data.venue}
            </span>
          )}
          {data.format && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white/80">
              {data.format}
            </span>
          )}
        </div>
      </div>

      {/* Coach note card */}
      <CoachNoteCard notes={data.entry?.notes ?? null} />

      {/* Entry / goal card */}
      <EntryCard data={data} />

      {/* History */}
      {data.history.length > 0 && <HistoryCard data={data} />}

      {/* CTA */}
      <div className="flex gap-3">
        {pameldt ? (
          <form action={avmeldAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground hover:border-destructive/60 hover:text-destructive"
            >
              <XCircle size={14} strokeWidth={1.5} />
              Meld av
            </button>
          </form>
        ) : (
          <form action={pameldAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-accent-foreground hover:opacity-90"
            >
              <CheckCircle size={14} strokeWidth={1.5} />
              Meld på
            </button>
          </form>
        )}
        {data.officialUrl && (
          <a
            href={data.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
          >
            Offisiell side
            <ChevronLeft size={12} strokeWidth={1.5} className="rotate-180" />
          </a>
        )}
      </div>
    </div>
  );
}

/** Coach note card with lime left border */
function CoachNoteCard({ notes }: { notes: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5" style={{ borderLeftWidth: 3, borderLeftColor: "hsl(var(--accent))" }}>
      <div className="flex items-start gap-3">
        {/* Coach avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
          AK
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Coach-notat
          </p>
          <p className="text-xs text-muted-foreground">Anders Kristiansen</p>
          <p className="mt-2 text-sm text-foreground">
            {notes ?? "Ingen coach-notat ennå."}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Entry/goal card */
function EntryCard({ data }: { data: TurneringDetaljLoad }) {
  const entry = data.entry;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Ditt mål
        </p>
        <Target size={14} strokeWidth={1.5} className="text-muted-foreground" />
      </div>

      {entry ? (
        <div className="mt-3 space-y-3">
          {/* Entry state */}
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] ${entryBadgeClass(entry.state.tone)}`}
            >
              {entry.state.label}
            </span>
            {entry.category && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {entry.category}
              </span>
            )}
          </div>

          {/* Goal progress bar placeholder */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">
                Fremgang
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">—</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* Registered date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={11} strokeWidth={1.5} />
            Påmeldt {entry.registeredLong}
          </div>

          {/* Player notes if any */}
          {entry.notes && (
            <p className="border-t border-border pt-3 text-sm text-foreground">
              {entry.notes}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Du er ikke påmeldt denne turneringen.
        </p>
      )}
    </div>
  );
}

/** History results card */
function HistoryCard({ data }: { data: TurneringDetaljLoad }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        Resultater · historikk
      </p>
      <div className="mt-3 divide-y divide-border">
        {data.history.map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-4 py-2.5">
            <span className="font-mono text-xs text-muted-foreground">
              {h.year}
            </span>
            {h.position != null ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                  #{h.position}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  plass
                </span>
              </div>
            ) : h.score != null ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                  {h.score}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  slag
                </span>
              </div>
            ) : (
              <span className="font-mono text-sm text-muted-foreground">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
