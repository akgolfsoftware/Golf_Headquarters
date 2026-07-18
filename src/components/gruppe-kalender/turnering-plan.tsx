import Link from "next/link";
import { Trophy } from "lucide-react";

import type { Turnering } from "@/lib/gruppe-kalender/types";

// Matcher TONE_KLASSE i gruppe-kalender-wrapper — samme serie-fargespråk.
const TONE_KLASSE: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  moss: "bg-emerald-600 text-white",
  gold: "bg-amber-500 text-black",
  muted: "bg-muted text-muted-foreground",
};

const MND_FMT = new Intl.DateTimeFormat("nb-NO", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

const DAG_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Oslo",
});

// Rent dag-tall (uten punktum) i Oslo-tid, for start-datoen i en range.
function dagIOslo(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { day: "numeric", timeZone: "Europe/Oslo" }).format(d);
}

// YYYY-MM-DD i Oslo-tid, uavhengig av server-runtime.
function dagNokkel(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(iso));
}

function mndNokkel(iso: string): string {
  return dagNokkel(iso).slice(0, 7); // YYYY-MM
}

function datoLabel(t: Turnering): string {
  const start = new Date(t.startDate);
  // Endagers (ingen endDate eller samme dag): "26. juli"
  if (!t.endDate || dagNokkel(t.startDate) === dagNokkel(t.endDate)) {
    return DAG_FMT.format(start);
  }
  const end = new Date(t.endDate);
  if (mndNokkel(t.startDate) === mndNokkel(t.endDate)) {
    // Samme måned: "12.–14. aug."
    return `${dagIOslo(start)}.–${DAG_FMT.format(end)}`;
  }
  return `${DAG_FMT.format(start)} – ${DAG_FMT.format(end)}`;
}

function storForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Turneringsplan for årsplanen: fremtidige turneringer fra WANG-seriene,
 * gruppert per måned, med serie-badge og lenke til turneringsdetaljen.
 * Erstatter den tidligere plassholderen (TurneringStub).
 */
export function TurneringPlan({ turneringer }: { turneringer: Turnering[] }) {
  if (turneringer.length === 0) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-4">
        <Trophy className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold text-foreground">Turneringsplan</p>
          <p className="text-[13px] text-muted-foreground">
            Ingen kommende turneringer i seriene ennå.
          </p>
        </div>
      </section>
    );
  }

  // Gruppér per måned, behold kronologisk rekkefølge.
  const grupper: { nokkel: string; label: string; rader: Turnering[] }[] = [];
  for (const t of turneringer) {
    const nokkel = mndNokkel(t.startDate);
    let gruppe = grupper.find((g) => g.nokkel === nokkel);
    if (!gruppe) {
      gruppe = { nokkel, label: storForbokstav(MND_FMT.format(new Date(t.startDate))), rader: [] };
      grupper.push(gruppe);
    }
    gruppe.rader.push(t);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <h2 className="font-display text-lg font-bold tracking-[-0.01em] text-foreground">
          Turneringsplan
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {turneringer.length} kommende
        </span>
      </div>

      <div className="space-y-5">
        {grupper.map((g) => (
          <div key={g.nokkel}>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {g.label}
            </p>
            <ul className="space-y-1">
              {g.rader.map((t) => {
                const innhold = (
                  <>
                    <span className="w-24 shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground">
                      {datoLabel(t)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {t.navn}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        TONE_KLASSE[t.tone] ?? TONE_KLASSE.muted
                      }`}
                    >
                      {t.serie}
                    </span>
                  </>
                );
                return (
                  <li key={t.id}>
                    {t.slug ? (
                      <Link
                        href={`/turneringer/${t.slug}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                      >
                        {innhold}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-2 py-1.5">{innhold}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
