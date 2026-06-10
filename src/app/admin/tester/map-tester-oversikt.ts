/**
 * Oversetter ekte TesterMatrixData (loadTesterMatrix) → v10 TesterOversiktData.
 *
 * Følger samme mønster som mapHjemData i src/app/portal/page.tsx: ren funksjon
 * som mapper loaderens shape til v10-komponentens prop-shape. Alle tom-tilstander
 * bevares — umålte celler beholder "ikke testet", tomme rader/kolonner forblir
 * tomme, og når mål ikke er definert (noTargets) skjules fargekode-legenden.
 */

import type { TesterMatrixData } from "@/lib/admin/tester-matrix-data";
import type {
  Cell,
  GroupFilter,
  PlayerRow,
  TesterOversiktData,
  TestColumn,
} from "@/components/admin/tester/tester-oversikt";

/** Loaderens avatarTone (default|primary|accent) → v10 (default|primary|lime). */
function avatarTone(tone: "default" | "primary" | "accent"): PlayerRow["avatarTone"] {
  return tone === "accent" ? "lime" : tone;
}

/** Loaderens gruppe-kortform (f.eks. "GFGK") → v10 group-chip med tone. */
function groupChip(label: string | null): PlayerRow["group"] {
  if (!label) return undefined;
  const lower = label.toLowerCase();
  const tone: NonNullable<PlayerRow["group"]>["tone"] = lower.includes("wang")
    ? "wang"
    : lower.includes("gfgk")
      ? "gfgk"
      : "aka";
  return { label, tone };
}

/** Loader-celle → v10-celle. Umålte celler beholder tom-tilstand ("IKKE TESTET"). */
function mapCell(c: TesterMatrixData["rows"][number]["cells"][number]): Cell {
  if (c.tone === "untested") {
    return { state: "untested", value: "—", when: "IKKE TESTET" };
  }
  return {
    state: "measured",
    value: c.value ?? "—",
    when: c.when ?? undefined,
    delta: c.delta?.text,
    deltaTone: c.delta?.tone,
    benchmark: c.benchmark ?? undefined,
  };
}

export function mapTesterOversikt(data: TesterMatrixData): TesterOversiktData {
  const columns: TestColumn[] = data.columns.map((col) => ({
    id: col.testId,
    axis: col.axis,
    name: col.name,
    unit: col.unitLine,
  }));

  const rows: PlayerRow[] = data.rows.map((r) => ({
    id: r.playerId,
    initials: r.initials,
    avatarTone: avatarTone(r.avatarTone),
    name: r.name,
    group: groupChip(r.group),
    sub: r.sub,
    cells: r.cells.map(mapCell),
    missingCount: r.missingCount,
    assignHref: r.tildelHref,
  }));

  const filters: GroupFilter[] = data.groups.map((g, i) => ({
    label: g.label,
    count: g.count,
    active: i === 0,
  }));

  const avg = data.groupAverages.map((a) => ({
    name: a.name,
    value: a.avg,
    unit: a.unit || undefined,
  }));

  const trends: TesterOversiktData["trends"] = [
    { label: "Bedring", count: `${data.trends.improving} spillere`, tone: "up" },
    { label: "Stagnasjon", count: `${data.trends.flat} spillere`, tone: "flat" },
    { label: "Tilbakegang", count: `${data.trends.declining} spillere`, tone: "down" },
  ];

  const hasTrend = data.trends.improving + data.trends.flat + data.trends.declining > 0;

  return {
    eyebrow: "TESTER",
    title: "Spillere × tester — ytelse-matrise",
    meta: {
      players: data.playerCount,
      tests: data.testCount,
      measured: data.measurementCount,
      missing: data.missingCount,
    },
    filters,
    legendNote: data.noTargets
      ? "Mål-fargekoding krever definerte mål — ikke satt ennå"
      : undefined,
    // Nivå-badge-legende (DataGolf) — ikke over/nær/under-fargekoding, som
    // krever per-test mål vi ikke har. Badge per celle viser oppnådd tour-nivå.
    showColorLegend: false,
    levelLegend: !data.noTargets,
    attribution: data.noTargets ? undefined : "Data powered by DataGolf",
    columns,
    rows,
    footerHint: "Klikk en celle for historikk · Klikk Tildel for å planlegge ny test",
    avg,
    trends,
    trendNote: hasTrend
      ? undefined
      : "Ingen spillere har nok historikk til å vise trend ennå (krever minst 2 målinger på samme test).",
    exportHref: "/admin/tester/eksport",
    templateHref: "/admin/tester/maler",
    newTestHref: "/admin/tester/ny",
  };
}
