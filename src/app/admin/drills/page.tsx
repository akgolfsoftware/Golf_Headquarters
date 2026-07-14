/**
 * AgencyOS — Drill-bibliotek (`/admin/drills`), v2.
 *
 * Port av `(legacy)/drills/page.tsx` (2026-07-14, AgencyOS Bølge 1.2) — samme
 * datamodell/-logikk (kategori via `?kat=`, søk via `?q=`, 30-tak per kategori),
 * ny v2-presentasjon i `AdminDrillerV2`. `actions.ts` bor fortsatt under
 * `(legacy)/drills/` — delt logikk brukt av alle drill-sidene (se
 * `plans/legacy-portering-prioritet.md`).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { AdminDrillerV2, type AdminDrillerV2Row } from "@/components/admin/v2/AdminDrillerV2";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drill-bibliotek · AgencyOS (v2)" };

const VIS_MAKS = 30;

const KATEGORIER: { param: string; label: string; where: Prisma.ExerciseDefinitionWhereInput | null }[] = [
  { param: "alle", label: "Alle", where: null },
  { param: "approach", label: "Approach", where: { skillArea: "TILNAERMING" } },
  { param: "putting", label: "Putting", where: { skillArea: "PUTTING" } },
  { param: "driving", label: "Driving", where: { skillArea: "TEE_TOTAL" } },
  { param: "naerspill", label: "Nærspill", where: { skillArea: "AROUND_GREEN" } },
  { param: "fys", label: "Fys", where: { pyramidArea: "FYS" } },
];

type DrillRad = {
  skillArea: string | null;
  pyramidArea: string;
  durationMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
};

function drillKategori(d: DrillRad): string {
  if (d.pyramidArea === "FYS") return "Fys";
  switch (d.skillArea) {
    case "TILNAERMING": return "Approach";
    case "PUTTING": return "Putting";
    case "TEE_TOTAL": return "Driving";
    case "AROUND_GREEN": return "Nærspill";
    case "SPILL": return "Spill";
    default: return "Teknikk";
  }
}

/** Ikonfarge per kategori — samme akse-tokens («pyr»-mapping) resten av v2 bruker. */
function kategoriFarge(kat: string): string {
  switch (kat) {
    case "Approach": return T.ax.SLAG;
    case "Putting": return T.ax.SPILL;
    case "Driving": return T.ax.TEK;
    case "Nærspill": return T.ax.TURN;
    case "Fys": return T.ax.FYS;
    default: return T.lime;
  }
}

function drillMeta(d: DrillRad): string {
  const deler: string[] = [drillKategori(d)];
  if (d.defaultSets !== null && d.defaultReps !== null) deler.push(`${d.defaultSets}×${d.defaultReps}`);
  if (d.durationMin !== null) deler.push(`${d.durationMin} min`);
  return deler.join(" · ");
}

export default async function DrillBibliotekPage({ searchParams }: { searchParams: Promise<{ kat?: string; q?: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const aktiv = KATEGORIER.find((k) => k.param === (sp.kat ?? "alle")) ?? KATEGORIER[0];
  const q = sp.q?.trim() ?? "";

  const sokWhere: Prisma.ExerciseDefinitionWhereInput | undefined = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { tags: { hasSome: [q] } }] }
    : undefined;

  const where: Prisma.ExerciseDefinitionWhereInput | undefined =
    aktiv.where && sokWhere ? { AND: [aktiv.where, sokWhere] } : (aktiv.where ?? sokWhere ?? undefined);

  const [total, iKategori, drills, forslagCount] = await Promise.all([
    prisma.exerciseDefinition.count(),
    prisma.exerciseDefinition.count({ where }),
    prisma.exerciseDefinition.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, skillArea: true, pyramidArea: true, durationMin: true, defaultSets: true, defaultReps: true },
      take: VIS_MAKS,
    }),
    prisma.caddieDraft.count({ where: { userId: user.id, toolName: DRILL_DRAFT_TOOL, status: "PENDING" } }),
  ]);

  const rader: AdminDrillerV2Row[] = drills.map((d) => {
    const kat = drillKategori(d);
    return { id: d.id, name: d.name, katLabel: kat, ikonFarge: kategoriFarge(kat), meta: drillMeta(d) };
  });

  return (
    <V2Shell aktiv="drills" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminDrillerV2
        total={total}
        iKategori={iKategori}
        visMaks={VIS_MAKS}
        q={q}
        aktivKat={aktiv.param}
        kategorier={KATEGORIER.map(({ param, label }) => ({ param, label }))}
        drills={rader}
        nyHref="/admin/drills/ny"
        forslagHref="/admin/drills/forslag"
        forslagCount={forslagCount}
      />
    </V2Shell>
  );
}
