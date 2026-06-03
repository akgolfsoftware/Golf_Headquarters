"use client";

/**
 * AgencyOS Turneringer — coachens konkurranseplan (kontrolltårn).
 * Presentasjonell og props-drevet. Bygget FRA design-manifest:
 *   docs/skjerm-manifest-agencyos.md §3 «/admin/tournaments» (ASCII-wireframe + spec).
 *
 * Manifest-krav som dekkes:
 *   - Turneringskalender med Uke/Måned/År-visning (segment-tabs øverst).
 *   - Auto-populert: «DENNE HELGEN»-seksjon viser hvilken turnering som spilles
 *     + hvilke spillere som stiller (deltakerliste med N spillere).
 *   - Per turnering: «Send fellesmelding til alle N deltakere» (åpner komponer-modal).
 *   - «+ Ny turnering» (lenke til /admin/tournaments/ny).
 *
 * DS-konsistens: kun globals.css-tokens (bg-card, text-foreground, border-border,
 *   bg-primary, accent osv.) + Lucide-ikoner. Ingen hardkodet hex, ingen emoji.
 *   Komponer-modal gjenbruker @/components/ui Dialog + Textarea.
 *
 * INGEN Prisma/DB/auth — kun presentasjon.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ── Typer ────────────────────────────────────────────────────────
export type TournamentParticipant = {
  id: string;
  initials: string;
  name: string;
};

export type Tournament = {
  id: string;
  name: string;
  /** Bane / spillested, f.eks. «Bortelid GK». */
  venue: string;
  /** Dato-tekst, f.eks. «14 – 16. juni». */
  dates: string;
  /** Sorterbar ISO-dato for start (brukes til gruppering/rekkefølge). */
  startISO: string;
  /** Kort kategori-label, f.eks. «SRIXON TOUR», «JUNIORTOUR». */
  category?: string;
  /** Coachens spillere som stiller i denne turneringen. */
  participants: TournamentParticipant[];
  /** Lenke til turnering-detalj (deltakere). */
  href: string;
};

export type TurneringerData = {
  /** Turneringen(e) som spilles inneværende helg — auto-populert øverst. */
  thisWeekend: Tournament[];
  /** Resten av kommende turneringer, sortert stigende på startISO. */
  upcoming: Tournament[];
  /** Lenke til «Ny turnering»-flyt. */
  newHref?: string;
};

type ViewKey = "uke" | "maaned" | "aar";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "uke", label: "Uke" },
  { key: "maaned", label: "Måned" },
  { key: "aar", label: "År" },
];

// Norske måneds-navn for År-gruppering (fra ISO-dato).
const MONTHS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function monthLabel(iso: string): string {
  const m = Number(iso.slice(5, 7)) - 1;
  return MONTHS[m] ?? "";
}

// ── Deltaker-stabel (avatarer + navn) ────────────────────────────
function ParticipantStack({
  participants,
  max = 6,
}: {
  participants: TournamentParticipant[];
  max?: number;
}) {
  const shown = participants.slice(0, max);
  const overflow = participants.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex -space-x-2">
        {shown.map((p) => (
          <span
            key={p.id}
            title={p.name}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary font-display text-[11px] font-bold text-foreground"
            aria-hidden
          >
            {p.initials}
          </span>
        ))}
        {overflow > 0 && (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary font-mono text-[10px] font-bold text-primary-foreground"
            aria-hidden
          >
            +{overflow}
          </span>
        )}
      </div>
      <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
        <span className="font-semibold text-foreground">
          {participants.length}
        </span>{" "}
        spillere:{" "}
        {participants.map((p) => p.name.split(" ")[0]).join(", ")}
      </p>
    </div>
  );
}

// ── Turnering-kort ───────────────────────────────────────────────
function TournamentCard({
  t,
  highlighted = false,
  onFellesmelding,
}: {
  t: Tournament;
  highlighted?: boolean;
  onFellesmelding: (t: Tournament) => void;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-5 transition-colors sm:p-6",
        highlighted
          ? "border-primary/30 ring-1 ring-primary/15"
          : "border-border hover:border-primary/30",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {t.category && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t.category}
            </span>
          )}
          <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.015em] text-foreground sm:text-2xl">
            {t.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              {t.venue}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.75}
                aria-hidden
              />
              {t.dates}
            </span>
          </div>
        </div>

        <Link
          href={t.href}
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-md px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Se turnering
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </div>

      {/* Deltakere (auto-populert) */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <Users className="h-3 w-3" strokeWidth={2} aria-hidden />
          Deltakere fra stallen
        </p>
        {t.participants.length > 0 ? (
          <ParticipantStack participants={t.participants} />
        ) : (
          <p className="text-[13px] text-muted-foreground">
            Ingen påmeldte fra stallen ennå.
          </p>
        )}
      </div>

      {/* Fellesmelding */}
      <div className="mt-5">
        <Button
          type="button"
          variant={highlighted ? "primary" : "secondary"}
          size="sm"
          onClick={() => onFellesmelding(t)}
          disabled={t.participants.length === 0}
          className="w-full sm:w-auto"
        >
          <Megaphone className="h-4 w-4" strokeWidth={2} aria-hidden />
          Send fellesmelding til alle {t.participants.length} deltakere
        </Button>
      </div>
    </article>
  );
}

