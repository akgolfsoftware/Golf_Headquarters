"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, Loader2, MapPin, User } from "lucide-react";
import { mergeTurneringer } from "../actions";

export type MergeKandidat = {
  manual: {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
    tour: string | null;
    createdByName: string | null;
    createdByEmail: string | null;
    antallEntries: number;
    antallResults: number;
    antallPublicEntries: number;
  };
  forslag: Array<{
    id: string;
    name: string;
    startDate: string;
    location: string | null;
    sourceOrigin: string | null;
    tour: string | null;
    score: number;
  }>;
};

const SOURCE_LABEL: Record<string, string> = {
  DATAGOLF: "DataGolf",
  NGF: "NGF",
  GJGT: "GJGT",
  VAGR: "VAGR",
  NCAA: "NCAA",
  MANUAL: "Manuell",
};

function formaterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MergeDubletterListe({ liste }: { liste: MergeKandidat[] }) {
  return (
    <div className="space-y-4">
      {liste.map((k) => (
        <DublettKort key={k.manual.id} kandidat={k} />
      ))}
    </div>
  );
}

function DublettKort({ kandidat }: { kandidat: MergeKandidat }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handleMerge(targetId: string, targetName: string) {
    setFeil(null);
    setFeedback(null);

    startTransition(async () => {
      const result = await mergeTurneringer({
        sourceId: kandidat.manual.id,
        targetId,
      });

      if (!result.ok) {
        setFeil(result.feil);
        return;
      }

      const { entries, results, participants } = result.flyttet;
      setFeedback(
        `Merget inn i "${targetName}" — flyttet ${entries} påmeldinger, ${results} resultater, ${participants} deltakere.`,
      );
      router.refresh();
    });
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Manuell turnering — header */}
      <header className="border-b border-border bg-secondary/50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-sm bg-accent/30 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                Manuell
              </span>
              <h3 className="truncate font-display text-base font-semibold text-foreground">
                {kandidat.manual.name}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{formaterDato(kandidat.manual.startDate)}</span>
              {kandidat.manual.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {kandidat.manual.location}
                </span>
              )}
              {kandidat.manual.createdByName && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {kandidat.manual.createdByName}
                </span>
              )}
              <span className="text-muted-foreground/70">
                {kandidat.manual.antallEntries + kandidat.manual.antallResults + kandidat.manual.antallPublicEntries} koblinger
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Forslag */}
      <div className="divide-y divide-border">
        {kandidat.forslag.length === 0 ? (
          <div className="px-6 py-6 text-sm text-muted-foreground">
            Ingen automatiske match-forslag. Du kan velge fra full liste i CoachHQ.
          </div>
        ) : (
          kandidat.forslag.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[1fr_auto] items-center gap-2 px-6 py-2 hover:bg-secondary/30"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                    {f.sourceOrigin ? SOURCE_LABEL[f.sourceOrigin] ?? f.sourceOrigin : "?"}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {f.name}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{formaterDato(f.startDate)}</span>
                  {f.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {f.location}
                    </span>
                  )}
                  {f.tour && <span>{f.tour}</span>}
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    score {f.score}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleMerge(f.id, f.name)}
                disabled={isPending}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                Merge
              </button>
            </div>
          ))
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="flex items-start gap-2 border-t border-primary/20 bg-primary/5 px-6 py-2 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{feedback}</span>
        </div>
      )}
      {feil && (
        <div className="border-t border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive-foreground">
          {feil}
        </div>
      )}
    </article>
  );
}
