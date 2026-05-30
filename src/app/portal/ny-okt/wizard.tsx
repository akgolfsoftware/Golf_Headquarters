/**
 * NyOktWizard — pre-BETA info-card.
 *
 * Full wizard (type → drills → tid/sted → bekreft) bygges post-BETA.
 * For nå viser vi en info-card som peker spillere til coach-fanen.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export function NyOktWizard() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <AthleticEyebrow tone="lime">NY ØKT</AthleticEyebrow>
      <p className="font-display mt-4 text-xl">
        Bygg din egen <em className="font-normal italic text-primary">økt</em>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Wizard åpnes post-BETA. For nå: be coach om en plan via Coach-fanen,
        eller logg en gjennomført runde.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/portal/coach"
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Kontakt coach
          <ArrowRight size={14} strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/portal/mal/runder/ny"
          className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Logg runde
          <ArrowRight size={14} strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
