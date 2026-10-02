/**
 * PH-07 Etter økt — ren bygging av visningstallene fra en fullført økt.
 *
 * Tegningen (Precision Athletics 7d7c2994, PH-07 og PH-07-FYS, runde 26) viser
 * tid totalt mot plan og reps mot plan (golf) eller serier mot plan (fysisk),
 * pluss en liste per øvelse. Mangler en verdi i loggen, blir den `null` og
 * vises som «—» — aldri gjetning.
 */
import type { LiveV2Summary } from "@/components/portal/live/types";
import { fysVisningsrader, golfLoggTall, lesFysRegistrering } from "@/lib/portal-live/fys-registrering";

export type EtterOktRad = {
  id: string;
  navn: string;
  /** Medgått tid i sekunder — null når drillen ikke har egen klokke i loggen. */
  sek: number | null;
  planSek: number | null;
  /** Registrerte reps (golf) eller serier (fysisk) — null uten registrering. */
  antall: number | null;
  planAntall: number | null;
  enhet: "serier" | "repetisjoner" | null;
  detaljer: { label: string; verdi: string }[];
  notat: string | null;
};

export type EtterOkt = {
  variant: "golf" | "fys";
  tom: boolean;
  totalSek: number | null;
  planSek: number | null;
  /** Reps for golf, serier for fysisk. */
  antall: number | null;
  planAntall: number | null;
  rader: EtterOktRad[];
};

const heltall = (n: number | null | undefined): number | null => (n != null && Number.isFinite(n) ? n : null);
const positiv = (n: number | null | undefined): number | null => (n != null && Number.isFinite(n) && n > 0 ? n : null);

export function byggEtterOkt(data: LiveV2Summary): EtterOkt {
  const fys = data.drills.length > 0 && data.drills.every((d) => d.pyramide === "FYS");
  const logg = (id: string) => data.existingLogs.find((l) => l.drillId === id);

  const planVindu = Math.round((Date.parse(data.endTimeISO) - Date.parse(data.scheduledAtISO)) / 1000);
  const planFraDriller = data.drills.reduce((sum, d) => sum + d.durationMinutes * 60, 0);
  const planSek = positiv(planVindu) ?? positiv(planFraDriller);
  const totalSek = positiv(data.durationSec);

  const rader: EtterOktRad[] = data.drills.map((d) => {
    const l = logg(d.id);
    let antall: number | null = null;
    let planAntall: number | null = null;
    let enhet: EtterOktRad["enhet"] = "repetisjoner";
    let detaljer: EtterOktRad["detaljer"] = [];
    let notat = l?.notes ?? null;
    if (d.pyramide === "FYS") {
      const reg = lesFysRegistrering(l?.notes);
      antall = reg?.type === "styrke" ? reg.sett.length : null;
      enhet = reg?.type === "styrke" || d.fysSett != null ? "serier" : null;
      planAntall = enhet === "serier" ? positiv(d.fysSett) : null;
      detaljer = reg ? fysVisningsrader(reg) : [];
      notat = reg ? reg.notat || null : notat;
    } else {
      antall = l ? heltall(l.repsTotal) : null;
      planAntall = positiv(d.plannedReps);
    }
    return {
      id: d.id, navn: d.name,
      sek: positiv(d.actualDurationSec), planSek: positiv(d.durationMinutes * 60),
      antall, planAntall, enhet, detaljer, notat,
    };
  });

  let antall: number | null;
  let planAntall: number | null;
  if (fys) {
    const summer = rader.filter((r) => r.enhet === "serier" && r.antall != null);
    antall = summer.length > 0 ? summer.reduce((s, r) => s + (r.antall ?? 0), 0) : null;
    const serier = rader.filter((r) => r.enhet === "serier");
    const planer = serier.filter((r) => r.planAntall != null);
    planAntall = planer.length === serier.length && planer.length > 0 ? planer.reduce((s, r) => s + (r.planAntall ?? 0), 0) : null;
  } else if (data.logSource === "tapper" || data.drills.length === 0) {
    antall = positiv(data.totalReps);
    planAntall = null;
  } else {
    const golf = golfLoggTall(data.drills, data.existingLogs);
    antall = data.existingLogs.length > 0 ? golf.totalReps : null;
    planAntall = positiv(golf.planReps);
  }

  const tom = totalSek === null && (antall === null || antall === 0) && rader.every((r) => (r.antall ?? 0) === 0 && r.sek === null && r.detaljer.length === 0);
  return { variant: fys ? "fys" : "golf", tom, totalSek, planSek, antall, planAntall, rader };
}

/** 2612 → «43:32». null → «—». */
export function mmss(sek: number | null): string {
  if (sek == null || !Number.isFinite(sek)) return "—";
  const s = Math.max(0, Math.round(sek));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
