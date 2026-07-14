/**
 * AgencyOS — Turneringer · Dubletter (`/admin/tournaments/dubletter`), v2.
 * Port av `(legacy)/tournaments/dubletter/page.tsx` + `merge-liste.tsx`
 * (2026-07-14, AgencyOS Bølge 3.29) — samme match-algoritme (token-overlap +
 * ±3 dager mot ikke-MANUAL turneringer), samme `mergeTurneringer`-kontrakt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTurneringerDubletterV2, type DubletterKandidatV2 } from "@/components/admin/v2/AdminTurneringerDubletterV2";

export const dynamic = "force-dynamic";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric" });

const SOURCE_LABEL: Record<string, string> = {
  DATAGOLF: "DataGolf",
  NGF: "NGF",
  GJGT: "GJGT",
  VAGR: "VAGR",
  NCAA: "NCAA",
  MANUAL: "Manuell",
};

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

  const liste: DubletterKandidatV2[] = manuals.map((m) => {
    const manualTokens = tokenize(m.name);
    const manualStart = m.startDate.getTime();
    const treDager = 3 * 24 * 60 * 60 * 1000;

    const forslag = kandidater
      .map((k) => {
        const datoDiff = Math.abs(k.startDate.getTime() - manualStart);
        if (datoDiff > treDager) return null;
        const overlap = tokenOverlap(manualTokens, tokenize(k.name));
        if (overlap === 0) return null;
        return { ...k, score: overlap * 100 - Math.floor(datoDiff / (24 * 60 * 60 * 1000)) };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      manualId: m.id,
      manualName: m.name,
      startDateTekst: NB_DATE.format(m.startDate),
      location: m.location,
      createdByName: m.createdBy?.name ?? null,
      antallKoblinger: m._count.entries + m._count.results + m._count.publicEntries,
      forslag: forslag.map((f) => ({
        id: f.id,
        name: f.name,
        startDateTekst: NB_DATE.format(f.startDate),
        location: f.location,
        sourceLabel: f.sourceOrigin ? SOURCE_LABEL[f.sourceOrigin] ?? f.sourceOrigin : "?",
        tour: f.tour,
        score: f.score,
      })),
    };
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTurneringerDubletterV2 liste={liste} />
    </V2Shell>
  );
}
