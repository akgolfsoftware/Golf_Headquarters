/**
 * Mapper: ekte StallenData (loadStallen, Prisma) → v10 SpillerListeData.
 *
 * Følger samme mønster som mapHjemData i src/app/portal/page.tsx: oversetter
 * den eksisterende data-loaderens shape til v10-komponentens prop-shape, og
 * bevarer tom-tilstander ([] når ingen spillere). Ingen oppdiktede verdier —
 * alle felter kommer fra StallenRow.
 *
 * SpillerListe (v10-fasit) krever non-null GroupBucket per rad. loadStallen sin
 * where-klausul krever en aktiv, ikke-PLATFORM_ONLY-enrollering, og hvert slikt
 * program mapper til WANG/GFGK/AKA — så group er i praksis alltid satt. Den
 * sjeldne null-en defaultes til "AKA" kun for å tilfredsstille typen.
 */

import type { StallenData, StallenRow } from "@/lib/admin/stallen-data";
import type {
  SpillerListeData,
  SpillerRow,
} from "@/components/admin/spillere/spiller-liste";

/** SG-delta (number | null) → norsk fortegns-streng, f.eks. "−0,42" / "±0,02". */
function fmtSgDelta(delta: number | null): string {
  if (delta == null) return "—";
  const abs = Math.abs(delta).toFixed(2).replace(".", ",");
  if (Math.abs(delta) < 0.005) return `±${abs}`;
  return delta > 0 ? `+${abs}` : `−${abs}`;
}

/** Timer (number) → norsk komma-streng, f.eks. 14.5 → "14,5". */
function fmtHours(h: number): string {
  return h.toFixed(1).replace(".", ",");
}

/** Hele-stallen timer-delta (number) → "+18 t" / "−4 t" / "±0 t". */
function fmtHoursDelta(d: number): string {
  if (d > 0) return `+${d} t`;
  if (d < 0) return `−${Math.abs(d)} t`;
  return "±0 t";
}

function mapRow(r: StallenRow): SpillerRow {
  // adherence: AxisAdh[] (rekkefølge fys, tek, slag, spill, turn) → [n,n,n,n,n]
  const axes = r.adherence.map((a) => a.pct);
  const adherence: [number, number, number, number, number] = [
    axes[0] ?? 0,
    axes[1] ?? 0,
    axes[2] ?? 0,
    axes[3] ?? 0,
    axes[4] ?? 0,
  ];

  return {
    id: r.id,
    initials: r.initials,
    avatarTone: "default",
    name: r.name,
    sub: r.sub,
    group: r.group ?? "AKA",
    coachInitials: r.coachInitials ?? "—",
    coachName: r.coachName ?? "Ingen coach",
    tier: r.tier,
    oktDone: r.oktDone,
    oktPlanned: r.oktPlanned,
    hours30: fmtHours(r.hours30),
    sgSpark: r.sgTrend,
    sgValue: fmtSgDelta(r.sgDelta),
    sgTone: r.sgTone,
    adherence,
    adherencePct: r.adhPct ?? 0,
    status: r.status,
  };
}

/** Oversetter ekte StallenData → v10 SpillerListeData. Tom-tilstand: rows = []. */
export function mapStallenData(data: StallenData): SpillerListeData {
  return {
    eyebrow: "STALLEN",
    week: data.weekNo,
    bakPlan: data.bakPlan,
    inaktive: data.inaktive,
    hoursDelta: fmtHoursDelta(data.hoursDelta),
    rows: data.rows.map(mapRow),
  };
}
