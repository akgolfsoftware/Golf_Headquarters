/**
 * PlayerHQ · AI foreslår turneringer (mobile-first, 430px)
 *
 * Forslag bygget på ekte data: spillerens kommende turneringspåmeldinger
 * (TournamentEntry) + katalogen av kommende turneringer (Tournament). Match
 * og status reflekterer faktisk påmeldingsstatus og tier — ingen oppdiktede
 * sannsynligheter. Tom katalog → tomstate.
 */

import Link from "next/link";
import { ArrowRight, CalendarPlus, MapPin, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayerHero } from "@/components/portal/player-hero";

export type TournamentStatusTone = "enrolled" | "recommended" | "stretch";

export type TournamentSuggestion = {
  id: string;
  href: string;
  day: string;
  month: string;
  badge: string;
  statusLabel: string;
  statusTone: TournamentStatusTone;
  name: string;
  venue: string | null;
  meta: string[];
  why: string;
};

export type ForeslaTurneringScreenProps = {
  playerFirstName: string;
  hcpLabel: string;
  catalogCount: number;
  suggestions: TournamentSuggestion[];
};

const STATUS_TONE: Record<TournamentStatusTone, string> = {
  enrolled: "text-success",
  recommended: "text-primary",
  stretch: "text-warning",
};

function SuggestionCard({ t }: { t: TournamentSuggestion }) {
  return (
    <Link
      href={t.href}
      className="block rounded-xl border border-border bg-card p-3.5 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(10,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start gap-3">
        {/* dato-blokk */}
        <div className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-secondary py-1.5">
          <span className="font-mono text-[17px] font-bold leading-none tabular-nums text-foreground">
            {t.day}
          </span>
          <span className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {t.month}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              {t.badge}
            </span>
            <span
              className={cn(
                "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                STATUS_TONE[t.statusTone],
              )}
            >
              {t.statusLabel}
            </span>
          </div>
          <h3 className="mt-1 text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {t.name}
          </h3>
          {(t.venue || t.meta.length > 0) && (
            <p className="mt-1 inline-flex flex-wrap items-center gap-x-1.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
              {t.venue && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" strokeWidth={1.75} aria-hidden />
                  {t.venue}
                </span>
              )}
              {t.meta.map((m, i) => (
                <span key={i}>
                  <span className="px-0.5">·</span>
                  {m}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2.5 rounded-lg bg-secondary/50 px-3 py-2.5">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
          Hvorfor denne
        </span>
        <p className="mt-1 text-[12px] leading-snug tracking-[-0.005em] text-foreground">
          {t.why}
        </p>
      </div>
    </Link>
  );
}

export function ForeslaTurneringScreen({
  playerFirstName,
  hcpLabel,
  catalogCount,
  suggestions,
}: ForeslaTurneringScreenProps) {
  return (
    <div className="mx-auto max-w-[430px] space-y-5 px-4 pb-20 md:pb-8">
      <PlayerHero
        eyebrow="PlayerHQ · AI · Turnerings-anbefaling"
        titleLead="Turneringer for"
        titleItalic={playerFirstName}
        sub="Vurdert mot handicapet ditt og turneringene du allerede er påmeldt."
      />

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="font-mono text-[10px] leading-snug tracking-[0.02em] text-muted-foreground">
          {catalogCount > 0 ? (
            <>
              Vurdert mot <span className="font-bold text-foreground">{catalogCount} kommende turneringer</span>{" "}
              · HCP <span className="font-bold text-foreground">{hcpLabel}</span>
            </>
          ) : (
            "Ingen kommende turneringer i katalogen ennå."
          )}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center"
        >
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Trophy size={22} strokeWidth={1.5} aria-hidden />
          </span>
          <h3 className="font-display text-base font-semibold tracking-tight">
            <em className="font-normal italic text-primary">Ingen forslag</em> ennå
          </h3>
          <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
            Når det finnes kommende turneringer som passer nivået ditt, dukker de opp her.
            Du kan også bla i hele kalenderen selv.
          </p>
          <Link
            href="/portal/tren/turneringer"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Se turneringer
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {suggestions.map((t) => (
              <SuggestionCard key={t.id} t={t} />
            ))}
          </div>
          <Link
            href="/portal/tren/turneringer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary transition-colors hover:bg-secondary"
          >
            Se alle turneringene mine
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}
