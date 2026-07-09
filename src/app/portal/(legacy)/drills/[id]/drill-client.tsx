"use client";

/**
 * DrillDetailClient — interaktive actions for én drill.
 *
 * To primær-handlinger:
 * - "Start økt med denne drill" (lime CTA, primary)
 * - "Legg til kalender" (sekundær)
 *
 * Server actions kobles på senere — foreløpig router-navigasjon + alert.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, CalendarPlus, Share2, Loader2 } from "lucide-react";

type Props = {
  drillId: string;
  drillTitle: string;
};

export function DrillDetailClient({ drillId, drillTitle }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function startOkt() {
    startTransition(() => {
      // Foreløpig: navigerer til ny-økt-flyt med drill-id som query.
      router.push(`/portal/ny-okt?drill=${encodeURIComponent(drillId)}`);
    });
  }

  function leggTilKalender() {
    alert(
      `"${drillTitle}" lagt til i kalenderen. Velg dag og tid neste skritt.`,
    );
  }

  function delDrill() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: drillTitle,
          text: `Sjekk ut denne drillen: ${drillTitle}`,
          url: window.location.href,
        })
        .catch(() => {
          // Bruker avbrøt — gjør ingenting.
        });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Lenke kopiert");
    }
  }

  return (
    <section
      aria-label="Drill-handlinger"
      className="flex flex-wrap items-stretch gap-2 border-t border-border pt-8"
    >
      <button
        type="button"
        onClick={startOkt}
        disabled={pending}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:flex-initial"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
        ) : (
          <Play className="h-4 w-4" strokeWidth={1.75} />
        )}
        Start økt med denne drill
      </button>

      <button
        type="button"
        onClick={leggTilKalender}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
      >
        <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
        Legg til kalender
      </button>

      <button
        type="button"
        onClick={delDrill}
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        Del
      </button>
    </section>
  );
}
