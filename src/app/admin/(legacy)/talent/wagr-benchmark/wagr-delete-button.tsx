"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { slettWagrSnapshot } from "../wagr-import/actions";

type Props = {
  snapshotId: string;
  fullName: string;
};

/**
 * Slett-knapp per WAGR-snapshot i benchmark-tabellen. Bekreftelse før sletting.
 * Server-action-en revaliderer og redirecter tilbake til benchmark-siden.
 */
export function WagrDeleteButton({ snapshotId, fullName }: Props) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState(false);

  function slett() {
    if (!confirm(`Slette WAGR-snapshot for «${fullName}»?`)) return;
    setFeil(false);
    startTransition(async () => {
      try {
        await slettWagrSnapshot(snapshotId);
      } catch {
        setFeil(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={slett}
      disabled={pending}
      aria-label={`Slett ${fullName}`}
      title={feil ? "Kunne ikke slette — prøv igjen" : "Slett snapshot"}
      className={`inline-grid h-7 w-7 place-items-center rounded-md border transition-colors disabled:opacity-50 ${
        feil
          ? "border-destructive/50 text-destructive"
          : "border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
      }`}
    >
      {pending ? (
        <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
      ) : (
        <Trash2 size={13} strokeWidth={1.75} />
      )}
    </button>
  );
}
