"use client";

/**
 * CoachAnalysisCard — viser AI-generert coach-analyse fra Voice Memo V3
 * i PlayerHQ. 5 collapsible kategorier (teknisk, taktisk, mental, fysisk,
 * hjemmelekse). "Hjemmelekse" er framhevet med accent-bakgrunn og åpen
 * som default fordi det er det viktigste for spilleren å handle på.
 *
 * Felter `coachAnalyse` og `nesteOktAnbefaling` fra V3 vises IKKE her —
 * de er kun for coach.
 */

import { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Target,
  Brain,
  Dumbbell,
  BookOpen,
} from "lucide-react";

export type AnalyseData = {
  teknisk: string;
  taktisk: string;
  mental: string;
  fysisk: string;
  hjemmelekse: string;
};

type Props = {
  analyse: AnalyseData;
  okteDato: Date;
};

export function CoachAnalysisCard({ analyse, okteDato }: Props) {
  const kategorier = [
    { tittel: "Teknisk", ikon: Target, tekst: analyse.teknisk },
    { tittel: "Taktisk", ikon: Sparkles, tekst: analyse.taktisk },
    { tittel: "Mental", ikon: Brain, tekst: analyse.mental },
    { tittel: "Fysisk", ikon: Dumbbell, tekst: analyse.fysisk },
    { tittel: "Hjemmelekse", ikon: BookOpen, tekst: analyse.hjemmelekse },
  ] as const;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Coach-analyse · {formatDato(okteDato)}
        </div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
          Hva coachen sa
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-sammendrag fra økten din. Hjemmeleksen er det viktigste å ta med
          videre.
        </p>
      </header>

      <div className="space-y-2">
        {kategorier.map((k) => (
          <KategoriPanel
            key={k.tittel}
            tittel={k.tittel}
            ikon={k.ikon}
            tekst={k.tekst}
            apenSomDefault={k.tittel === "Hjemmelekse"}
          />
        ))}
      </div>
    </section>
  );
}

function KategoriPanel({
  tittel,
  ikon: Ikon,
  tekst,
  apenSomDefault,
}: {
  tittel: string;
  ikon: typeof Target;
  tekst: string;
  apenSomDefault?: boolean;
}) {
  const [apen, setApen] = useState(apenSomDefault ?? false);
  const erHjemmelekse = tittel === "Hjemmelekse";

  const tekstHarInnhold = tekst != null && tekst.trim().length > 0;

  return (
    <div
      className={
        erHjemmelekse
          ? "rounded-md border border-primary bg-accent"
          : "rounded-md border border-border bg-card"
      }
    >
      <button
        type="button"
        onClick={() => setApen(!apen)}
        aria-expanded={apen}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <span className="flex items-center gap-2">
          <Ikon
            size={16}
            strokeWidth={1.75}
            className={
              erHjemmelekse ? "text-accent-foreground" : "text-muted-foreground"
            }
          />
          <span
            className={
              erHjemmelekse
                ? "font-display text-base font-semibold text-accent-foreground"
                : "font-display text-base font-semibold text-foreground"
            }
          >
            {tittel}
          </span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          className={`shrink-0 transition-transform ${apen ? "rotate-180" : ""} ${
            erHjemmelekse ? "text-accent-foreground" : "text-muted-foreground"
          }`}
        />
      </button>
      {apen && (
        <div
          className={
            erHjemmelekse
              ? "border-t border-primary/30 px-4 py-2 text-sm leading-relaxed text-accent-foreground"
              : "border-t border-border px-4 py-2 text-sm leading-relaxed text-foreground"
          }
        >
          {tekstHarInnhold ? (
            <p className="whitespace-pre-line">{tekst}</p>
          ) : (
            <p className="italic text-muted-foreground">
              Ingen notater fra coachen i denne kategorien.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
