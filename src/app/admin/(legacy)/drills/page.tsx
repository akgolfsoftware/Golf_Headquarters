/**
 * AgencyOS — Drill-bibliotek (/admin/drills).
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → DrillsScreen (mørkt tema,
 * desktop 1280): PageHead («PLANLEGGE · DRILL-BIBLIOTEK» / «{N} drills,
 * tagget.» / lead + «Ny drill»), seg-kontroll med ferdighetskategorier
 * (Alle/Approach/Putting/Driving/Nærspill/Fys) og 3-kolonners tile-grid
 * med kategorifarget ball-ikon. Klikk på tile → drill-detalj.
 *
 * Datakilde (gjenbrukt fra forrige versjon av siden): prisma.exerciseDefinition.
 * Kategorifilter via URL (?kat=) — serveren filtrerer i Prisma:
 * Approach=TILNAERMING · Putting=PUTTING · Driving=TEE_TOTAL ·
 * Nærspill=AROUND_GREEN · Fys=pyramidArea FYS. Biblioteket har flere
 * hundre drills — grid-en viser de første 30 i valgt kategori (ærlig
 * teller under), fasiten har ingen paginering.
 */

import Link from "next/link";
import { Plus, Search, Volleyball } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const VIS_MAKS = 30;

/** Fasit-kategorier → Prisma-filter + tile-ikonfarge (fasitens --pyr-mapping). */
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

/** Ikonfarge per kategori — fasitens var(--pyr-*)-mapping. */
function kategoriFarge(kat: string): string {
  switch (kat) {
    case "Approach":
      return "text-pyr-slag";
    case "Putting":
      return "text-pyr-spill";
    case "Driving":
      return "text-pyr-tek";
    case "Nærspill":
      return "text-pyr-turn";
    case "Fys":
      return "text-pyr-fys";
    default:
      return "text-primary";
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
  const aktiv =
    KATEGORIER.find((k) => k.param === (sp.kat ?? "alle")) ?? KATEGORIER[0];
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
    aktiv.where && sokWhere
      ? { AND: [aktiv.where, sokWhere] }
      : (aktiv.where ?? sokWhere ?? undefined);

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

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Planlegge · Drill-bibliotek"
        title={`${total} drills,`}
        italic="tagget."
        lead="Øvelsesbiblioteket coachene deler. Filtrer på ferdighet og slipp drills rett inn i en plan."
        actions={
          <Link href="/admin/drills/ny" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny drill
          </Link>
        }
      />

      {/* Søk — kombineres med kategorifilteret via ?q= */}
      <form className="mb-4 flex" action="/admin/drills" method="GET">
        <label className="inline-flex h-9 w-full max-w-[360px] items-center gap-2 rounded-full border border-input bg-card px-3.5">
          <Search className="h-[13px] w-[13px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Søk drill-navn, beskrivelse eller tag"
            className="min-w-0 flex-1 bg-transparent font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        {aktiv.param !== "alle" && (
          <input type="hidden" name="kat" value={aktiv.param} />
        )}
      </form>

      {/* Seg-kontroll (fasit .seg) — interaktiv via ?kat= */}
      <div className="mb-4 overflow-x-auto pb-1">
        <div className="inline-flex gap-[2px] rounded-lg bg-secondary p-[3px] whitespace-nowrap">
        {KATEGORIER.map((k) => (
          <Link
            key={k.param}
            href={(() => {
              const params = new URLSearchParams();
              if (k.param !== "alle") params.set("kat", k.param);
              if (q) params.set("q", q);
              const qs = params.toString();
              return qs ? `/admin/drills?${qs}` : "/admin/drills";
            })()}
            className={cn(
              "inline-flex h-[26px] items-center rounded-md px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
              k.param === aktiv.param
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k.label}
          </Link>
        ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {drills.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground lg:col-span-3">
            Ingen drills i denne kategorien ennå.
          </div>
        )}
        {drills.map((d) => {
          const kat = drillKategori(d);
          return (
            <Link
              key={d.id}
              href={`/admin/drills/${d.id}`}
              className="flex min-h-[96px] flex-col gap-[10px] rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
            >
              <span
                className={cn(
                  "inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary",
                  kategoriFarge(kat),
                )}
              >
                <Volleyball size={20} strokeWidth={1.5} />
              </span>
              <span className="font-display text-sm font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                {d.name}
              </span>
              <span className="mt-auto font-mono text-[10px] leading-none text-muted-foreground">
                {drillMeta(d)}
              </span>
            </Link>
          );
        })}
      </div>

      {iKategori > VIS_MAKS && (
        <p className="mt-4 font-mono text-[10px] text-muted-foreground">
          Viser {VIS_MAKS} av {iKategori} i kategorien «{aktiv.label}».
        </p>
      )}
    </AgPage>
  );
}
