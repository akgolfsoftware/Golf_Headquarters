"use client";

/**
 * ForeslattTestKort — viser en custom-test som venter på coach-godkjenning.
 * Coach kan «Godkjenn» (visibility blir ACADEMY, isCoachApproved=true) eller
 * «Avvis» (sletter testen permanent).
 */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2, User } from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { avvisForslag, godkjennForslag } from "./actions";

type Test = {
  id: string;
  name: string;
  description: string | null;
  pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  scoringRule: string;
  protocol: unknown;
  createdAt: string;
  forfatter: string;
};

function protokollSteg(protocol: unknown): string[] {
  if (
    protocol &&
    typeof protocol === "object" &&
    !Array.isArray(protocol) &&
    "steg" in protocol &&
    Array.isArray((protocol as { steg: unknown }).steg)
  ) {
    return ((protocol as { steg: unknown[] }).steg).filter(
      (s): s is string => typeof s === "string",
    );
  }
  return [];
}

function malverdier(protocol: unknown): Record<string, string> {
  if (
    protocol &&
    typeof protocol === "object" &&
    !Array.isArray(protocol) &&
    "malverdi" in protocol
  ) {
    const m = (protocol as { malverdi: unknown }).malverdi;
    if (
      m &&
      typeof m === "object" &&
      !Array.isArray(m) &&
      "nivaaer" in m &&
      typeof (m as { nivaaer: unknown }).nivaaer === "object"
    ) {
      const obj = (m as { nivaaer: Record<string, unknown> }).nivaaer;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
  }
  return {};
}

export function ForeslattTestKort({ test }: { test: Test }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function godkjenn() {
    startTransition(async () => {
      try {
        await godkjennForslag({ id: test.id });
        toast.success(`«${test.name}» er godkjent og synlig for akademi.`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Kunne ikke godkjenne testen.",
        );
      }
    });
  }

  function avvis() {
    if (!confirm(`Avvis og slett «${test.name}»?`)) return;
    startTransition(async () => {
      try {
        await avvisForslag({ id: test.id });
        toast.success(`«${test.name}» ble avvist.`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Kunne ikke avvise testen.",
        );
      }
    });
  }

  const steg = protokollSteg(test.protocol);
  const nivaaer = malverdier(test.protocol);
  const opprettet = new Date(test.createdAt).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
  });

  return (
    <li className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
            {test.name}
          </h3>
          <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <User size={12} strokeWidth={1.75} />
            {test.forfatter} · {opprettet}
          </span>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.10em] text-secondary-foreground">
          {test.pyramidArea}
        </span>
      </div>

      {test.description && (
        <p className="mt-3 text-sm text-muted-foreground">{test.description}</p>
      )}

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scoring
          </dt>
          <dd className="mt-1">{test.scoringRule}</dd>
        </div>

        {steg.length > 0 && (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Protokoll
            </dt>
            <ol className="mt-1 space-y-1">
              {steg.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {i + 1}.
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {Object.keys(nivaaer).length > 0 && (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mål-verdier per nivå
            </dt>
            <dl className="mt-1 grid grid-cols-4 gap-2 text-xs">
              {Object.entries(nivaaer).map(([nivaa, verdi]) => (
                <div key={nivaa}>
                  <dt className="font-mono text-[10px] uppercase text-muted-foreground">
                    {nivaa}
                  </dt>
                  <dd className="mt-0.5 font-mono tabular-nums">{verdi}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </dl>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={godkjenn}
          disabled={pending}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <Check size={14} strokeWidth={1.75} />
          )}
          Godkjenn
        </button>
        <button
          type="button"
          onClick={avvis}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-card px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          <Trash2 size={14} strokeWidth={1.75} />
          Avvis
        </button>
      </div>
    </li>
  );
}
