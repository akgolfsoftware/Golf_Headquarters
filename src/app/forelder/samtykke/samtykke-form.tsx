"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { lagreSamtykker } from "./actions";

type SamtykkeDef = {
  key: string;
  tittel: string;
  beskrivelse: string;
};

type Props = {
  childId: string;
  samtykker: SamtykkeDef[];
  eksisterende: Record<string, boolean>;
};

export function SamtykkeForm({ childId, samtykker, eksisterende }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valg, setValg] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of samtykker) {
      init[s.key] = eksisterende[s.key] ?? false;
    }
    return init;
  });

  function toggle(key: string) {
    setValg((v) => ({ ...v, [key]: !v[key] }));
    setSuccess(false);
  }

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        await lagreSamtykker(childId, valg);
        setSuccess(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lagring feilet.");
      }
    });
  }

  return (
    <div className="divide-y divide-border">
      {samtykker.map((s) => (
        <label
          key={s.key}
          className="flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-secondary/30"
        >
          <input
            type="checkbox"
            checked={valg[s.key] ?? false}
            onChange={() => toggle(s.key)}
            className="mt-1 h-4 w-4 rounded border-border accent-primary"
          />
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-semibold">
              {s.tittel}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {s.beskrivelse}
            </p>
          </div>
        </label>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-4 bg-secondary/20 px-6 py-4">
        {success ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Samtykker lagret
          </span>
        ) : error ? (
          <span className="text-sm text-destructive">{error}</span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Endringer logges i revisjonsloggen.
          </span>
        )}
        <button
          type="button"
          onClick={lagre}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Lagrer …" : "Lagre samtykker"}
        </button>
      </div>
    </div>
  );
}
