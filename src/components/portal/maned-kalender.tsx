// Måneds-grid med dag-celler. Viser aktivitet-prikker per dag.

import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  sammeDag,
} from "@/lib/uke-helpers";

export type Aktivitet =
  | { type: "training"; tittel: string }
  | { type: "round"; tittel: string }
  | { type: "test"; tittel: string };

const FARGER: Record<Aktivitet["type"], string> = {
  training: "bg-primary",
  round: "bg-pyr-spill", // oransje
  test: "bg-destructive",
};

export function ManedKalender({
  maned,
  aktiviteterPerDag,
  bygglenke,
}: {
  maned: Date;
  aktiviteterPerDag: Map<string, Aktivitet[]>;
  bygglenke: (dato: Date) => string;
}) {
  const start = startOfMonth(maned);
  const slutt = endOfMonth(maned);
  const gridStart = startOfWeek(start);

  // Generer 6 uker med dager (42 celler) — dekker alltid en hel måned
  const dager: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    dager.push(d);
    if (d >= slutt && d.getDay() === 0) break;
  }

  const idag = new Date();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {["man", "tir", "ons", "tor", "fre", "lør", "søn"].map((d) => (
          <div
            key={d}
            className="px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dager.map((d) => {
          const utenforManed = d.getMonth() !== maned.getMonth();
          const erIdag = sammeDag(d, idag);
          const key = d.toISOString().split("T")[0];
          const aktivitet = aktiviteterPerDag.get(key) ?? [];

          return (
            <Link
              key={key}
              href={bygglenke(d)}
              className={`relative min-h-[80px] border-b border-r border-border p-2 transition-colors hover:bg-muted/40 active:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                utenforManed ? "bg-muted/20 text-muted-foreground" : ""
              } ${erIdag ? "bg-primary/5" : ""}`}
            >
              <span
                className={`font-mono text-xs ${
                  erIdag
                    ? "font-semibold text-primary"
                    : utenforManed
                    ? "text-muted-foreground/50"
                    : "text-foreground"
                }`}
              >
                {d.getDate()}
              </span>

              {aktivitet.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {aktivitet.slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${FARGER[a.type]}`}
                      title={a.tittel}
                    />
                  ))}
                  {aktivitet.length > 3 && (
                    <span className="font-mono text-[9px] text-muted-foreground">
                      +{aktivitet.length - 3}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
