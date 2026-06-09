"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2Off, Loader2 } from "lucide-react";
import { unmergeTurnering } from "../actions";

type Props = {
  sourceId: string;
  /** Navnet på turneringen denne er slått sammen inn i (mål). */
  targetName: string | null;
};

/**
 * Vises kun når en turnering er slått sammen (mergedIntoId satt). Lar coachen
 * oppheve sammenslåingen. Flytter IKKE påmeldinger/resultater tilbake — det
 * gjør server-action-en klart i teksten.
 */
export function UnmergeBanner({ sourceId, targetName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function opphev() {
    if (
      !confirm(
        "Oppheve sammenslåingen? Turneringen blir synlig igjen i lista. Påmeldinger og resultater som ble flyttet, flyttes IKKE tilbake automatisk.",
      )
    ) {
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await unmergeTurnering(sourceId);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Slått sammen{targetName ? ` inn i «${targetName}»` : ""}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Denne turneringen er markert som dublett og skjules fra
            hovedlista. Opphev for å vise den som egen turnering igjen.
          </p>
        </div>
        <button
          type="button"
          onClick={opphev}
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Link2Off className="h-4 w-4" strokeWidth={1.75} />
          )}
          Opphev sammenslåing
        </button>
      </div>
      {feil && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {feil}
        </div>
      )}
    </div>
  );
}
