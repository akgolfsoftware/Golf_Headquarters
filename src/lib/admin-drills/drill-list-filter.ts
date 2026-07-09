import type { Prisma } from "@/generated/prisma/client";
import type {
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/enums";
import {
  AK_KATEGORI_ORDER,
  akKategoriIdx,
  akTilNgfKategori,
  ngfKategoriTilAk,
} from "@/lib/domain/spiller-kategori";

/** URL-parametre for /admin/drills (seg-kontroll + filter-bar). */
export type DrillListSearchParams = {
  kat?: string;
  q?: string;
  disiplin?: string;
  skill?: string;
  env?: string;
  minNgf?: string;
  maxNgf?: string;
  morad?: string;
};

export type ParsedDrillListFilters = {
  q: string;
  disipliner: PyramidArea[];
  skills: SkillArea[];
  envs: SessionEnvironment[];
  minNgf?: NgfKategori;
  maxNgf?: NgfKategori;
  morad: boolean;
};

const PYRAMID_AREAS = new Set<PyramidArea>(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const SKILL_AREAS = new Set<SkillArea>([
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
]);
const SESSION_ENVS = new Set<SessionEnvironment>([
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
]);
const NGF_VALUES = new Set<NgfKategori>([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
]);

/** Prisma enum-rekkefølge A (best) → L (legacy/svakeste). */
const NGF_ORDER: NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

function parseEnumList<T extends string>(raw: string | undefined, allowed: Set<T>): T[] {
  if (!raw?.trim()) return [];
  const seen = new Set<T>();
  const out: T[] = [];
  for (const part of raw.split(",")) {
    const s = part.trim();
    if (!allowed.has(s as T) || seen.has(s as T)) continue;
    seen.add(s as T);
    out.push(s as T);
  }
  return out;
}

function parseNgf(raw: string | undefined): NgfKategori | undefined {
  const v = raw?.trim();
  if (!v || !NGF_VALUES.has(v as NgfKategori)) return undefined;
  return v as NgfKategori;
}

/** Indeks for NGF-overlapp (L behandles som K i A–K-skalaen). */
export function ngfFilterIdx(k: NgfKategori): number {
  const ak = ngfKategoriTilAk(k);
  return ak ? akKategoriIdx(ak) : 0;
}

export function parseDrillListFilters(sp: DrillListSearchParams): ParsedDrillListFilters {
  return {
    q: sp.q?.trim() ?? "",
    disipliner: parseEnumList(sp.disiplin, PYRAMID_AREAS),
    skills: parseEnumList(sp.skill, SKILL_AREAS),
    envs: parseEnumList(sp.env, SESSION_ENVS),
    minNgf: parseNgf(sp.minNgf),
    maxNgf: parseNgf(sp.maxNgf),
    morad: sp.morad === "1",
  };
}

function buildNgfOverlapWhere(
  minNgf?: NgfKategori,
  maxNgf?: NgfKategori,
): Prisma.ExerciseDefinitionWhereInput | null {
  if (!minNgf && !maxNgf) return null;

  const filterMinIdx = minNgf ? ngfFilterIdx(minNgf) : 0;
  const filterMaxIdx = maxNgf ? ngfFilterIdx(maxNgf) : AK_KATEGORI_ORDER.length - 1;

  const tillattMinKategori = NGF_ORDER.filter((k) => ngfFilterIdx(k) <= filterMaxIdx);
  const tillattMaxKategori = NGF_ORDER.filter((k) => ngfFilterIdx(k) >= filterMinIdx);

  return {
    AND: [
      {
        OR: [{ minKategori: null }, { minKategori: { in: tillattMinKategori } }],
      },
      {
        OR: [{ maxKategori: null }, { maxKategori: { in: tillattMaxKategori } }],
      },
    ],
  };
}

/** Prisma-where fra filter-bar-parametre (uten seg-kontroll ?kat=). */
export function buildFilterBarWhere(
  sp: DrillListSearchParams,
): Prisma.ExerciseDefinitionWhereInput | null {
  const f = parseDrillListFilters(sp);
  const parts: Prisma.ExerciseDefinitionWhereInput[] = [];

  if (f.q) {
    parts.push({
      OR: [
        { name: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
        { coachNotes: { contains: f.q, mode: "insensitive" } },
        { tags: { has: f.q } },
      ],
    });
  }

  if (f.disipliner.length === 1) {
    parts.push({ pyramidArea: f.disipliner[0] });
  } else if (f.disipliner.length > 1) {
    parts.push({ pyramidArea: { in: f.disipliner } });
  }

  if (f.skills.length === 1) {
    parts.push({ skillArea: f.skills[0] });
  } else if (f.skills.length > 1) {
    parts.push({ skillArea: { in: f.skills } });
  }

  if (f.envs.length > 0) {
    parts.push({ environment: { hasSome: f.envs } });
  }

  const ngfWhere = buildNgfOverlapWhere(f.minNgf, f.maxNgf);
  if (ngfWhere) parts.push(ngfWhere);

  if (f.morad) {
    parts.push({ morad: true });
  }

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return { AND: parts };
}

/** Kombinerer seg-kontroll (?kat=) med filter-bar. */
export function buildDrillListWhere(
  sp: DrillListSearchParams,
  katWhere: Prisma.ExerciseDefinitionWhereInput | null,
): Prisma.ExerciseDefinitionWhereInput | undefined {
  const parts: Prisma.ExerciseDefinitionWhereInput[] = [];
  if (katWhere) parts.push(katWhere);
  const barWhere = buildFilterBarWhere(sp);
  if (barWhere) parts.push(barWhere);

  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return { AND: parts };
}

const FILTER_KEYS = ["q", "disiplin", "skill", "env", "minNgf", "maxNgf", "morad"] as const;

/** Bygger query-streng — bevarer aktive filtre ved kategori-bytt. */
export function drillListQueryString(
  sp: DrillListSearchParams,
  overrides: Partial<DrillListSearchParams> = {},
): string {
  const merged = { ...sp, ...overrides };
  const params = new URLSearchParams();

  if (merged.kat && merged.kat !== "alle") {
    params.set("kat", merged.kat);
  }

  const f = parseDrillListFilters(merged);
  if (f.q) params.set("q", f.q);
  if (f.disipliner.length) params.set("disiplin", f.disipliner.join(","));
  if (f.skills.length) params.set("skill", f.skills.join(","));
  if (f.envs.length) params.set("env", f.envs.join(","));
  if (f.minNgf) params.set("minNgf", f.minNgf);
  if (f.maxNgf) params.set("maxNgf", f.maxNgf);
  if (f.morad) params.set("morad", "1");

  return params.toString();
}

export function drillListHref(
  sp: DrillListSearchParams,
  overrides: Partial<DrillListSearchParams> = {},
): string {
  const qs = drillListQueryString(sp, overrides);
  return qs ? `/admin/drills?${qs}` : "/admin/drills";
}

export function hasActiveBarFilters(sp: DrillListSearchParams): boolean {
  const f = parseDrillListFilters(sp);
  return (
    !!f.q ||
    f.disipliner.length > 0 ||
    f.skills.length > 0 ||
    f.envs.length > 0 ||
    !!f.minNgf ||
    !!f.maxNgf ||
    f.morad
  );
}

/** NGF-verdier fra indeks (for tester). */
export function ngfFromAkIdx(idx: number): NgfKategori {
  return akTilNgfKategori(AK_KATEGORI_ORDER[idx]);
}

export { FILTER_KEYS };