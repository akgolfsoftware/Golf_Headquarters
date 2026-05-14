/**
 * PlayerHQ · Mål · Baner
 *
 * V2-feature: bane-bibliotek med slope/rating, Strokes Gained per hull og
 * runde-historikk. Per Sprint H er dette ren placeholder — full
 * implementasjon kommer når CourseDefinition har lat/lng + slope-data per tee.
 */

import Link from "next/link";
import { ArrowLeft, Map } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function BanerPage() {
  await requirePortalUser();

  return (
    <div className="space-y-8">
      <Link
        href="/portal/mal"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Tilbake til Mål
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Mål · Baner"
        titleLead="Baner"
        titleItalic="kommer snart"
        sub="Vi jobber med å samle alle norske baner med par, slope og historikk. Tilgjengelig i V2."
      />

      <EmptyState
        icon={Map}
        titleItalic="Bane-database"
        titleTrail="under utvikling"
        sub="Når den er klar kan du logge runder direkte mot riktig bane og se utviklingen din over tid."
      />

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Hva som kommer i V2
        </div>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-medium">Slope og rating per tee</strong>
              <span className="text-muted-foreground"> — riktig handicap-justering for hver bane</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-medium">Strokes Gained per hull</strong>
              <span className="text-muted-foreground"> — se hvor du tjener og taper slag</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-medium">Logg dine runder</strong>
              <span className="text-muted-foreground"> — full historikk og trend per bane</span>
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
