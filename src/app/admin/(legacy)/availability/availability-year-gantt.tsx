/**
 * År-Gantt for tilgjengelighet — viser hvert ukentlige tidsvindu som en bjelke
 * over de 12 månedene i valgt år, plassert etter periode (validFrom–validTo).
 * Vinduer uten periode spenner hele året. Farge per anlegg.
 *
 * Ren presentasjon (server-komponent): perioder bor i CRUD-skjemaet (SlotForm).
 */

const MND_KORT = [
  "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D",
];

// Token-farger som syklus per anlegg (designsystem, ingen hardkodet hex).
const TONER = [
  { bar: "bg-success/70", dot: "bg-success" },
  { bar: "bg-info/70", dot: "bg-info" },
  { bar: "bg-warning/70", dot: "bg-warning" },
  { bar: "bg-accent/80", dot: "bg-accent" },
] as const;

export type YearWindow = {
  id: string;
  locationName: string | null;
  label: string; // "Fredag · 10:00–18:00" (+ ev. repetisjon)
  validFrom: Date | null;
  validTo: Date | null;
};

/** Andel inn i året [0,1] for en dato; null → kantverdi. */
function aarsAndel(d: Date | null, kant: 0 | 1, year: number): number {
  if (!d) return kant;
  if (d.getFullYear() < year) return 0;
  if (d.getFullYear() > year) return 1;
  const start = new Date(year, 0, 1).getTime();
  const slutt = new Date(year + 1, 0, 1).getTime();
  return Math.min(1, Math.max(0, (d.getTime() - start) / (slutt - start)));
}

export function AvailabilityYearGantt({
  year,
  windows,
}: {
  year: number;
  windows: YearWindow[];
}) {
  // Gruppér per anlegg (null → «Alle steder») i stabil rekkefølge.
  const grupper = new Map<string, YearWindow[]>();
  for (const w of windows) {
    const navn = w.locationName ?? "Alle steder";
    if (!grupper.has(navn)) grupper.set(navn, []);
    grupper.get(navn)!.push(w);
  }
  const anleggsNavn = Array.from(grupper.keys());
  const toneFor = (navn: string) => TONER[anleggsNavn.indexOf(navn) % TONER.length];

  return (
    <div className="rounded-xl border border-border bg-card p-[18px]">
      {/* Måned-header */}
      <div className="mb-3 grid grid-cols-[160px_1fr] items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {year}
        </span>
        <div className="grid grid-cols-12">
          {MND_KORT.map((mnd, i) => (
            <span
              key={i}
              className="text-center font-mono text-[9px] font-extrabold tracking-[0.06em] text-muted-foreground"
            >
              {mnd}
            </span>
          ))}
        </div>
      </div>

      {windows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen ukentlige tidsvinduer satt. Legg til vinduer med periode for å se
          dem fordelt over året.
        </p>
      ) : (
        <div className="space-y-4">
          {anleggsNavn.map((navn) => (
            <div key={navn}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className={`h-[7px] w-[7px] rounded-full ${toneFor(navn).dot}`} />
                <span className="font-display text-sm font-bold tracking-[-0.01em] text-foreground">
                  {navn}
                </span>
              </div>
              <div className="space-y-1.5">
                {grupper.get(navn)!.map((w) => {
                  const fra = aarsAndel(w.validFrom, 0, year);
                  const til = aarsAndel(w.validTo, 1, year);
                  const bredde = Math.max(0.02, til - fra);
                  return (
                    <div
                      key={w.id}
                      className="grid grid-cols-[160px_1fr] items-center gap-3"
                    >
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {w.label}
                      </span>
                      <div className="relative h-5 rounded-[6px] bg-background">
                        {/* Måned-rutenett */}
                        <div className="absolute inset-0 grid grid-cols-12">
                          {MND_KORT.map((_, i) => (
                            <span
                              key={i}
                              className="border-l border-border/40 first:border-l-0"
                            />
                          ))}
                        </div>
                        <div
                          className={`absolute inset-y-[3px] rounded-[4px] ${toneFor(navn).bar}`}
                          style={{
                            left: `${fra * 100}%`,
                            width: `${bredde * 100}%`,
                          }}
                          title={w.label}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 font-mono text-[9px] tracking-[0.06em] text-muted-foreground">
        Bjelker uten satt periode spenner hele året. Sett «Begrens til periode» i
        et tidsvindu for å avgrense det til en sesong.
      </div>
    </div>
  );
}