// ── Seksjon-header ───────────────────────────────────────────────
function SectionLabel({
  icon: Icon,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          tone === "accent" ? "text-primary" : "text-muted-foreground",
        )}
        strokeWidth={2}
      />
      <span className={tone === "accent" ? "text-foreground" : "text-muted-foreground"}>
        {children}
      </span>
    </h2>
  );
}

// ── Hovedkomponent ───────────────────────────────────────────────
export function Turneringer({ data }: { data: TurneringerData }) {
  const [view, setView] = useState<ViewKey>("uke");
  const [composeFor, setComposeFor] = useState<Tournament | null>(null);

  const allUpcoming = data.upcoming;
  const totalCount = data.thisWeekend.length + allUpcoming.length;

  // År-visning: grupper kommende (inkl. helg) etter måned.
  const byMonth = useMemo(() => {
    const all = [...data.thisWeekend, ...allUpcoming].sort((a, b) =>
      a.startISO.localeCompare(b.startISO),
    );
    const groups: { month: string; items: Tournament[] }[] = [];
    for (const t of all) {
      const label = monthLabel(t.startISO);
      const last = groups[groups.length - 1];
      if (last && last.month === label) last.items.push(t);
      else groups.push({ month: label, items: [t] });
    }
    return groups;
  }, [data.thisWeekend, allUpcoming]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Side-header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            Turneringer
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            <Trophy className="h-3 w-3" strokeWidth={2} aria-hidden />
            {totalCount} kommende
          </span>
        </div>

        <Link
          href={data.newHref ?? "/admin/tournaments/ny"}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Ny turnering
        </Link>
      </header>

      {/* Kalender-visning + auto-populert hint */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Kalendervisning"
          className="inline-flex rounded-lg bg-secondary p-1"
        >
          {VIEWS.map((v) => {
            const active = view === v.key;
            return (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(v.key)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
          Auto-populert fra turneringskalenderen
        </p>
      </div>

      {/* DENNE HELGEN — alltid synlig (auto-populert) */}
      <section className="mt-7">
        <SectionLabel icon={Trophy} tone="accent">
          Denne helgen
        </SectionLabel>
        <div className="mt-3 space-y-4">
          {data.thisWeekend.length > 0 ? (
            data.thisWeekend.map((t) => (
              <TournamentCard
                key={t.id}
                t={t}
                highlighted
                onFellesmelding={setComposeFor}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <span
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary"
              >
                <CalendarDays className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-foreground">
                Ingen turnering denne helgen
              </p>
              <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
                Stallen har ingen påmeldte turneringer for inneværende helg.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Kommende — innhold avhenger av valgt visning */}
      <section className="mt-8">
        {view === "aar" ? (
          // ÅR: kompakt, gruppert etter måned (alle turneringer).
          <div className="space-y-7">
            {byMonth.map((g) => (
              <div key={g.month}>
                <SectionLabel icon={CalendarDays}>{g.month}</SectionLabel>
                <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {g.items.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={t.href}
                        className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-5"
                      >
                        <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary py-1.5">
                          <span className="font-display text-base font-bold leading-none text-foreground">
                            {t.startISO.slice(8, 10)}
                          </span>
                          <span className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                            {monthLabel(t.startISO).slice(0, 3)}
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {t.name}
                          </span>
                          <span className="block truncate text-[12px] text-muted-foreground">
                            {t.venue} · {t.dates}
                          </span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
                          <Users className="h-3 w-3" strokeWidth={2} aria-hidden />
                          {t.participants.length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          // UKE / MÅNED: fulle kort. Label skiller de to visningene.
          <>
            <SectionLabel icon={CalendarDays}>
              {view === "uke" ? "Senere i uka og neste uke" : "Senere denne måneden"}
            </SectionLabel>
            <div className="mt-3 space-y-4">
              {allUpcoming.length > 0 ? (
                allUpcoming.map((t) => (
                  <TournamentCard key={t.id} t={t} onFellesmelding={setComposeFor} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    Ingen flere turneringer i denne perioden.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Komponer fellesmelding */}
      <FellesmeldingDialog
        tournament={composeFor}
        onClose={() => setComposeFor(null)}
      />
    </div>
  );
}

// ── Fellesmelding-modal ──────────────────────────────────────────
function FellesmeldingDialog({
  tournament,
  onClose,
}: {
  tournament: Tournament | null;
  onClose: () => void;
}) {
  const open = tournament !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Fellesmelding til deltakere</DialogTitle>
          <DialogDescription>
            {tournament
              ? `${tournament.name} · ${tournament.participants.length} mottakere`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Mottakere */}
          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Mottakere
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tournament?.participants.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pl-1 pr-2.5 text-[12px] text-foreground"
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-card font-display text-[9px] font-bold"
                    aria-hidden
                  >
                    {p.initials}
                  </span>
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          {/* Melding (forhåndsutfylt mal) */}
          <div>
            <label
              htmlFor="fellesmelding-tekst"
              className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
            >
              Melding
            </label>
            <Textarea
              id="fellesmelding-tekst"
              rows={7}
              defaultValue={
                tournament
                  ? `Hei alle sammen!\n\nKlar for ${tournament.name} på ${tournament.venue} (${tournament.dates}).\n\nBaneinfo og siste forberedelser kommer her. Husk plan: spill din egen runde, hold rutinene, og ha det gøy.\n\nLykke til – Anders`
                  : ""
              }
            />
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />
              Sendes som varsel i PlayerHQ og på e-post.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost-light" size="sm" onClick={onClose}>
            Avbryt
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
            Send til {tournament?.participants.length ?? 0}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
