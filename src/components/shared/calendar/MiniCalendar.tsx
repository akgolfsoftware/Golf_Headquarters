"use client";

// MiniCalendar — kompakt 3-måneders navigator. Brukes i venstre sidemeny.
//
// Viser forrige, nåværende og neste måned. Klikk på en dag emitter onValgDato.

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Måneden som er sentrert. */
  basisMaaned: Date;
  valgtDato?: Date | null;
  onValgDato?: (dato: Date) => void;
  onByttMaaned?: (delta: number) => void;
  /** Datoer som skal markeres med prikk (f.eks. økt-dager). */
  markerteDatoer?: Date[];
};

const UKEDAGER = ["m", "t", "o", "t", "f", "l", "s"];
const MAANEDS_NAVN = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

function iSammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function lagDagsmatrise(aar: number, maaned: number): Array<Date | null> {
  const første = new Date(aar, maaned, 1);
  // JS: søn=0 → mandag-først krever justering.
  const startJs = første.getDay();
  const førsteUkedagMo = startJs === 0 ? 6 : startJs - 1;
  const antallDager = new Date(aar, maaned + 1, 0).getDate();

  const dager: Array<Date | null> = [];
  for (let i = 0; i < førsteUkedagMo; i++) dager.push(null);
  for (let d = 1; d <= antallDager; d++) dager.push(new Date(aar, maaned, d));
  while (dager.length % 7 !== 0) dager.push(null);
  return dager;
}

function MaanedRute({
  aar,
  maaned,
  valgtDato,
  markerte,
  onValgDato,
}: {
  aar: number;
  maaned: number;
  valgtDato?: Date | null;
  markerte: Set<string>;
  onValgDato?: (dato: Date) => void;
}) {
  const matrise = useMemo(() => lagDagsmatrise(aar, maaned), [aar, maaned]);
  const idag = new Date();
  const navn = MAANEDS_NAVN[maaned] ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-semibold capitalize text-foreground">
        {navn} {aar}
      </h4>
      <div className="grid grid-cols-7 gap-0.5">
        {UKEDAGER.map((d, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-medium uppercase text-muted-foreground"
          >
            {d}
          </span>
        ))}
        {matrise.map((dato, i) => {
          if (!dato) return <span key={`b-${i}`} />;
          const erValgt = valgtDato && iSammeDag(valgtDato, dato);
          const erIdag = iSammeDag(idag, dato);
          const erMarkert = markerte.has(dato.toISOString().slice(0, 10));
          return (
            <button
              key={i}
              type="button"
              onClick={() => onValgDato?.(dato)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-sm text-[11px] tabular-nums transition-colors",
                "hover:bg-secondary",
                erIdag && "font-semibold text-primary",
                erValgt && "bg-primary text-primary-foreground hover:bg-primary",
                !erValgt && !erIdag && "text-foreground",
              )}
            >
              <span>{dato.getDate()}</span>
              {erMarkert && (
                <span
                  className={cn(
                    "absolute mt-4 h-0.5 w-0.5 rounded-full",
                    erValgt ? "bg-primary-foreground" : "bg-accent",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MiniCalendar({
  basisMaaned,
  valgtDato,
  onValgDato,
  onByttMaaned,
  markerteDatoer,
}: Props) {
  const markerte = useMemo(() => {
    const set = new Set<string>();
    for (const d of markerteDatoer ?? []) {
      set.add(d.toISOString().slice(0, 10));
    }
    return set;
  }, [markerteDatoer]);

  const måneder = useMemo(() => {
    const m = basisMaaned.getMonth();
    const a = basisMaaned.getFullYear();
    return [
      { aar: a, maaned: m - 1 },
      { aar: a, maaned: m },
      { aar: a, maaned: m + 1 },
    ].map(({ aar, maaned }) => {
      // Normaliser via Date for å håndtere januar/desember-overlap.
      const d = new Date(aar, maaned, 1);
      return { aar: d.getFullYear(), maaned: d.getMonth() };
    });
  }, [basisMaaned]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onByttMaaned?.(-1)}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Forrige måned"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <span className="text-xs font-medium text-foreground">3-måneders navigator</span>
        <button
          type="button"
          onClick={() => onByttMaaned?.(1)}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Neste måned"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {måneder.map((m) => (
          <MaanedRute
            key={`${m.aar}-${m.maaned}`}
            aar={m.aar}
            maaned={m.maaned}
            valgtDato={valgtDato}
            markerte={markerte}
            onValgDato={onValgDato}
          />
        ))}
      </div>
    </div>
  );
}
