// 7 dag-kort horisontalt, klikk for å velge dag.

import Link from "next/link";
import type { TrainingPlanSession, PyramidArea } from "@/generated/prisma/client";
import { dagerIUken, dagNavnKort, sammeDag } from "@/lib/uke-helpers";

const PYR_FARGE: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

export function UkeStripe({
  ukestart,
  sessions,
  valgtDato,
  bygglenke,
}: {
  ukestart: Date;
  sessions: TrainingPlanSession[];
  valgtDato: Date;
  bygglenke: (dato: Date) => string;
}) {
  const dager = dagerIUken(ukestart);

  return (
    <div className="grid grid-cols-7 gap-2">
      {dager.map((dato) => {
        const dagensSesjoner = sessions.filter((s) =>
          sammeDag(new Date(s.scheduledAt), dato)
        );
        const aktiv = sammeDag(dato, valgtDato);
        const erIDag = sammeDag(dato, new Date());

        return (
          <Link
            key={dato.toISOString()}
            href={bygglenke(dato)}
            className={`relative rounded-lg border p-3 text-left transition-colors ${
              aktiv
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-input"
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {dagNavnKort(dato)}
            </div>
            <div
              className={`mt-1 font-display text-lg font-semibold ${
                erIDag ? "text-primary" : "text-foreground"
              }`}
            >
              {dato.getDate()}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {dagensSesjoner.length === 0 ? (
                <span className="font-mono text-[10px] text-muted-foreground">—</span>
              ) : (
                dagensSesjoner.slice(0, 3).map((s) => (
                  <span
                    key={s.id}
                    className={`h-1.5 w-1.5 rounded-full ${PYR_FARGE[s.pyramidArea]}`}
                    title={s.title}
                  />
                ))
              )}
            </div>

            {dagensSesjoner.length > 0 && (
              <div className="mt-1 truncate text-[11px] text-foreground/80">
                {dagensSesjoner[0].title}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
