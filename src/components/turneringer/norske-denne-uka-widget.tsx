/**
 * Widget som viser norske golfere som spiller denne uka.
 * Brukes øverst på /turneringer + på akgolf.no forside.
 */

import Link from "next/link";
import { Flag, ArrowRight } from "lucide-react";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

type Entry = {
  id: string;
  status: string;
  position: number | null;
  scoreToPar: number | null;
  player: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    photoUrl: string | null;
  };
  tournament: {
    id: string;
    name: string;
    slug: string | null;
    startDate: Date;
    tour: string | null;
    status: string | null;
    location: string | null;
  };
};

export function NorskeDenneUkaWidget({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return null;
  }

  // Grupper per turnering
  const perTurnering = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = e.tournament.id;
    const list = perTurnering.get(key) ?? [];
    list.push(e);
    perTurnering.set(key, list);
  }

  return (
    <section className="border-b border-border bg-accent/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <Flag className="mr-2 inline-block h-5 w-5 text-primary" strokeWidth={2} />
            Nordmenn denne uka
          </h2>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            {entries.length}{" "}
            {entries.length === 1 ? "spiller" : "spillere"} i{" "}
            {perTurnering.size}{" "}
            {perTurnering.size === 1 ? "turnering" : "turneringer"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {Array.from(perTurnering.entries()).map(([turId, ents]) => {
            const tur = ents[0].tournament;
            return (
              <Link
                key={turId}
                href={tur.slug ? `/turneringer/${tur.slug}` : "/turneringer"}
                className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                    {formaterTour(tur.tour)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {NB_DATE.format(tur.startDate)}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-semibold tracking-tight">
                  {tur.name}
                </h3>
                {tur.location && (
                  <p className="text-[11px] text-muted-foreground">
                    {tur.location}
                  </p>
                )}
                <ul className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
                  {ents.slice(0, 4).map((e) => (
                    <li
                      key={e.id}
                      className="flex items-baseline justify-between gap-2 text-[13px]"
                    >
                      <span className="font-medium text-foreground">
                        {e.player.name}
                      </span>
                      {tur.status === "IN_PROGRESS" && e.position && (
                        <span className="inline-flex items-baseline gap-1.5 font-mono tabular-nums">
                          <span className="text-[11px] text-muted-foreground">
                            T{e.position}
                          </span>
                          {e.scoreToPar !== null && (
                            <span
                              className={`font-semibold ${
                                e.scoreToPar < 0
                                  ? "text-primary"
                                  : e.scoreToPar > 0
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {e.scoreToPar > 0 ? `+${e.scoreToPar}` : e.scoreToPar}
                            </span>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                  {ents.length > 4 && (
                    <li className="text-[11px] text-muted-foreground">
                      + {ents.length - 4} flere
                    </li>
                  )}
                </ul>
                <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary group-hover:gap-2">
                  Se turnering
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "opp": return "PGA Tour · Opposite Field";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry Tour";
    case "alt": return "Alt-tour";
    case "champ": return "Champions Tour";
    case "lpga": return "LPGA";
    case "let": return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    default: return "Turnering";
  }
}
