"use client";

/**
 * Raske handlinger-seksjon for /admin/stats/overview.
 *
 * «Sjekk DB-helse» kjører en ekte read-only DB-ping. De tre andre er bevisst
 * inaktive (utadvendt / ikke koblet / sensitiv) og merket som det, i stedet for
 * å se klikkbare ut men gjøre ingenting.
 */

import { useState, useTransition } from "react";
import { Play, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Reveal } from "@/components/stats/reveal";
import { cn } from "@/lib/utils";
import { sjekkDbHelse, type DbHelseResultat } from "./actions";

type LaastGrunn = "utadvendt" | "ikke koblet" | "sensitiv";

const LAAST: { tekst: string; grunn: LaastGrunn }[] = [
  { tekst: "Kjør manuell sync av PGA-data", grunn: "utadvendt" },
  { tekst: "Send ukentlig roundup nå", grunn: "ikke koblet" },
  { tekst: "Roter CRON_SECRET", grunn: "sensitiv" },
];

const GRUNN_TEKST: Record<LaastGrunn, string> = {
  utadvendt: "Treffer DataGolf — kjøres fra ops",
  "ikke koblet": "Endepunkt ikke bygget",
  sensitiv: "Hemmelighet — kjøres fra terminal",
};

export function RaskeHandlinger() {
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<DbHelseResultat | null>(null);

  function kjorDbHelse() {
    startTransition(async () => {
      setResultat(null);
      const r = await sjekkDbHelse();
      setResultat(r);
    });
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Sjekk DB-helse — ekte, read-only */}
      <Reveal delay={0}>
        <button
          type="button"
          onClick={kjorDbHelse}
          disabled={pending}
          className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" strokeWidth={1.75} aria-hidden />
          ) : (
            <Play className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
          )}
          <span className="text-[13px] font-medium leading-snug text-foreground">
            Sjekk DB-helse
          </span>
          {resultat && (
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]",
                resultat.ok ? "text-success" : "text-destructive",
              )}
            >
              {resultat.ok ? (
                <>
                  <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
                  OK · {resultat.latencyMs} ms · {resultat.brukere} brukere
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Feil · {resultat.latencyMs} ms
                </>
              )}
            </span>
          )}
        </button>
      </Reveal>

      {/* Bevisst inaktive snarveier */}
      {LAAST.map((h, i) => (
        <Reveal key={h.tekst} delay={(i + 1) * 40}>
          <div
            className="flex h-full w-full cursor-not-allowed flex-col gap-2.5 rounded-xl border border-dashed border-border bg-card/60 p-5 text-left"
            title={GRUNN_TEKST[h.grunn]}
          >
            <Play className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <span className="text-[13px] font-medium leading-snug text-muted-foreground">
              {h.tekst}
            </span>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {GRUNN_TEKST[h.grunn]}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
