"use client";

/**
 * TrackManSessionClient — interaktive deler av økt-detalj-siden.
 *
 * Eksporteres som et objekt med to underkomponenter:
 * - .Filter  — chip-strip for å filtrere/sortere shots
 * - .Actions — knapper for eksport CSV · slett · sammenlign
 *
 * Selve shots-tabellen rendres som server-component i page.tsx. Filter-
 * tilstanden lagres lokalt og kobler seg på senere via context eller URL-state.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  GitCompare,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { AthleticButton } from "@/components/athletic/button";

function Filter() {
  const [active, setActive] = useState<"alle" | "best" | "verst">("alle");
  const chips: Array<{ key: typeof active; label: string }> = [
    { key: "alle", label: "Alle" },
    { key: "best", label: "Beste 10" },
    { key: "verst", label: "Verste 10" },
  ];

  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal
        className="h-3.5 w-3.5 text-muted-foreground"
        strokeWidth={1.75}
      />
      <div className="flex items-center gap-1.5">
        {chips.map((chip) => {
          const isActive = chip.key === active;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setActive(chip.key)}
              className={`rounded-full px-4 py-1 font-mono text-[10px] uppercase tracking-[0.10em] transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Actions({
  sessionId,
  shotCount,
}: {
  sessionId: string;
  shotCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function eksporterCsv() {
    // Stub — server action for CSV-eksport kobles på senere.
    alert(`Eksporterer ${shotCount} shots som CSV. (Kobles til server action)`);
  }

  function sammenlign() {
    router.push("/portal/mal/trackman");
  }

  function slett() {
    if (
      !confirm(
        "Er du sikker på at du vil slette denne TrackMan-økten? Dette kan ikke angres.",
      )
    )
      return;
    startTransition(() => {
      // Server action kobles på senere.
      alert("Slett-action ikke koblet ennå.");
    });
  }

  const isDummy = sessionId === "dummy-session";

  return (
    <section
      aria-label="Økt-handlinger"
      className="flex flex-wrap items-center gap-2 border-t border-border pt-8"
    >
      <AthleticButton
        type="button"
        variant="primary"
        onClick={eksporterCsv}
        disabled={pending}
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
        Eksporter CSV
      </AthleticButton>

      <button
        type="button"
        onClick={sammenlign}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <GitCompare className="h-4 w-4" strokeWidth={1.75} />
        Sammenlign med…
      </button>

      <button
        type="button"
        onClick={slett}
        disabled={pending || isDummy}
        className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
        ) : (
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        )}
        Slett økt
      </button>

      {isDummy && (
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Demo · slett-action ikke aktiv
        </span>
      )}
    </section>
  );
}

export const TrackManSessionClient = {
  Filter,
  Actions,
};
