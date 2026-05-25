/**
 * CoachHQ · Turneringer · Dubletter
 *
 * Coach gjennomgår potensielle dubletter mellom MANUAL-turneringer
 * (lagt til av spillere via PlayerHQ) og synkroniserte DATAGOLF/NGF-turneringer.
 *
 * Algoritme:
 *   - For hver MANUAL-turnering uten mergedIntoId
 *   - Søk DATAGOLF/NGF/GJGT-turneringer med overlappende dato (±3 dager)
 *     og lignende navn (token-overlap eller substring)
 *
 * Coach klikker "Merge" for å sette mergedIntoId og flytte alle relasjoner.
 */

import Link from "next/link";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { MergeDubletterListe, type MergeKandidat } from "./merge-liste";

export const dynamic = "force-dynamic";

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3),
  );
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const t of a) if (b.has(t)) count++;
  return count;
}

export default async function DubletterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Hent alle MANUAL-turneringer som IKKE er merget
  const manuals = await prisma.tournament.findMany({
    where: {
      sourceOrigin: "MANUAL",
      mergedIntoId: null,
    },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { entries: true, results: true, publicEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // For matching: hent alle ikke-MANUAL turneringer (kandidat-pool)
  const kandidater = await prisma.tournament.findMany({
    where: {
      sourceOrigin: { not: "MANUAL" },
      mergedIntoId: null,
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      sourceOrigin: true,
      tour: true,
    },
  });

  // Bygg match-forslag per manual-turnering
  const liste: MergeKandidat[] = manuals.map((m) => {
    const manualTokens = tokenize(m.name);
    const manualStart = m.startDate.getTime();
    const treDager = 3 * 24 * 60 * 60 * 1000;

    const forslag = kandidater
      .map((k) => {
        const datoDiff = Math.abs(k.startDate.getTime() - manualStart);
        if (datoDiff > treDager) return null;
        const overlap = tokenOverlap(manualTokens, tokenize(k.name));
        if (overlap === 0) return null;
        return {
          id: k.id,
          name: k.name,
          startDate: k.startDate,
          location: k.location,
          sourceOrigin: k.sourceOrigin,
          tour: k.tour,
          score: overlap * 100 - Math.floor(datoDiff / (24 * 60 * 60 * 1000)),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      manual: {
        id: m.id,
        name: m.name,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate?.toISOString() ?? null,
        location: m.location,
        tour: m.tour,
        createdByName: m.createdBy?.name ?? null,
        createdByEmail: m.createdBy?.email ?? null,
        antallEntries: m._count.entries,
        antallResults: m._count.results,
        antallPublicEntries: m._count.publicEntries,
      },
      forslag: forslag.map((f) => ({
        id: f.id,
        name: f.name,
        startDate: f.startDate.toISOString(),
        location: f.location,
        sourceOrigin: f.sourceOrigin,
        tour: f.tour,
        score: f.score,
      })),
    };
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Tilbake til turneringer
        </Link>
      </div>

      <PageHeader
        eyebrow="CoachHQ · Turneringer"
        titleLead="Vurder"
        titleItalic="dubletter"
        sub={`${manuals.length} ${manuals.length === 1 ? "manuell turnering" : "manuelle turneringer"} venter på vurdering. Merge når kilden matcher.`}
      />

      {manuals.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          titleItalic="Ingen ventende"
          titleTrail="dubletter"
          sub="Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering."
        />
      ) : (
        <>
          <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <strong className="text-foreground">Slik fungerer merge:</strong>
                <p className="mt-1">
                  Når du merger en manuell turnering inn i en kanonisk turnering,
                  flyttes alle påmeldinger, resultater og deltakerlister automatisk.
                  Manuell-rad blir markert som dublett og forsvinner fra hovedlista.
                </p>
              </div>
            </div>
          </div>

          <MergeDubletterListe liste={liste} />
        </>
      )}
    </div>
  );
}
