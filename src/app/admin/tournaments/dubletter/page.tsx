/**
 * AgencyOS · Turneringer · Dubletter — v2. Auth/Prisma/match-algoritme
 * bevart 1:1 fra legacy-siden — kun visuelt portert til v2-biblioteket.
 *
 * Algoritme: for hver MANUAL-turnering uten mergedIntoId, søk
 * DATAGOLF/NGF/GJGT-turneringer med overlappende dato (±3 dager) og
 * lignende navn (token-overlap). Coach klikker «Slå sammen» for å sette
 * mergedIntoId og flytte alle relasjoner.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { Caps, Kort, T, Tittel, TilbakeLenke, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
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
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const manuals = await prisma.tournament.findMany({
    where: { sourceOrigin: "MANUAL", mergedIntoId: null },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { entries: true, results: true, publicEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const kandidater = await prisma.tournament.findMany({
    where: { sourceOrigin: { not: "MANUAL" }, mergedIntoId: null },
    select: { id: true, name: true, startDate: true, endDate: true, location: true, sourceOrigin: true, tour: true },
  });

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
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/tournaments">Turneringer</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Planlegge · Turneringer</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="dubletter">Vurder</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "8px 0 0", maxWidth: 520 }}>
            {manuals.length} {manuals.length === 1 ? "manuell turnering" : "manuelle turneringer"} venter på vurdering. Slå sammen når kilden matcher.
          </p>
        </div>

        {liste.length === 0 ? (
          <Kort>
            <TomTilstand icon="check-circle" title="Ingen ventende dubletter" sub="Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering." />
          </Kort>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 14, background: T.panel, border: `1px solid ${T.border}`, padding: "14px 18px" }}>
              <Icon name="info" size={16} style={{ color: T.lime, marginTop: 1, flex: "none" }} />
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: T.fg, fontWeight: 600 }}>Slik fungerer sammenslåing: </strong>
                Når du slår sammen en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger, resultater og
                deltakerlister automatisk. Manuell-raden markeres som dublett og forsvinner fra hovedlista.
              </p>
            </div>
            <MergeDubletterListe liste={liste} />
          </>
        )}
      </div>
    </V2Shell>
  );
}
