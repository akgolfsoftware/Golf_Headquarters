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

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  GitCompare,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Actions(_props: { sessionId: string; shotCount: number }) {
  const router = useRouter();

  function sammenlign() {
    router.push("/portal/mal/trackman");
  }

  const pending = false;

  return (
    <section
      aria-label="Økt-handlinger"
      className="flex flex-wrap items-center gap-2 border-t border-border pt-8"
    >
      <AthleticButton
        type="button"
        variant="primary"
        disabled
        title="Kommer post-BETA"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
        Eksporter CSV
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.10em] opacity-70">
          kommer snart
        </span>
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
        disabled
        title="Kommer post-BETA"
        className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2.5 text-sm font-medium text-destructive opacity-50 cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        Slett økt
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.10em] opacity-70">
          kommer snart
        </span>
      </button>
    </section>
  );
}

export const TrackManSessionClient = {
  Filter,
  Actions,
};
