/**
 * AgencyOS — Drill-bibliotek (/admin/drills). v2-port 16. juli 2026.
 *
 * Filtrer på ferdighetskategori (?kat=) og søk (?q=) — server-rendret,
 * fungerer uten JS. Datakilde: prisma.exerciseDefinition. Biblioteket har
 * flere hundre drills — grid-en viser de første 30 i valgt kategori (ærlig
 * teller under), ingen paginering.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AdminDrillsV2, type AdminDrillsV2Data, type AdminDrillsRad } from "@/components/admin/v2/AdminDrillsV2";
import { T } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

const VIS_MAKS = 30;

/** Fasit-kategorier → Prisma-filter. */
const KATEGORIER: {
  param: string;
  label: string;
  where: Prisma.ExerciseDefinitionWhereInput | null;
}[] = [
  { param: "alle", label: "Alle", where: null },
  { param: "approach", label: "Approach", where: { skillArea: "TILNAERMING" } },
  { param: "putting", label: "Putting", where: { skillArea: "PUTTING" } },
  { param: "driving", label: "Driving", where: { skillArea: "TEE_TOTAL" } },
  { param: "naerspill", label: "Nærspill", where: { skillArea: "AROUND_GREEN" } },
  { param: "fys", label: "Fys", where: { pyramidArea: "FYS" } },
];

type DrillRad = {
  id: string;
  name: string;
  skillArea: string | null;
  pyramidArea: string;
  durationMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
};

/** Visningskategori for én drill (samme begreper som seg-kontrollen). */
function drillKategori(d: DrillRad): string {
  if (d.pyramidArea === "FYS") return "Fys";
  switch (d.skillArea) {
    case "TILNAERMING":
      return "Approach";
    case "PUTTING":
      return "Putting";
    case "TEE_TOTAL":
      return "Driving";
    case "AROUND_GREEN":
      return "Nærspill";
    case "SPILL":
      return "Spill";
    default:
      return "Teknikk";
  }
}

/** Ikonfarge per kategori — v2-akse-tokens. */
function kategoriFarge(kat: string): string {
  switch (kat) {
    case "Approach":
      return T.ax.SLAG;
    case "Putting":
      return T.ax.SPILL;
    case "Driving":
      return T.ax.TEK;
    case "Nærspill":
      return T.ax.TURN;
    case "Fys":
      return T.ax.FYS;
    default:
      return T.lime;
  }
}

/** Meta-linje av ekte felter — utelater det som mangler, finner aldri på tall. */
function drillMeta(d: DrillRad): string {
  const deler: string[] = [drillKategori(d)];
  if (d.defaultSets !== null && d.defaultReps !== null) {
    deler.push(`${d.defaultSets}×${d.defaultReps}`);
  }
  if (d.durationMin !== null) deler.push(`${d.durationMin} min`);
  return deler.join(" · ");
}

export default async function DrillBibliotekPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string; q?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const aktiv = KATEGORIER.find((k) => k.param === (sp.kat ?? "alle")) ?? KATEGORIER[0];
  const q = sp.q?.trim() ?? "";

  const sokWhere: Prisma.ExerciseDefinitionWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { hasSome: [q] } },
        ],
      }
    : undefined;

  const where: Prisma.ExerciseDefinitionWhereInput | undefined =
    aktiv.where && sokWhere ? { AND: [aktiv.where, sokWhere] } : (aktiv.where ?? sokWhere ?? undefined);

  const [total, iKategori, drills] = await Promise.all([
    prisma.exerciseDefinition.count(),
    prisma.exerciseDefinition.count({ where }),
    prisma.exerciseDefinition.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        skillArea: true,
        pyramidArea: true,
        durationMin: true,
        defaultSets: true,
        defaultReps: true,
      },
      take: VIS_MAKS,
    }),
  ]);

  const rader: AdminDrillsRad[] = drills.map((d) => ({
    id: d.id,
    navn: d.name,
    kategori: drillKategori(d),
    kategoriFarge: kategoriFarge(drillKategori(d)),
    meta: drillMeta(d),
  }));

  const data: AdminDrillsV2Data = {
    total,
    iKategori,
    visMaks: VIS_MAKS,
    kategorier: KATEGORIER.map(({ param, label }) => ({ param, label })),
    aktivKategori: aktiv.param,
    sok: q,
    drills: rader,
  };

  return <AdminDrillsV2 data={data} />;
}
